import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { codexCommand, trustOverride } from './launch-alpha.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function writeOwned(path, bytes) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporary, bytes, { flag: 'wx' });
    renameSync(temporary, path);
  } finally { if (existsSync(temporary)) unlinkSync(temporary); }
}
export function installSkill({ home = homedir(), runtime = root } = {}) {
  const source = join(runtime, '.agents/skills/crumb');
  const target = join(home, '.agents/skills/crumb');
  // Refuse linked paths and unrelated/modified Crumb files; never replace other skills.
  for (const path of [home, join(home, '.agents'), join(home, '.agents/skills'), target]) {
    if (existsSync(path) && lstatSync(path).isSymbolicLink()) throw new Error(`Linked installation path: ${path}`);
  }
  const manifestPath = join(target, '.crumb-alpha.json');
  if (existsSync(manifestPath) && lstatSync(manifestPath).isSymbolicLink()) throw new Error('Linked skill ownership manifest.');
  const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : null;
  const files = {};
  function collect(folder, prefix = '') {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const name = prefix + entry.name;
      if (entry.isDirectory()) collect(join(folder, entry.name), name + '/');
      else if (entry.isFile()) files[name] = readFileSync(join(folder, entry.name));
      else throw new Error('Skill source contains a linked or unsupported file.');
    }
  }
  collect(source);
  files['runtime.json'] = Buffer.from(JSON.stringify({ root: runtime, node: process.execPath, cli: join(runtime, 'dist/src/cli/main.js') }, null, 2) + '\n');
  if (!existsSync(join(runtime, 'dist/src/cli/main.js'))) throw new Error('Build Crumb before installing the skill.');
  if (existsSync(target) && !previous) throw new Error(`An existing Crumb skill is not owned by this installer: ${target}. It was preserved.`);
  for (const name of Object.keys(files)) {
    const to = join(target, name);
    let parent = dirname(to);
    while (parent !== target) {
      if (existsSync(parent) && lstatSync(parent).isSymbolicLink()) throw new Error(`Linked skill directory: ${parent}`);
      parent = dirname(parent);
    }
    if (existsSync(to) && (lstatSync(to).isSymbolicLink() ||
      ![previous?.files?.[name], hash(files[name])].includes(hash(readFileSync(to))))) throw new Error(`Modified skill file preserved: ${to}`);
  }
  // Record ownership before copying so an interrupted fresh copy can be repaired.
  mkdirSync(target, { recursive: true });
  const manifest = JSON.stringify({ files: Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name, hash(bytes)])) }, null, 2) + '\n';
  // Keep the old manifest through updates so either old or new bytes are recoverable.
  if (!previous) writeOwned(manifestPath, manifest);
  for (const [name, bytes] of Object.entries(files)) {
    const to = join(target, name);
    mkdirSync(dirname(to), { recursive: true });
    writeOwned(to, bytes);
    if (hash(readFileSync(to)) !== hash(bytes)) throw new Error(`Skill copy verification failed: ${name}`);
  }
  writeOwned(manifestPath, manifest);
  return join(target, 'SKILL.md');
}

export async function verifyHost({ workspace, skill, executable = process.env.CRUMB_CODEX ?? 'codex', env = process.env, scope = 'user', verifyLaunch = false } = {}) {
  // npm installs Codex as PowerShell/.cmd shims; Windows cannot spawn those directly.
  const shim = /\.(cmd|bat|ps1)$/i.test(executable);
  const resolved = verifyLaunch ? codexCommand(executable) : null;
  const child = spawn(resolved?.command ?? (shim ? 'powershell.exe' : executable), resolved
    ? [...resolved.prefix, 'app-server', '--stdio', '-c', trustOverride(workspace)] : shim
    ? ['-NoLogo', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '& $env:CRUMB_CODEX app-server --stdio; exit $LASTEXITCODE']
    : ['app-server', '--stdio'], { cwd: workspace, env: { ...env, CRUMB_CODEX: executable }, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
  const lines = createInterface({ input: child.stdout });
  const pending = new Map();
  let sequence = 0;
  const fail = error => { for (const p of pending.values()) { clearTimeout(p.timer); p.reject(error); } pending.clear(); };
  child.on('error', fail);
  child.on('exit', () => fail(new Error('Codex verification host exited.')));
  child.stdin.on('error', fail);
  child.stderr.resume();
  lines.on('line', line => {
    let msg; try { msg = JSON.parse(line); } catch { return; }
    const p = pending.get(msg.id); if (!p) return;
    pending.delete(msg.id); clearTimeout(p.timer);
    msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
  });
  const request = (method, params) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out.`)); }, 20000);
    pending.set(id, { resolve, reject, timer });
    child.stdin.write(JSON.stringify({ id, method, params }) + '\n');
  });
  try {
    await request('initialize', { clientInfo: { name: 'crumb_alpha_setup', version: '1' } });
    child.stdin.write(JSON.stringify({ method: 'initialized', params: {} }) + '\n');
    const config = await request('config/read', { includeLayers: verifyLaunch }); // Native parser validates without rewriting TOML.
    if (verifyLaunch && !config.layers?.some(layer => layer.config?.projects?.[workspace]?.trust_level === 'trusted')) throw new Error('Codex did not accept the scoped launch trust override.');
    const list = await request('skills/list', { cwds: [workspace], forceReload: true });
    const same = path => resolve(path).toLowerCase() === resolve(skill).toLowerCase();
    const found = list.data?.flatMap(item => item.skills ?? []).find(item => item.name === 'crumb' && same(item.path));
    if (!found?.enabled || found.scope !== scope) throw new Error(`Codex did not discover the enabled ${scope} Crumb skill: ` + JSON.stringify(list.data?.flatMap(item => item.skills ?? []).filter(item => item.name === 'crumb').map(({ path, scope, enabled }) => ({ path, scope, enabled }))));
    return { discovery: true, scope: found.scope, requiredMcpServers: [] };
  } finally {
    child.stdin.end(); child.kill(); lines.close(); fail(new Error('Verification ended.'));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log('[3/5] Configuring Codex...');
    const skill = installSkill();
    console.log('[4/5] Connecting Crumb...');
    // M1-R2 on alpha-testing-layer invokes the local CLI; there is no MCP dependency.
    console.log('[5/5] Verifying installation...');
    const result = await verifyHost({ workspace: process.env.CRUMB_ALPHA_WORKSPACE, skill, verifyLaunch: true });
    console.log(`Global Crumb skill verified (${result.scope}); local CLI integration ready.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
