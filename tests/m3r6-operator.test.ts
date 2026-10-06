import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,existsSync,copyFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {temporaryProject} from './helpers.js';
import {planFounderMove} from '../src/domain/founder-intelligence.js';
import {nextIdeStep} from '../src/domain/guide.js';
import {emptyIde,assertAct,ideState} from '../src/domain/ide.js';
const repo=fileURLToPath(new URL('../../',import.meta.url));
const base={kind:'evidence_decision' as const,hasCurrentSnapshot:true,materialExternalGap:false,existingEvidence:'current' as const};

test('R6 active authority and research retain current invariants; historical text stays archived',()=>{
  const skill=readFileSync(join(repo,'skill/crumb/SKILL.md'),'utf8');
  const research=readFileSync(join(repo,'skill/crumb/references/research.md'),'utf8');
  assert.doesNotMatch(skill,/Humor is optional/);
  assert.doesNotMatch(research,/M1-R3|cheapest important learning step/);
  assert.match(readFileSync(join(repo,'docs/legacy-skills/crumb/research-pre-r6.md'),'utf8'),/M1-R3 depth/);
  assert.match(readFileSync(join(repo,'AGENTS.md'),'utf8'),/CURRENT_PRODUCT_AUTHORITY/);
  assert.ok(readFileSync(join(repo,'CURRENT_PRODUCT_AUTHORITY.md'),'utf8').split(/\s+/).length<=1500);
  assert.match(skill,/Never claim a switch/); // contract guard, not personality/UX proof
});

test('R6 allowlist migrates known old references, excludes orphans and refuses modified history',t=>{
  const root=temporaryProject(t),script=join(repo,'scripts/sync-global-skill.mjs');
  const run=(...args:string[])=>spawnSync(process.execPath,[script,'--skill-only',...args],{env:{...process.env,USERPROFILE:root},encoding:'utf8',windowsHide:true});
  assert.equal(run('--install').status,0);
  const refs=join(root,'.agents/skills/crumb/references');
  for(const name of ['conversations.md','interviews-master.md']){
    assert.equal(existsSync(join(refs,name)),false);
    copyFileSync(join(repo,'docs/legacy-skills/crumb',name),join(refs,name));
  }
  assert.equal(run('--install').status,0);
  assert.equal(existsSync(join(refs,'conversations.md')),false);
  writeFileSync(join(refs,'interviews-master.md'),'founder modification');
  assert.match(run('--install').stderr,/Preserve modified/);
  assert.equal(readFileSync(join(refs,'interviews-master.md'),'utf8'),'founder modification');
});

test('R6 locator common operation examples execute through actual CLI without source discovery',t=>{
  const root=temporaryProject(t),script=join(repo,'scripts/sync-global-skill.mjs');
  const installed=spawnSync(process.execPath,[script,'--install','--skill-only'],{env:{...process.env,USERPROFILE:root},encoding:'utf8',windowsHide:true});
  assert.equal(installed.status,0,installed.stderr);
  const runtime=JSON.parse(readFileSync(join(root,'.agents/skills/crumb/runtime.json'),'utf8'));
  const outputs:Record<string,any>={};
  for(const op of ['research-decision','market-pulse','founder-move','first-user-plan','outreach-draft','validation-asset']){
    const path=join(root,'request.json');writeFileSync(path,JSON.stringify(runtime.operations[op]));
    const result=spawnSync(process.execPath,[runtime.cli,'internal',op,root,'--input-file',path],{encoding:'utf8',windowsHide:true});
    assert.equal(result.status,0,`${op}: ${result.stderr}`);outputs[op]=JSON.parse(result.stdout);
  }
  assert.equal(outputs['founder-move'].path,'first_users');
  assert.equal(outputs['outreach-draft'].sendAllowed,false);
  assert.equal(outputs['validation-asset'].permission,'draft_only_until_act');
});

test('R6 built or prototype with weak customer evidence activates existing first-user work',()=>{
  for(const productStage of ['prototype','built','live'] as const)for(const customerEvidence of ['none','weak'] as const){
    const move=planFounderMove({...base,productStage,customerEvidence});
    assert.equal(move.path,'first_users');assert.match(move.next,/direct links/);assert.match(move.next,/No send or build/);
  }
  assert.equal(planFounderMove({...base,productStage:'built',customerEvidence:'current'}).path,'fast');
});
test('R6 long horizon selects credible parallel learning, not fictional proxy validation',()=>{
  const move=planFounderMove({...base,evidenceHorizon:'long',fasterEvidence:true});
  assert.equal(move.path,'parallel_learning');assert.match(move.next,/can and cannot establish/);
  assert.equal(planFounderMove({...base,evidenceHorizon:'long',fasterEvidence:false}).path,'fast');
});
test('R6 high founder effort uses researchable evidence; current sources and simple replies stay fast',()=>{
  const gap={...base,materialExternalGap:true,existingEvidence:'none' as const,founderEffort:'high' as const};
  assert.equal(planFounderMove(gap).path,'research');assert.match(planFounderMove(gap).next,/instead of assigning/);
  assert.equal(planFounderMove({...gap,existingEvidence:'current'}).researchBatches,0);
  assert.equal(planFounderMove({...gap,kind:'clarification'}).path,'fast');
  assert.throws(()=>planFounderMove({...base,productStage:'invented'} as any),/bounded/);
  assert.throws(()=>planFounderMove({...base,fasterEvidence:'yes'} as any),/boolean/);
});
test('R6 sourced credible working context prevents duplicate intake without granting formal consent',()=>{
  const c=emptyIde();c.project.entry='fresh';c.intention.status='provided';c.intention.statement='Build a paid service';
  const fact={value:'Independent rental managers',status:'inferred' as const,confidence:'medium' as const,source:'Founder firsthand observation'};
  c.workingContext={conversationId:'operator_chat_123',project:{customer:fact,problem:{...fact,value:'Keys are not returned on time'}},founder:{},inspected:[],opportunity:null};
  assert.equal(nextIdeStep(c).kind,'research');
  assert.equal(c.definition.user.text,null);assert.notEqual(ideState(c).target_user,'founder_confirmed');
  assert.throws(()=>assertAct(c),/founder-confirmed/);
  c.evaluation.status='in_progress';assert.equal(nextIdeStep(c).kind,'review');
  c.workingContext.project.customer={...fact,status:'stale'};
  assert.equal(nextIdeStep(c).kind,'question');
  delete c.workingContext;const question=nextIdeStep(c);
  assert.match(question.text,/Who.*what happened/);assert.equal(question.subject,null);
});
