import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmdirSync, unlinkSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {projectFactKeys,founderFactKeys} from '../dist/src/domain/founder-intelligence.js';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'skill','crumb');
const target=join(process.env.USERPROFILE??'', '.agents','skills','crumb');
const args=process.argv.slice(2),install=args.includes('--install');
if(!process.env.USERPROFILE||args.some(arg=>arg!=='--install')||args.length>1)throw new Error('Use --install to update the single global Crumb skill, or no option to check it.');
const files=['SKILL.md',...readdirSync(join(source,'references')).map(name=>`references/${name}`).sort()];
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
if(existsSync(target)&&lstatSync(target).isSymbolicLink())throw new Error('Global skill target must be a real directory.');
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
  'project-bootstrap':{decision:'pricing',previous:[]},
  'working-context':{start:true,expectedVersion:0,conversationId:'replace_with_current_chat_id',delta:{project:{next_move:{value:'replace with concise next move',status:'inferred',confidence:'medium',source:'current conversation'}}},projectFields:projectFactKeys,founderFields:founderFactKeys,limits:'Create the chosen unused child target directory before start:true. Each fact value <=320 characters; source is required (null or string <=240). Split price, risk and next_move into separate short facts. Inferred facts cannot have high confidence. Later updates omit start and use returned version.'},
  'revise-foundation':{command:'ide',input:{operation:'revise-foundation',expectedVersion:'current version',subject:'user',text:'corrected provisional user',quote:'actual founder correction',turnId:'actual source turn'},output:'Invalidates affected review; no confirmation. Use for a founder correction instead of rebuilding the dossier.'},
  'present-thesis':{command:'ide',input:{operation:'present-thesis',expectedVersion:'current version'},output:'context.presentation: keep id, basis and exact text in chat; display text unchanged'},
  'confirm-thesis':{command:'ide',input:{operation:'confirm-thesis',expectedVersion:'returned version',presentationId:'returned id',displayedText:'exact text actually displayed',quote:'verbatim founder reply',turnId:'actual source turn'},output:'Check context.confirmations before acknowledging saved review. Never Act approval'},
  'conversation-context':{resume:'--resume only for explicit continuation',input:null}
}};
if(!existsSync(runtime.cli))throw new Error('Build Crumb Core before installing its skill.');
const runtimePath=join(target,'runtime.json'),runtimeText=JSON.stringify(runtime,null,2)+'\n';
if(existsSync(runtimePath)&&lstatSync(runtimePath).isSymbolicLink())throw new Error('Runtime locator must be a real file.');
if(install)writeFileSync(runtimePath,runtimeText);
if(!existsSync(runtimePath)||readFileSync(runtimePath,'utf8')!==runtimeText)throw new Error('Installed runtime locator differs from this checkout; reinstall.');
console.log(JSON.stringify({status:'in_sync',source,target,files:files.length,runtime,skillSha256:hash(join(source,'SKILL.md'))}));
