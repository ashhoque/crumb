// Opt-in native Windows discovery check; isolated HOME/CODEX_HOME, no auth copied.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { installSkill, verifyHost } from './install-alpha.mjs';
const home = resolve('.m0-local/alpha host profile');
const workspace = join(home, 'workspace');
mkdirSync(workspace, { recursive: true });
mkdirSync(join(home, '.codex'), { recursive: true });
const config = '# preserved test configuration\nweb_search = "disabled"\n';
const configPath = join(home, '.codex/config.toml');
writeFileSync(configPath, config);
const skill = installSkill({ home });
installSkill({ home });
const env = { ...process.env, HOME: home, USERPROFILE: home, CODEX_HOME: join(home, '.codex') };
let executable;
if (process.argv.includes('--shim')) {
  env.CRUMB_REAL_CODEX = process.env.CRUMB_REAL_CODEX;
  if (!env.CRUMB_REAL_CODEX) throw new Error('Provide CRUMB_REAL_CODEX for the native shim probe.');
  executable = join(home, 'codex shim.ps1');
  writeFileSync(executable, '& $env:CRUMB_REAL_CODEX @args\nexit $LASTEXITCODE\n');
}
// On Windows Codex obtains the OS account home, ignoring these overrides. This
// profile lives beneath a repo, so its copied skill has repo scope in this probe.
const result = await verifyHost({ workspace, skill, env, executable, scope: 'repo', verifyLaunch: !process.argv.includes('--shim') });
if (readFileSync(configPath, 'utf8') !== config) throw new Error('Config changed.');
console.log(JSON.stringify({ ...result, repeatInstall: true, configPreserved: true, globalDiscoveryVerified: false }));
