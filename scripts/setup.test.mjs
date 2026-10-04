import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setup } from './setup.mjs';

test('setup rejects a wrong runtime before installing anything', () => {
  assert.throws(() => setup({ version: '18.0.0', run: () => assert.fail('must not run') }), /requires Node 24.19.0/);
});
test('setup requires npm and stops immediately after a failed stage', () => {
  assert.throws(() => setup({ npmCli: '', run: () => assert.fail('must not run') }), /npm run setup/);
  let calls = 0;
  assert.throws(() => setup({ npmCli: 'npm-cli.js', run: () => { calls++; return { status: 1 }; } }), /Install locked dependencies failed/);
  assert.equal(calls, 1);
});
test('setup uses the same Node and repository cwd for install, build and doctor', () => {
  const calls = [];
  setup({ npmCli: 'path with spaces/npm-cli.js', run: (...args) => { calls.push(args); return { status: 0 }; } });
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[0][1], ['path with spaces/npm-cli.js', 'ci', '--ignore-scripts', '--include=dev']);
  assert.ok(calls[1][1][0].endsWith('build.mjs'));
  assert.equal(calls[2][1][1], 'doctor');
  for (const [executable, , options] of calls) {
    assert.equal(executable, process.execPath);
    assert.equal(options.cwd, calls[0][2].cwd);
    assert.equal(options.windowsHide, true);
  }
});
test('setup surfaces process startup errors', () => {
  assert.throws(() => setup({ npmCli: 'npm-cli.js', run: () => ({ error: new Error('cannot start') }) }), /cannot start/);
});
