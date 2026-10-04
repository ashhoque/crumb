import test from 'node:test';
import assert from 'node:assert/strict';
import { planMarketPulse, assessOpportunity, type MarketSignal } from '../src/domain/market-intelligence.js';
import { planFirstUsers, prepareOutreach, validationAsset } from '../src/domain/first-user-engine.js';
import { updateWorkingContext } from '../src/domain/founder-intelligence.js';

const base={user:'Independent accountants',problem:'Manual client document chasing',decision:'Which narrow user should we test first?',externalEvidence:'none' as const,materialGap:true,localMarket:false};
test('M3-R4 pulse runs early but remains one bounded batch',()=>{
  assert.equal(planMarketPulse({...base,user:''}).action,'clarify');
  assert.equal(planMarketPulse({...base,materialGap:false}).maxQueries,0);
  assert.equal(planMarketPulse({...base,externalEvidence:'current'}).action,'reuse');
  assert.equal(planMarketPulse({...base,localMarket:true}).action,'ask_region');
  const plan=planMarketPulse(base);
  assert.equal(plan.action,'research');assert.equal(plan.maxQueries,3);assert.equal(plan.maxPages,6);
});
const signal=(kind:MarketSignal['kind'],independentSource:string,access:MarketSignal['access']='inspected'):MarketSignal=>({kind,segment:'Independent accountants',observation:'Observed public discussion',sourceUrl:'https://example.com/discussion',retrievedOn:'2026-10-04',independentSource,access,directUser:kind==='pain'});
test('M3-R4 opportunity map separates pain and spending from buzz and TAM',()=>{
  const input={segment:'Independent accountants',pain:'Document chasing',productFit:'Possible workflow fit',founderAdvantage:'Knows practice operations'};
  const buzz=assessOpportunity({...input,signals:[signal('engagement','one')]});
  assert.equal(buzz.evidenceStrength,'unestablished');assert.equal(buzz.marketSize,'unknown');
  const hypothesis=assessOpportunity({...input,signals:[signal('pain','one'),signal('frequency','one'),signal('spend','one','snippet')]});
  assert.equal(hypothesis.evidenceStrength,'tentative');assert.equal(hypothesis.observed.spend,false);
  const stronger=assessOpportunity({...input,signals:[signal('pain','one'),signal('frequency','two'),signal('spend','three')]});
  assert.equal(stronger.evidenceStrength,'strong');assert.equal(stronger.marketSize,'unknown');
  assert.throws(()=>assessOpportunity({...input,signals:[{...signal('pain','one'),sourceUrl:'file:///private'}]}),/public HTTPS/);
});
test('M3-R4 first-user plan distinguishes research from permitted acquisition and locality',()=>{
  const habitats=[
    {name:'Accounting forum',sourceUrl:'https://example.com/forum',observed:'People discuss document chasing',participation:'check_rules' as const,role:'research' as const,fit:'high' as const},
    {name:'Local association',sourceUrl:'https://example.com/association',observed:'Member directory is public',participation:'allowed' as const,role:'acquisition' as const,fit:'high' as const},
    {name:'Private group',sourceUrl:'https://example.com/group',observed:'Access restricted',participation:'restricted' as const,role:'acquisition' as const,fit:'medium' as const},
  ];
  assert.equal(planFirstUsers({user:'Accountants',pain:'Chasing files',market:'local_smb',habitats}).action,'ask_region');
  const plan=planFirstUsers({user:'Accountants',pain:'Chasing files',market:'local_smb',region:'Toronto',habitats});
  assert.equal(plan.action,'discover');assert.equal(plan.research.length,1);assert.equal(plan.acquisition.length,1);
  assert.equal(plan.candidateTarget,5);assert.equal(plan.outreach,'draft_only_requires_explicit_approval');
});
test('M3-R4 outreach and validation asset cannot imply send or Act approval',()=>{
  const draft=prepareOutreach({audience:'accountants',observedContext:'your firm handles many client documents',ask:'Would a 15-minute workflow chat help',channel:'email',sourceUrl:'https://example.com/firm',routeReviewed:true});
  assert.equal(draft.status,'draft_only');assert.equal(draft.sendAllowed,false);assert.match(draft.body,/No pressure/);
  assert.equal(validationAsset(true,false,true).permission,'draft_only_until_act');
  assert.match(validationAsset(true,false,true).recommendation,/labeled as a concept/);
});
test('M3-R4 compact user and market learning stays tentative',()=>{
  const context=updateWorkingContext(undefined,{project:{market_pulse:{value:'Public complaints point to a possible wedge',status:'inferred',confidence:'medium',source:'https://example.com'},buyer_process:{value:'Owner may approve tools',status:'inferred',confidence:'low',source:null},first_user_learning:{value:'Two ignored messages; channel signal unclear',status:'known',confidence:'medium',source:'founder report'}}},'conversation_123');
  assert.equal(context.project.market_pulse?.status,'inferred');
  assert.throws(()=>updateWorkingContext(context,{project:{trust:{value:'Certain',status:'inferred',confidence:'high',source:null}}},'conversation_123'),/inference cannot be high-confidence/);
});
