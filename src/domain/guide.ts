import { assertEvaluationComplete, ideState, presentationText, type AnyPrebuild, type Subject } from './ide.js';
import { interviewRecommendation } from './evaluation-quality.js';
import { firstUserDiscoveryNotice, firstUserScopeQuestion } from './first-user-discovery.js';

export interface Guidance { kind: 'question' | 'confirm' | 'research' | 'review' | 'redefine' | 'scope' | 'pause'; subject: Subject | null; text: string }

/** Suggest the next useful move without manufacturing assent or repeating intake. */
export function nextIdeStep(c: AnyPrebuild): Guidance {
  const question = (text: string): Guidance => ({ kind: 'question', subject: null, text });
  if (c.contractVersion === 1) return { kind: 'confirm', subject: 'intention', text: 'We have your earlier context. I’ll use it to confirm the current intention before the next build decision.' };
  const state = ideState(c);
  if (c.project.entry === 'unknown' && !c.intention.statement && !c.definition.user.text && !c.definition.problem.text) return question('Are you starting fresh, or do you already have a project in progress?');
  if(c.definition.user.text&&c.definition.problem.text&&(!c.intention.statement||['skipped','undecided'].includes(c.intention.status)))return {kind:'research',subject:null,text:'The user and pain give us enough for reversible investigation. I’ll check the alternatives and prepare a small test; your broader goal stays open and no build is approved.'};
  if (['skipped','undecided'].includes(c.intention.status)) return {kind:'pause',subject:'intention',text:"Your intention is still open. We can explore what matters to you when you are ready; I will keep the saved context and hold the build decision until you choose a direction."};
  if (state.evaluation === 'requires_redefinition') return {kind:'redefine',subject:'user',text:`The research changes our understanding: ${c.investigation.redefinition} I’ll revise only the affected definition with you.`};
  if(!c.intention.statement)return question('What would you like this project to become, given your most important constraint?');
  if(!c.definition.user.text)return question('Who was doing this work when you last saw the problem?');
  if(!c.definition.problem.text)return question('What happened the last time this work was difficult for them?');
  if([state.intention,state.target_user,state.problem_definition].some(x=>x!=='founder_confirmed')){
    if(!c.research.length&&!c.sources.length&&c.evaluation.status==='not_started')return {kind:'research',subject:null,text:'We have enough to investigate provisionally. I’ll check the painful workflow, alternatives, spending and reachable users, then bring back a working direction. This does not approve a build.'};
    return {kind:'review',subject:null,text:'I’ll bring the intention, first user, strongest pain, evidence and main uncertainty together as one working business thesis for your correction. Build approval stays separate.'};
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
