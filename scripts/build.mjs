import { spawnSync } from 'node:child_process';
import { readFileSync, cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const expected = readFileSync(join(root, '.node-version'), 'utf8').trim();
if (process.versions.node !== expected) throw new Error(`Select Node ${expected} before building; found ${process.versions.node}.`);
const result = spawnSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', join(root, 'tsconfig.json')], { cwd: root, stdio: 'inherit', windowsHide: true });
if (result.error) throw result.error;
if (result.status === 0) cpSync(join(root, 'contracts'), join(root, 'dist/contracts'), { recursive: true });
process.exitCode = result.status ?? 1;
