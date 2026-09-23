import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { initializeProject, DATABASE_NAME } from './initialize.js';
import { requireTestedRuntime } from './runtime.js';
import { openSqlite, type SqliteConnection } from '../persistence/sqlite.js';
import { migrateWorkflow } from '../persistence/workflow-store.js';
import { inspectPath, PRIVATE_DIRECTORY, resolveProjectRoot } from '../privacy/storage.js';
import { inspectArtifacts, selectedFileHash, sha256 } from '../privacy/artifacts.js';
import { claimFields, isActionable, validate, type Approval, type ConversationDraft, type Draft, type Receipt } from '../domain/contracts.js';
import { validateConversation } from '../domain/conversation.js';

export interface SavedDraft { version: number; hash: string; draft: ConversationDraft }
export interface Cycle { id: string; foundationId: string; revision: 1; basis: 'HYPOTHESIS-LED'; draftHash: string; draft: Draft; approvedAt: string; approvalQuote: string }
export interface BuildReceipt extends Receipt {
  id: string; recordedAt: string; fileHashes: Record<string, string | null>;
  release: 'not_released'; customerExposure: 'not_recorded'; customerValidation: 'not_established';
  provenance: 'host_report_with_local_file_hashes';
}
export interface WorkflowState { initialized: boolean; projectId: string | null; draft: SavedDraft | null; cycle: Cycle | null; latestReceipt: BuildReceipt | null }

function withStore<T>(target: string, operation: (db: SqliteConnection, root: string) => T): T {
  const location = initializeProject(target);
  const db = openSqlite(location.database);
  try { migrateWorkflow(db); return operation(db, location.projectRoot); }
  finally { db.close(); }
}

function storedDraft(db: SqliteConnection): SavedDraft | null {
  const row = db.get('SELECT version, body, digest FROM drafts WHERE singleton = 1');
  return row ? { version: Number(row['version']), hash: String(row['digest']), draft: JSON.parse(String(row['body'])) as ConversationDraft } : null;
}

function storedCycle(db: SqliteConnection): Cycle | null {
  const row = db.get('SELECT body FROM cycles LIMIT 1');
  return row ? JSON.parse(String(row['body'])) as Cycle : null;
}

function verifyArtifacts(root: string, draft: ConversationDraft): void {
  if (draft.artifacts.length === 0) return;
  const artifacts = inspectArtifacts(root, { paths: draft.artifacts.map(item => item.path), permissionGranted: draft.artifactPermission.granted, permissionQuote: draft.artifactPermission.quote });
  if (artifacts.some((item, index) => item.sha256 !== draft.artifacts[index]?.sha256)) throw new Error('Selected artifacts changed since inspection. Review the changed files with permission and save a revised draft before approval.');
}

function validateDraft(input: unknown): asserts input is ConversationDraft {
  validate<ConversationDraft>('draft', input);
  validateConversation(input);
  if (Buffer.byteLength(JSON.stringify(input)) > 16_384) throw new Error('Keep the draft below 16 KiB; retain only the current test context.');
  if (input.proposal?.method === 'build' && input.proposal.capabilities.length === 0) throw new Error('A build test needs one to three capabilities.');
  if (input.artifacts.length > 0 && (!input.artifactPermission.granted || !input.artifactPermission.quote.trim())) throw new Error('Record the founder permission before selected artifact reads.');
  const claims = claimFields.map(name => input.foundation[name]);
  if (input.contractVersion !== 1) claims.push(input.ideal.consequence);
  for (const claim of claims) {
    if ((claim.value === null) !== (claim.basis === 'unknown')) throw new Error('Unknown/skipped fields must use null and the unknown basis; do not fill them with guesses.');
    if (claim.basis === 'artifact_observation' && !input.artifacts.some(item => item.path === claim.source)) throw new Error('Artifact observations must reference a selected, permitted artifact.');
    if (claim.basis === 'founder_statement' && !claim.source) throw new Error('Founder statements need a short reference to the actual founder input.');
  }
}

export function saveDraft(target: string, input: unknown): SavedDraft {
  validateDraft(input);
  // Validate before initializing or saving; reading is limited to granted selections.
  verifyArtifacts(resolveProjectRoot(target), input);
  return withStore(target, db => db.transaction(() => {
    if (storedCycle(db)) throw new Error('M1 already has an approved cycle. It is immutable; additional cycles are deferred.');
    const old = storedDraft(db);
    if ((old?.version ?? 0) !== input.expectedVersion) throw new Error('The draft changed in another session. Read current context, then review your revision.');
    const version = (old?.version ?? 0) + 1;
    const body = JSON.stringify(input);
    const hash = sha256(JSON.stringify({ projectId: db.get('SELECT id FROM projects LIMIT 1')?.['id'], version, draft: input }));
    db.run('INSERT INTO drafts VALUES (1, ?, ?, ?) ON CONFLICT(singleton) DO UPDATE SET version=excluded.version, body=excluded.body, digest=excluded.digest', version, body, hash);
    return { version, hash, draft: input };
  }));
}

export function approveDraft(target: string, input: unknown): Cycle {
  validate<Approval>('approval', input);
  return withStore(target, (db, root) => db.transaction(() => {
    const existing = storedCycle(db);
    if (existing) {
      if (existing.draftHash === input.draftHash) return existing;
      throw new Error('The approved M1 scope is immutable. Approval does not authorize another cycle.');
    }
    const draft = storedDraft(db);
    if (!draft || draft.hash !== input.draftHash) throw new Error('Approval does not match the current draft. Show the current scope and obtain its approval.');
    if (!isActionable(draft.draft)) throw new Error('This is problem context, not a build scope. Show a small proposal before requesting approval.');
    verifyArtifacts(root, draft.draft);
    const approvedAt = new Date().toISOString();
    const foundationId = randomUUID();
    const cycle: Cycle = { id: randomUUID(), foundationId, revision: 1, basis: 'HYPOTHESIS-LED', draftHash: draft.hash, draft: draft.draft, approvedAt, approvalQuote: input.approvalQuote };
    db.run('INSERT INTO foundations VALUES (?, ?, 1, ?, ?)', foundationId, String(db.get('SELECT id FROM projects LIMIT 1')?.['id']), JSON.stringify(draft.draft.foundation), approvedAt);
    db.run('INSERT INTO cycles VALUES (?, ?, ?, ?, ?)', cycle.id, foundationId, draft.hash, JSON.stringify(cycle), approvedAt);
    return cycle;
  }));
}

export function readWorkflow(target: string): WorkflowState {
  requireTestedRuntime();
  const root = resolveProjectRoot(target);
  const empty = { initialized: false, projectId: null, draft: null, cycle: null, latestReceipt: null };
  // Do not create a workspace or ask onboarding again when merely checking context.
  if (!inspectPath(join(root, PRIVATE_DIRECTORY))) return empty;
  if (!inspectPath(join(root, PRIVATE_DIRECTORY, DATABASE_NAME))) throw new Error('Private workspace has no database. Preserve it and review before proceeding.');
  const location = initializeProject(root);
  if (location.foundationOnly) return { ...empty, initialized: true };
  const db = openSqlite(location.database, true);
  try {
    const latest = db.get('SELECT body FROM receipts ORDER BY rowid DESC LIMIT 1');
    return { initialized: true, projectId: String(db.get('SELECT id FROM projects LIMIT 1')?.['id']), draft: storedDraft(db), cycle: storedCycle(db), latestReceipt: latest ? JSON.parse(String(latest['body'])) as BuildReceipt : null };
  } finally { db.close(); }
}

export function approvedHandoff(target: string): Cycle {
  const state = readWorkflow(target);
  if (!state.cycle) throw new Error('No approved scope. Show the draft and wait for founder approval before implementation.');
  if (!state.latestReceipt) verifyArtifacts(resolveProjectRoot(target), state.cycle.draft);
  return state.cycle;
}

export function recordReceipt(target: string, input: unknown): BuildReceipt {
  validate<Receipt>('receipt', input);
  for (const check of input.checks) {
    const expected = !check.executed ? 'not_run' : check.exitCode === 0 ? 'passed' : 'failed';
    if (check.result !== expected || (!check.executed && check.exitCode !== null) || (check.executed && check.exitCode === null)) throw new Error('Test result contradicts execution/exit code. Failed or unexecuted checks cannot be recorded as passed.');
  }
  if (input.implementation === 'completed' && (!input.checks.some(check => check.executed) || input.checks.some(check => check.result !== 'passed'))) throw new Error('Completed implementation needs executed passing checks. Record partial work and gaps for failed/unexecuted acceptance.');
  if (new Set(input.changes.map(item => item.path.replaceAll('\\', '/').toLowerCase())).size !== input.changes.length) throw new Error('Receipt paths must be unique.');
  return withStore(target, (db, root) => db.transaction(() => {
    const cycle = storedCycle(db);
    if (!cycle || cycle.id !== input.cycleId) throw new Error('Receipt requires the actual approved cycle; no implementation is implied by a draft.');
    if ((cycle.draft.proposal.method === 'learning') !== (input.implementation === 'not_applicable')) throw new Error('Record learning-only work without implying a software implementation.');
    if (input.implementation === 'not_applicable' && input.changes.length > 0) throw new Error('Learning-only scope does not authorize code changes.');
    if (input.implementation === 'completed' && input.changes.length === 0) throw new Error('Record changed files for a completed build; otherwise record partial/not-started work.');
    const fileHashes: Record<string, string | null> = {};
    for (const change of input.changes) {
      const hash = selectedFileHash(root, change.path);
      if ((change.kind === 'deleted') !== (hash === null)) throw new Error('Receipt change kind does not match the selected file on disk.');
      fileHashes[change.path] = hash;
    }
    const receipt: BuildReceipt = { ...input, id: randomUUID(), recordedAt: new Date().toISOString(), fileHashes, release: 'not_released', customerExposure: 'not_recorded', customerValidation: 'not_established', provenance: 'host_report_with_local_file_hashes' };
    db.run('INSERT INTO receipts VALUES (?, ?, ?, ?)', receipt.id, cycle.id, JSON.stringify(receipt), receipt.recordedAt);
    return receipt;
  }));
}

/** Context is bounded to current scope and a compact latest receipt, never all history. */
export function compactContext(target: string): object {
  const state = readWorkflow(target);
  const { latestReceipt, ...current } = state;
  return { ...current, draft: state.cycle ? null : state.draft, latestReceipt: latestReceipt ? { id: latestReceipt.id, implementation: latestReceipt.implementation, changedPaths: latestReceipt.changes, checks: latestReceipt.checks.map(({ label, result }) => ({ label, result })), gaps: latestReceipt.gaps, runInstructions: latestReceipt.runInstructions, release: latestReceipt.release, customerExposure: latestReceipt.customerExposure, customerValidation: latestReceipt.customerValidation } : null };
}
