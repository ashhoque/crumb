import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function codexCommand(executable) {
  if (!executable) throw new Error('Codex executable was not resolved.');
  if (!/\.(cmd|bat|ps1)$/i.test(executable)) return { command: executable, prefix: [] };
  // Official npm Codex shims all delegate to this JS entry point. Invoke it
  // directly so legacy PowerShell/cmd cannot strip TOML quotes or split paths.
  const entry = join(dirname(executable), 'node_modules/@openai/codex/bin/codex.js');
  if (!existsSync(entry)) throw new Error(`Unsupported Codex shim: ${executable}. Expected the official npm Codex entry point at ${entry}.`);
  return { command: process.execPath, prefix: [entry] };
}
export const trustOverride = workspace => `projects={${JSON.stringify(workspace)}={trust_level="trusted"}}`;
export function launchArgs(workspace) {
  return ['-C', workspace, '-c', trustOverride(workspace), '$crumb Welcome me to the closed alpha and help me begin testing. Use your installed runtime.json for local tools. Ask what I want to work on; do not start a demo or build automatically.'];
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { command, prefix } = codexCommand(process.env.CRUMB_CODEX);
    const child = spawn(command, [...prefix, ...launchArgs(process.env.CRUMB_ALPHA_WORKSPACE)], { stdio: 'inherit' });
    child.on('error', error => { console.error(`Codex launch failed: ${error.message}`); process.exitCode = 1; });
    child.on('exit', code => { process.exitCode = code ?? 1; });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
