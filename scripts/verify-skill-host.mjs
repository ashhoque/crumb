import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Opt-in M3 integration check: one synthetic ephemeral turn in the installed
// Codex host. It uses normal host authentication; it never reads credentials.
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const expectedPath = join(process.env.USERPROFILE??'', '.agents/skills/crumb/SKILL.md');
const result = { timestamp: new Date().toISOString(), discovery: false, invocation: false, markerObserved: false };
const child = spawn('codex', ['app-server', '--stdio'], { cwd: root, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
const pending = new Map();
let sequence = 0;
let diagnostic = '';
let agentText = '';
let complete;
let timer;
const completion = new Promise(resolve => { complete = resolve; });
const lines = createInterface({ input: child.stdout });
child.stderr.on('data', chunk => { diagnostic += chunk.toString(); });
child.stdin.on('error', () => {});
function rejectPending(message) {
  for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error(message)); }
  pending.clear();
}
child.on('error', () => rejectPending('The installed Codex executable could not start.'));
child.on('exit', () => { rejectPending('Codex app-server exited before responding.'); complete({ status: 'failed' }); });
lines.on('line', line => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  if (message.id !== undefined && !message.method && pending.has(message.id)) {
    const request = pending.get(message.id);
    pending.delete(message.id); clearTimeout(request.timer);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  }
  if (message.method === 'item/completed' && message.params?.item?.type === 'agentMessage') agentText += message.params.item.text ?? '';
  if (message.method === 'turn/completed') complete(message.params.turn);
  if (message.method && message.id !== undefined) {
    child.stdin.write(JSON.stringify({ id: message.id, error: { code: -32601, message: 'This synthetic probe authorizes no tools, approvals or external app operations.' } }) + '\n');
  }
});
function request(method, params) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`${method} timed out after 25 seconds.`)); }, 25_000);
    pending.set(id, { resolve, reject, timer });
    child.stdin.write(JSON.stringify({ id, method, params }) + '\n');
  });
}
const normalize = path => process.platform === 'win32' ? resolve(path).toLowerCase() : resolve(path);
console.log('Checking the single global Crumb skill and one synthetic invocation in the installed Codex host.');
try {
  await request('initialize', { clientInfo: { name: 'business_copilot_host_check', version: '0.0.0' }, capabilities: { experimentalApi: true } });
  child.stdin.write(JSON.stringify({ method: 'initialized', params: {} }) + '\n');
  const list = await request('skills/list', { cwds: [root], forceReload: true });
  const skill = list.data?.flatMap(item => item.skills ?? []).find(skill => skill.name === 'crumb' && normalize(skill.path) === normalize(expectedPath));
  result.discovery = skill?.enabled === true;
  if (!result.discovery) throw new Error('The expected global skill was not discovered and enabled.');
  const thread = await request('thread/start', { cwd: root, ephemeral: true, sandbox: 'read-only', approvalPolicy: 'never', developerInstructions: 'This is only a synthetic skill invocation test. Respond to its discovery probe only. Do not use tools, read files, change files, or implement code.' });
  await request('turn/start', { threadId: thread.thread.id, input: [{ type: 'text', text: '$crumb Run the discovery probe only.' }, { type: 'skill', name: skill.name, path: skill.path }] });
  const turn = await Promise.race([completion, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Skill invocation timed out after 60 seconds.')), 60_000); })]);
  result.markerObserved = agentText.includes('CRUMB_M3_SKILL_LOADED');
  result.invocation = turn.status === 'completed' && result.markerObserved;
  result.turnStatus = turn.status;
} catch (error) {
  result.error = error.message;
} finally {
  clearTimeout(timer);
  result.homeDirectoryUnavailable = /Could not find home directory/i.test(diagnostic);
  result.accessDenied = /Access is denied|Permission denied/i.test(diagnostic);
  child.stdin.end(); child.kill(); lines.close(); rejectPending('Probe ended.');
  mkdirSync(join(root, '.m0-local'), { recursive: true });
  writeFileSync(join(root, '.m0-local/host-check.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  if (!result.discovery || !result.invocation) process.exitCode = 1;
}
