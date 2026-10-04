import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openSqlite } from '../persistence/sqlite.js';
import { inspectPath, PRIVATE_DIRECTORY, resolveProjectRoot } from '../privacy/storage.js';
import { selectedPath, sha256 } from '../privacy/artifacts.js';
import { APPLICATION_ID, DATABASE_NAME } from './initialize.js';
import { storedPrebuild } from './prebuild.js';
import { stored as storedAct, compactAct } from './act.js';
import { conversationContext } from '../domain/session.js';
import { basis, confirmation } from '../domain/ide.js';
import { discoveryCards } from '../domain/first-user-discovery.js';

export const contextReads = ['get_current_context','get_confirmed_intention','get_confirmed_user','get_confirmed_problem','get_current_evaluation','get_user_habitats','get_first_user_avenues','get_build_handoff','get_current_build_stage','search_research'] as const;
export type ContextRead = typeof contextReads[number];
export const freshContext = { available:false, reason:'Fresh conversation. Saved idea context is available only when the founder explicitly continues that project.' } as const;

function explicitContinuation(value: unknown): boolean {
  if (value === undefined) return false;
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Use a fresh conversation or an explicit continuation scope.');
  const scope = value as Record<string, unknown>;
  if (Object.keys(scope).some(k=>!['mode','conversationId'].includes(k)) || scope.mode !== 'continue' || typeof scope.conversationId !== 'string' || !/^[A-Za-z0-9_-]{8,120}$/.test(scope.conversationId)) throw new Error('Continuing saved context needs a current conversation identifier and explicit founder intent.');
  return true;
}

/** Core read boundary: no initializer, migrations, artifact refresh, network or
 * approval mutations. The MCP transport delegates here, never implements IDE. */
export function readContext(target: string, name: ContextRead, args: Record<string, unknown> = {}): unknown {
  if (!contextReads.includes(name)) throw new Error('Unknown read-only context tool.');
  if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('Use an argument object.');
  if (Object.keys(args).some(k => !['scope',...(name === 'search_research' ? ['query','limit'] : [])].includes(k))) throw new Error('Only a continuation scope and bounded research search accept arguments; project and permissions are fixed at startup.');
  if (name === 'search_research' && (typeof args.query !== 'string' || !args.query.trim() || args.query.length > 120 || (args.limit !== undefined && (!Number.isInteger(args.limit) || Number(args.limit) < 1 || Number(args.limit) > 6)))) throw new Error('Search with 1–120 characters and a limit from one to six.');
  // A repository is not a conversation. Do not even open its private database
  // until the host has identified this turn as an explicit continuation.
  if (!explicitContinuation(args.scope)) return freshContext;
  const root = resolveProjectRoot(target), directory = join(root, PRIVATE_DIRECTORY);
  if (!inspectPath(directory)) return { available:false, reason:'No saved Crumb context. No project was initialized.' };
  const file = join(directory, DATABASE_NAME);
  if (!inspectPath(file)?.isFile()) throw new Error('Saved context database is unavailable.');
  const db = openSqlite(file, true);
  try {
    if (Number(db.get('PRAGMA application_id')?.application_id) !== APPLICATION_ID) throw new Error('Unrecognized context database.');
    const saved = storedPrebuild(db);
    if (!saved || saved.context.contractVersion !== 2) return { available:false, reason:'No current IDE context. Retained history was not changed.' };
    const c = saved.context, compact = conversationContext(saved);
    const envelope = { revision:saved.version, synthetic:c.synthetic, readOnly:true };
    if (name === 'get_current_context') return { ...envelope, context:compact };
    if (name.startsWith('get_confirmed_')) {
      const subject = name.slice('get_confirmed_'.length) as 'intention'|'user'|'problem';
      const value = compact[subject];
      return { ...envelope, confirmed:value.confirmed, text:value.confirmed ? value.text : null };
    }
    if (name === 'get_current_evaluation') return { ...envelope, ...compact.evaluation, technical:compact.quality??null };
    if (name === 'get_user_habitats') return { ...envelope, habitats:compact.habitats };
    if (name === 'get_first_user_avenues') return { ...envelope, avenues:compact.habitats, candidates:discoveryCards(c).slice(0,3), permission:'No outreach permission or willingness is implied.' };
    if (name === 'get_current_build_stage') {
      const act = storedAct(db);
      return { ...envelope, current:!!act && act.record.ideBasis === basis(c,'act') && !!confirmation(c,'act'), stage:act ? compactAct(act) : null, instruction:'Read-only preview. Execution still requires the core stage handoff and current approval.' };
    }
    if (name === 'get_build_handoff') {
      const path = selectedPath(root,'BUILD_HANDOFF.json');
      const info = inspectPath(path);
      if (!info) return { ...envelope, available:false };
      if (!info.isFile() || info.size > 32768) throw new Error('Unrecognized build handoff.');
      const body = readFileSync(path,'utf8'), manifestPath = selectedPath(root,'COPILOT_SESSION.json');
      const manifestInfo=inspectPath(manifestPath);
      if (!manifestInfo?.isFile() || manifestInfo.size>32768) throw new Error('Missing or oversized handoff ownership manifest.');
      const manifest = JSON.parse(readFileSync(manifestPath,'utf8'));
      const { digest, ...owned } = manifest;
      const handoff = JSON.parse(body);
      if (sha256(JSON.stringify(owned)) !== digest || manifest.files?.['BUILD_HANDOFF.json'] !== sha256(body) || handoff.contextHash !== saved.hash || handoff.actConfirmation?.id !== confirmation(c,'act')?.id || !confirmation(c,'act')) throw new Error('Handoff is stale, edited or unconfirmed. Refresh it through Crumb Core.');
      return { ...envelope, available:true, handoff, executionApproved:false };
    }
    const query = String(args.query).trim().toLocaleLowerCase(), limit = Number(args.limit??4);
    // Public/synthetic source summaries only; raw interview notes and private
    // customer identities never enter routine model context through this tool.
    const matches = c.sources.filter(s => ['public','synthetic_fixture'].includes(s.provenance) && !s.archived && `${s.id} ${s.title} ${s.retainedText}`.toLocaleLowerCase().includes(query));
    return { ...envelope, items:matches.slice(0,limit).map(s=>({id:s.id,title:s.title,url:s.url,access:s.access,provenance:s.provenance,retrievedOn:s.retrievedOn,observation:s.retainedText.slice(0,700),limitation:s.limitation.slice(0,400)})), more:matches.length>limit, freshSearch:false };
  } finally { db.close(); }
}
