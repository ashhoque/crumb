import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { temporaryProject } from './helpers.js';
import { prepareIde, ideFixture, confirmSubject, actionFor } from './ide-fixtures.js';
import { savePrebuild, readPrebuild, transitionIde, exportPrebuild, importPrebuild } from '../src/application/prebuild.js';
import { saveDraft, approveDraft, approvedHandoff, readWorkflow, recordReceipt } from '../src/application/workflow.js';
import { assertAct, ideState, confirmation, upgradeContext, type IdeContext, type Subject } from '../src/domain/ide.js';
import { renderPrebuildSummary, renderPrebuildDetail, renderStartupMaster, renderFullResearch } from '../src/cli/prebuild-render.js';
import { createBackup } from '../src/application/backup.js';
import { inspectArtifacts } from '../src/privacy/artifacts.js';
import { openSqlite } from '../src/persistence/sqlite.js';
import { initializeProject } from '../src/application/initialize.js';
import { seedHistoricalDraft, seedHistoricalApproval } from './historical-fixtures.js';
import type { ConversationDraft } from '../src/domain/contracts.js';

const cli = fileURLToPath(new URL('../src/cli/main.js', import.meta.url));
const current = (root: string): IdeContext => { const c = structuredClone(readPrebuild(root)!.context); assert.equal(c.contractVersion, 2); if (c.contractVersion !== 2) throw new Error('Expected IDE'); c.expectedVersion = readPrebuild(root)!.version; return c; };
const approve = (root: string, hash: string) => approveDraft(root, { contractVersion: 1, draftHash: hash, founderApproved: true, approvalQuote: 'Implement only this displayed synthetic scope.' });

for (const [through, missing] of [['none', 'intention'], ['intention', 'target_user'], ['user', 'problem_definition'], ['problem', 'founder-reviewed evaluation'], ['evaluation', 'explicitly choose']] as const) {
  test(`R3 Act remains locked without ${missing}`, t => {
    const root = temporaryProject(t), saved = prepareIde(root, through);
    assert.throws(() => assertAct(saved.context), new RegExp(missing));
    assert.throws(() => saveDraft(root, actionFor(saved)), new RegExp(missing));
    assert.equal(readWorkflow(root).draft, null);
    assert.throws(() => approvedHandoff(root), /No approved scope/);
  });
}

test('R3 explicit current Act confirmation permits scope but not automatic implementation approval', t => {
  const root = temporaryProject(t), saved = prepareIde(root);
  assert.doesNotThrow(() => assertAct(saved.context));
  const draft = saveDraft(root, actionFor(saved));
  assert.equal(readWorkflow(root).cycle, null);
  assert.throws(() => approvedHandoff(root), /No approved scope/);
  const cycle = approve(root, draft.hash);
  assert.equal(approvedHandoff(root).id, cycle.id);
});

test('R3 each missing confirmation independently blocks Act even when all other receipts remain', t => {
  const root = temporaryProject(t), saved = prepareIde(root);
  assert.equal(saved.context.contractVersion, 2);
  for (const subject of ['intention', 'user', 'problem', 'evaluation', 'act'] as const) {
    const c = structuredClone(saved.context) as IdeContext;
    c.ide.confirmations = c.ide.confirmations.filter(r => r.subject !== subject);
    assert.equal(c.ide.confirmations.length, 4);
    assert.throws(() => assertAct(c));
  }
});

test('R3 whitespace-only presentation edits preserve substantive confirmation', t => {
  const root = temporaryProject(t); prepareIde(root);
  const before = current(root), c = current(root);
  c.intention.statement = `  ${c.intention.statement}\n`;
  c.definition.user.text = c.definition.user.text!.replaceAll(' ', '  ');
  c.definition.problem.text = `\n${c.definition.problem.text}\n`;
  savePrebuild(root, c);
  assert.deepEqual(current(root).ide.generations, before.ide.generations);
  assert.doesNotThrow(() => assertAct(current(root)));
});

test('R3 v3 and v4 early-build choices and absent context cannot bypass current scope guards', t => {
  const root = temporaryProject(t), base = actionFor(prepareIde(root));
  const { context: _context, decision: _decision, ...withoutContext } = base;
  for (const draft of [
    { ...withoutContext, contractVersion: 3, decision: { basis: 'build_requested', source: 'Just build it.' } },
    { ...base, contractVersion: 4, decision: { basis: 'build_requested', source: 'Just build it.' } },
    { ...base, contractVersion: 4, decision: { basis: 'evaluation_ready', source: 'Old ready state.' } },
  ]) {
    assert.throws(() => saveDraft(root, draft), /New guided work requires/);
    const result = spawnSync(process.execPath, [cli, 'internal', 'draft', root], { input: JSON.stringify(draft), encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 1); assert.match(result.stderr, /New guided work requires/);
  }
  assert.throws(() => saveDraft(temporaryProject(t), base), /referenced evaluation changed/);
});

test('R3 unavailable research and unrelated run receipts cannot manufacture evaluation review', t => {
  const root = temporaryProject(t); prepareIde(root, 'problem');
  const c = current(root);
  c.research = c.research.map(r => ({ ...r, capability: 'unavailable', queries: [], inspectedSourceIds: [], stopReason: 'unavailable' }));
  assert.throws(() => savePrebuild(root, c));
  const next = current(root);
  next.research.push({ ...next.research[0]!, id: 'empty-attempt', queries: [], inspectedSourceIds: [], capability: 'unavailable', stopReason: 'unavailable' });
  next.investigation.questions[0]!.runIds = ['empty-attempt'];
  savePrebuild(root, next);
  assert.throws(() => transitionIde(root, { operation: 'review', expectedVersion: readPrebuild(root)!.version }), /relevant research question/);
});

for (const [kind, mutate, retained] of [
  ['intention', (c: IdeContext) => { c.intention.statement = 'Now pursue enterprise growth.'; }, []],
  ['user', (c: IdeContext) => { c.definition.user.text = 'Professional portfolio analysts reviewing daily.'; }, ['intention']],
  ['problem', (c: IdeContext) => { c.definition.problem.text = 'Recover lost review reasons after a weekly decision.'; }, ['intention', 'user']],
  ['evidence', (c: IdeContext) => { c.evaluation.contradictions.push('An adequate existing substitute now contradicts the gap.'); }, ['intention', 'user', 'problem']],
] as const) test(`R3 changing ${kind} revokes dependent consent, approval and handoff`, t => {
  const root = temporaryProject(t), saved = prepareIde(root), pending = saveDraft(root, actionFor(saved));
  const c = current(root); mutate(c); const changed = savePrebuild(root, c);
  if (changed.context.contractVersion !== 2) throw new Error('Expected IDE');
  for (const s of retained) assert.ok(confirmation(changed.context, s as Subject));
  assert.equal(ideState(changed.context).act_readiness, 'not_ready');
  assert.throws(() => approve(root, pending.hash), /referenced evaluation changed/);
  assert.throws(() => saveDraft(root, { ...actionFor(changed), expectedVersion: pending.version }), /Act is locked/);
  assert.equal(readWorkflow(root).cycle, null);
});

test('R3 already approved scope remains immutable but cannot hand off after material change', t => {
  const root = temporaryProject(t), saved = prepareIde(root), draft = saveDraft(root, actionFor(saved));
  const cycle = approve(root, draft.hash), before = JSON.stringify(cycle);
  const c = current(root); c.definition.problem.text = 'A changed pain.'; savePrebuild(root, c);
  assert.throws(() => approvedHandoff(root), /referenced evaluation changed/);
  assert.equal(JSON.stringify(readWorkflow(root).cycle), before);
  assert.equal(approve(root, draft.hash).id, cycle.id); // Historical idempotent read, not handoff.
});

test('R3 reverting wording does not resurrect an old confirmation', t => {
  const root = temporaryProject(t), initial = prepareIde(root), original = current(root).definition.user.text;
  const c = current(root); c.definition.user.text = 'Different user.'; savePrebuild(root, c);
  const back = current(root); back.definition.user.text = original; const restored = savePrebuild(root, back);
  assert.throws(() => assertAct(restored.context), /target_user/);
  assert.ok(initial.context.contractVersion === 2 && initial.context.ide.confirmations.length === 5);
});

test('R3 optional views, name and presentation changes preserve substantive confirmations', t => {
  const root = temporaryProject(t); prepareIde(root);
  const c = current(root); c.preferredName = { value: 'Alex', source: 'Synthetic founder: Call me Alex.' }; c.brief.next = 'Continue when ready.';
  const saved = savePrebuild(root, c);
  for (const section of ['sources', 'users', 'research', 'habitats'] as const) renderPrebuildDetail(saved, section);
  assert.doesNotThrow(() => assertAct(readPrebuild(root)!.context));
});

test('R3 generic saves reject fabricated confirmation, presentation, review and generation state', t => {
  for (const edit of [
    (c: IdeContext) => { c.ide.reviewBasis = 'a'.repeat(64); },
    (c: IdeContext) => { c.ide.generations.act = 9; },
    (c: IdeContext) => { c.ide.presentation = { id: 'forged', subject: 'act', basis: 'b'.repeat(64), text: 'Unseen.' }; },
  ]) {
    const root = temporaryProject(t); prepareIde(root, 'none'); const c = current(root); edit(c);
    assert.throws(() => savePrebuild(root, c), /generic saves cannot/);
  }
});

test('R3 quoted, negative, ambiguous and editing replies cannot confirm foundations', t => {
  const root = temporaryProject(t); prepareIde(root, 'none');
  const shown = transitionIde(root, { expectedVersion: readPrebuild(root)!.version, operation: 'present', subject: 'intention' });
  const c = current(root);
  for (const quote of ['"Yes"', 'Maybe', 'Yes?', 'Yes, maybe', 'Yes if we can change it later', 'Yes, but change it', 'Yes, not that goal', 'No']) assert.throws(() => transitionIde(root, { expectedVersion: shown.version, operation: 'confirm', presentationId: c.ide.presentation!.id, turnId: randomUUID(), quote }), /clear agreement/);
  assert.equal(readPrebuild(root)!.version, shown.version);
});

test('R3 final decision requires clear assent to the current Act commitment, not ambiguity or selecting review', t => {
  const root = temporaryProject(t); prepareIde(root, 'evaluation');
  const shown = transitionIde(root, { expectedVersion: readPrebuild(root)!.version, operation: 'present', subject: 'act' });
  const c = current(root);
  assert.equal(ideState(c).act_readiness, 'ready_for_confirmation');
  assert.match(renderPrebuildSummary(shown), /Are you ready to commit a build cycle to this\?/);
  assert.doesNotMatch(renderPrebuildSummary(shown), /Yes — let's build · Change the user · Change the problem · Review evaluation/);
  for (const quote of ['Maybe', 'I guess', 'Review evaluation', 'Change the user']) assert.throws(() => transitionIde(root, { expectedVersion: shown.version, operation: 'confirm', presentationId: c.ide.presentation!.id, turnId: randomUUID(), quote }), /Explicit agreement/);
});

test('R3 a founder turn cannot approve multiple statements; stale presentation and concurrent writes fail', t => {
  const root = temporaryProject(t); prepareIde(root, 'intention'); const original = current(root);
  const shown = transitionIde(root, { expectedVersion: original.expectedVersion, operation: 'present', subject: 'user' });
  const c = current(root);
  assert.throws(() => transitionIde(root, { expectedVersion: shown.version, operation: 'confirm', presentationId: c.ide.presentation!.id, turnId: c.ide.confirmations[0]!.turnId, quote: 'Yes' }), /multiple statements/);
  assert.throws(() => transitionIde(root, { expectedVersion: original.expectedVersion, operation: 'present', subject: 'user' }), /another session/);
  const edited = current(root); edited.definition.user.text = 'Changed user before assent.'; savePrebuild(root, edited);
  assert.throws(() => transitionIde(root, { expectedVersion: readPrebuild(root)!.version, operation: 'confirm', presentationId: c.ide.presentation!.id, turnId: randomUUID(), quote: 'Yes' }), /current displayed/);
});

test('R3 the presentation order and reviewed evaluation are mandatory', t => {
  const root = temporaryProject(t); prepareIde(root, 'none');
  for (const subject of ['user', 'problem', 'evaluation', 'act']) assert.throws(() => transitionIde(root, { expectedVersion: readPrebuild(root)!.version, operation: 'present', subject }), /intention first/);
  assert.throws(() => transitionIde(root, { expectedVersion: readPrebuild(root)!.version, operation: 'review' }), /Confirm Intention/);
});

for (const [label, change] of [
  ['missing topic', (c: IdeContext) => { c.investigation.coverage.pop(); }],
  ['unexamined dimension', (c: IdeContext) => { c.investigation.coverage[0]!.status = 'unexamined'; }],
  ['missing relevant question', (c: IdeContext) => { c.investigation.questions = []; }],
  ['missing substitute investigation', (c: IdeContext) => { c.investigation.alternatives = []; }],
  ['no counterevidence', (c: IdeContext) => { c.investigation.counterevidence = null; }],
  ['no decision synthesis', (c: IdeContext) => { c.investigation.decision = null; }],
  ['no first-user route', (c: IdeContext) => { c.firstUserAvenues = []; }],
  ['unchallenged important claims', (c: IdeContext) => { c.redTeam = []; }],
] as const) test(`R3 incomplete evaluation fails: ${label}`, t => {
  const root = temporaryProject(t); prepareIde(root, 'problem'); const c = current(root); change(c); savePrebuild(root, c);
  assert.throws(() => transitionIde(root, { expectedVersion: readPrebuild(root)!.version, operation: 'review' }));
  assert.equal(ideState(current(root)).act_readiness, 'not_ready');
});

test('R3 requires redefinition, reconfirmation and a new evaluation review after material feedback', t => {
  const root = temporaryProject(t); prepareIde(root);
  const c = current(root); c.investigation.redefinition = 'Reported feedback changes which user has the pain.'; savePrebuild(root, c);
  assert.equal(ideState(current(root)).evaluation, 'requires_redefinition');
  assert.equal(confirmation(current(root), 'user'), undefined);
  const revised = current(root); revised.definition.user.text = 'Experienced shortlist reviewers in the revised cohort.'; revised.definition.problem.text = 'A refined comparison pain.'; revised.investigation.redefinition = null; savePrebuild(root, revised);
  confirmSubject(root, 'user'); confirmSubject(root, 'problem');
  assert.throws(() => assertAct(current(root)), /founder-reviewed/);
  transitionIde(root, { expectedVersion: readPrebuild(root)!.version, operation: 'review' });
  confirmSubject(root, 'evaluation'); confirmSubject(root, 'act'); assert.doesNotThrow(() => assertAct(current(root)));
});

test('R3 interviews and opportunity brief are available before Act, with no solution sections', t => {
  const root = temporaryProject(t), saved = prepareIde(root, 'evaluation');
  const brief = renderStartupMaster(saved);
  assert.match(brief, /Opportunity brief/); assert.doesNotMatch(brief, /## MVP hypothesis|## Technical strategy/);
  assert.match(renderPrebuildDetail(saved, 'interview'), /recent occasion/);
  assert.equal(readWorkflow(root).draft, null);
  assert.throws(() => assertAct(saved.context), /explicitly choose/);
});

test('R3 pre-Act solution choices and master are rejected, including build_requested', t => {
  for (const action of ['shape_mvp', 'build_requested'] as const) {
    const root = temporaryProject(t); prepareIde(root, 'evaluation'); const c = current(root);
    c.brief.choices = [{ label: 'Build a prototype', action }]; assert.throws(() => savePrebuild(root, c), /Act is locked/);
  }
});

test('R3 old ready/export data never becomes confirmation; portable restore strips consent', t => {
  const root = temporaryProject(t), saved = prepareIde(root);
  const exported = exportPrebuild(root), restored = importPrebuild(temporaryProject(t), exported);
  assert.throws(() => assertAct(restored.context), /intention/);
  const backup = createBackup(root), db = openSqlite(backup.path, true);
  try { const row = db.get('SELECT digest FROM prebuild_revisions ORDER BY version DESC LIMIT 1'); assert.equal(row?.['digest'], saved.hash); } finally { db.close(); }
  const old = JSON.parse(readFileSync(new URL('../../fixtures/m1r2/evaluated-stock.json', import.meta.url), 'utf8'));
  assert.throws(() => assertAct(upgradeContext(old)), /intention/);
  assert.throws(() => importPrebuild(root, exported), /without pre-build history/);
});

test('R3 resuming historical or portable knowledge replaces stale solution recommendations', t => {
  const legacy = JSON.parse(readFileSync(new URL('../../fixtures/m1r2/build-now.json', import.meta.url), 'utf8'));
  const upgraded = savePrebuild(temporaryProject(t), upgradeContext(legacy));
  assert.doesNotMatch(renderPrebuildSummary(upgraded), /build now|MVP|prototype|saved rationale/i);
  assert.match(renderPrebuildSummary(upgraded), /confirm the current intention/);
  const root = temporaryProject(t); prepareIde(root);
  const c = current(root);
  c.brief.summary = 'We can discuss an MVP now. The founder has explicitly chosen Act.';
  savePrebuild(root, c);
  const restored = importPrebuild(temporaryProject(t), exportPrebuild(root));
  assert.doesNotMatch(renderPrebuildSummary(restored), /MVP now|chosen Act/);
  assert.throws(() => assertAct(restored.context), /intention/);
});

test('R3 cannot relabel synthetic context or substitute a new intention/user/problem in action', t => {
  const root = temporaryProject(t), saved = prepareIde(root);
  for (const mutate of [
    (d: ReturnType<typeof actionFor>) => { d.synthetic = false; },
    (d: ReturnType<typeof actionFor>) => { d.ideal.intention.statement = 'A new intention.'; },
    (d: ReturnType<typeof actionFor>) => { d.foundation.targetUser.value = 'Different users.'; },
    (d: ReturnType<typeof actionFor>) => { d.foundation.problem.value = 'A different problem.'; },
    (d: ReturnType<typeof actionFor>) => { d.decision.confirmationId = 'forged'; },
  ]) { const d = actionFor(saved); mutate(d); assert.throws(() => saveDraft(root, d)); }
});

test('R3 legacy versions and historical approvals cannot be used to start new work', t => {
  for (const file of ['m1/idea.json', 'm1r/fresh.json', 'orientation/stock.json']) {
    const root = temporaryProject(t), draft = JSON.parse(readFileSync(new URL(`../../fixtures/${file}`, import.meta.url), 'utf8')) as ConversationDraft;
    if (!draft.proposal) continue;
    assert.throws(() => saveDraft(root, draft), /New guided work requires/);
    const old = seedHistoricalDraft(root, draft);
    assert.throws(() => approve(root, old.hash), /legacy proposal/);
    const cycle = seedHistoricalApproval(root, { contractVersion: 1, draftHash: old.hash, founderApproved: true, approvalQuote: 'Historical scope approval.' });
    assert.throws(() => approvedHandoff(root), /Historical approval/);
    assert.deepEqual(readWorkflow(root).cycle, cycle);
  }
});

test('R3 selected code remains intact and drift blocks approval', t => {
  const root = temporaryProject(t), path = join(root, 'README.md'); writeFileSync(path, '# Existing code\n');
  const c = ideFixture(); c.project.artifacts = inspectArtifacts(root, { paths: ['README.md'], permissionGranted: true, permissionQuote: 'Read README.' }).map(({ path, sha256 }) => ({ path, sha256 })); c.project.permissionQuote = 'Read README.';
  const saved = prepareIde(root, 'act', c), draft = saveDraft(root, actionFor(saved));
  assert.equal(readFileSync(path, 'utf8'), '# Existing code\n'); writeFileSync(path, '# Changed code\n');
  assert.throws(() => approve(root, draft.hash), /Selected artifacts changed/);
});

test('R3 real CLI confirms IDE then reviews scope, approves, hands off, records checks and backs up', t => {
  const root = temporaryProject(t);
  const run = (operation: string, input?: object) => spawnSync(process.execPath, [cli, 'internal', operation, root], { input: input ? JSON.stringify(input) : '', encoding: 'utf8', windowsHide: true });
  const c = ideFixture(); c.project.name = 'café 日本語';
  assert.equal(run('prebuild', c).status, 0);
  for (const subject of ['intention', 'user', 'problem', 'evaluation', 'act'] as const) {
    if (subject === 'evaluation') { const result = run('ide', { expectedVersion: readPrebuild(root)!.version, operation: 'review' }); assert.equal(result.status, 0, result.stderr); }
    const shown = run('ide', { expectedVersion: readPrebuild(root)!.version, operation: 'present', subject }); assert.equal(shown.status, 0, shown.stderr);
    const state = current(root);
    const assent = run('ide', { expectedVersion: readPrebuild(root)!.version, operation: 'confirm', presentationId: state.ide.presentation!.id, turnId: randomUUID(), quote: subject === 'act' ? 'Yes — move to Act' : 'Yes' }); assert.equal(assent.status, 0, assent.stderr);
  }
  const draftResult = run('draft', actionFor(readPrebuild(root)!)); assert.equal(draftResult.status, 0, draftResult.stderr);
  assert.equal(run('handoff').status, 1);
  const draft = JSON.parse(draftResult.stdout) as { hash: string };
  const approved = run('approve', { contractVersion: 1, draftHash: draft.hash, founderApproved: true, approvalQuote: 'Implement this displayed synthetic scope.' }); assert.equal(approved.status, 0, approved.stderr);
  assert.equal(run('handoff').status, 0);
  assert.match(run('context').stdout, /café 日本語/);
  // This is a disposable core receipt check, not a founder product build or M2.
  writeFileSync(join(root, 'receipt-check.mjs'), 'export const answer = 42;\n');
  const check = spawnSync(process.execPath, ['--input-type=module', '-e', "import assert from 'node:assert/strict'; import {answer} from './receipt-check.mjs'; assert.equal(answer,42);"], { cwd: root, encoding: 'utf8', windowsHide: true });
  assert.equal(check.status, 0, check.stderr);
  const receipt = recordReceipt(root, { contractVersion: 1, cycleId: readWorkflow(root).cycle!.id, implementation: 'completed', changes: [{ path: 'receipt-check.mjs', kind: 'created' }], checks: [{ label: 'Disposable receipt integration', command: 'node assertion', executed: true, exitCode: 0, result: 'passed', output: 'Actual assertion succeeded.' }], runInstructions: ['Import receipt-check.mjs'], gaps: ['Synthetic integration only; no customer exposure.'], reportedBy: 'codex' });
  assert.equal(receipt.customerValidation, 'not_established'); assert.equal(createBackup(root).integrity, 'ok');
  const db = openSqlite(initializeProject(root).database); try { assert.throws(() => db.run('DELETE FROM prebuild_revisions')); } finally { db.close(); }
});
