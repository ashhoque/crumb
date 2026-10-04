import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'skill','crumb');
const target=join(process.env.USERPROFILE??'', '.agents','skills','crumb');
const args=process.argv.slice(2),install=args.includes('--install');
if(!process.env.USERPROFILE||args.some(arg=>arg!=='--install')||args.length>1)throw new Error('Use --install to update the single global Crumb skill, or no option to check it.');
const files=['SKILL.md',...readdirSync(join(source,'references')).map(name=>`references/${name}`).sort()];
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
if(existsSync(target)&&lstatSync(target).isSymbolicLink())throw new Error('Global skill target must be a real directory.');
for(const file of files){
  const from=join(source,file),to=join(target,file);
  if(!lstatSync(from).isFile()||(existsSync(to)&&lstatSync(to).isSymbolicLink()))throw new Error(`Refusing linked skill file: ${file}`);
  if(install){mkdirSync(dirname(to),{recursive:true});copyFileSync(from,to);}
  if(!existsSync(to)||hash(from)!==hash(to))throw new Error(`Global skill differs from version-controlled source: ${file}`);
}
console.log(JSON.stringify({status:'in_sync',source,target,files:files.length,skillSha256:hash(join(source,'SKILL.md'))}));
