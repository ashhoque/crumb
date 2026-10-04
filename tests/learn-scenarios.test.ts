import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { temporaryProject } from './helpers.js';
import { exerciseLearning, learningScenarios } from './learn-scenarios.js';
for(const scenario of learningScenarios)test(`M3 end-to-end ${scenario.id}: ${scenario.title}`,t=>{
  const result=exerciseLearning(temporaryProject(t),scenario.id);
  assert.equal(result.status,'decided');assert.equal(result.learning!.destination,scenario.destination);assert.equal(result.messagesSentByCrumb,0);assert.equal(result.m4Started,false);
  assert.ok(result.build.commands.at(-1)!.output.includes('pass 4'));
  if(scenario.id==='B'){assert.ok(result.learning!.contradictions.length);assert.ok(result.learning!.park.some(p=>p.includes('dashboard')));}
  if(scenario.id==='C')assert.equal(result.learning!.counts.technical_result,1);
  if(scenario.id==='D')assert.ok(result.returnLoop);
  if(scenario.id==='E'){assert.match(result.summary,/ambiguous/);assert.equal(result.learning!.counts.observed_behavior,0);}
  if(scenario.id==='F'){assert.equal(result.learning!.counts.payment,0);assert.ok(result.learning!.park.some(p=>p.includes('winning-trade')));assert.equal(result.build.capabilities.length,2);assert.match(result.summary,/not validation/);}
  const evidenceDirectory=process.env['CEC_M3_EVIDENCE_DIRECTORY'];
  if(evidenceDirectory){mkdirSync(evidenceDirectory,{recursive:true});writeFileSync(join(evidenceDirectory,`scenario-${scenario.id}.json`),JSON.stringify(result,null,2)+'\n');}
});
