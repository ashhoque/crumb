import { assertEvaluationComplete, ideState, presentationText, type AnyPrebuild, type Subject } from './ide.js';
import { interviewRecommendation } from './evaluation-quality.js';
import { firstUserDiscoveryNotice, firstUserScopeQuestion } from './first-user-discovery.js';

export interface Guidance { kind: 'question' | 'confirm' | 'research' | 'review' | 'redefine' | 'scope' | 'pause'; subject: Subject | null; text: string }

/** Suggest the next useful move without manufacturing assent or repeating intake. */
export function nextIdeStep(c: AnyPrebuild): Guidance {
  const question = (text: string): Guidance => ({ kind: 'question', subject: null, text });
  if (c.contractVersion === 1) return { kind: 'confirm', subject: 'intention', text: 'We have your earlier context. I’ll use it to confirm the current intention before the next build decision.' };
  const state = ideState(c);
  if (c.project.entry === 'unknown') return question('Are you starting fresh, or do you already have a project in progress?');
  if (['skipped','undecided'].includes(c.intention.status)) return {kind:'pause',subject:'intention',text:"Your intention is still open. We can explore what matters to you when you are ready; I will keep the saved context and hold the build decision until you choose a direction."};
  const foundations = [
    ['intention', state.intention, c.intention.statement, 'What would you like this project to become, given your most important constraint?'],
    ['user', state.target_user, c.definition.user.text, 'That gives us a direction. Which person and recurring situation should we focus on first?'],
    ['problem', state.problem_definition, c.definition.problem.text, 'We have a specific user now. What happened the last time this work was difficult for them?'],
  ] as const;
  for (const [subject, status, known, prompt] of foundations) {
    if (status === 'founder_confirmed') continue;
    if (state.evaluation === 'requires_redefinition' && subject !== 'intention') return { kind: 'redefine', subject, text: `The research changes our understanding: ${c.investigation.redefinition} I’ll revise the affected definition with you before we continue.` };
    return known ? { kind: 'confirm', subject, text: presentationText(c, subject) } : question(prompt);
  }
  if (state.evaluation === 'researching' && c.evaluation.status === 'ready') {
    try {
      assertEvaluationComplete(c);
      return {kind:'review',subject:'evaluation',text:"The saved research is ready for review. I'll bring together the strongest reasons, counterevidence and remaining uncertainty so you can judge the opportunity."};
    } catch { /* Incomplete research still needs the relevant investigation. */ }
  }
  if (state.evaluation === 'researching' || state.evaluation === 'not_started') return { kind: 'research', subject: null, text: 'That gives us something concrete to investigate. I’ll check the alternatives, what users love or find frustrating, the technical constraints, and where these users already gather. Then I’ll bring back the useful differences and the uncertainty that matters most.' };
  if (state.evaluation === 'reviewed') return { kind: 'confirm', subject: 'evaluation', text: presentationText(c, 'evaluation') };
  if (state.act_readiness !== 'founder_confirmed') {
    const scopeQuestion = firstUserScopeQuestion(c);
    if (scopeQuestion) return { kind: 'question', subject: null, text: [firstUserDiscoveryNotice(c), scopeQuestion].filter(Boolean).join('\n\n') };
    return { kind: 'confirm', subject: 'act', text: [firstUserDiscoveryNotice(c), interviewRecommendation(c), presentationText(c, 'act')].filter(Boolean).join('\n\n') };
  }
  return { kind: 'scope', subject: null, text: 'We have a deliberate build decision. The saved handoff carries the confirmed pain into the build session. There we will prepare one complete user journey and the full Build Pack for review before touching code.' };
}
