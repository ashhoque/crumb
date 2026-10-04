import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { temporaryProject } from './helpers.js';
import { rehearse, scenarios } from './ide-rehearsals.js';
import { validateIde, type IdeContext } from '../src/domain/ide.js';

for (const scenario of scenarios) test(`R3 conversation rehearsal: ${scenario.title}`, t => {
  const result=rehearse(temporaryProject(t),scenario);
  assert.ok(result.turns.slice(0,result.firstSolutionTurn-1).every(t=>t.actLocked));
  assert.equal(result.turns[result.firstSolutionTurn-2]?.text,'Yes — move to Act');
  assert.match(result.turns[result.firstSolutionTurn-1]!.text,/MVP/);
  for(const prompt of ['Is that the intention you want me to optimize around?','Is this the user you actually want to focus on first?','Is this the exact pain you want us to solve?','Are you ready to commit a build cycle to this?']) assert.ok(result.turns.some(t=>t.text.includes(prompt)));
  assert.ok(result.turns.some(t=>t.state.evaluation==='founder_reviewed'&&t.state.act_readiness==='ready_for_confirmation'));
  if('revisedUser' in scenario) {
    assert.ok(result.turns.some(t=>t.state.evaluation==='requires_redefinition'));
    assert.equal(result.turns.filter(t=>t.text.includes('Is this the user you actually want to focus on first?')).length,2);
    assert.equal(result.turns.filter(t=>t.text.includes('Is this the exact pain you want us to solve?')).length,2);
  }
  if(scenario.entry==='existing') assert.doesNotMatch(result.transcript,/Are you starting fresh/);
});

test('R3 stock dossier preserves real provenance, obsolete-gap counterevidence and unknown commercial demand',()=>{
  const c=JSON.parse(readFileSync(new URL('../../fixtures/m1r3/stock.json',import.meta.url),'utf8')) as IdeContext;
  validateIde(c);
  assert.equal(c.synthetic,true); assert.equal(c.investigation.coverage.length+c.evaluation.coverage.length,28);
  assert.equal(c.investigation.alternatives.length,9); assert.ok(c.adjacent.length<=2);
  assert.equal(c.sources.find(x=>x.id==='service')!.access,'snippet');
  assert.ok(!c.research.some(x=>x.inspectedSourceIds.includes('service')));
  assert.equal(c.claims.find(x=>x.id==='vendor-users')!.basis,'reported_metric');
  assert.equal(c.claims.find(x=>x.id==='release-proxy')!.basis,'public_proxy');
  assert.equal(c.claims.find(x=>x.id==='revenue-unknown')!.basis,'unknown');
  assert.match(c.investigation.counterevidence!,/contradicted by current documentation/);
  assert.equal(c.claims.find(x=>x.id==='love-hate')!.repetition,'single');
  assert.ok(c.sources.filter(x=>x.provenance==='public').every(x=>x.url&&x.retrievedOn&&x.limitation));
  assert.ok(c.habitats.every(x=>!x.participation.verified));
});
