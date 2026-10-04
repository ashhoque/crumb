/** Test-only reconstruction of records written by M0/M1/M1-R/M1-R2.
 * Not imported by production. New-work permission is tested with the real APIs
 * in ide.test.ts. These fixtures exercise old bytes, readers and recovery.
 */
import { randomUUID } from 'node:crypto';
import { initializeProject } from '../src/application/initialize.js';
import { openSqlite, type SqliteConnection } from '../src/persistence/sqlite.js';
import { migrateWorkflow } from '../src/persistence/workflow-store.js';
import { inspectArtifacts, sha256 } from '../src/privacy/artifacts.js';
import { validate, type Approval, type ConversationDraft, type Draft, type EvaluatedActionDraft } from '../src/domain/contracts.js';
import { saveDraft as currentSave, readWorkflow, type SavedDraft, type Cycle } from '../src/application/workflow.js';
import { storedPrebuild } from '../src/application/prebuild.js';

function files(root: string, draft: ConversationDraft): void {
  if (!draft.artifacts.length) return;
  const found = inspectArtifacts(root, { paths: draft.artifacts.map(x => x.path), permissionGranted: draft.artifactPermission.granted, permissionQuote: draft.artifactPermission.quote });
  if (found.some((x, i) => x.sha256 !== draft.artifacts[i]?.sha256)) throw new Error('Selected artifacts changed since inspection.');
}
function oldReference(db: SqliteConnection, draft: EvaluatedActionDraft): void {
  const saved = storedPrebuild(db);
  if (!saved || saved.version !== draft.context.version || saved.hash !== draft.context.hash) throw new Error('The referenced evaluation changed.');
  const c = saved.context;
  if (c.synthetic !== draft.synthetic) throw new Error('Preserve synthetic or actual provenance.');
  const goal = ['personal', 'bootstrapped'].includes(c.intention.goal) ? 'custom' : c.intention.goal;
  const status = c.intention.status === 'undecided' ? 'skipped' : c.intention.status;
  if (draft.ideal.intention.goal !== goal || draft.ideal.intention.status !== status || draft.ideal.intention.statement !== c.intention.statement) throw new Error('Carry the saved intention.');
  if (c.project.artifacts.some(x => !draft.artifacts.some(f => f.path === x.path && f.sha256 === x.sha256))) throw new Error('Carry selected file hashes.');
  if (draft.decision.basis === 'evaluation_ready' && c.evaluation.status !== 'ready') throw new Error('Finish meaningful Evaluate.');
  if (draft.decision.basis === 'build_requested' && c.buildRequest?.quote !== draft.decision.source) throw new Error('Preserve the actual explicit build request.');
}
export function seedHistoricalDraft(root: string, input: unknown): SavedDraft {
  // Current validation must still reject corrupt payloads. Only the explicit
  // retirement of legacy creation is handled by this fixture constructor.
  try { return currentSave(root, input); }
  catch (error) { if (!(error instanceof Error) || !error.message.startsWith('New guided work requires')) throw error; }
  const draft = input as ConversationDraft;
  files(root, draft);
  const location = initializeProject(root), db = openSqlite(location.database);
  try { migrateWorkflow(db); return db.transaction(() => {
    if (db.get('SELECT id FROM cycles')) throw new Error('Historical cycle is immutable.');
    if (draft.contractVersion === 4) oldReference(db, draft);
    else if (storedPrebuild(db)) throw new Error('A legacy preview cannot replace a saved evaluation.');
    const previous = db.get('SELECT version FROM drafts');
    if (Number(previous?.['version'] ?? 0) !== draft.expectedVersion) throw new Error('The draft changed in another session.');
    const version = draft.expectedVersion + 1;
    const hash = sha256(JSON.stringify({ projectId: db.get('SELECT id FROM projects')?.['id'], version, draft }));
    db.run('INSERT INTO drafts VALUES (1, ?, ?, ?) ON CONFLICT(singleton) DO UPDATE SET version=excluded.version, body=excluded.body, digest=excluded.digest', version, JSON.stringify(draft), hash);
    return { version, hash, draft };
  }); } finally { db.close(); }
}
export function seedHistoricalApproval(root: string, input: unknown): Cycle {
  validate<Approval>('approval', input);
  const location = initializeProject(root), db = openSqlite(location.database);
  try { migrateWorkflow(db); return db.transaction(() => {
    const old = db.get('SELECT body FROM cycles');
    if (old) { const c = JSON.parse(String(old['body'])) as Cycle; if (c.draftHash !== input.draftHash) throw new Error('Approved scope is immutable.'); return c; }
    const row = db.get('SELECT body, digest FROM drafts');
    if (!row || row['digest'] !== input.draftHash) throw new Error('Approval does not match the current draft.');
    const draft = JSON.parse(String(row['body'])) as ConversationDraft;
    if (!draft.proposal) throw new Error('This is problem context, not a build scope.');
    if (draft.contractVersion === 4) oldReference(db, draft);
    else if (storedPrebuild(db)) throw new Error('This legacy proposal predates the evaluation.');
    files(root, draft);
    const approvedAt = new Date().toISOString(), foundationId = randomUUID();
    const cycle: Cycle = { id: randomUUID(), foundationId, revision: 1, basis: 'HYPOTHESIS-LED', draftHash: input.draftHash, draft: draft as Draft, approvedAt, approvalQuote: input.approvalQuote };
    db.run('INSERT INTO foundations VALUES (?, ?, 1, ?, ?)', foundationId, String(db.get('SELECT id FROM projects')?.['id']), JSON.stringify(draft.foundation), approvedAt);
    db.run('INSERT INTO cycles VALUES (?, ?, ?, ?, ?)', cycle.id, foundationId, input.draftHash, JSON.stringify(cycle), approvedAt);
    return cycle;
  }); } finally { db.close(); }
}
export function readHistoricalScope(root: string): Cycle {
  const state = readWorkflow(root);
  if (!state.cycle) throw new Error('No approved scope.');
  if (!state.latestReceipt) files(root, state.cycle.draft);
  return state.cycle;
}
