import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {temporaryProject} from './helpers.js';
import {emptyIde, assertAct, ideState} from '../src/domain/ide.js';
import {nextIdeStep} from '../src/domain/guide.js';
import {savePrebuild, readPrebuild, transitionIde} from '../src/application/prebuild.js';
import {ideFixture} from './ide-fixtures.js';

function provisional(){
  const c=emptyIde();c.project.entry='fresh';
  c.intention={status:'provided',goal:'high_growth',statement:'build a scalable tool for project teams',advice:'Prefer a narrow first user.'};
  c.definition.user={text:'project managers on construction jobs',claimIds:[],basis:'observed'};
  c.definition.problem={text:'field notes disappear before handoff',claimIds:[],basis:'observed'};
  return c;
}

test('M3-R5 provisional foundations start investigation before three confirmation turns',()=>{
  const c=provisional();
  assert.equal(nextIdeStep(c).kind,'research');
  assert.equal(ideState(c).act_readiness,'not_ready');
  assert.throws(()=>assertAct(c),/founder-confirmed/);
  c.evaluation.status='in_progress';
  assert.equal(nextIdeStep(c).kind,'review');
});

test('M3-R5 one displayed working thesis can confirm foundations but cannot approve Act',t=>{
  const root=temporaryProject(t);savePrebuild(root,ideFixture());
  const shown=transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'present-thesis'});
  if(shown.context.contractVersion!==2)throw new Error('Expected current IDE.');
  const p=shown.context.ide.presentation!;
  assert.equal(p.subject,'thesis');assert.match(p.text,/first user/i);
  const saved=transitionIde(root,{expectedVersion:shown.version,operation:'confirm-thesis',presentationId:p.id,turnId:randomUUID(),quote:"Looks good, but don't build yet."});
  if(saved.context.contractVersion!==2)throw new Error('Expected current IDE.');
  assert.equal(saved.context.ide.confirmations.length,4);
  assert.equal(ideState(saved.context).evaluation,'founder_reviewed');
  assert.equal(ideState(saved.context).act_readiness,'ready_for_confirmation');
  assert.throws(()=>assertAct(saved.context),/explicitly choose/);
});

test('M3-R5 ambiguous or stale thesis cannot manufacture consent',t=>{
  const root=temporaryProject(t);savePrebuild(root,ideFixture());
  const shown=transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'present-thesis'});
  if(shown.context.contractVersion!==2)throw new Error('Expected current IDE.');
  const p=shown.context.ide.presentation!;
  for(const quote of ['Maybe','Looks good, but change the user','No'])assert.throws(()=>transitionIde(root,{expectedVersion:shown.version,operation:'confirm-thesis',presentationId:p.id,turnId:randomUUID(),quote}),/clear agreement/);
  const edited=structuredClone(shown.context);edited.expectedVersion=shown.version;edited.definition.user.text='a different user';savePrebuild(root,edited);
  assert.throws(()=>transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'confirm-thesis',presentationId:p.id,turnId:randomUUID(),quote:'Yes'}),/current displayed thesis/);
});
