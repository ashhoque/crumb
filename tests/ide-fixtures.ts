import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { savePrebuild, transitionIde, readPrebuild } from '../src/application/prebuild.js';
import { upgradeContext, extraTopics, ideTopics, alternativeKinds, confirmation, type IdeContext, type Subject } from '../src/domain/ide.js';
import type { PrebuildContext, SavedPrebuild } from '../src/domain/prebuild.js';
import type { ConfirmedActionDraft, RevisedDraft } from '../src/domain/contracts.js';

/** Synthetic research only. This fixture tests transitions, not market truth. */
export function ideFixture(): IdeContext {
  const old = JSON.parse(readFileSync(new URL('../../fixtures/m1r2/evaluated-stock.json', import.meta.url), 'utf8')) as PrebuildContext;
  const c = upgradeContext(old);
  c.evaluation.status = 'ready';
  c.brief = { kind: 'research', summary: 'The comparison workflow is specific enough to investigate. Demand remains uncertain.', seeing: [], matters: [], next: 'Confirm the current understanding.', questions: [], choices: [] };
  const runIds = [c.research[0]!.id];
  c.investigation.coverage = extraTopics.map(topic => ({ topic, status: 'unknown_after_search', claimIds: [], runIds, reason: `Synthetic bounded investigation of ${topic}: unknown; no empirical conclusion.` }));
  c.investigation.questions = ideTopics.map(topic => ({ topic, runIds, relevance: `The synthetic research session explicitly considers ${topic} for the stated user; no real finding is implied.` }));
  c.investigation.alternatives = alternativeKinds.map(kind => ({ kind, competitorIds: [], runIds, conclusion: `Synthetic attempted comparison of ${kind}; no actual provider or unmet need established.` }));
  c.investigation.counterevidence = 'An existing spreadsheet may already be sufficient; independent paid demand is unknown.';
  c.investigation.decision = 'A hypothetical founder can consider learning while acknowledging the unresolved demand.';
  if (c.evaluation.promising.length < 2) c.evaluation.promising.push('The synthetic founder reports relevant workflow experience, not proven demand.');
  return c;
}
export function confirmSubject(root: string, s: Subject): SavedPrebuild {
  const saved = readPrebuild(root)!;
  const shown = transitionIde(root, { expectedVersion: saved.version, operation: 'present', subject: s });
  if (shown.context.contractVersion !== 2) throw new Error('Expected IDE.');
  return transitionIde(root, { expectedVersion: shown.version, operation: 'confirm', presentationId: shown.context.ide.presentation!.id, turnId: randomUUID(), quote: s === 'act' ? 'Yes — move to Act' : 'Yes' });
}
export function prepareIde(root: string, through: 'none' | Subject = 'act', input = ideFixture()): SavedPrebuild {
  let saved = savePrebuild(root, input);
  for (const s of ['intention', 'user', 'problem', 'evaluation', 'act'] as const) {
    if (through === 'none') break;
    if (s === 'evaluation') saved = transitionIde(root, { expectedVersion: saved.version, operation: 'review' });
    saved = confirmSubject(root, s);
    if (s === through) break;
  }
  return saved;
}
export function actionFor(saved: SavedPrebuild): ConfirmedActionDraft {
  if (saved.context.contractVersion !== 2) throw new Error('Expected IDE context.');
  const c = saved.context;
  const old = JSON.parse(readFileSync(new URL('../../fixtures/m1r/fresh.json', import.meta.url), 'utf8')) as RevisedDraft;
  return { ...old, contractVersion: 5, synthetic: c.synthetic, phase: 'proposal',
    context: { version: saved.version, hash: saved.hash },
    decision: { basis: 'act_confirmed', source: 'Synthetic founder explicitly chose Yes — move to Act.', confirmationId: confirmation(c, 'act')?.id ?? 'missing-consent' },
    foundation: { ...old.foundation, targetUser: { value: c.definition.user.text, basis: 'founder_statement', source: 'Confirmed synthetic user.' }, problem: { value: c.definition.problem.text, basis: 'founder_statement', source: 'Confirmed synthetic problem.' } },
    ideal: { ...old.ideal, intention: { goal: c.intention.goal === 'personal' || c.intention.goal === 'bootstrapped' ? 'custom' : c.intention.goal, status: 'provided', statement: c.intention.statement }, evaluation: { state: 'not_run', question: null, unavailableReason: null, findings: [] }, assessment: null },
    brief: { summary: 'The founder chose a build cycle after reviewing IDE. This scope remains a hypothesis.', nextAction: 'Review this concrete scope.', questions: [] },
    artifacts: c.project.artifacts, artifactPermission: { granted: c.project.artifacts.length > 0, quote: c.project.permissionQuote ?? '' },
  };
}
