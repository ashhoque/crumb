import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const tests = readdirSync(join(root, 'dist/tests')).filter(name => name.endsWith('.test.js')).sort().map(name => join(root, 'dist/tests', name));
if (tests.length === 0) throw new Error('Build the M0 tests before running them.');
const preload = pathToFileURL(join(root, 'scripts/offline-guard.mjs')).href;
const result = spawnSync(process.execPath, ['--test', '--test-reporter=tap', ...tests], {
  cwd: root, stdio: 'inherit', windowsHide: true,
  env: { ...process.env, NODE_OPTIONS: `--import=${preload}` },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
