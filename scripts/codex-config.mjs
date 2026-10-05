import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {join} from 'node:path';
import {mkdirSync} from 'node:fs';
import {mergeCrumbHostInstructions} from '../dist/src/host/codex-identity.js';

// Native config API updates one key; do not parse/rewrite the user's TOML.
export async function syncCodexIdentity(profile, guard, install) {
  const configHome=join(profile,'.codex');mkdirSync(configHome,{recursive:true});
  const child=spawn('codex',['app-server','--stdio'],{env:{...process.env,CODEX_HOME:configHome},windowsHide:true,stdio:['pipe','pipe','pipe']});
  const lines=createInterface({input:child.stdout}),pending=new Map();let sequence=0;
  const fail=error=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();};
  child.on('error',fail);child.on('exit',()=>fail(new Error('Codex config host exited.')));child.stdin.on('error',fail);child.stderr.resume();
  lines.on('line',line=>{let msg;try{msg=JSON.parse(line);}catch{return;}const p=pending.get(msg.id);if(!p)return;pending.delete(msg.id);clearTimeout(p.timer);msg.error?p.reject(new Error(msg.error.message)):p.resolve(msg.result);});
  const request=(method,params)=>new Promise((resolve,reject)=>{const id=++sequence,timer=setTimeout(()=>{pending.delete(id);reject(new Error(`${method} timed out`));},10000);pending.set(id,{resolve,reject,timer});child.stdin.write(JSON.stringify({id,method,params})+'\n');});
  try {
    await request('initialize',{clientInfo:{name:'crumb_identity_install',version:'1'}});
    child.stdin.write(JSON.stringify({method:'initialized',params:{}})+'\n');
    const before=await request('config/read',{includeLayers:true});
    const existing=before.config.developer_instructions??null,expected=mergeCrumbHostInstructions(existing,guard);
    if(existing!==expected){
      if(!install)throw new Error('Installed Codex developer identity contract differs; reinstall global Crumb.');
      const layer=before.layers?.find(l=>l.name.type==='user'&&!l.name.profile);
      await request('config/value/write',{keyPath:'developer_instructions',value:expected,mergeStrategy:'replace',filePath:join(configHome,'config.toml'),...(layer?{expectedVersion:layer.version}:{})});
    }
    const after=await request('config/read',{});
    if(after.config.developer_instructions!==expected)throw new Error('Effective Codex identity contract is overridden or stale.');
    return {status:'in_sync',file:join(configHome,'config.toml')};
  } finally {child.stdin.end();child.kill();lines.close();fail(new Error('Config check ended.'));}
}
