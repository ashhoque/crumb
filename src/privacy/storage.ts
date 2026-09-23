import { lstatSync, realpathSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { parse, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

export const PRIVATE_DIRECTORY = '.customer-evidence';
export const IGNORE_RULE = '/.customer-evidence/';

export function inspectPath(file: string): ReturnType<typeof lstatSync> | undefined {
  try {
    const info = lstatSync(file);
    if (info.isSymbolicLink()) throw new Error('Linked storage or configuration paths are not supported. No private data was written.');
    if (info.isFile() && info.nlink !== 1) throw new Error('Hard-linked storage or configuration files are not supported.');
    return info;
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return undefined;
    throw error;
  }
}

export function resolveProjectRoot(input: string): string {
  const root = resolve(input);
  if (root === parse(root).root || root.startsWith('\\\\')) throw new Error('Choose a normal local project folder, not a drive root or network share.');
  if (!inspectPath(root)?.isDirectory()) throw new Error('The target must be an existing project directory.');
  const canonical = realpathSync.native(root);
  const fold = (value: string): string => process.platform === 'win32' ? value.toLowerCase() : value;
  if (fold(canonical) !== fold(root)) throw new Error('Linked project roots or ancestors are not supported.');
  if (root.split(/[\\/]/).some(part => ['.git', PRIVATE_DIRECTORY].includes(part.toLowerCase()))) {
    throw new Error('The project root cannot be inside Git metadata or a CEC private workspace.');
  }
  return canonical;
}

function git(root: string, args: string[]): ReturnType<typeof spawnSync> {
  const result = spawnSync('git', ['--no-optional-locks', '-C', root, ...args], {
    encoding: 'utf8', windowsHide: true, timeout: 10_000,
    env: { ...process.env, LC_ALL: 'C' },
  });
  if (result.error) throw new Error('Git inspection could not run. Fix Git access before initializing private storage.');
  return result;
}

export function inspectGit(root: string): boolean {
  const result = git(root, ['rev-parse', '--is-inside-work-tree']);
  if (result.status === 0 && String(result.stdout).trim() === 'true') return true;
  if (result.status !== 0 && String(result.stderr).includes('not a git repository')) return false;
  throw new Error('Git state cannot be verified. Resolve repository ownership/access or bare-repository constraints before initialization; no trust settings were changed.');
}

export function refuseTrackedPrivateData(root: string): void {
  const result = git(root, ['ls-files', '--cached', '-z', '--', `:(icase,literal)${PRIVATE_DIRECTORY}`]);
  if (result.status !== 0) throw new Error('The Git index could not be inspected; initialization stopped.');
  if (String(result.stdout).length > 0) {
    throw new Error('Private CEC data is already tracked by Git. Initialization stopped. Review the index and any published history, preserve a backup, then explicitly remove private paths from tracking. CEC will not untrack or delete them automatically.');
  }
}

function gitIgnoresPrivatePaths(root: string): boolean {
  return [`${PRIVATE_DIRECTORY}/`, `${PRIVATE_DIRECTORY}/__cec_privacy_probe__`].every(file => {
    const result = git(root, ['check-ignore', '--no-index', '-q', '--', file]);
    if (result.status === 0) return true;
    if (result.status === 1) return false;
    throw new Error('Git ignore protection could not be verified; initialization stopped.');
  });
}

export function ensurePrivateIgnore(root: string, inGit: boolean): boolean {
  const file = resolve(root, '.gitignore');
  const info = inspectPath(file);
  if (info && !info.isFile()) throw new Error('.gitignore must be a regular file; initialization stopped.');
  const original = info ? readFileSync(file) : Buffer.alloc(0);
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(original); }
  catch { throw new Error('Existing .gitignore is not UTF-8; preserve it and review its encoding before initialization.'); }
  const lines = text.split(/\r?\n/);
  const explicit = lines.includes(IGNORE_RULE);
  const finalRule = lines.filter(line => line.trim() && !line.startsWith('#')).at(-1);
  if (explicit && (inGit ? gitIgnoresPrivatePaths(root) : finalRule === IGNORE_RULE)) return false;
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const prefix = original.length > 0 && !text.endsWith('\n') ? newline : '';
  const addition = `${prefix}# CEC private workspace${newline}${IGNORE_RULE}${newline}`;
  if (info) appendFileSync(file, addition, 'utf8');
  else writeFileSync(file, addition, { encoding: 'utf8', flag: 'wx' });
  if (inGit && !gitIgnoresPrivatePaths(root)) throw new Error('Private paths are not effectively ignored. No private storage was created.');
  return true;
}
