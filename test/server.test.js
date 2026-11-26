// Tests for server.js. Run with: npm test (Node's built-in test runner, no dependencies).
// Each test run uses its own temporary data folder, so your real resume-data.json is never touched.
'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createServer, configFromEnv } = require('../server.js');

let server;
let base;
let tmp;
let dataFile;
let backupDir;

const APP = { 'X-Resume-Builder': '1', 'Content-Type': 'application/json', Origin: 'http://localhost:5173' };
const resume = (savedAt, name = 'Test') => ({ savedAt, state: { meta: { name }, header: { name }, design: {}, sections: [] } });
const put = (body, headers = APP) => fetch(`${base}/api/resume`, { method: 'PUT', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'resume-builder-test-'));
  dataFile = path.join(tmp, 'resume-data.json');
  backupDir = path.join(tmp, 'backups');
  server = createServer({ dataFile, backupDir, backupKeep: 2, backupEveryMs: 0, quiet: true });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  await new Promise((r) => server.close(r));
  fs.rmSync(tmp, { recursive: true, force: true });
});

test('serves the app files with security headers', async () => {
  for (const [p, type] of [['/', 'text/html'], ['/styles.css', 'text/css'], ['/app.js', 'text/javascript']]) {
    const r = await fetch(base + p);
    assert.equal(r.status, 200, p);
    assert.match(r.headers.get('content-type'), new RegExp(type));
    assert.match(r.headers.get('content-security-policy'), /default-src 'self'/);
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(r.headers.get('x-frame-options'), 'DENY');
  }
});

test('answers a repeat request with 304 when the file has not changed', async () => {
  const first = await fetch(`${base}/app.js`);
  const etag = first.headers.get('etag');
  assert.ok(etag);
  const again = await fetch(`${base}/app.js`, { headers: { 'If-None-Match': etag } });
  assert.equal(again.status, 304);
});

test('returns 404 for unknown files and never serves other project files', async () => {
  for (const p of ['/server.js', '/package.json', '/resume-data.json', '/../server.js', '/nope']) {
    const r = await fetch(base + p);
    assert.equal(r.status, 404, p);
  }
  assert.equal((await fetch(`${base}/api/nope`)).status, 404);
});

test('refuses requests addressed to another host name (DNS rebinding)', async () => {
  const port = server.address().port;
  const r = await new Promise((resolve, reject) => {
    const http = require('http');
    http.get({ host: '127.0.0.1', port, path: '/api/resume', headers: { Host: 'evil.example' } }, resolve).on('error', reject);
  });
  r.resume();
  assert.equal(r.statusCode, 421);
});

test('GET /api/resume is empty before the first save', async () => {
  const r = await fetch(`${base}/api/resume`);
  assert.equal(r.status, 204);
});

test('rejects writes that do not come from the app', async () => {
  assert.equal((await put(resume(1), { 'Content-Type': 'application/json' })).status, 403);
  assert.equal((await put(resume(1), { ...APP, Origin: 'https://evil.example' })).status, 403);
  assert.equal((await put(resume(1), { ...APP, 'Content-Type': 'text/plain' })).status, 415);
});

test('rejects bodies that are not a resume', async () => {
  assert.equal((await put('{not json')).status, 400);
  assert.equal((await put({ savedAt: 1 })).status, 400);
  assert.equal((await put({ state: { sections: [] } })).status, 400);
  assert.equal((await put(resume(Date.now() + 3 * 24 * 3600 * 1000))).status, 400);
  assert.equal(fs.existsSync(dataFile), false);
});

test('saves, returns the saved copy, and reports where it is stored', async () => {
  const r = await put(resume(1000, 'First'));
  assert.equal(r.status, 200);
  const saved = await (await fetch(`${base}/api/resume`)).json();
  assert.equal(saved.savedAt, 1000);
  assert.equal(saved.state.meta.name, 'First');
  const info = await (await fetch(`${base}/api/info`)).json();
  assert.equal(info.file, dataFile);
  assert.equal(info.exists, true);
  assert.ok(info.size > 0);
});

test('never lets an older copy overwrite a newer one', async () => {
  assert.equal((await put(resume(5000, 'Newer'))).status, 200);
  const stale = await put(resume(2000, 'Stale tab'));
  assert.equal(stale.status, 409);
  assert.equal((await stale.json()).state.meta.name, 'Newer');
  const saved = await (await fetch(`${base}/api/resume`)).json();
  assert.equal(saved.state.meta.name, 'Newer');
});

test('handles many saves at once without corrupting the file', async () => {
  const results = await Promise.all(Array.from({ length: 20 }, (_, i) => put(resume(10000 + i, `Save ${i}`))));
  for (const r of results) assert.ok([200, 409].includes(r.status));
  const saved = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  assert.equal(saved.savedAt, 10019);
  assert.deepEqual(fs.readdirSync(tmp).filter((f) => f.endsWith('.tmp')), []);
});

test('keeps backups of earlier saves and prunes old ones', async () => {
  for (let i = 0; i < 4; i++) {
    assert.equal((await put(resume(20000 + i))).status, 200);
    await new Promise((r) => setTimeout(r, 5)); // distinct backup file names
  }
  const backups = fs.readdirSync(backupDir).filter((f) => f.startsWith('resume-data-'));
  assert.equal(backups.length, 2);
});

test('stores the resume in the Resume folder by default, and DATA_DIR moves it', () => {
  const def = configFromEnv({});
  const expected = process.platform === 'win32' ? 'C:\\Resume' : path.join(os.homedir(), 'Resume');
  assert.equal(def.dataDir, expected);
  assert.equal(def.dataFile, path.join(expected, 'resume-data.json'));
  assert.equal(def.backupDir, path.join(expected, 'backups'));

  assert.equal(def.defaultLocation, true);
  const custom = configFromEnv({ DATA_DIR: tmp });
  assert.equal(custom.defaultLocation, false); // a chosen folder never takes over the old project-folder resume
  assert.equal(custom.dataFile, path.join(tmp, 'resume-data.json'));
  assert.equal(custom.backupDir, path.join(tmp, 'backups'));
  assert.equal(configFromEnv({ DATA_DIR: tmp, DATA_FILE: path.join(tmp, 'x.json') }).dataFile, path.join(tmp, 'x.json'));
});

test('rejects unsupported methods', async () => {
  assert.equal((await fetch(`${base}/api/resume`, { method: 'DELETE', headers: APP })).status, 405);
  assert.equal((await fetch(`${base}/app.js`, { method: 'POST' })).status, 405);
});
