import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

for (const script of ['build.mjs', 'test.mjs']) {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(script, import.meta.url))], { stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) { process.exitCode = result.status ?? 1; break; }
}
