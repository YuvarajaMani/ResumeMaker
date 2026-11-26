// Local server for the Resume Builder. No dependencies: Node's standard library only.
//
// It serves the three app files and keeps the latest resume in resume-data.json, so edits
// survive closing the browser, switching browsers, or opening the app at another local address.
// It is built for one person on their own computer: it only listens on this machine and only
// accepts requests addressed to localhost.
//
// Settings (environment variables):
//   PORT           port to listen on (default 5173)
//   HOST           address to listen on (default 127.0.0.1; keep it local)
//   DATA_DIR       folder for the resume and its backups (default C:\Resume on Windows, ~/Resume elsewhere)
//   DATA_FILE      where the resume is saved (default <DATA_DIR>/resume-data.json)
//   BACKUP_DIR     where older copies are kept (default <DATA_DIR>/backups)
//   BACKUP_KEEP    how many backups to keep (default 20, 0 turns backups off)
//   BACKUP_EVERY   minutes between backups (default 10)
//   LOG            "info" (default) logs saves and errors, "quiet" logs errors only
'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const ROOT = __dirname;
const MAX_BODY = 25 * 1024 * 1024; // photos are stored inline, so allow a generous size
const MAX_FUTURE_MS = 24 * 60 * 60 * 1000; // reject save times more than a day ahead (bad clock)

const STATIC = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/styles.css': { file: 'styles.css', type: 'text/css; charset=utf-8' },
  '/app.js': { file: 'app.js', type: 'text/javascript; charset=utf-8' },
};

// Web fonts come from Google Fonts; everything else is served by this server.
// Inline style attributes are needed because the page sets CSS variables and positions per element.
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    'font-src https://fonts.gstatic.com',
    "img-src 'self' data: blob:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

// The resume lives outside the project, so it survives reinstalling or deleting the app.
const DEFAULT_DATA_DIR = process.platform === 'win32' ? 'C:\\Resume' : path.join(require('os').homedir(), 'Resume');
// Where earlier versions kept it; copied to the new folder once (see migrateLegacyData).
const LEGACY_DATA_FILE = path.join(ROOT, 'resume-data.json');
const LEGACY_BACKUP_DIR = path.join(ROOT, 'backups');

function configFromEnv(env = process.env) {
  const num = (v, d) => (v != null && v !== '' && Number.isFinite(+v) ? +v : d);
  const dataDir = path.resolve(env.DATA_DIR || DEFAULT_DATA_DIR);
  return {
    port: num(env.PORT, 5172),
    host: env.HOST || '127.0.0.1',
    dataDir,
    // Only the default location takes over the resume from the old project-folder location.
    // A folder chosen with DATA_DIR / DATA_FILE (for example a test or demo folder) starts empty.
    defaultLocation: !env.DATA_DIR && !env.DATA_FILE,
    dataFile: path.resolve(env.DATA_FILE || path.join(dataDir, 'resume-data.json')),
    backupDir: path.resolve(env.BACKUP_DIR || path.join(dataDir, 'backups')),
    backupKeep: Math.max(0, Math.floor(num(env.BACKUP_KEEP, 20))),
    backupEveryMs: Math.max(0, num(env.BACKUP_EVERY, 10)) * 60 * 1000,
    quiet: env.LOG === 'quiet',
  };
}

// The host name a request was addressed to, without the port.
function hostnameOf(value) {
  if (!value) return '';
  try {
    return new URL(`http://${value}`).hostname.toLowerCase();
  } catch (e) {
    return '';
  }
}

// Only requests addressed to this machine by name are served. This blocks DNS-rebinding
// attacks, where another website points its own domain at 127.0.0.1 to read your resume.
const isLocalHost = (req) => LOCAL_HOSTS.has(hostnameOf(req.headers.host));

// Only the app itself may write: it sends a custom header (which other websites can't send
// to this server without a CORS preflight it never approves) from a local origin.
function isLocalApp(req) {
  if (req.headers['x-resume-builder'] !== '1') return false;
  const origin = req.headers.origin;
  if (!origin || origin === 'null') return !origin;
  try {
    return LOCAL_HOSTS.has(new URL(origin).hostname.toLowerCase());
  } catch (e) {
    return false;
  }
}

function createServer(options = {}) {
  const cfg = { ...configFromEnv({}), ...options };
  const log = (...a) => { if (!cfg.quiet) console.log(new Date().toISOString(), ...a); };
  const logError = (...a) => console.error(new Date().toISOString(), ...a);

  // Saves are written one at a time, so two quick saves can never interleave on disk.
  let writeChain = Promise.resolve();
  let lastBackupAt = 0;

  function send(res, code, body = '', type = 'application/json; charset=utf-8', extra = {}) {
    if (res.headersSent) return;
    const buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
    res.writeHead(code, { ...SECURITY_HEADERS, 'Content-Type': type, 'Content-Length': buf.length, 'Cache-Control': 'no-store', ...extra });
    res.end(res.req && res.req.method === 'HEAD' ? undefined : buf);
  }
  const sendJson = (res, code, obj) => send(res, code, JSON.stringify(obj));

  async function readStored() {
    try {
      return await fsp.readFile(cfg.dataFile, 'utf8');
    } catch (e) {
      if (e.code === 'ENOENT') return null;
      throw e;
    }
  }

  // Keep a copy of the previous save now and then, and prune old copies.
  async function backupPrevious() {
    if (!cfg.backupKeep || Date.now() - lastBackupAt < cfg.backupEveryMs) return;
    try {
      await fsp.access(cfg.dataFile);
    } catch (e) {
      return; // nothing saved yet
    }
    await fsp.mkdir(cfg.backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    await fsp.copyFile(cfg.dataFile, path.join(cfg.backupDir, `resume-data-${stamp}.json`));
    lastBackupAt = Date.now();
    const old = (await fsp.readdir(cfg.backupDir)).filter((f) => /^resume-data-.*\.json$/.test(f)).sort();
    await Promise.all(old.slice(0, Math.max(0, old.length - cfg.backupKeep)).map((f) => fsp.unlink(path.join(cfg.backupDir, f))));
  }

  async function writeResume(data) {
    const text = await readStored();
    if (text) {
      try {
        const cur = JSON.parse(text);
        // Never let an older copy (for example a stale tab) overwrite a newer one.
        if (Number.isFinite(cur.savedAt) && cur.savedAt > data.savedAt) return { conflict: text };
      } catch (e) { /* unreadable file: replace it */ }
    }
    await backupPrevious().catch((e) => logError('Backup failed:', e.message));
    await fsp.mkdir(path.dirname(cfg.dataFile), { recursive: true });
    const tmp = `${cfg.dataFile}.${process.pid}.tmp`;
    await fsp.writeFile(tmp, JSON.stringify(data));
    await fsp.rename(tmp, cfg.dataFile); // atomic: the file is never half-written
    return { ok: true };
  }

  function readBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      let size = 0;
      req.on('data', (c) => {
        size += c.length;
        if (size > MAX_BODY) {
          reject(Object.assign(new Error('too large'), { status: 413 }));
          req.destroy();
          return;
        }
        chunks.push(c);
      });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }

  function validResume(data) {
    if (!data || typeof data !== 'object') return 'not an object';
    if (!Number.isFinite(data.savedAt) || data.savedAt <= 0) return 'missing savedAt';
    if (data.savedAt > Date.now() + MAX_FUTURE_MS) return 'savedAt is in the future';
    const s = data.state;
    if (!s || typeof s !== 'object' || !Array.isArray(s.sections)) return 'missing state.sections';
    if (s.header != null && typeof s.header !== 'object') return 'invalid header';
    return '';
  }

  async function handleResume(req, res) {
    if (req.method === 'GET' || req.method === 'HEAD') {
      const text = await readStored();
      return text == null ? send(res, 204) : send(res, 200, text);
    }
    if (req.method !== 'PUT' && req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' });
    if (!isLocalApp(req)) return sendJson(res, 403, { error: 'forbidden' });
    if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) return sendJson(res, 415, { error: 'expected application/json' });

    let data;
    try {
      data = JSON.parse(await readBody(req));
    } catch (e) {
      if (e.status === 413) return sendJson(res, 413, { error: 'too large' });
      return sendJson(res, 400, { error: 'invalid json' });
    }
    const problem = validResume(data);
    if (problem) return sendJson(res, 400, { error: `not a resume: ${problem}` });

    const result = await (writeChain = writeChain.catch(() => {}).then(() => writeResume(data)));
    if (result.conflict) return send(res, 409, result.conflict);
    log('Saved resume', `(${data.state.sections.length} sections)`);
    return sendJson(res, 200, { ok: true });
  }

  async function handleInfo(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'method not allowed' });
    let st = null;
    try {
      st = await fsp.stat(cfg.dataFile);
    } catch (e) { /* not saved yet */ }
    return sendJson(res, 200, { file: cfg.dataFile, exists: !!st, size: st ? st.size : 0, modified: st ? st.mtimeMs : null });
  }

  async function handleStatic(req, res, pathname) {
    if (pathname === '/favicon.ico') return send(res, 204);
    const entry = STATIC[pathname];
    if (!entry) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain; charset=utf-8', { Allow: 'GET, HEAD' });
    const file = path.join(ROOT, entry.file);
    const st = await fsp.stat(file);
    const etag = `"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers = { ETag: etag, 'Cache-Control': 'no-cache' }; // always revalidate, so edits show on refresh
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { ...SECURITY_HEADERS, ...headers });
      return res.end();
    }
    return send(res, 200, await fsp.readFile(file), entry.type, headers);
  }

  const server = http.createServer(async (req, res) => {
    res.req = req;
    try {
      if (!isLocalHost(req)) return send(res, 421, 'This server only answers requests for localhost.', 'text/plain; charset=utf-8');
      let pathname;
      try {
        pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      } catch (e) {
        return send(res, 400, 'Bad request', 'text/plain; charset=utf-8');
      }
      if (pathname === '/api/resume') return await handleResume(req, res);
      if (pathname === '/api/info') return await handleInfo(req, res);
      if (pathname.startsWith('/api/')) return sendJson(res, 404, { error: 'not found' });
      return await handleStatic(req, res, pathname);
    } catch (e) {
      logError(`${req.method} ${req.url} failed:`, e.stack || e.message);
      return sendJson(res, 500, { error: 'server error' });
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  // Lets shutdown wait for a save that is still being written.
  server.flushWrites = () => writeChain.catch(() => {});
  server.config = cfg;
  return server;
}

// Make sure the data folder can be written. If it can't (no such drive, no permission),
// fall back to the project folder so saving still works, and say so loudly.
function ensureDataLocation(cfg) {
  try {
    fs.mkdirSync(path.dirname(cfg.dataFile), { recursive: true });
    fs.accessSync(path.dirname(cfg.dataFile), fs.constants.W_OK);
    return cfg;
  } catch (e) {
    console.error(`Cannot use ${path.dirname(cfg.dataFile)} (${e.code || e.message}). Saving to the project folder instead.`);
    return { ...cfg, dataFile: LEGACY_DATA_FILE, backupDir: LEGACY_BACKUP_DIR };
  }
}

// One-time move from the old location: if the new folder has no resume yet but the project
// folder does, copy the resume and its backups over. The old copies are left in place.
function migrateLegacyData(cfg) {
  if (!cfg.defaultLocation || cfg.dataFile === LEGACY_DATA_FILE || fs.existsSync(cfg.dataFile) || !fs.existsSync(LEGACY_DATA_FILE)) return;
  try {
    fs.copyFileSync(LEGACY_DATA_FILE, cfg.dataFile, fs.constants.COPYFILE_EXCL);
    let n = 0;
    if (fs.existsSync(LEGACY_BACKUP_DIR) && cfg.backupDir !== LEGACY_BACKUP_DIR) {
      fs.mkdirSync(cfg.backupDir, { recursive: true });
      for (const f of fs.readdirSync(LEGACY_BACKUP_DIR).filter((x) => /^resume-data-.*\.json$/.test(x))) {
        const to = path.join(cfg.backupDir, f);
        if (!fs.existsSync(to)) { fs.copyFileSync(path.join(LEGACY_BACKUP_DIR, f), to); n++; }
      }
    }
    console.log(`Copied your resume${n ? ` and ${n} backup(s)` : ''} from the project folder to ${path.dirname(cfg.dataFile)}.`);
    console.log('The old copies in the project folder are no longer used; you can delete them.');
  } catch (e) {
    console.error('Could not copy your resume from the project folder:', e.message);
  }
}

function start() {
  const cfg = ensureDataLocation(configFromEnv());
  migrateLegacyData(cfg);
  const server = createServer(cfg);
  if (!['127.0.0.1', 'localhost', '::1'].includes(cfg.host)) {
    console.warn(`Warning: listening on ${cfg.host}. The resume holds personal data and the app has no login; keep it on 127.0.0.1 unless you know you need otherwise.`);
  }
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') console.error(`Port ${cfg.port} is already in use. Is the Resume Builder already running? Set PORT to use another port.`);
    else console.error('Server error:', e.message);
    process.exit(1);
  });
  server.listen(cfg.port, cfg.host, () => {
    console.log(`Resume Builder running at http://localhost:${cfg.port}`);
    console.log(`Saving to ${cfg.dataFile}${cfg.backupKeep ? ` (backups in ${cfg.backupDir})` : ''}`);
  });

  let stopping = false;
  const stop = (signal) => {
    if (stopping) return;
    stopping = true;
    console.log(`${signal} received, finishing saves and shutting down...`);
    server.close();
    server.flushWrites().then(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  };
  process.on('SIGINT', () => stop('SIGINT'));
  process.on('SIGTERM', () => stop('SIGTERM'));
}

module.exports = { createServer, configFromEnv, SECURITY_HEADERS };

if (require.main === module) start();
