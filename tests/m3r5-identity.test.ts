import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assistantIdentityLeaks,openingAssistantText,mergeCrumbHostInstructions,composeDeveloperInstructions} from '../src/host/codex-identity.js';

test('M3-R5 actual assistant openings and later progress fail identity acceptance; invocation UI is not speech',()=>{
  const bad=["I'm using Crumb to help.","I’ll use the Crumb workflow.","I've loaded Crumb.","According to the Crumb skill, we should research.","I'm checking the skill instructions.","Our M3-R5 review starts now.","I read SKILL.md and runtime.json."];
  for(const text of bad){
    assert.equal(assistantIdentityLeaks([{type:'agentMessage',phase:'commentary',text}]).length,1,text);
    assert.equal(assistantIdentityLeaks([{type:'agentMessage',phase:'final',text}]).length,1,text);
  }
  const ui={type:'skillInvocation',text:'Using Crumb skill'};
  const direct={type:'agentMessage',phase:'commentary',text:'Six bikes occupying the racks is a real constraint. I’ll check what still fails after the reminder.'};
  assert.deepEqual(assistantIdentityLeaks([ui,direct]),[]);
  assert.equal(openingAssistantText([ui,direct]),direct.text);
  assert.throws(()=>openingAssistantText([ui]),/actual assistant speech/);
  assert.equal(assistantIdentityLeaks([direct,{type:'agentMessage',text:'I’m using the Crumb skill to check prices.'}]).length,1);
});

test('M3-R5 host installation preserves unrelated developer instructions and replaces only its scoped guard',()=>{
  const custom='Keep my output brief.\nPreserve approval boundaries.\n';
  const first=mergeCrumbHostInstructions(custom,'Old scoped identity rule.');
  const updated=mergeCrumbHostInstructions(first,'New scoped identity rule.');
  assert.ok(updated.startsWith(custom));assert.ok(!updated.includes('Old scoped'));
  assert.equal(mergeCrumbHostInstructions(updated,'New scoped identity rule.'),updated);
  for(const malformed of ['<crumb-host-identity>missing end','</crumb-host-identity>','<crumb-host-identity>x</crumb-host-identity><crumb-host-identity>y</crumb-host-identity>'])assert.throws(()=>mergeCrumbHostInstructions(malformed,'guard'),/malformed/);
});

test('M3-R5 assembled adapter retains the installed developer guard instead of replacing it with test instructions',()=>{
  const guard=readFileSync(new URL('../../skill/crumb/host/codex.md',import.meta.url),'utf8');
  const installed=mergeCrumbHostInstructions('Other host instructions.',guard);
  const additional='Synthetic data only. No external sends or builds.';
  const payload={developerInstructions:composeDeveloperInstructions(installed,additional),input:[{type:'text',text:'$crumb Help with this business.'},{type:'skill',name:'crumb'}]};
  assert.equal(payload.developerInstructions,`${installed}\n\n${additional}`);
  assert.equal(mergeCrumbHostInstructions(payload.developerInstructions,guard),payload.developerInstructions);
  assert.ok(payload.developerInstructions.startsWith('Other host instructions.'));
});
