import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { requireTestedRuntime } from '../src/application/runtime.js';
import { temporaryProject } from './helpers.js';

const cli = fileURLToPath(new URL('../src/cli/main.js', import.meta.url));
function run(root: string, ...args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8', windowsHide: true, timeout: 15_000 });
}

test('doctor reports actual runtime/database versions without creating storage', t => {
  const root = temporaryProject(t);
  const result = run(root, 'doctor');
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout) as Record<string, unknown>;
  assert.equal(output['node'], process.versions.node);
  assert.match(String(output['sqlite']), /^3\./);
  assert.equal(output['milestone'], 'M1-R2');
  assert.equal(output['customerWorkflow'], 'pre-build evaluation with permitted host research; existing first-cycle build path');
  assert.deepEqual(readdirSync(root), []);
});

test('CLI initializes a directory containing spaces and Unicode', t => {
  const root = temporaryProject(t);
  const target = join(root, 'project café 日本語');
  mkdirSync(target);
  const result = run(root, 'init', target);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(join(target, '.customer-evidence', 'cec.sqlite')), true);
  assert.equal((JSON.parse(result.stdout) as { foundationOnly: boolean }).foundationOnly, true);
});

test('invalid commands, flags and excess arguments fail without writes', t => {
  const root = temporaryProject(t);
  for (const args of [[], ['workflow'], ['doctor', 'extra'], ['init', root, 'extra'], ['init', '--force']]) {
    const result = run(root, ...args);
    assert.equal(result.status, 1);
    assert.notEqual(result.stderr.trim(), '');
    assert.equal(result.stdout, '');
  }
  assert.deepEqual(readdirSync(root), []);
});

test('unverified runtime versions fail with actionable guidance', () => {
  assert.throws(() => requireTestedRuntime('18.17.0'), /Select the pinned runtime/);
  assert.throws(() => requireTestedRuntime('25.0.0'), /Select the pinned runtime/);
  requireTestedRuntime();
});
