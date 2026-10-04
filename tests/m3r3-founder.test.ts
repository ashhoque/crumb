import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { temporaryProject } from './helpers.js';
import { bootstrapProject } from '../src/application/project-bootstrap.js';
import { emptyIde } from '../src/domain/ide.js';
import { savePrebuild, readPrebuild, saveWorkingContext } from '../src/application/prebuild.js';
import { readContext } from '../src/application/read-context.js';
import { updateWorkingContext, planFounderMove, opportunityLevel } from '../src/domain/founder-intelligence.js';

test('M3-R3 runtime entrypoint places direct Crumb identity before process guidance',async()=>{
  const {readFileSync}=await import('node:fs');
  const skill=readFileSync(new URL('../../.agents/skills/crumb/SKILL.md',import.meta.url),'utf8');
  assert.ok(skill.indexOf('You are Crumb in every user-visible message')<skill.indexOf('## Start with the current conversation'));
  assert.match(skill,/including brief progress updates/);
  assert.match(skill,/an existing app brought into this conversation/);
});

test('M3-R3 bootstrap reads few safe high-information files and reuses unchanged content',t=>{
  const root=temporaryProject(t);
  writeFileSync(join(root,'README.md'),'A board for editors to manage client revisions.');
  writeFileSync(join(root,'package.json'),JSON.stringify({name:'review-board'}));
  writeFileSync(join(root,'.env'),'PRIVATE=do-not-read');
  mkdirSync(join(root,'src'));writeFileSync(join(root,'src','pricing.md'),'Editors coordinate approvals here.');
  const first=bootstrapProject(root,{decision:'pricing',targeted:['src/pricing.md']});
  assert.equal(first.metrics.filesRead,3);
  assert.equal(first.metrics.contentReturned,3);
  assert.ok(!JSON.stringify(first).includes('PRIVATE'));
  const again=bootstrapProject(root,{decision:'pricing',targeted:['src/pricing.md'],previous:first.files.map(({path,sha256})=>({path,sha256}))});
  assert.equal(again.metrics.contentReturned,0);assert.equal(again.metrics.reused,3);
  assert.throws(()=>bootstrapProject(root,{decision:'pricing',targeted:['.env']}),/safe relative/);
  assert.throws(()=>bootstrapProject(root,{decision:'pricing',targeted:['../outside']}),/safe relative/);
});

test('M3-R3 installed CLI bootstrap is read-only and returns bounded metrics',t=>{
  const root=temporaryProject(t);writeFileSync(join(root,'README.md'),'A paid app for editors.');
  const cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url));
  const result=spawnSync(process.execPath,[cli,'internal','project-bootstrap',root],{input:JSON.stringify({decision:'pricing'}),encoding:'utf8',windowsHide:true,timeout:15000});
  assert.equal(result.status,0,result.stderr);
  const output=JSON.parse(result.stdout);
  assert.equal(output.metrics.filesRead,1);assert.equal(output.files[0].path,'README.md');
  assert.equal(readPrebuild(root),null);
});

test('M3-R3 working model is compact, confidence-aware and delta-updated',()=>{
  const conversationId='conversation_123';
  const first=updateWorkingContext(undefined,{project:{product:{value:'Revision board',status:'known',confidence:'high',source:'README.md'}},founder:{pace:{value:'Prefers one decision at a time',status:'inferred',confidence:'low',source:null}}},conversationId);
  const second=updateWorkingContext(first,{project:{decision:{value:'Choose first price test',status:'known',confidence:'high',source:'current turn'}}},conversationId);
  assert.equal(second.project.product?.value,'Revision board');
  assert.equal(second.project.decision?.value,'Choose first price test');
  assert.throws(()=>updateWorkingContext(first,{},'different_chat_123'),/different conversation/);
  assert.throws(()=>updateWorkingContext(undefined,{founder:{pace:{value:'Fast',status:'inferred',confidence:'high',source:null}}},conversationId),/inference cannot be high-confidence/);
});

test('M3-R3 saved working context remains behind explicit continuation and never grants Act',t=>{
  const root=temporaryProject(t);savePrebuild(root,emptyIde());
  const before=readPrebuild(root)!;
  const saved=saveWorkingContext(root,{expectedVersion:before.version,conversationId:'conversation_123',delta:{project:{product:{value:'Revision board',status:'known',confidence:'high',source:'README.md'}}}});
  assert.equal(saved.context.contractVersion,2);
  if(saved.context.contractVersion!==2)throw new Error('Expected current IDE context.');
  assert.equal(saved.context.workingContext?.project.product?.value,'Revision board');
  assert.equal(saved.context.ide.confirmations.length,0);
  assert.deepEqual(readContext(root,'get_current_context'),{available:false,reason:'Fresh conversation. Saved idea context is available only when the founder explicitly continues that project.'});
  const resumed=readContext(root,'get_current_context',{scope:{mode:'continue',conversationId:'newchat_123'}}) as {context:{workingContext:{project:{product:{value:string}}}}};
  assert.equal(resumed.context.workingContext.project.product.value,'Revision board');
});

test('M3-R3 one-move budget stays fast until a material gap, and radar calibrates claims',()=>{
  assert.deepEqual(planFounderMove({kind:'clarification',hasCurrentSnapshot:false,materialExternalGap:true,existingEvidence:'none'}).researchBatches,0);
  const boot=planFounderMove({kind:'project_decision',hasCurrentSnapshot:false,materialExternalGap:true,existingEvidence:'none'});
  assert.equal(boot.path,'bootstrap');assert.equal(boot.projectPasses,2);assert.equal(boot.researchBatches,1);
  const reuse=planFounderMove({kind:'evidence_decision',hasCurrentSnapshot:true,materialExternalGap:true,existingEvidence:'current'});
  assert.equal(reuse.researchBatches,0);
  assert.equal(opportunityLevel(0,false,false),'signal');
  assert.equal(opportunityLevel(1,false,false),'hypothesis');
  assert.equal(opportunityLevel(2,true,true),'recommended_test');
});
