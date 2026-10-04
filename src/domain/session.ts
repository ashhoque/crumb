import { confirmation, ideState, type IdeContext } from './ide.js';
import type { SavedPrebuild } from './prebuild.js';
import { plain } from './conversation.js';
import { nextIdeStep } from './guide.js';
import { discoveryCards } from './first-user-discovery.js';
export type SessionMode='conversation'|'build';
export interface HostSurface {host:'codex'|'chatgpt'|'claude'|'cursor'|'portable';sharedProjectFiles:boolean;canExecute:boolean}
export const CONTINUE_BUILD='Continue the Crumb build.';
const clip=(s:string|null|undefined,n=300)=>s?plain(s).slice(0,n):null;
export function conversationContext(s:SavedPrebuild){
  if(s.context.contractVersion!==2)throw new Error('Confirm the retained legacy knowledge through current IDE first.');
  const c=s.context,confirmed=(subject:'intention'|'user'|'problem')=>!!confirmation(c,subject);
  const insights=c.competitors.slice(0,2).map(x=>({name:x.name,insight:clip(x.fields.gaps.text??x.fields.love.text??x.fields.positioning.text),claimIds:[...new Set([...x.fields.gaps.claimIds,...x.fields.love.claimIds])].slice(0,4)}));
  return {format:'business-copilot-current-context-v1',revision:s.version,contextHash:s.hash,synthetic:c.synthetic,
    preferredName:c.preferredName?{value:c.preferredName.value,source:clip(c.preferredName.source)}:null,
    intention:{text:c.intention.statement,confirmed:confirmed('intention')},user:{text:c.definition.user.text,confirmed:confirmed('user')},buyer:clip(c.definition.buyer.text),problem:{text:c.definition.problem.text,confirmed:confirmed('problem')},
    constraints:[clip(c.intention.advice),clip(c.definition.frequency.text),clip(c.definition.workaround.text)].filter(Boolean),
    evaluation:{conclusion:clip(c.evaluation.conclusion,500),state:ideState(c).evaluation,competitors:insights,marketGap:clip(c.competitors.map(x=>x.fields.gaps.text).find(Boolean)),unknowns:c.evaluation.unknowns.slice(0,3).map(x=>clip(x))},
    habitats:c.firstUserAvenues.slice(0,3).map(id=>c.habitats.find(h=>h.id===id)!).filter(Boolean).map(h=>({id:h.id,place:h.place,summary:clip(h.relevance),verifiedRoute:h.participation.verified})),
    firstUserCards:discoveryCards(c).slice(0,3).map(card=>({id:card.id,displayName:card.displayName,kind:card.kind,relationship:card.relationship,observed:clip(card.observed),routeStatus:card.routeStatus,sourceIds:card.sourceIds})),
    discovery:c.discovery??null,
    interviewLearning:c.feedbackClaimIds.slice(0,3).map(id=>({id,summary:clip(c.claims.find(x=>x.id===id)?.statement)})),
    ...(c.quality?{quality:{technicalSummary:clip(c.quality.technical.summary),centralRisk:clip(c.quality.technical.centralRisk),founderEdge:clip(c.quality.founderFit.edge),founderLimit:clip(c.quality.founderFit.limitation),nextLearning:c.quality.learning,detail:'View technical evaluation'}}:{}),
    state:ideState(c),guidance:nextIdeStep(c),actConfirmation:confirmation(c,'act')?{id:confirmation(c,'act')!.id,basis:confirmation(c,'act')!.basis}:null,
    detail:{research:'CRUMB_RESEARCH.json',handoff:'BUILD_HANDOFF.md',retrieval:'Retrieve only relevant claim/source/habitat IDs; do not reload full history.'},
    researchPolicy:{default:'reuse_cached',refreshWhen:['user_changes','material_problem_change','market_change','stale_or_time_sensitive','inadequate_coverage','founder_requests_refresh'],sourceCount:c.sources.length,latestResearchOn:c.sources.map(x=>x.retrievedOn).sort().at(-1)??null},
  };
}
export function buildTransition(c:IdeContext,host:HostSurface):string {
  const name=c.preferredName?plain(c.preferredName.value)+', ':'';
  if(!host.sharedProjectFiles)return `Ready to build\n${name}the confirmed context and portable build handoff are saved in the selected project. This adapter cannot verify shared files on this chat surface, so I cannot promise an automatic transfer. Connect the saved project files to a capable build environment, then say: ${CONTINUE_BUILD} You do not need to reconstruct or paste the research. No build session has been opened.`;
  const move=host.host==='chatgpt'?'Now open a Work chat in this same Project and say:':host.host==='claude'?'Open a capable Claude Code session with this same project and say:':host.host==='cursor'?'Switch to a capable Plan/Agent session in this same project and say:':'Continue in the build-capable session for this same project and say:';
  return `Ready to build\n${name}we have narrowed this enough to build deliberately. I have saved the confirmed user, problem, evaluation and build handoff, so you will not need to explain them again.\n\n${move}\n\n${CONTINUE_BUILD}\n\nThe first task is to prepare the full Build Pack before touching product code. I have not opened another session. This instruction assumes the build session can read these same project files.`;
}
