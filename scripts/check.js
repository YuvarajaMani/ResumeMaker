// Static checks that need no dependencies. Run with: npm run check
// - every JavaScript file parses
// - index.html only references files the server serves, and nothing the security policy blocks
// - app.js has no eval and no leftover console.log
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
let failed = 0;
const ok = (msg) => console.log(`  ok   ${msg}`);
const fail = (msg) => { failed++; console.error(`  FAIL ${msg}`); };

console.log('Syntax');
for (const file of ['app.js', 'server.js', 'scripts/check.js', 'test/server.test.js']) {
  try {
    new vm.Script(fs.readFileSync(path.join(root, file), 'utf8'), { filename: file });
    ok(file);
  } catch (e) {
    fail(`${file}: ${e.message}`);
  }
}

console.log('index.html references');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const served = new Set(['app.js', 'styles.css']);
for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (/^https:\/\/fonts\.(googleapis|gstatic)\.com/.test(ref)) continue;
  if (/^https?:/.test(ref)) fail(`external reference not allowed by the Content-Security-Policy: ${ref}`);
  else if (!served.has(ref)) fail(`references ${ref}, which server.js does not serve`);
  else ok(ref);
}
if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) fail('inline <script> found; the Content-Security-Policy blocks it');
if (/\son[a-z]+="/i.test(html)) fail('inline event handler found; the Content-Security-Policy blocks it');

console.log('app.js');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
if (/\beval\(|new Function\(/.test(app)) fail('uses eval or new Function; the Content-Security-Policy blocks it');
else ok('no eval');
if (/console\.log\(/.test(app)) fail('leftover console.log');
else ok('no console.log');

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll checks passed');
