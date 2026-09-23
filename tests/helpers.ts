import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { TestContext } from 'node:test';

export function temporaryProject(t: TestContext): string {
  const root = mkdtempSync(join(tmpdir(), 'cec-m0-'));
  t.after(() => {
    const absolute = resolve(root);
    assert.equal(dirname(absolute).toLowerCase(), resolve(tmpdir()).toLowerCase());
    assert.ok(basename(absolute).startsWith('cec-m0-'));
    rmSync(absolute, { recursive: true, force: true });
  });
  return root;
}

export function git(root: string, ...args: string[]): string {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true, timeout: 10_000 });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}
