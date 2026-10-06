import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmdirSync, unlinkSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {projectFactKeys,founderFactKeys} from '../dist/src/domain/founder-intelligence.js';
import {syncCodexIdentity} from './codex-config.mjs';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'skill','crumb');
const target=join(process.env.USERPROFILE??'', '.agents','skills','crumb');
const args=process.argv.slice(2),install=args.includes('--install'),skillOnly=args.includes('--skill-only');
if(!process.env.USERPROFILE||args.some(arg=>!['--install','--skill-only'].includes(arg))||new Set(args).size!==args.length)throw new Error('Use --install to update global Crumb, no option to verify, or --skill-only for isolated offline fixtures.');
const files=['SKILL.md','host/codex.md',...['research','local-tools','act','modes','learn'].map(name=>`references/${name}.md`)];
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
if(existsSync(target)&&lstatSync(target).isSymbolicLink())throw new Error('Global skill target must be a real directory.');
// Remove only known formerly installed historical files, never arbitrary user files.
for(const name of ['conversations.md','interviews-master.md']){
  const path=join(target,'references',name);
  if(existsSync(path)){
    if(!install||lstatSync(path).isSymbolicLink())throw new Error(`Historical reference remains installed: ${name}`);
    const archived=join(root,'docs','legacy-skills','crumb',name);
    if(!existsSync(archived)||hash(path)!==hash(archived))throw new Error(`Preserve modified historical reference before installing: ${name}`);
    unlinkSync(path);
  }
}
const oldAgents=join(target,'agents'),oldPolicy=join(oldAgents,'openai.yaml');
if(existsSync(oldAgents)){
  if(!install||lstatSync(oldAgents).isSymbolicLink()||readdirSync(oldAgents).join(',')!=='openai.yaml'||readFileSync(oldPolicy,'utf8').replaceAll('\r','').trim()!=='policy:\n  allow_implicit_invocation: false')throw new Error('Global skill has unexpected legacy metadata; inspect it before installing.');
  unlinkSync(oldPolicy);rmdirSync(oldAgents);
}
for(const file of files){
  const from=join(source,file),to=join(target,file);
  if(!lstatSync(from).isFile()||(existsSync(to)&&lstatSync(to).isSymbolicLink()))throw new Error(`Refusing linked skill file: ${file}`);
  if(install){mkdirSync(dirname(to),{recursive:true});copyFileSync(from,to);}
  if(!existsSync(to)||hash(from)!==hash(to))throw new Error(`Global skill differs from version-controlled source: ${file}`);
}
const runtime={node:process.execPath,cli:join(root,'dist/src/cli/main.js'),input:'Write one UTF-8 JSON request to a temporary file, then use internal <operation> <target> --input-file <request-path>. No shell pipe or command discovery.',operations:{
  'research-decision':{decision:'one decision',materialExternalGap:true,evidence:'none',kind:'competition',localityMatters:false},
  'market-pulse':{user:'specific provisional user',problem:'observed pain',decision:'one decision',materialGap:true,externalEvidence:'none',localMarket:false},
  'founder-move':{kind:'evidence_decision',hasCurrentSnapshot:true,materialExternalGap:false,existingEvidence:'current',productStage:'built',customerEvidence:'none',evidenceHorizon:'short',fasterEvidence:false,founderEffort:'low'},
  'first-user-plan':{user:'specific provisional user',pain:'strongest pain',market:'distributed',habitats:[]},
  'outreach-draft':{audience:'specific role',observedContext:'observed public workflow',ask:'Could we discuss your last example',channel:'interview',sourceUrl:'https://example.com/replace-with-inspected-route',routeReviewed:false},
  'validation-asset':{painKnown:true,productBuilt:false,fastLearning:true},
  'project-bootstrap':{decision:'pricing',previous:[]},
  'template':{input:null,output:'Actual full prebuild contract. For formal evaluation copy this returned object; do not reconstruct enums or required nested fields from memory.'},
  'prebuild':{input:'Returned template/current context with expectedVersion from the target; add actual retained sources, claims and research. stage is intention/define/evaluate, never prototype. project.entry is unknown/fresh/existing, never idea. Every observed/inferred finding needs supporting retained claimIds; unsupported facts stay basis:unknown, text:null, claimIds:[]. feedbackClaimIds is only founder_reported claims, never public observations or simulated interviews. Notes do not become evidence or consent.'},
  'working-context':{start:true,expectedVersion:0,conversationId:'replace_with_current_chat_id',delta:{project:{next_move:{value:'replace with concise next move',status:'inferred',confidence:'medium',source:'current conversation'}}},projectFields:projectFactKeys,founderFields:founderFactKeys,limits:'Create the chosen unused child target directory before start:true. Each fact value <=320 characters; source is required (null or string <=240). Split price, risk and next_move into separate short facts. Inferred facts cannot have high confidence. Later updates omit start and use returned version.'},
  'revise-foundation':{command:'ide',input:{operation:'revise-foundation',expectedVersion:'current version',subject:'user',text:'corrected provisional user',quote:'actual founder correction',turnId:'actual source turn'},output:'Invalidates affected review; no confirmation. Use for a founder correction instead of rebuilding the dossier.'},
  'present-thesis':{command:'ide',input:{operation:'present-thesis',expectedVersion:'current version'},output:'context.presentation: keep id, basis and exact text in chat; display text unchanged'},
  'confirm-thesis':{command:'ide',input:{operation:'confirm-thesis',expectedVersion:'returned version',presentationId:'returned id',displayedText:'exact text actually displayed',quote:'verbatim founder reply',turnId:'actual source turn'},output:'Check context.confirmations before acknowledging saved review. Never Act approval'},
  'conversation-context':{resume:'--resume only for explicit continuation',input:null}
},contractNotes:{
  'project-binding':'Runtime checkout, founder app and conversation notes are distinct roots. project-bootstrap and working-context reject the runtime checkout and its children. Use supplied app context; missing app access does not block public work.',
  'bounded-learning':'quality.learning optionally accepts decision go/one_gap/pivot_stop and experiment {promise, capabilities [1–3], cuts, limitations, success, failure, testDate YYYY-MM-DD}. go + build_decision required for an experiment. Retain actual uncertainty. Exact displayed experiment binds Act; negative decisions cannot build.',
  'present-thesis':'For initial review, use compact notes: founder.objective and project.customer/problem with source, known/inferred status, medium/high confidence. Only missing provisional drafts are populated; notes remain assumptions, never independent evidence or consent. Existing definitions and skipped/undecided intention are preserved. Full Evaluation remains separate.',
  'research-decision':'kind: money/competition/technical/first_users/other; evidence: none/current/stale/estimate; optional cityRegion <=120 chars when locality matters.',
  'founder-move':'productStage: idea/prototype/built/live/unknown; customerEvidence: none/weak/current; evidenceHorizon: immediate/short/long; founderEffort: low/high; fasterEvidence boolean. Optional fields preserve older inputs.',
  'first-user-plan':'Optional region <=120 chars, required for local_smb. At most 8 habitats: {name <=160, sourceUrl public HTTPS, observed <=500, participation allowed/check_rules/restricted, role research/acquisition/both, fit high/medium/low}. Never invent observations.',
  'outreach-draft':'channel: email/dm/call/voicemail/interview/beta; audience <=160, observedContext <=300, ask <=220. sourceUrl is inspected public route, routeReviewed boolean. Always draft-only.',
}};
if(!existsSync(runtime.cli))throw new Error('Build Crumb Core before installing its skill.');
const runtimePath=join(target,'runtime.json'),runtimeText=JSON.stringify(runtime,null,2)+'\n';
if(existsSync(runtimePath)&&lstatSync(runtimePath).isSymbolicLink())throw new Error('Runtime locator must be a real file.');
if(install)writeFileSync(runtimePath,runtimeText);
if(!existsSync(runtimePath)||readFileSync(runtimePath,'utf8')!==runtimeText)throw new Error('Installed runtime locator differs from this checkout; reinstall.');
const hostIdentity=skillOnly?null:await syncCodexIdentity(process.env.USERPROFILE,readFileSync(join(target,'host/codex.md'),'utf8'),install);
console.log(JSON.stringify({status:'in_sync',source,target,files:files.length,runtime,hostIdentity,hostIdentitySha256:hash(join(source,'host/codex.md')),skillSha256:hash(join(source,'SKILL.md'))}));
