import test from 'node:test';
import assert from 'node:assert/strict';
import { planMarketPulse, assessOpportunity, type MarketSignal } from '../src/domain/market-intelligence.js';
import { planFirstUsers, prepareOutreach, validationAsset, learnFirstUsers } from '../src/domain/first-user-engine.js';
import { updateWorkingContext } from '../src/domain/founder-intelligence.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

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
test('M3-R4 learning treats silence as ambiguous and conversations as limited',()=>{
  const ignored=learnFirstUsers([{kind:'ignored',audience:'Accountants',channel:'email',observation:'No reply reported after one invite'}]);
  assert.equal(ignored.validation,'not_established');assert.match(ignored.next,/Silence is ambiguous/);
  const talked=learnFirstUsers([{kind:'conversation',audience:'Small practices',channel:'association',observation:'Discussed document chasing'}]);
  assert.deepEqual(talked.segmentSignal,['Small practices']);assert.equal(talked.validation,'not_established');
});
test('M3-R4 compact user and market learning stays tentative',()=>{
  const context=updateWorkingContext(undefined,{project:{market_pulse:{value:'Public complaints point to a possible wedge',status:'inferred',confidence:'medium',source:'https://example.com'},buyer_process:{value:'Owner may approve tools',status:'inferred',confidence:'low',source:null},first_user_learning:{value:'Two ignored messages; channel signal unclear',status:'known',confidence:'medium',source:'founder report'}}},'conversation_123');
  assert.equal(context.project.market_pulse?.status,'inferred');
  assert.throws(()=>updateWorkingContext(context,{project:{trust:{value:'Certain',status:'inferred',confidence:'high',source:null}}},'conversation_123'),/inference cannot be high-confidence/);
});
test('M3-R4 live skill guidance retains personality, early research, continuity and send gate',()=>{
  const skill=readFileSync(new URL('../../skill/crumb/SKILL.md',import.meta.url),'utf8');
  const research=readFileSync(new URL('../../skill/crumb/references/research.md',import.meta.url),'utf8');
  assert.match(skill,/Hype the founder's real progress/);assert.match(skill,/single `\$crumb` invocation carries/);
  assert.match(skill,/No unapproved sends\/posts/);assert.match(skill,/early Market Pulse/i);
  assert.match(skill,/Choosing the team is not consent to contact prospects/);
  assert.match(research,/Engagement|engagement/);assert.match(research,/research habitats and one or two acquisition routes/);
});
test('M3-R4 installed CLI planners run without a saved project or network',()=>{
  const cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url));
  const result=spawnSync(process.execPath,[cli,'internal','market-pulse'],{input:JSON.stringify(base),encoding:'utf8',windowsHide:true,timeout:15000});
  assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).action,'research');
  const outreach=spawnSync(process.execPath,[cli,'internal','outreach-draft'],{input:JSON.stringify({audience:'accountants',observedContext:'your firm handles client files',ask:'Open to a short chat',channel:'email',sourceUrl:'https://example.com',routeReviewed:true}),encoding:'utf8',windowsHide:true,timeout:15000});
  assert.equal(outreach.status,0,outreach.stderr);assert.equal(JSON.parse(outreach.stdout).sendAllowed,false);
});
