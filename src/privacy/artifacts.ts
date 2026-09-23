import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, isAbsolute } from 'node:path';
import { inspectPath, resolveProjectRoot } from './storage.js';
import { validate, type ArtifactRequest } from '../domain/contracts.js';

export const sha256 = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex');

/** Selected project files only. Never traverse secrets, metadata or private CEC state. */
export function selectedPath(root: string, relative: string): string {
  const parts = relative.split(/[\\/]/);
  if (isAbsolute(relative) || parts.some(part => !part || part === '..' || part.startsWith('.') || /[:\x00-\x1f]/.test(part)) || parts.some(part => /^(node_modules|credentials?|secrets?|auth)(\.|$)/i.test(part)) || /\.(pem|key|pfx|p12|sqlite|db)$/i.test(relative)) {
    throw new Error('Select a normal relative source/document path; secret, hidden, private, linked and outside paths are excluded.');
  }
  let current = root;
  for (const [index, part] of parts.entries()) {
    current = join(current, part);
    const info = inspectPath(current);
    if (index < parts.length - 1 && info && !info.isDirectory()) throw new Error('A selected path parent is not a directory.');
  }
  return current;
}

export function inspectArtifacts(target: string, input: unknown): { path: string; sha256: string; text: string }[] {
  validate<ArtifactRequest>('inspect', input);
  const root = resolveProjectRoot(target);
  let total = 0;
  return input.paths.map(path => {
    const file = selectedPath(root, path);
    const info = inspectPath(file);
    if (!info?.isFile() || info.size > 16_384 || (total += Number(info.size)) > 49_152) throw new Error('Choose at most 6 UTF-8 artifacts, each at most 16 KiB and 48 KiB total. Select a smaller file or summarize it as a founder statement.');
    const bytes = readFileSync(file);
    let text: string;
    try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
    catch { throw new Error('Selected artifacts must be UTF-8 text.'); }
    if (text.includes('\0')) throw new Error('Binary artifacts are not supported for orientation.');
    return { path, sha256: sha256(bytes), text };
  });
}

export function selectedFileHash(root: string, path: string): string | null {
  const file = selectedPath(root, path);
  const info = inspectPath(file);
  if (!info) return null;
  if (!info.isFile() || info.size > 2_097_152) throw new Error('Receipt paths must be normal files of at most 2 MiB.');
  return sha256(readFileSync(file));
}
