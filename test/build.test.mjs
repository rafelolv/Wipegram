import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { cp, mkdtemp, mkdir, readFile, rm, symlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const execute = promisify(execFile);

test('userscript is identical across checkout directories', async t => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'wipegram-build-'));
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const outputs = [];
  for (const name of ['checkout-one', 'checkout-two']) {
    const checkout = path.join(temporary, name);
    await mkdir(checkout);
    for (const entry of ['src', 'build', 'build.mjs', 'package.json', 'LICENSE', 'images']) {
      await cp(path.join(root, entry), path.join(checkout, entry), { recursive: true });
    }
    await symlink(path.join(root, 'node_modules'), path.join(checkout, 'node_modules'), 'dir');
    await execute(process.execPath, ['build.mjs'], { cwd: checkout });
    const output = await readFile(path.join(checkout, 'wipegram.user.js'), 'utf8');
    assert(!output.includes(checkout), 'Bundle must not contain absolute checkout paths');
    assert(output.includes('// dom-template:src/panel.html'));
    outputs.push(output);
  }
  assert.equal(outputs[0], outputs[1]);
});
