export interface CompletionRequirement {
  code:string; path:string; owner:'crumb'|'founder'; operation:string; message:string;
}
export class CompletionError extends Error {
  constructor(public readonly requirements:CompletionRequirement[]) {
    super(requirements[0]?.message??'Evaluation is incomplete.');
  }
}
export function completionChecks() {
  const items:CompletionRequirement[]=[];
  return {items,check:(condition:unknown,code:string,path:string,message:string,operation='inspect_and_assess',owner:CompletionRequirement['owner']='crumb')=>{
    if(!condition)items.push({code,path,owner,operation,message});
  }};
}
