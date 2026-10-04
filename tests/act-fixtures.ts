import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { prepareIde, ideFixture, actionFor } from './ide-fixtures.js';
import { basis, type IdeContext } from '../src/domain/ide.js';
import { evaluatedClaimIds, type ActPlan, type SavedAct, type StageResult } from '../src/domain/act.js';
import type { SavedPrebuild } from '../src/domain/prebuild.js';
import { saveActPlan, approveActPlan, generateBuildPack } from '../src/application/act.js';

export function planFor(saved:SavedPrebuild):ActPlan {
  const c=saved.context as IdeContext,scope=actionFor(saved);
  scope.foundation.name=c.project.name;
  for(const field of ['buyer','trigger','workaround'] as const) scope.foundation[field]={value:c.definition[field].text,basis:c.definition[field].text?'founder_statement':'unknown',source:c.definition[field].text?'Retained synthetic context.':null};
  scope.foundation.desiredOutcome={value:'Complete the confirmed review workflow.',basis:'assumption',source:null};
  scope.foundation.solution={value:'One local workflow with no live data integration.',basis:'assumption',source:null};
  scope.proposal={...scope.proposal,method:'build',title:'A single comparison',journey:'Read a local shortlist, compare the supplied facts, save one review note',capabilities:['Compare supplied facts','Save one review note'],keep:[],park:['Live prices','Portfolio dashboard'],criticalUnknown:'Does one comparison reduce repeated checking?'};
  scope.brief={summary:'One comparison is enough to test the reported pain. Demand remains uncertain.',nextAction:'Approve this small build scope.',questions:[]};
  scope.proposal.why='Only the complete main path is needed to test the confirmed pain.';
  scope.proposal.nextAction='Build the approved local workflow and stop for review.';
  scope.proposal.technicalAcceptance=['Actual input produces the stated output; failures are useful and files remain safe.'];
  scope.proposal.learningAcceptance=['Later observe whether a real user can complete the confirmed job with less repeated checking.'];
  return {contractVersion:1,expectedVersion:0,scope,
    outcome:{input:'A local JSON shortlist containing supplied facts.',output:'A comparison with one saved note.',failureBehavior:'Reject missing or malformed facts with a useful error and no saved result.',persistence:{mode:'local',reason:'Keep the single review note so the user can return to their reasoning.'}},
    capabilities:scope.proposal.capabilities.map(name=>({name,userBasis:basis(c,'user'),problemBasis:basis(c,'problem'),evidenceClaimIds:[[...evaluatedClaimIds(c)][0]!],learningObjective:'Learn whether this removes repeated comparison work; not investment advice or a demand claim.'})),
    repository:{permissionQuote:'Synthetic founder authorizes inspecting and editing this disposable project for this scope.',inspectedPaths:[],environment:'known',stack:'Existing Node runtime with native JavaScript and no new dependencies.',constraints:['No network, accounts or additional dependencies.']},
    keep:[],park:scope.proposal.park.map(label=>({label,paths:[],reason:'Not needed to test the comparison workflow.'})),
    stages:[{id:'mvp',title:'M1: complete the comparison',kind:'mvp',goal:'Produce one real end-to-end comparison and saved note with useful failures.',capabilities:[...scope.proposal.capabilities],writes:['compare.mjs','compare.test.mjs'],checks:[{id:'journey',description:'Actual input/output, persistence and invalid input checks pass.',commandHint:'node --test compare.test.mjs'}]}],stopAfterStageId:'mvp',packDirectory:'build-context'};
}
export function readyPlan(root:string):ActPlan { return planFor(prepareIde(root)); }
export function authorized(root:string,p=readyPlan(root)):SavedAct {
  let saved=saveActPlan(root,p);
  saved=approveActPlan(root,{expectedVersion:saved.version,planHash:saved.record.planHash,quote:'Synthetic founder: implement the displayed scope and first stage.'});
  return generateBuildPack(root,{expectedVersion:saved.version});
}
export function resultFor(s:SavedAct):StageResult {
  const stage=s.record.plan.stages[s.record.currentStage]!;
  return {expectedVersion:s.version,stageId:stage.id,implementation:'completed',changes:[],checks:stage.checks.map(check=>({criterionId:check.id,label:check.description,command:check.commandHint,executed:true,exitCode:0,result:'passed',output:'Synthetic unit-test receipt. No external execution is implied.'})),runInstructions:['Use the approved local command with your supplied example.'],gaps:[]};
}
export function multiStage(p:ActPlan):ActPlan {
  p.repository.environment='unknown';
  p.stages.unshift({id:'groundwork',title:'Groundwork: inspect the environment',kind:'groundwork',goal:'Verify the actual runtime and commands without replacing existing setup.',capabilities:[],writes:['ENVIRONMENT.md'],checks:[{id:'runtime',description:'Read the installed runtime version.',commandHint:'node --version'}]},
    {id:'risk',title:'M0: resolve the file input risk',kind:'risk',goal:'Verify the required input format before implementing the journey.',capabilities:[],writes:['INPUT_NOTES.md'],checks:[{id:'input',description:'Confirm a local JSON file can be read with this runtime.',commandHint:'node --input-type=module -e "JSON.parse(\'{\"items\":[]}\')"'}]});
  return p;
}
export function stockContext():IdeContext {
  // Reuse the previously executed M1-R3 public-research fixture. Rehearsal founder
  // replies remain synthetic; historical sources are not refreshed or validated.
  const c=JSON.parse(readFileSync(new URL('../../fixtures/m1r3/stock.json',import.meta.url),'utf8')) as IdeContext;
  return c;
}
export function existingPlan(root:string):ActPlan {
  writeFileSync(join(root,'parser.mjs'),'export const parse = text => JSON.parse(text);\n');
  writeFileSync(join(root,'dashboard.mjs'),'// Working unrelated dashboard retained byte-for-byte.\nexport const title = "Dashboard";\n');
  const c=ideFixture(); c.project.entry='existing'; c.project.permissionQuote='Synthetic founder permits inspecting these project files.';
  const p=planFor(prepareIde(root,'act',c));
  p.repository.inspectedPaths=['parser.mjs','dashboard.mjs'];
  p.keep=[{label:'Existing JSON parser',paths:['parser.mjs'],reason:'It already reads the required input.'}];p.scope.proposal.keep=p.keep.map(x=>x.label);
  p.park=[{label:'Existing dashboard',paths:['dashboard.mjs'],reason:'The core comparison does not need it.'}];p.scope.proposal.park=p.park.map(x=>x.label);
  return p;
}
