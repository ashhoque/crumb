// Legacy payload/record compatibility. Fixture seeding is test-only; ide.test.ts tests all new-work gates.
import assert from 'node:assert/strict';
import test from 'node:test';
import { cpSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { compactContext, readWorkflow, recordReceipt } from '../src/application/workflow.js';
import { seedHistoricalApproval as approveDraft, readHistoricalScope as approvedHandoff, seedHistoricalDraft as saveDraft } from './historical-fixtures.js';
import { createBackup } from '../src/application/backup.js';
import { inspectArtifacts } from '../src/privacy/artifacts.js';
import { detailSections, renderDetail, renderHandoff, renderOpening, renderStatus, renderSummary } from '../src/cli/render.js';
import { words } from '../src/domain/conversation.js';
import type { ActionDraft, OrientationDraft, RevisedDraft } from '../src/domain/contracts.js';
import { temporaryProject } from './helpers.js';

const fixtures = fileURLToPath(new URL('../../fixtures/', import.meta.url));
const cli = fileURLToPath(new URL('../src/cli/main.js', import.meta.url));
const orientation = (name = 'stock'): OrientationDraft => JSON.parse(readFileSync(join(fixtures, 'orientation', `${name}.json`), 'utf8')) as OrientationDraft;
const legacy = (name = 'fresh'): RevisedDraft => JSON.parse(readFileSync(join(fixtures, 'm1r', `${name}.json`), 'utf8')) as RevisedDraft;
const approve = (root: string, hash: string) => approveDraft(root, { contractVersion: 1, draftHash: hash, founderApproved: true, approvalQuote: 'Build this reviewed scope.' });
function action(context: OrientationDraft, basis: ActionDraft['decision']['basis'] = 'build_requested'): ActionDraft {
  return { ...context, phase: 'proposal', proposal: legacy().proposal,
    decision: { basis, source: basis === 'build_requested' ? 'Synthetic founder: Build now.' : 'Synthetic founder goal and corrected problem, with the displayed evaluation.' },
    brief: { summary: 'We can build the small test now. Its usefulness remains unproven.', nextAction: 'Review this small scope.', questions: [] } };
}

for (const name of ['fresh', 'existing', 'feedback', 'stock']) {
  test(`historical data: ${name}: orientation survives a new process without a proposal, approval or repeated onboarding`, t => {
    const root = temporaryProject(t), input = orientation(name);
    const saved = saveDraft(root, input);
    const process = spawnSync(globalThis.process.execPath, [cli, 'internal', 'context', root], { encoding: 'utf8', windowsHide: true });
    assert.equal(process.status, 0, process.stderr);
    const resumed = JSON.parse(process.stdout) as ReturnType<typeof readWorkflow>;
    assert.deepEqual(resumed.draft, saved);
    assert.equal(resumed.draft?.draft.proposal, null);
    assert.equal(resumed.cycle, null);
    assert.equal(resumed.latestReceipt, null);
    const summary = renderStatus(resumed);
    assert.ok(summary.startsWith('Executive Summary\n'));
    assert.ok(words(summary) <= 120);
    assert.ok(!summary.includes('Scope:'));
    assert.ok(!summary.includes('Are you starting fresh'));
    assert.doesNotMatch(summary, /Build now/);
    assert.throws(() => approve(root, saved.hash), /problem context/);
    assert.throws(() => approvedHandoff(root), /No approved scope/);
    for (const section of detailSections) {
      const text = renderDetail(saved, section);
      assert.ok(words(text) <= 250);
      assert.doesNotMatch(text, /Build now/);
      assert.equal(readWorkflow(root).draft?.hash, saved.hash);
      assert.equal(readWorkflow(root).cycle, null);
    }
    assert.match(renderDetail(saved, 'research'), /No research has been performed/);
    assert.match(renderDetail(saved, 'checks'), /No action or technical acceptance/);
  });
}

test('historical data: the stock regression rejects a premature action unless the founder explicitly elects to build', t => {
  const root = temporaryProject(t), context = orientation();
  const premature = action(context, 'context_ready');
  assert.throws(() => saveDraft(root, premature), /Clarify intention/);
  assert.deepEqual(readdirSync(root), []);
  const requested = action(context);
  const saved = saveDraft(root, requested);
  assert.equal(readWorkflow(root).cycle, null); // A request does not approve unseen scope.
  const cycle = approve(root, saved.hash);
  assert.equal(cycle.draft.foundation.buyer.value, null);
  assert.equal(cycle.basis, 'HYPOTHESIS-LED');
});

test('historical data: malformed orientation, intentions and excess questions fail before storage', t => {
  const root = temporaryProject(t);
  for (const change of [
    (d: OrientationDraft) => { Object.assign(d, { proposal: legacy().proposal }); },
    (d: OrientationDraft) => { Object.assign(d, { decision: { basis: 'build_requested', source: 'Not an action yet' } }); },
    (d: OrientationDraft) => { d.ideal.intention.status = 'provided'; },
    (d: OrientationDraft) => { d.brief.questions = ['Who?', 'Why?', 'When?']; },
    (d: OrientationDraft) => { d.brief.questions = ['Who? Why? When?']; },
    (d: OrientationDraft) => { d.brief.summary = 'One sentence only.'; },
    (d: OrientationDraft) => { d.brief.nextAction = 'word '.repeat(79); },
  ]) {
    const input = orientation(); change(input);
    assert.throws(() => saveDraft(root, input));
    assert.deepEqual(readdirSync(root), []);
  }
  const missingScope = action(orientation()); Object.assign(missingScope, { proposal: null });
  assert.throws(() => saveDraft(root, missingScope), /complete scope/);
  const falseMethod = action(orientation()); falseMethod.proposal.method = 'learning';
  assert.throws(() => saveDraft(root, falseMethod), /build request/);
});

test('historical data: Build now bypasses unknown intention and research in every orientation state', t => {
  for (const status of ['unasked', 'asked', 'skipped'] as const) {
    for (const state of ['not_run', 'requested', 'unavailable'] as const) {
      const root = temporaryProject(t), input = orientation();
      input.ideal.intention.status = status;
      input.ideal.evaluation = { state, findings: [], question: state === 'requested' ? 'Which substitutes exist?' : null, unavailableReason: state === 'unavailable' ? 'No research tool in M1-R.' : null };
      const saved = saveDraft(root, input);
      const requested = action(input); requested.expectedVersion = saved.version;
      const proposed = saveDraft(root, requested);
      const cycle = approve(root, proposed.hash);
      assert.equal(cycle.draft.contractVersion, 3);
      assert.equal(cycle.draft.foundation.buyer.value, null);
      assert.equal(approve(root, proposed.hash).id, cycle.id);
    }
  }
});

test('historical data: skipped intention persists and evaluated context can recommend a learning action without a build', t => {
  const root = temporaryProject(t), input = orientation('existing');
  input.ideal.intention = { status: 'skipped', goal: 'unknown', statement: null };
  input.brief.questions = [];
  const saved = saveDraft(root, input);
  const returned = readWorkflow(root).draft!.draft;
  assert.equal(returned.contractVersion, 3);
  if (returned.contractVersion !== 3) throw new Error('Expected retained v3 context.');
  assert.equal(returned.ideal.intention.status, 'skipped');
  const next = action(input, 'context_ready'); next.expectedVersion = saved.version;
  next.proposal.method = 'learning'; next.proposal.capabilities = [];
  next.proposal.journey = 'Prepare questions about one recent invoice review.';
  const proposed = saveDraft(root, next);
  assert.equal(approve(root, proposed.hash).draft.proposal.method, 'learning');
});

test('historical data: existing-project v3 context preserves selected files and still detects drift before approval', t => {
  const root = temporaryProject(t);
  cpSync(join(fixtures, 'm1/unfinished'), root, { recursive: true });
  const input = orientation('existing');
  input.artifactPermission = { granted: true, quote: 'Read the five named synthetic project files.' };
  input.artifacts = inspectArtifacts(root, { paths: ['AGENTS.md', 'README.md', 'package.json', 'app.mjs', 'app.test.mjs'], permissionGranted: true, permissionQuote: input.artifactPermission.quote }).map(({ path, sha256 }) => ({ path, sha256 }));
  input.foundation.solution = { value: 'The app totals unpaid invoices', basis: 'artifact_observation', source: 'app.mjs' };
  const before = input.artifacts.map(item => readFileSync(join(root, item.path)));
  const saved = saveDraft(root, input);
  const next = action(input); next.expectedVersion = saved.version;
  const proposed = saveDraft(root, next);
  for (const [index, item] of input.artifacts.entries()) assert.deepEqual(readFileSync(join(root, item.path)), before[index]);
  writeFileSync(join(root, 'app.mjs'), 'Changed after scope review');
  assert.throws(() => approve(root, proposed.hash), /changed since inspection/);
  assert.equal(readWorkflow(root).cycle, null);
});

test('historical data: feedback corrections replace an unapproved proposal without reusing stale approval', t => {
  const root = temporaryProject(t), first = action(orientation('existing'), 'context_ready');
  first.proposal = legacy('existing').proposal;
  const original = saveDraft(root, first);
  const corrected = orientation('feedback'); corrected.expectedVersion = original.version;
  const understanding = saveDraft(root, corrected);
  assert.equal(readWorkflow(root).draft?.draft.foundation.problem.value, corrected.foundation.problem.value);
  assert.throws(() => approve(root, original.hash), /does not match/);
  assert.throws(() => approve(root, understanding.hash), /problem context/);
  const next = action(corrected, 'context_ready'); next.expectedVersion = understanding.version;
  next.proposal.capabilities = ['Record and show an invoice last-follow-up note'];
  next.proposal.journey = 'Find the most recent manual follow-up.';
  const proposed = saveDraft(root, next);
  assert.throws(() => approve(root, original.hash), /does not match/);
  const cycle = approve(root, proposed.hash);
  assert.deepEqual(cycle.draft.proposal.capabilities, next.proposal.capabilities);
  assert.match(renderHandoff(cycle), /follow-up note/);
  assert.equal((cycle.draft as ActionDraft).ideal.feedback.length, 3);
});

test('historical data: v3 seeded snapshots remain readable with actual receipts and backup', t => {
  const root = temporaryProject(t);
  const run = (operation: string, input?: object) => {
    if (operation === 'draft') return JSON.stringify(saveDraft(root, input));
    const result = spawnSync(process.execPath, [cli, 'internal', operation, root], { encoding: 'utf8', input: input ? JSON.stringify(input) : undefined, windowsHide: true });
    assert.equal(result.status, 0, result.stderr); return result.stdout;
  };
  const context = orientation();
  const saved = JSON.parse(run('draft', context)) as { version: number; hash: string };
  const next = action(context); next.expectedVersion = saved.version;
  next.proposal = { ...next.proposal, journey: 'Compare two synthetic notes.', capabilities: ['Display two supplied notes side by side'], technicalAcceptance: ['The two supplied notes are preserved'], learningAcceptance: ['Later observe whether comparison is clearer than separate notes'] };
  const proposed = JSON.parse(run('draft', next)) as { hash: string };
  const cycle = approve(root, proposed.hash);
  writeFileSync(join(root, 'compare.mjs'), 'export const compare = (a, b) => ({ left: a, right: b });\n');
  const args = ['--input-type=module', '-e', "import assert from 'node:assert/strict'; import {compare} from './compare.mjs'; assert.deepEqual(compare('growth','risk'),{left:'growth',right:'risk'});"];
  const check = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', windowsHide: true });
  assert.equal(check.status, 0, check.stderr);
  const receipt = recordReceipt(root, { contractVersion: 1, cycleId: cycle.id, implementation: 'completed', changes: [{ path: 'compare.mjs', kind: 'created' }], checks: [{ label: 'Preserves both notes', command: JSON.stringify([process.execPath, ...args]), executed: true, exitCode: check.status, result: 'passed', output: 'Comparison assertion passed.' }], runInstructions: ['Import compare.mjs'], gaps: ['Synthetic local check; no user exposure'], reportedBy: 'codex' });
  assert.equal(receipt.customerValidation, 'not_established');
  assert.equal(receipt.release, 'not_released');
  assert.ok(createBackup(root));
  assert.match(run('context'), /Preserves both notes/);
  assert.ok(!run('review').includes('Are you starting fresh'));
  assert.ok(JSON.stringify(compactContext(root)).includes('Synthetic Stock Comparison'));
});

test('historical data: display renaming never changes old snapshots, hashes, schema identity or paths', t => {
  const root = temporaryProject(t), old = legacy();
  const saved = saveDraft(root, old), cycle = approve(root, saved.hash);
  const snapshot = JSON.stringify(readWorkflow(root));
  assert.match(renderOpening('Another Name'), /Another Name/);
  assert.deepEqual(readWorkflow(root).cycle, cycle);
  assert.equal(JSON.stringify(readWorkflow(root)), snapshot);
  assert.equal(readWorkflow(root).draft?.hash, saved.hash);
  assert.ok(readdirSync(join(root, '.customer-evidence')).includes('cec.sqlite'));
  assert.match(readFileSync(join(fixtures, '../contracts/m1r.schema.json'), 'utf8'), /https:\/\/pruvity.local\/contracts\/m1r-v2/);
});
