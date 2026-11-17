import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const files = readdirSync(join(root, 'game'));
assert.equal(files.length, 4, 'game is four independent, static, original files');
for (const file of files) {
  const path = join(root, 'game', file), code = readFileSync(path, 'utf8');
  assert.ok(statSync(path).isFile());
  assert.equal(/https?:\/\/|fetch\s*\(|XMLHttpRequest|WebSocket|import\s*\(/.test(code), false, `${file}: no runtime network or imports`);
}
const html = readFileSync(join(root, 'game/index.html'), 'utf8');
for (const ref of [...html.matchAll(/(?:src|href)="\.\/([^"#]+)"/g)]) assert.ok(files.includes(ref[1]));
const vendor = readFileSync(join(root, 'vendor/makefun-game.ts'));
assert.equal(createHash('sha256').update(vendor).digest('hex'), 'dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129');
console.log('PASS: local references, no runtime network, original static files, unchanged kit vendor');
