import { join } from 'node:path';
import { initializeProject, DATABASE_NAME } from './initialize.js';
import { openSqlite, type SqliteConnection } from '../persistence/sqlite.js';
import { migratePrebuild } from '../persistence/prebuild-store.js';
import { inspectPath, PRIVATE_DIRECTORY, resolveProjectRoot } from '../privacy/storage.js';
import { inspectArtifacts, sha256 } from '../privacy/artifacts.js';
import { validatePrebuild, type PrebuildContext, type SavedPrebuild } from '../domain/prebuild.js';
import type { EvaluatedActionDraft } from '../domain/contracts.js';

export function storedPrebuild(db: SqliteConnection): SavedPrebuild | null {
  if (Number(db.get('PRAGMA user_version')?.['user_version']) < 2) return null;
  const row = db.get('SELECT version, body, digest, recorded_at FROM prebuild_revisions ORDER BY version DESC LIMIT 1');
  return row ? { version: Number(row['version']), hash: String(row['digest']), recordedAt: String(row['recorded_at']), context: JSON.parse(String(row['body'])) as PrebuildContext } : null;
}

export function readPrebuild(target: string): SavedPrebuild | null {
  const root = resolveProjectRoot(target);
  if (!inspectPath(join(root, PRIVATE_DIRECTORY))) return null;
  if (!inspectPath(join(root, PRIVATE_DIRECTORY, DATABASE_NAME))) throw new Error('Private workspace has no database; preserve it and review.');
  const location = initializeProject(root);
  if (location.foundationOnly) return null;
  const db = openSqlite(location.database, true);
  try { return storedPrebuild(db); } finally { db.close(); }
}

export function savePrebuild(target: string, input: unknown): SavedPrebuild {
  validatePrebuild(input);
  // Preserve the caller's object; clearing a stale document affects only the new revision.
  const context = structuredClone(input);
  const root = resolveProjectRoot(target);
  if (input.project.artifacts.length) {
    if (!input.project.permissionQuote) throw new Error('Record permission for the selected project files.');
    const artifacts = inspectArtifacts(root, { paths: input.project.artifacts.map(item => item.path), permissionGranted: true, permissionQuote: input.project.permissionQuote });
    if (artifacts.some((item, i) => item.sha256 !== input.project.artifacts[i]?.sha256)) throw new Error('Selected project files changed. Revisit the code observations before saving.');
  }
  const location = initializeProject(root);
  const db = openSqlite(location.database);
  try {
    migratePrebuild(db);
    return db.transaction(() => {
      const current = storedPrebuild(db);
      if ((current?.version ?? 0) !== input.expectedVersion) throw new Error('Pre-build context changed in another session. Resume the latest context before saving.');
      if (current?.context.master && JSON.stringify(current.context.master) === JSON.stringify(context.master) && masterBasis(current.context) !== masterBasis(context)) context.master = null;
      const version = (current?.version ?? 0) + 1;
      const projectId = String(db.get('SELECT id FROM projects LIMIT 1')?.['id']);
      const body = JSON.stringify(context), recordedAt = new Date().toISOString();
      const hash = sha256(JSON.stringify({ projectId, version, context }));
      db.run('INSERT INTO prebuild_revisions VALUES (?, ?, ?, ?, ?)', version, projectId, body, hash, recordedAt);
      return { version, hash, recordedAt, context };
    });
  } finally { db.close(); }
}

function masterBasis(context: PrebuildContext): string {
  const { expectedVersion, brief, preferredName, master, ...basis } = context;
  return JSON.stringify(basis);
}

/** Host context excludes the optional dossier until it is explicitly requested. */
export function compactPrebuild(saved: SavedPrebuild): object {
  const { context: c, ...identity } = saved;
  return { ...identity, synthetic: c.synthetic, stage: c.stage, project: c.project, preferredName: c.preferredName, intention: c.intention, definition: c.definition, feedbackClaimIds: c.feedbackClaimIds, brief: c.brief, buildRequest: c.buildRequest, evaluation: { status: c.evaluation.status, conclusion: c.evaluation.conclusion, promising: c.evaluation.promising, weak: c.evaluation.weak, unknowns: c.evaluation.unknowns, contradictions: c.evaluation.contradictions }, detailCounts: { sources: c.sources.length, claims: c.claims.length, competitors: c.competitors.length, habitats: c.habitats.length, adjacent: c.adjacent.length }, masterAvailable: c.master !== null };
}

export function assertPrebuildReference(db: SqliteConnection, draft: EvaluatedActionDraft): void {
  const saved = storedPrebuild(db);
  if (!saved || saved.version !== draft.context.version || saved.hash !== draft.context.hash) throw new Error('The referenced evaluation changed. Review the latest context and scope before approval.');
  if (saved.context.synthetic !== draft.synthetic) throw new Error('Preserve the context’s synthetic or actual provenance in the action.');
  const intent = saved.context.intention;
  const goal = ['personal', 'bootstrapped'].includes(intent.goal) ? 'custom' : intent.goal;
  const status = intent.status === 'undecided' ? 'skipped' : intent.status;
  if (draft.ideal.intention.goal !== goal || draft.ideal.intention.status !== status || draft.ideal.intention.statement !== intent.statement) throw new Error('Carry the saved intention into the action without inventing or changing the founder’s goal.');
  if (saved.context.project.artifacts.some(contextFile => !draft.artifacts.some(file => file.path === contextFile.path && file.sha256 === contextFile.sha256))) throw new Error('Carry the context’s selected file hashes into the action so approval can detect changed code.');
  if (draft.decision.basis === 'evaluation_ready' && saved.context.evaluation.status !== 'ready') throw new Error('Finish meaningful Evaluate before recommending this action. An explicit build request remains available.');
  if (draft.decision.basis === 'build_requested' && saved.context.buildRequest?.quote !== draft.decision.source) throw new Error('Preserve the actual explicit build request; do not infer permission from missing answers.');
}

export function exportPrebuild(target: string): object {
  const saved = readPrebuild(target);
  if (!saved) throw new Error('No pre-build context to export.');
  return { format: 'business-copilot-prebuild-export-v1', contentHash: sha256(JSON.stringify(saved.context)), context: saved.context };
}

/** Recover selected context into an empty context store; never replace old history. */
export function importPrebuild(target: string, input: unknown): SavedPrebuild {
  if (!input || typeof input !== 'object' || !('format' in input) || input.format !== 'business-copilot-prebuild-export-v1' || !('context' in input) || !('contentHash' in input) || input.contentHash !== sha256(JSON.stringify(input.context))) throw new Error('Invalid or changed pre-build export. Nothing was imported.');
  validatePrebuild(input.context);
  if (readPrebuild(target)) throw new Error('Restore context into a project without pre-build history; existing context will not be overwritten.');
  return savePrebuild(target, { ...input.context, expectedVersion: 0 });
}
