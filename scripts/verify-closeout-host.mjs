import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createInterface } from 'node:readline';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareIde } from '../dist/tests/ide-fixtures.js';
import { emptyIde, confirmation } from '../dist/src/domain/ide.js';
import { savePrebuild, readPrebuild, transitionIde } from '../dist/src/application/prebuild.js';
import { inspectArtifacts } from '../dist/src/privacy/artifacts.js';

// Opt-in installed-host test. Founder turns and prepared state are synthetic.
// It uses normal host auth without reading credentials; no model override.
// MCP configuration is process-local, never written to the user's config.
const root=dirname(dirname(fileURLToPath(import.meta.url))),runDir=join(root,'.m0-local',`closeout-host-${Date.now()}`);
mkdirSync(runDir,{recursive:true});
const fixtureDir=mkdtempSync(join(tmpdir(),'crumb-closeout-'));
const skillPath=join(process.env.USERPROFILE??'', '.agents/skills/crumb/SKILL.md'),mcp=join(root,'dist/src/cli/mcp.js');
const results={timestamp:new Date().toISOString(),syntheticInputs:true,liveModel:true,skillPath,discovery:false,mcp:[],sessions:[],status:'running'};
const stock=()=>JSON.parse(readFileSync(join(root,'fixtures/m3r1-quality/stock.json'),'utf8'));
const cases=JSON.parse(readFileSync(join(root,'fixtures/m3r1-closeout/conversation-cases.json'),'utf8')).cases;
const turnTimeout=process.argv.includes('--live-web')?300000:180000;
if(process.argv.includes('--fixture-only')){const folder=createFixture('existing-fixture','existing');console.log(JSON.stringify({folder,entry:readPrebuild(folder).context.project.entry,artifacts:readPrebuild(folder).context.project.artifacts}));process.exit(0);}
const child=spawn('codex',['app-server','--stdio'],{cwd:root,windowsHide:true,stdio:['pipe','pipe','pipe']});
const lines=createInterface({input:child.stdout}),pending=new Map();
let seq=0,diagnostic='',active=null;
child.stderr.on('data',chunk=>{diagnostic=(diagnostic+chunk).slice(-10000);});
child.stdin.on('error',()=>{});
function cancel(reason){for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error(reason));}pending.clear();if(active){clearTimeout(active.timer);active.reject(new Error(reason));active=null;}}
child.on('error',()=>cancel('Installed host could not start.'));
child.on('exit',()=>cancel('Installed host exited.'));
lines.on('line',line=>{
  let msg;try{msg=JSON.parse(line);}catch{return;}
  if(msg.id!==undefined&&!msg.method&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);clearTimeout(p.timer);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);}
  if(active&&msg.method==='item/completed'){
    const item=msg.params?.item;
    if(item?.type==='agentMessage'){active.output.push(item.text??'');active.messages.push({phase:item.phase??null,text:item.text??''});}
    else if(item)active.tools.push({type:item.type,name:item.tool??item.name??null,command:item.command??null,status:item.status??null,...(item.status==='failed'?{failureOutput:(item.aggregatedOutput??'').slice(-4000)}:{}),...(item.type==='webSearch'?{action:item.action??null}:{})});
  }
  if(active&&msg.method==='turn/completed'){const a=active;active=null;clearTimeout(a.timer);a.resolve({status:msg.params.turn.status,error:msg.params.turn.error??null,output:a.output.join('\n\n'),messages:a.messages,tools:a.tools,elapsedMs:Date.now()-a.started});}
  if(msg.id!==undefined&&msg.method)child.stdin.write(JSON.stringify({id:msg.id,error:{code:-32601,message:'This test authorizes only normal sandbox tools against its disposable synthetic fixture; no elevated or external actions.'}})+'\n');
});
function request(method,params){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(new Error(`${method} timed out`));},30000);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({id,method,params})+'\n');});}
function save(){writeFileSync(join(runDir,'results.json'),JSON.stringify(results,null,2));}
function state(folder){const saved=readPrebuild(folder),c=saved.context;return {version:saved.version,user:c.definition.user.text,problem:c.definition.problem.text,confirmed:['intention','user','problem','evaluation','act'].filter(subject=>confirmation(c,subject)),presentation:c.ide.presentation?.subject??null};}
async function turn(threadId,text,first=false){
  const started=Date.now();
  const done=new Promise((resolve,reject)=>{active={resolve,reject,output:[],messages:[],tools:[],started,timer:setTimeout(()=>{const a=active;active=null;resolve({status:'timed_out',error:`Live turn exceeded ${turnTimeout/1000} seconds; stop and inspect partial output.`,output:a.output.join('\n\n'),messages:a.messages,tools:a.tools,elapsedMs:Date.now()-started});},turnTimeout)};});
  await request('turn/start',{threadId,input:[{type:'text',text},...(first?[{type:'skill',name:'crumb',path:skillPath}]:[])]});
  return done;
}
function createFixture(id,seed='evaluated'){
  const folder=join(fixtureDir,id);mkdirSync(folder);
  if(seed==='fresh'){const c=emptyIde();c.synthetic=true;c.project.entry='fresh';savePrebuild(folder,c);}
  else if(seed==='priced-app'){
    writeFileSync(join(folder,'README.md'),'# Reviewlane\nA small app for freelance video editors to compare client revision requests, deadlines and deliverables in one board. Editors use it on each active project; clients see a shared status page. A working beta exists. Pricing and payment willingness are unknown. No real customers or sales are represented in this synthetic fixture.\n');
    writeFileSync(join(folder,'package.json'),JSON.stringify({name:'reviewlane',version:'0.1.0',description:'Revision board for freelance video editors'}));
    const c=emptyIde();c.synthetic=true;c.project.entry='existing';savePrebuild(folder,c);
  }
  else {
    const c=stock();if(seed==='existing'){c.project.entry='existing';writeFileSync(join(folder,'parser.mjs'),'export const parse = JSON.parse;\n');c.project.permissionQuote='Synthetic fixture authorizes reading its parser.';c.project.artifacts=inspectArtifacts(folder,{paths:['parser.mjs'],permissionGranted:true,permissionQuote:c.project.permissionQuote}).map(({path,sha256})=>({path,sha256}));}
    prepareIde(folder,seed==='build'?'act':seed==='pending-user'?'intention':'evaluation',c);
    if(seed==='pending-user')transitionIde(folder,{operation:'present',subject:'user',expectedVersion:readPrebuild(folder).version});
  }
  return folder;
}
async function start(id,seed='evaluated',existingFolder){
  const folder=existingFolder??createFixture(id,seed);
  const liveWeb=process.argv.includes('--live-web');
  const config={'mcp_servers.crumb_context':{command:process.execPath,args:[mcp,folder],required:true,startup_timeout_sec:15,tool_timeout_sec:15,default_tools_approval_mode:'approve'},web_search:liveWeb?'live':'disabled'};
  const t=await request('thread/start',{cwd:folder,ephemeral:true,sandbox:'workspace-write',approvalPolicy:'never',config,
    developerInstructions:`This is an opt-in synthetic acceptance test of the installed Crumb skill. Use the real Crumb behavior, not a critique of it. All founder statements are synthetic and all writes are limited to ${folder}. The Crumb source is the explicitly supplied skill path; pinned Node is ${process.execPath}. Use the configured read-only crumb_context MCP tools for compact saved state; use Crumb's existing internal CLI for necessary state writes. Never inspect the real installation's private customer state, credentials, or unrelated files. No external communication, deployment, paid service, code implementation, or subagents. ${liveWeb?'Public web research is authorized through available host tools; respect access restrictions and distinguish current findings from saved synthetic fixture assertions.':'Web research is disabled for this isolated replay; reuse stored research and state that test limitation.'} Do not invent a search, source, candidate, permission, interview or test. Supplied scenario backgrounds in brackets describe synthetic test conditions, not actual new research receipts.`});
  return {folder,threadId:t.thread.id};
}
try{
  await request('initialize',{clientInfo:{name:'crumb_closeout_test',version:'1'},capabilities:{experimentalApi:true}});child.stdin.write(JSON.stringify({method:'initialized',params:{}})+'\n');
  const catalog=await request('skills/list',{cwds:[root],forceReload:true});
  results.skillInventory=catalog.data?.flatMap(x=>x.skills??[]).filter(s=>['crumb','pruvity','pruvello','customer-evidence'].includes(s.name)).map(s=>({name:s.name,path:s.path,enabled:s.enabled,scope:s.scope}))??[];
  results.discovery=results.skillInventory.length===1&&results.skillInventory[0].name==='crumb'&&results.skillInventory[0].enabled&&results.skillInventory[0].path.toLowerCase()===skillPath.toLowerCase();
  if(!results.discovery)throw new Error('Expected one installed global Crumb skill and no active project-local or legacy aliases.');
  if(!process.argv.includes('--skip-mcp')){
  const probe=await start('mcp-probe','build');
  const inventory=await request('mcpServerStatus/list',{threadId:probe.threadId,serverName:'crumb_context',detail:'toolsAndAuthOnly'});
  results.mcpInventory=inventory;
  for(const tool of ['get_current_context','get_confirmed_intention','get_confirmed_user','get_confirmed_problem','get_current_evaluation','get_user_habitats','get_first_user_avenues','get_build_handoff','get_current_build_stage','search_research']){
    const scope={mode:'continue',conversationId:probe.threadId.replace(/[^A-Za-z0-9_-]/g,'_').slice(0,120)};
    const result=await request('mcpServer/tool/call',{threadId:probe.threadId,server:'crumb_context',tool,arguments:tool==='search_research'?{scope,query:'TradingView',limit:2}:{scope}});
    results.mcp.push({tool,isError:result.isError??false,bytes:JSON.stringify(result).length});
    if(result.isError)throw new Error(`Installed MCP call failed: ${tool}`);
  }
  save();console.log('Installed Codex MCP: all ten read tools called.');
  }
  const sessions=[
    {id:'m3r5-autonomy',seed:'fresh',messages:["$crumb I want to build a voice-assisted note-taking product for project managers.","I want this to become a large business. On construction jobs I have seen project managers leave site conversations with voice memos, then lose a decision or who owns the follow-up. I have not interviewed anyone or checked alternatives yet."]},
    {id:'m3r5-predictive',seed:'priced-app',messages:["$crumb The Reviewlane beta is built. I can spare a few evenings. Help me turn it into a small real business.","I know two freelance editors who could look at it, but I have not asked them yet."]},
    {id:'m3r5-no-build',seed:'evaluated',messages:["$crumb Pick up the saved stock-comparison work and recommend the next useful move. I do not want to build yet."]},
    {id:'m3r4-market',seed:'fresh',messages:["$crumb We may build a client-document chase helper for independent accountants. They currently use email and spreadsheets. Is the pain worth testing? Check a small public market pulse if you can.","Where is the strongest narrow wedge? Separate what you saw from your guess. Don't give me a made-up TAM."]},
    {id:'m3r4-pricing',seed:'priced-app',messages:["$crumb This review board already works. What should we charge freelance editors? Inspect the small project context and check current public alternatives if you can.","Would per-project beat a monthly subscription? Give your view and the cheapest price test."]},
    {id:'m3r4-first-users',seed:'fresh',messages:["$crumb We need first users for a scheduling tool for independent Toronto physiotherapy clinics. Where would you look first? Don't contact anyone.","Draft a short one-ask note for a clinic owner, and tell me what you actually verified."]},
    {id:'m3r4-hidden-opportunity',seed:'fresh',messages:["$crumb We planned an AI dashboard for small creative agencies. Our synthetic notes say three agency operators paid assistants to chase client approvals and barely looked at dashboards. What's the stronger problem? Treat these as supplied notes, not verified market research.","What's the smallest way to test that without pretending we built it?"]},
    {id:'m3r4-feature-pushback',seed:'fresh',messages:["$crumb Add more AI features to our review board before we talk to users: summaries, calendar, insights and chat.","But the feature list sounds impressive. Why not build it anyway?"]},
    {id:'m3r4-founder-win',seed:'fresh',messages:["$crumb We got a real first paying pilot for our review board today. They paid to make revision approvals less chaotic!","We also sent five invites; two were ignored. What should we learn next?"]},
    {id:'m3r4-continuity',seed:'fresh',messages:["$crumb We help independent accountants chase missing client documents. Help me find a sensible first wedge.","They mostly use email today.","Some do this every week.","Would bookkeepers be a better starting user?","I know two small practices personally.","I don't know whether they pay for this pain.","Could we test it without software?","I prefer a local pilot.","Toronto is where I can meet them.","I want the invitation to sound human.","Good. Keep the plan small and tell me our next move."]},
    {id:'m3r3-pricing',seed:'priced-app',messages:["$crumb The app's basically built. Let's figure out pricing.","Would a per-project price fit better than a monthly editor plan? Use what we already know."]},
    {id:'m3r3-feature-obsession',seed:'fresh',messages:["$crumb We're building a review board for freelance editors, but we haven't spoken to users yet. What should we do next?","I keep thinking we need more features. Add an AI brief generator and a calendar before we talk to anyone."]},
    {id:'m3r3-research-surprise',seed:'fresh',messages:["$crumb Our synthetic research notes: people barely mention the dashboard we imagined, but several independently describe losing track of revision approvals and paying assistants to chase them. What do you notice? Don't claim these notes are verified customers."]},
    {id:'m3r3-real-win',seed:'fresh',messages:["$crumb We got our first paying customer for the review board today! They paid for help tracking revision approvals."]},
    {id:'m3r3-simple',seed:'fresh',messages:["$crumb Quick clarification: what's the difference between a customer and a user for our app? Keep it short.","Got it. If the editor uses the app and the agency pays, which is which? One sentence."]},
    {id:'fresh-b2b',seed:'fresh',messages:["$crumb I want a small paid business helping independent restaurant managers compare supplier quotes. I have evenings to work on it.","I'm not sure whether the owner or the person placing orders is the right user.","I don't know which API we'd need. You figure that out. Keep it direct, no jokes."]},
    {id:'existing-project',seed:'existing',messages:["$crumb I already have the shortlist parser in this project. Where were we?","Looks good, don't build yet. I only want to discuss what remains uncertain."]},
    {id:'customer-feedback',messages:["$crumb These are synthetic notes for this test: three scheduled-review traders liked comparing their own shortlist, but ignored discovery and wanted clearer source dates. What changes?","Exactly. The comparison is still the job, but they need to know how stale each fact is."]},
    {id:'casual-confirmation',seed:'pending-user',messages:["$crumb Show me the user statement we were confirming, then lead me through the next decision.","yup","sounds right","Yes, but only people who review after work, not full-time traders.","Maybe. I'm not ready to commit build time."]},
    {id:'research-heavy-stock',messages:["$crumb The evaluation sounds right. Lead me through the useful next step.","What would you ask them about their last comparison?","Can this actually tell me what institutions are buying today? I don't know the technical side.","Give me a formal research summary with sources, including the weak parts."]},
    {id:'live-research',messages:["$crumb Before I commit build time, check the weakest part of the saved stock-comparison evaluation against current public sources. Keep this bounded to three searches and three opened pages: actual institutional-data freshness, one competitor's capabilities or limitation, and where this confirmed user discusses their workflow. Lead me to the next useful step. No contacts, outreach or code, and do not treat our synthetic notes as actual user evidence."]},
    {id:'build-handoff',messages:["$crumb We have reviewed the evaluation. Show me the final commitment before deciding whether to build.","Yes — let's build.","We are using normal ChatGPT Chat with these same Project files available to Work. Tell me the next step.","Continue the Crumb build. Prepare the six-document review pack in this disposable project; do not implement product code."]},
  ];
  // All supplied cases are exercised through actual model turns, not asserted
  // by repeating a renderer string. Backgrounds stay explicitly synthetic.
  sessions.push({id:'supplied-cases',messages:cases.map(c=>`[Independent synthetic conversation case ${c.id}. Current hypothetical background: ${c.given} This case does not replace saved approval or create research receipts.]\n${c.user_message}`)});
  const selected=process.argv.find(arg=>arg.startsWith('--sessions='))?.slice('--sessions='.length).split(',');
  for(const spec of sessions.filter(spec=>!selected||selected.includes(spec.id))){
    const s=await start(spec.id,spec.seed),record={id:spec.id,fixture:s.folder,turns:[]};results.sessions.push(record);
    for(let i=0;i<spec.messages.length;i++){
      const response=await turn(s.threadId,spec.messages[i],i===0);
      record.turns.push({input:spec.messages[i],...response,state:state(s.folder),questionMarks:(response.output.match(/\?/g)??[]).length,webActions:response.tools.filter(t=>t.type==='webSearch').length});save();
      console.log(`${spec.id} ${i+1}/${spec.messages.length}: ${response.status}`);
      if(response.status!=='completed')throw new Error(`Live host failed in ${spec.id}; review the retained response.`);
    }
    if(spec.id==='existing-project'){
      const resumed=await start('existing-project-resume','evaluated',s.folder);
      const input='$crumb I am back in a new session. Continue from the saved compact context; do not rebuild the history. What is the next useful decision? I have not approved building.';
      const response=await turn(resumed.threadId,input,true);results.sessions.push({id:'existing-project-resume',fixture:s.folder,turns:[{input,...response}]});save();
      console.log(`existing-project-resume: ${response.status}`);if(response.status!=='completed')throw new Error('Live resume failed; review retained response.');
    }
  }
  const identityLeak=/\b(?:Crumb(?:'s|’s)? (?:skill|workflow|instructions|context)|skill instructions|skill file|installed skill|global skill|I(?:'m| am|’m) (?:checking|reading|loading) (?:the )?skill)\b/i;
  results.identityLeaks=results.sessions.flatMap(s=>s.turns.flatMap((t,i)=>identityLeak.test(t.output)?[{session:s.id,turn:i+1}]:[]));
  results.timings=results.sessions.map(s=>({session:s.id,elapsedMs:s.turns.map(t=>t.elapsedMs)}));
  results.status=results.identityLeaks.length?'failed_identity_leak':'completed_needs_semantic_review';
  if(results.identityLeaks.length)process.exitCode=1;
}catch(error){results.status='blocked';results.error=error.message;results.homeDirectoryUnavailable=/Could not find home directory/i.test(diagnostic);process.exitCode=1;}
finally{save();console.log(JSON.stringify({status:results.status,path:join(runDir,'results.json'),error:results.error}));child.stdin.end();child.kill();lines.close();cancel('Test ended.');}
