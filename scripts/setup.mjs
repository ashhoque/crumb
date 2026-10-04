import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

export function setup({ version = process.versions.node, npmCli = process.env.npm_execpath, run = spawnSync } = {}) {
  const expected = readFileSync(join(root, '.node-version'), 'utf8').trim();
  if (version !== expected) throw new Error(`Crumb requires Node ${expected}; found ${version}. Install/select the version in .node-version, then rerun npm run setup. See ALPHA_TESTING.md.`);
  if (!npmCli) throw new Error('Run this through npm run setup so the npm CLI can be located.');
  const stages = [
    ['Install locked dependencies', [npmCli, 'ci', '--ignore-scripts', '--include=dev']],
    ['Build the existing runtime', [join(root, 'scripts/build.mjs')]],
    ['Check Node and SQLite', [join(root, 'dist/src/cli/main.js'), 'doctor']],
  ];
  for (const [label, args] of stages) {
    console.log(`\n${label}...`);
    const result = run(process.execPath, args, { cwd: root, stdio: 'inherit', windowsHide: true });
    if (result.error) throw new Error(`${label} failed: ${result.error.message}`);
    if (result.status !== 0) throw new Error(`${label} failed (exit ${result.status ?? 'unknown'}). Fix the error above, then rerun npm run setup.`);
  }
  console.log('\nCrumb is ready locally. Open this clone in Codex, start a new chat, and send:\n$crumb Run the discovery probe only.\nThen follow ALPHA_TESTING.md. No global skill or target project was installed.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { setup(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
