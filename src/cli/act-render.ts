import type { SavedAct } from '../domain/act.js';
import { basis, ideState, type AnyPrebuild } from '../domain/ide.js';
import { nextIdeStep } from '../domain/guide.js';
import { OPTIONAL_DETAIL, plain } from '../domain/conversation.js';

export function renderActSummary(saved: SavedAct, context: AnyPrebuild): string {
  const r = saved.record, p = r.plan, stage = p.stages[r.currentStage]!;
  if (context.contractVersion !== 2 || ideState(context).act_readiness !== 'founder_confirmed' || basis(context, 'act') !== r.ideBasis) {
    return `The foundation has changed, so this build is on hold. ${nextIdeStep(context).text}`;
  }
  if (r.status === 'proposed') return [
    'Executive summary',
    `We're building for ${plain(p.scope.foundation.targetUser.value!)}.`,
    `The pain we're addressing: ${plain(p.scope.foundation.problem.value!)}`,
    `One workflow: ${plain(p.scope.proposal.journey)}.`,
    `The first version needs to help us learn: ${plain(p.scope.proposal.criticalUnknown)}`,
    '', 'Building', ...p.capabilities.map(x => '- ' + plain(x.name)),
    ...(p.park.length ? ['', 'Parking', ...p.park.slice(0, 2).map(x => '- ' + plain(x.label))] : []),
    '', `First build stage: ${plain(stage.title)}. ${plain(stage.goal)}`,
    ...(p.execution?['',p.execution.automaticStages?'Approval lets passing checks advance the planned stages until a defined human checkpoint. I will stop at the completed core workflow.':'I will stop for your review after each stage.']:[]),
    '', 'These capabilities test the core pain. Extra features would add work without answering that question.',
    '', p.execution?'Approve Build Pack | Adjust scope | View full Build Pack':'Approve build | Adjust scope | View build plan', OPTIONAL_DETAIL,
  ].join('\n');

  const receipt = r.receipts.findLast(x => x.stageId === stage.id);
  const result = receipt
    ? `${receipt.checks.filter(x => x.result === 'passed').length} checks passed, ${receipt.checks.filter(x => x.result === 'failed').length} failed, ${receipt.checks.filter(x => x.result === 'not_run').length} not run.`
    : 'No technical result has been recorded yet.';
  let next: string;
  switch (r.status) {
    case 'authorized':
      next = r.pack ? p.execution?.automaticStages&&!p.execution.humanCheckpoints.includes(stage.id)?`I'll complete ${plain(stage.goal)}, run its checks, and continue only within the approved plan until your test checkpoint.`:`I'll work only on ${plain(stage.title)}, run its checks, then stop for your review.` : "I'll prepare the approved build pack so the coding agent can continue from this scope.";
      break;
    case 'awaiting_review':
      next = p.execution?`Ready for you. Please try the normal workflow, one realistic bad input, and anything that immediately feels confusing. Tell me what felt wrong or unnecessary. ${stage.id===p.stopAfterStageId?'This is the planned stopping point.':'I will use that feedback before continuing.'}`:`Try this stage using the recorded run instructions. ${stage.id === p.stopAfterStageId ? 'We have reached the planned stopping point.' : 'Your review is needed before the next stage.'}`;
      break;
    case 'paused': next = 'The build is paused. Resume when you are ready, or cancel this run to revise the scope.'; break;
    case 'stopped': next = stage.kind==='mvp' && receipt?.implementation==='completed' ? "The MVP review is complete. Next I'll prepare a small first-user launch pack from the confirmed user and habitat routes. No message will be sent." : 'This run is stopped. Review the unfinished MVP before preparing user exposure.'; break;
    default: next = 'This run is stopped. No further stage or Launch & Learn work is authorized.';
  }
  return [
    'Executive summary', `${plain(stage.title)}: ${r.status.replaceAll('_', ' ')}. ${result}`,
    'Technical results do not establish customer validation.', '', next,
    ...(receipt ? ['', ...receipt.runInstructions.slice(0, 2).map(plain), ...receipt.gaps.slice(0, 2).map(x => 'Remaining: ' + plain(x))] : []),
    '', 'View build plan | View technical results', OPTIONAL_DETAIL,
  ].join('\n');
}
