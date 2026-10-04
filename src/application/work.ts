import { saveActPlan, generateBuildPack } from './act.js';
import type { SavedAct } from '../domain/act.js';
export function prepareWorkPack(target:string,input:unknown):SavedAct {
  if(!input||typeof input!=='object'||!('execution'in input)||!input.execution)throw new Error('Use the verified build session and reviewed handoff to prepare the full Work Build Pack.');
  const s=saveActPlan(target,input);
  return generateBuildPack(target,{expectedVersion:s.version});
}
