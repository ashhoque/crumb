import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {temporaryProject} from './helpers.js';
import {emptyIde, assertAct, ideState, thesisText} from '../src/domain/ide.js';
import {nextIdeStep} from '../src/domain/guide.js';
import {savePrebuild, readPrebuild, transitionIde, saveWorkingContext} from '../src/application/prebuild.js';
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
  c.intention.statement=null;c.intention.status='skipped';
  assert.equal(nextIdeStep(c).kind,'research');
  assert.throws(()=>assertAct(c),/founder-confirmed/);
});

test('M3-R5 one displayed working thesis can confirm foundations but cannot approve Act',t=>{
  const root=temporaryProject(t);savePrebuild(root,ideFixture());
  const shown=transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'present-thesis'});
  if(shown.context.contractVersion!==2)throw new Error('Expected current IDE.');
  const p=shown.context.ide.presentation!;
  assert.equal(p.subject,'thesis');assert.match(p.text,/first user/i);
  assert.ok(p.text.includes(shown.context.investigation.counterevidence!));
  for(const risk of shown.context.evaluation.unknowns)assert.ok(p.text.includes(risk));
  const saved=transitionIde(root,{expectedVersion:shown.version,operation:'confirm-thesis',presentationId:p.id,displayedText:p.text,turnId:randomUUID(),quote:"Looks good, but don't build yet."});
  if(saved.context.contractVersion!==2)throw new Error('Expected current IDE.');
  assert.equal(saved.context.ide.confirmations.length,4);
  assert.ok(saved.context.ide.confirmations.every(receipt=>receipt.presentedText===p.text));
  assert.equal(ideState(saved.context).evaluation,'founder_reviewed');
  assert.equal(ideState(saved.context).act_readiness,'ready_for_confirmation');
  assert.throws(()=>assertAct(saved.context),/explicitly choose/);
});

test('M3-R5 ambiguous or stale thesis cannot manufacture consent',t=>{
  const root=temporaryProject(t);savePrebuild(root,ideFixture());
  const shown=transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'present-thesis'});
  if(shown.context.contractVersion!==2)throw new Error('Expected current IDE.');
  const p=shown.context.ide.presentation!;
  for(const quote of ['Maybe','Looks good, but change the user','No'])assert.throws(()=>transitionIde(root,{expectedVersion:shown.version,operation:'confirm-thesis',presentationId:p.id,displayedText:p.text,turnId:randomUUID(),quote}),/clear agreement/);
  const edited=structuredClone(shown.context);edited.expectedVersion=shown.version;edited.definition.user.text='a different user';savePrebuild(root,edited);
  assert.throws(()=>transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'confirm-thesis',presentationId:p.id,turnId:randomUUID(),quote:'Yes'}),/current displayed thesis/);
});

test('M3-R5 incomplete and oversized thesis cannot silently approve Evaluation',t=>{
  const c=ideFixture();c.evaluation.status='in_progress';
  const root=temporaryProject(t);savePrebuild(root,c);
  const shown=transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'present-thesis'});
  if(shown.context.contractVersion!==2)throw new Error('Expected current IDE.');
  const saved=transitionIde(root,{expectedVersion:shown.version,operation:'confirm-thesis',presentationId:shown.context.ide.presentation!.id,displayedText:shown.context.ide.presentation!.text,turnId:randomUUID(),quote:"Looks good, don't build yet."});
  if(saved.context.contractVersion!==2)throw new Error('Expected current IDE.');
  assert.equal(saved.context.ide.confirmations.length,3);
  assert.equal(ideState(saved.context).evaluation,'researching');
  assert.throws(()=>assertAct(saved.context),/founder-reviewed/);
  c.evaluation.unknowns=['Material risk. '.repeat(600)];
  assert.throws(()=>thesisText(c),/do not truncate/);
});

test('M3-R5 actual displayed wording binds review; a replacement invalidates it',t=>{
  const root=temporaryProject(t);savePrebuild(root,ideFixture());
  const shown=transitionIde(root,{expectedVersion:readPrebuild(root)!.version,operation:'present-thesis'});
  if(shown.context.contractVersion!==2)throw new Error('Expected current IDE.');
  const p=shown.context.ide.presentation!;
  const input={expectedVersion:shown.version,operation:'confirm-thesis' as const,presentationId:p.id,turnId:randomUUID(),quote:"Looks good, don't build yet."};
  for(const displayedText of [undefined,p.text.replace('first user','only buyer')])assert.throws(()=>transitionIde(root,{...input,displayedText}),/text actually shown/);
  assert.equal(readPrebuild(root)!.version,shown.version);
  const reviewed=transitionIde(root,{...input,displayedText:p.text.replaceAll('\n','\r\n')});
  if(reviewed.context.contractVersion!==2)throw new Error('Expected current IDE.');
  const changed=structuredClone(reviewed.context);changed.expectedVersion=reviewed.version;changed.definition.problem.text='A materially different customer problem';
  const next=savePrebuild(root,changed);
  if(next.context.contractVersion!==2)throw new Error('Expected current IDE.');
  assert.equal(ideState(next.context).problem_definition,'drafted');
  assert.equal(next.context.ide.reviewBasis,null);
  assert.throws(()=>assertAct(next.context),/founder-confirmed/);
});

test('M3-R5 fresh working notes persist without a dossier and cannot replace prior work',t=>{
  const root=temporaryProject(t);
  const input={start:true,synthetic:true,expectedVersion:0,conversationId:'fresh_chat_123',delta:{project:{next_move:{value:'Draft a paid trial invitation',status:'inferred' as const,confidence:'medium' as const,source:'Current conversation'}}}};
  const saved=saveWorkingContext(root,input);
  if(saved.context.contractVersion!==2)throw new Error('Expected current IDE.');
  assert.equal(saved.context.workingContext?.project.next_move?.value,input.delta.project.next_move.value);
  assert.equal(saved.context.synthetic,true);
  assert.throws(()=>assertAct(saved.context),/founder-confirmed/);
  assert.throws(()=>saveWorkingContext(root,input),/unused context folder/);
  assert.equal(readPrebuild(root)!.version,saved.version);
});
