import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { temporaryProject } from './helpers.js';
import { ideFixture, prepareIde } from './ide-fixtures.js';
import { readContext, contextReads } from '../src/application/read-context.js';
import { readPrebuild, savePrebuild } from '../src/application/prebuild.js';
import { renderPrebuildSummary } from '../src/cli/prebuild-render.js';
import { agreesWithPresentation } from '../src/domain/reply.js';
import { discoveryCards, discoveryScope, firstUserDiscoveryNotice, validateFirstUserCards } from '../src/domain/first-user-discovery.js';
import type { IdeContext } from '../src/domain/ide.js';
import { inspectArtifacts } from '../src/privacy/artifacts.js';
const continuation={scope:{mode:'continue',conversationId:'synthetic-chat-001'}};

test('Closeout: artifact observations serialize as references, never raw text',t=>{
  const root=temporaryProject(t),c=ideFixture();writeFileSync(join(root,'parser.mjs'),'export const parse = JSON.parse;\n');
  c.project.entry='existing';c.project.permissionQuote='Read the synthetic parser only.';
  const observations=inspectArtifacts(root,{paths:['parser.mjs'],permissionGranted:true,permissionQuote:c.project.permissionQuote});
  assert.match(observations[0]!.text,/JSON.parse/);
  c.project.artifacts=observations;
  assert.throws(()=>savePrebuild(root,c),/artifacts\/0 must NOT have additional properties/);
  c.project.artifacts=observations.map(({path,sha256})=>({path,sha256}));
  const saved=savePrebuild(root,JSON.parse(JSON.stringify(c)));
  assert.deepEqual(saved.context.project.artifacts,c.project.artifacts);
  assert.equal('text' in readPrebuild(root)!.context.project.artifacts[0]!,false);
});

test('Closeout: installed-host existing fixture uses the authoritative artifact contract',()=>{
  const result=spawnSync(process.execPath,[fileURLToPath(new URL('../../scripts/verify-closeout-host.mjs',import.meta.url)),'--fixture-only'],{encoding:'utf8',windowsHide:true,timeout:30000});
  assert.equal(result.status,0,result.stderr);const saved=JSON.parse(result.stdout);
  assert.equal(saved.entry,'existing');assert.deepEqual(Object.keys(saved.artifacts[0]).sort(),['path','sha256']);
});

test('Closeout: conversational prose is independent of length and formal research still has structure', t=>{
  const root=temporaryProject(t),c=ideFixture();
  c.brief={kind:'conversation',summary:'That constraint gives us a clearer starting point. You want to help the person doing the weekly comparison, and keep their existing tools useful. The missing piece is what happens during that comparison when they have to decide which fact matters. I will investigate available mechanisms once we understand that moment.',seeing:['We can keep the user narrow.'],matters:[],next:'What happened on the last occasion?',questions:[],choices:[]};
  const s=savePrebuild(root,c),text=renderPrebuildSummary(s);
  assert.doesNotMatch(text,/Executive summary|What I.m seeing|^Next|extra detail/im);
  assert.equal((text.match(/\?/g)??[]).length,1);
  c.expectedVersion=s.version;c.brief.kind='research';
  assert.match(renderPrebuildSummary(savePrebuild(root,c)),/^Executive summary/);
});

test('Closeout: natural assent never swallows a correction, pause or uncertainty',()=>{
  for(const reply of ['yup','yeah','sounds right','exactly','go with that'])assert.equal(agreesWithPresentation(reply),true,reply);
  for(const reply of ['Yes, but just single-location independents.','Looks good, do not build yet.','maybe','I don’t know, you figure that out','Yes, change the user.'])assert.equal(agreesWithPresentation(reply),false,reply);
});

test('Closeout: candidates require current scope/permission, and opt-outs survive refresh',t=>{
  const root=temporaryProject(t),c=ideFixture();
  c.firstUserCards=[{id:'synthetic-card',kind:'person',displayName:'synthetic-practitioner',subjectKey:'synthetic-community/practitioner',relationship:'intended_user',observed:'Synthetic fixture: described the comparison workflow.',fitInference:'May be relevant to the confirmed task.',uncertainty:'No interview or contact agreement.',sourceIds:['user-discussion'],route:'Synthetic in-platform discussion',routeStatus:'check_rules',firsthand:true,scopeKey:discoveryScope(c),usePermission:'permitted'}];
  assert.equal(discoveryCards(c).length,1);
  const restricted=structuredClone(c);restricted.firstUserCards![0]!.usePermission='unknown';assert.equal(discoveryCards(restricted).length,0);
  const revised=structuredClone(c);revised.definition.user.text='A different intended user';assert.equal(discoveryCards(revised).length,0);
  c.discovery!.suppressedSubjectKeys=['synthetic-community/practitioner'];assert.equal(discoveryCards(c).length,0);
  const saved=savePrebuild(root,c),refresh=structuredClone(saved.context) as IdeContext;refresh.expectedVersion=saved.version;refresh.discovery!.suppressedSubjectKeys=[];
  assert.throws(()=>savePrebuild(root,refresh),/opt-outs/);
  const snippet=structuredClone(c);snippet.sources.find(s=>s.id==='user-discussion')!.access='snippet';snippet.firstUserCards![0]!.routeStatus='reviewed';
  assert.throws(()=>validateFirstUserCards(snippet),/inspected source/);
  snippet.discovery!.suppressedSubjectKeys=[];snippet.firstUserCards![0]!.routeStatus='check_rules';
  assert.match(firstUserDiscoveryNotice(snippet),/snippet:/);
});

test('Closeout: all MCP reads are bounded, read-only and cannot initialize or forge approval',t=>{
  const empty=temporaryProject(t);assert.deepEqual(readContext(empty,'get_current_context',continuation),{available:false,reason:'No saved Crumb context. No project was initialized.'});assert.deepEqual(readdirSync(empty),[]);
  const root=temporaryProject(t),saved=prepareIde(root),before=JSON.stringify(readPrebuild(root));
  const tracked=['.gitignore','CRUMB_CONTEXT.json','COPILOT_SESSION.json','BUILD_HANDOFF.json'];
  const bytes=tracked.map(path=>readFileSync(join(root,path)));
  for(const name of contextReads){const result=readContext(root,name,name==='search_research'?{...continuation,query:'synthetic',limit:2}:continuation);assert.ok(Buffer.byteLength(JSON.stringify(result))<=24576,name);}
  assert.equal(JSON.stringify(readPrebuild(root)),before);
  tracked.forEach((path,i)=>assert.deepEqual(readFileSync(join(root,path)),bytes[i]));
  assert.throws(()=>readContext(root,'get_current_context',{approval:true}),/arguments/);
  assert.throws(()=>readContext(root,'search_research',{query:'x',limit:100}),/one to six/);
  assert.equal((readContext(root,'get_confirmed_user',continuation) as {text:string}).text,saved.context.definition.user.text);
  writeFileSync(join(root,'BUILD_HANDOFF.json'),'{}');assert.throws(()=>readContext(root,'get_build_handoff',continuation),/stale|edited|unconfirmed/);
});

test('M3-R2 fresh chat never reads an unrelated idea; explicit continuation restores it',t=>{
  const root=temporaryProject(t),saved=prepareIde(root,'problem');
  for(const name of contextReads){
    const result=readContext(root,name,name==='search_research'?{query:'synthetic'}:{});
    assert.deepEqual(result,{available:false,reason:'Fresh conversation. Saved idea context is available only when the founder explicitly continues that project.'});
    assert.equal(JSON.stringify(result).includes(String(saved.context.definition.user.text)),false);
  }
  assert.equal((readContext(root,'get_confirmed_user',continuation) as {text:string}).text,saved.context.definition.user.text);
  assert.throws(()=>readContext(root,'get_current_context',{scope:{mode:'continue',conversationId:'x'}}),/conversation identifier/);
  const cli=fileURLToPath(new URL('../src/cli/main.js',import.meta.url));
  const fresh=spawnSync(process.execPath,[cli,'internal','template',root],{encoding:'utf8',windowsHide:true,timeout:15000});
  assert.equal(fresh.status,0,fresh.stderr);assert.equal(JSON.parse(fresh.stdout).definition.user.text,null);
  assert.throws(()=>savePrebuild(root,JSON.parse(fresh.stdout)),/changed in another session/);
  assert.equal(readPrebuild(root)!.hash,saved.hash);
  const continued=spawnSync(process.execPath,[cli,'internal','template',root,'--resume'],{encoding:'utf8',windowsHide:true,timeout:15000});
  assert.equal(continued.status,0,continued.stderr);assert.equal(JSON.parse(continued.stdout).definition.user.text,saved.context.definition.user.text);
});

test('Closeout: real MCP stdio initialize/list/call rejects writes and outside-project arguments',t=>{
  const root=temporaryProject(t);prepareIde(root,'problem');
  const messages=[{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'synthetic-test',version:'1'}}},{jsonrpc:'2.0',method:'notifications/initialized'},{jsonrpc:'2.0',id:2,method:'tools/list'},{jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'get_confirmed_user',arguments:{}}},{jsonrpc:'2.0',id:4,method:'tools/call',params:{name:'get_confirmed_user',arguments:continuation}},{jsonrpc:'2.0',id:5,method:'tools/call',params:{name:'approve_act',arguments:{}}},{jsonrpc:'2.0',id:6,method:'tools/call',params:{name:'get_current_context',arguments:{project:'C:/'}}}];
  const result=spawnSync(process.execPath,[fileURLToPath(new URL('../src/cli/mcp.js',import.meta.url)),root],{input:messages.map(x=>JSON.stringify(x)).join('\n')+'\n',encoding:'utf8',windowsHide:true,timeout:20000});
  assert.equal(result.status,0,result.stderr);const rows=result.stdout.trim().split('\n').map(line=>JSON.parse(line));
  assert.equal(rows[0].result.protocolVersion,'2025-03-26');assert.equal(rows[1].result.tools.length,10);assert.ok(rows[1].result.tools.every((tool:{annotations:{readOnlyHint:boolean}})=>tool.annotations.readOnlyHint));
  assert.equal(JSON.parse(rows[2].result.content[0].text).available,false);
  assert.equal(JSON.parse(rows[3].result.content[0].text).confirmed,true);
  assert.equal(rows[4].result.isError,true);assert.equal(rows[5].result.isError,true);
});
