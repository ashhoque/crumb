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
const skillPath=join(root,'.agents/skills/crumb/SKILL.md'),mcp=join(root,'dist/src/cli/mcp.js');
const results={timestamp:new Date().toISOString(),syntheticInputs:true,liveModel:true,discovery:false,mcp:[],sessions:[],status:'running'};
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
    if(item?.type==='agentMessage')active.output.push(item.text??'');
    else if(item)active.tools.push({type:item.type,name:item.tool??item.name??null,command:item.command??null,status:item.status??null,...(item.status==='failed'?{failureOutput:(item.aggregatedOutput??'').slice(-4000)}:{}),...(item.type==='webSearch'?{action:item.action??null}:{})});
  }
  if(active&&msg.method==='turn/completed'){const a=active;active=null;clearTimeout(a.timer);a.resolve({status:msg.params.turn.status,error:msg.params.turn.error??null,output:a.output.join('\n\n'),tools:a.tools});}
  if(msg.id!==undefined&&msg.method)child.stdin.write(JSON.stringify({id:msg.id,error:{code:-32601,message:'This test authorizes only normal sandbox tools against its disposable synthetic fixture; no elevated or external actions.'}})+'\n');
});
function request(method,params){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(new Error(`${method} timed out`));},30000);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({id,method,params})+'\n');});}
function save(){writeFileSync(join(runDir,'results.json'),JSON.stringify(results,null,2));}
function state(folder){const saved=readPrebuild(folder),c=saved.context;return {version:saved.version,user:c.definition.user.text,problem:c.definition.problem.text,confirmed:['intention','user','problem','evaluation','act'].filter(subject=>confirmation(c,subject)),presentation:c.ide.presentation?.subject??null};}
async function turn(threadId,text,first=false){
  const done=new Promise((resolve,reject)=>{active={resolve,reject,output:[],tools:[],timer:setTimeout(()=>{const a=active;active=null;resolve({status:'timed_out',error:`Live turn exceeded ${turnTimeout/1000} seconds; stop and inspect partial output.`,output:a.output.join('\n\n'),tools:a.tools});},turnTimeout)};});
  await request('turn/start',{threadId,input:[{type:'text',text},...(first?[{type:'skill',name:'crumb',path:skillPath}]:[])]});
  return done;
}
function createFixture(id,seed='evaluated'){
  const folder=join(fixtureDir,id);mkdirSync(folder);
  if(seed==='fresh'){const c=emptyIde();c.synthetic=true;c.project.entry='fresh';savePrebuild(folder,c);}
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
    developerInstructions:`This is an opt-in synthetic acceptance test of the installed Crumb skill. Use the real Crumb behavior, not a critique of it. All founder statements are synthetic and all writes are limited to ${folder}. The Crumb installation is ${root}; pinned Node is ${process.execPath}. Use the configured read-only crumb_context MCP tools for compact saved state; use Crumb's existing internal CLI for necessary state writes. Never inspect the real installation's private customer state, credentials, or unrelated files. No external communication, deployment, paid service, code implementation, or subagents. ${liveWeb?'Public web research is authorized through available host tools; respect access restrictions and distinguish current findings from saved synthetic fixture assertions.':'Web research is disabled for this isolated replay; reuse stored research and state that test limitation.'} Do not invent a search, source, candidate, permission, interview or test. Supplied scenario backgrounds in brackets describe synthetic test conditions, not actual new research receipts.`});
  return {folder,threadId:t.thread.id};
}
try{
  await request('initialize',{clientInfo:{name:'crumb_closeout_test',version:'1'},capabilities:{experimentalApi:true}});child.stdin.write(JSON.stringify({method:'initialized',params:{}})+'\n');
  const catalog=await request('skills/list',{cwds:[root],forceReload:true});results.discovery=!!catalog.data?.flatMap(x=>x.skills??[]).find(s=>s.name==='crumb'&&s.enabled&&s.path.toLowerCase()===skillPath.toLowerCase());
  if(!results.discovery)throw new Error('Installed Crumb skill not discovered.');
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
      const response=await turn(s.threadId,spec.messages[i],i===0);record.turns.push({input:spec.messages[i],...response,state:state(s.folder)});save();
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
  results.status='completed_needs_semantic_review';
}catch(error){results.status='blocked';results.error=error.message;results.homeDirectoryUnavailable=/Could not find home directory/i.test(diagnostic);process.exitCode=1;}
finally{save();console.log(JSON.stringify({status:results.status,path:join(runDir,'results.json'),error:results.error}));child.stdin.end();child.kill();lines.close();cancel('Test ended.');}
