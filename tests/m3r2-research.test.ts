import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { temporaryProject } from './helpers.js';
import { classifyExternalEvidence, planDecisionResearch } from '../src/domain/research-decision.js';

test('M3-R2 ordinary conversation has a deterministic zero-research path',t=>{
  const root=temporaryProject(t);
  const plan=planDecisionResearch({decision:'Clarify which workflow hurts',materialExternalGap:false,evidence:'none',kind:'other'});
  assert.equal(plan.action,'answer');assert.equal(plan.maxQueries,0);assert.equal(plan.maxPages,0);
  const cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url));
  const result=spawnSync(process.execPath,[cli,'internal','research-decision',root],{input:JSON.stringify({decision:'Clarify which workflow hurts',materialExternalGap:false,evidence:'none',kind:'other'}),encoding:'utf8',windowsHide:true,timeout:15000});
  assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).action,'answer');
  assert.deepEqual(readdirSync(root),[]);
});

test('M3-R2 material evidence is researched once, bounded and reused while current',()=>{
  const decision={decision:'Choose an initial price',materialExternalGap:true,evidence:'none' as const,kind:'money' as const};
  const planned=planDecisionResearch(decision);
  assert.equal(planned.action,'research');assert.equal(planned.maxQueries,3);assert.equal(planned.maxPages,6);
  assert.equal(planDecisionResearch({...decision,evidence:'current'}).action,'reuse');
  assert.equal(planDecisionResearch({...decision,evidence:'stale'}).action,'research');
  assert.equal(planDecisionResearch({...decision,kind:'competition'}).action,'research');
  assert.equal(planDecisionResearch({...decision,kind:'technical'}).action,'research');
  assert.equal(planDecisionResearch({...decision,kind:'first_users'}).action,'research');
});

test('M3-R2 locality and provenance prevent unsupported precision',()=>{
  const decision={decision:'Compare a local service price',materialExternalGap:true,evidence:'none' as const,kind:'money' as const,localityMatters:true};
  assert.equal(planDecisionResearch(decision).action,'ask_locality');
  assert.match(planDecisionResearch(decision).question!,/city or region/);
  assert.equal(planDecisionResearch({...decision,cityRegion:'Ontario'}).action,'research');
  assert.equal(classifyExternalEvidence({estimated:true}),'estimate');
  assert.equal(classifyExternalEvidence({sourceUrl:'https://example.org',retrievedOn:'2026-10-04',entity:'Example',localityMatters:true,inspected:true}),'unverified');
  assert.equal(classifyExternalEvidence({sourceUrl:'https://example.org',retrievedOn:'2026-10-04',entity:'Example',location:'Toronto',localityMatters:true,inspected:true}),'publicly_listed');
  assert.equal(classifyExternalEvidence({sourceUrl:'https://example.org',retrievedOn:'2026-10-04',entity:'Example',location:'Toronto',localityMatters:true,inspected:true,directlyVerified:true}),'publicly_listed');
  assert.equal(classifyExternalEvidence({sourceUrl:'https://example.org',retrievedOn:'2026-10-04',entity:'Example',location:'Toronto',localityMatters:true,inspected:true,directlyVerified:true,currentAsOf:'2026-10-04'}),'verified_current');
  assert.equal(planDecisionResearch({...decision,evidence:'stale',cityRegion:'Toronto',claimEvidence:{sourceUrl:'https://example.org',retrievedOn:'2026-10-04',entity:'Example',location:'Toronto',localityMatters:true,inspected:true,directlyVerified:true,currentAsOf:'2026-10-04'}}).claimStatus,'publicly_listed');
});
