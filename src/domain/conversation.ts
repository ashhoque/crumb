import type { ConversationDraft } from './contracts.js';

export const OPTIONAL_DETAIL = 'The detail below is optional—you can continue without reading it.';
export const plain = (value: string): string => value.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '').replace(/[\x00-\x1f\x7f-\x9f\u202a-\u202e\u2066-\u2069]/g, ' ').trim();
export const words = (value: string): number => plain(value).split(/\s+/u).filter(Boolean).length;

/** Every capability is visible before assent. Never truncate reviewed scope. */
export function proposalSummary(draft: ConversationDraft): string {
  const p = draft.proposal;
  const summary = draft.contractVersion !== 1 ? draft.brief.summary : `You reported: ${draft.foundation.targetUser.value ?? 'the target user is unknown'}. This test remains a hypothesis; customer demand is not established.`;
  const action = draft.contractVersion !== 1 ? draft.brief.nextAction : draft.proposal.title;
  const scope = p ? p.capabilities.length ? p.capabilities.map(plain).join('; ') : plain(p.journey) : '';
  return [
    'Executive Summary', plain(summary), '',
    `Recommended next action: ${plain(action)}`,
    ...(p ? [`Scope: ${scope}${/[.!?]$/.test(scope) ? '' : '.'}`, 'Local only; no spending, sending or deployment.'] : []),
    ...(draft.contractVersion === 3 ? draft.brief.questions.map(plain) : []), '',
    OPTIONAL_DETAIL,
    !p || p.method === 'build' ? 'Build now | Correct my understanding | Why?' : 'Approve preparation | Build now | Why?',
  ].join('\n');
}

export function validateConversation(draft: ConversationDraft): void {
  if (draft.contractVersion === 1) return;
  const { intention, evaluation, feedback } = draft.ideal;
  if ((intention.goal === 'unknown') !== (intention.statement === null)) throw new Error('Keep skipped intention unknown; otherwise preserve the founder objective in their words.');
  if (draft.contractVersion === 3) {
    const { intention: intent, assessment } = draft.ideal;
    if ((intent.status === 'provided') !== (intent.goal !== 'unknown')) throw new Error('Preserve whether intention was provided, asked, unasked or deliberately skipped.');
    if (draft.phase === 'orientation' && (draft.proposal !== null || draft.decision !== null)) throw new Error('Orientation retains understanding without an action proposal or decision.');
    if (draft.phase === 'proposal') {
      if (!draft.proposal || !draft.decision) throw new Error('An action proposal needs its complete scope and a reason to propose it.');
      if (draft.decision.basis === 'build_requested' && draft.proposal.method !== 'build') throw new Error('A build request must lead to a reviewed build scope.');
      if (draft.decision.basis === 'context_ready' && (!assessment || !draft.foundation.problem.value || !['provided', 'skipped'].includes(intent.status))) throw new Error('Clarify intention, the problem and a brief evaluation before recommending an action, or record the explicit build request.');
    }
    // Structural guard only: compound questions and reasoning still need transcript review.
    const questionText = [draft.brief.summary, draft.brief.nextAction, ...draft.brief.questions].join(' ');
    if ((questionText.match(/[?？]/gu)?.length ?? 0) > 2) throw new Error('Ask at most two material questions; normally one.');
  }
  if (feedback.length && draft.foundation.contactState !== 'contact_reported') throw new Error('Reported feedback needs the reported-contact state; it is not verified customer evidence.');
  if ((evaluation.state === 'available') !== (evaluation.findings.length > 0)) throw new Error('Available evaluation needs sourced fixture findings; other states cannot contain findings.');
  if ((evaluation.state === 'unavailable') !== (evaluation.unavailableReason !== null)) throw new Error('Only unavailable evaluation needs a reason.');
  if (evaluation.state === 'requested' && !evaluation.question) throw new Error('Record the optional research question without blocking a build.');
  for (const finding of evaluation.findings) {
    const url = new URL(finding.source.url);
    if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) throw new Error('Use a public HTTPS source reference without credentials.');
    if (Number.isNaN(Date.parse(finding.source.accessedOn)) || new Date(finding.source.accessedOn).toISOString().slice(0, 10) !== finding.source.accessedOn) throw new Error('Source access dates must be real calendar dates.');
  }
  const sentences = [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(plain(draft.brief.summary))];
  if (sentences.length < 2 || sentences.length > 5) throw new Error('Draft an Executive Summary of two to five short sentences.');
  if (words(proposalSummary(draft)) > 120) throw new Error('Shorten the default response to 120 words while keeping every capability visible. Put reasoning in optional detail; do not ask the founder to shorten it.');
}
