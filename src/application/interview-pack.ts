import { mkdirSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readPrebuild } from './prebuild.js';
import { assertFounderProject } from './project-bootstrap.js';
import { selectedPath, sha256 } from '../privacy/artifacts.js';
import { inspectGit, inspectPath, resolveProjectRoot } from '../privacy/storage.js';
import { problemInterview } from '../domain/interviews.js';
import { planFirstUsers } from '../domain/first-user-engine.js';
import { agreesWithPresentation, type ReplyInterpretation } from '../domain/reply.js';

// The inbox has one default; deployments may override it without changing prompts.
export function interviewSupportEmail(): string {
  return email(process.env.CRUMB_INTERVIEW_SUPPORT_EMAIL ?? 'ashhoque0@gmail.com');
}
export const interviewChoice = "Ask: Do you want to run these interviews yourself, or should Crumb's team take them off your plate and email you what we learn?";
export const returnEmailAsk = "Quick ask: What email should Crumb's team send the interview findings to?";
export const replyInstruction = 'Return findings and any follow-up questions by replying to this thread.';
const directory = 'crumb-interviews';
const disclosure = "Crumb's team is human-assisted during the alpha. Recruitment, completed interviews and turnaround aren't guaranteed. The normal goal is 2–4 completed real interviews; requests and scheduled calls aren't evidence.";
const resultTemplate = `## Interview metadata
Request ID / interview number / date / participant identifier / why they fit / recruitment source / interviewer:
Occurred (not merely scheduled), and how this was established:
## Participant statements (paraphrase unless quotation consent is recorded)
Hardest part / last encounter / why hard / what tried / disliked alternatives:
Frequency or recency / time, money, risk or frustration:
Important quote and consent, if any:
## Interviewer interpretation
Supporting evidence / contradicting evidence / highest-order pain / limitations:
## Crumb inference (filled on return)
GO / ONE GAP / PIVOT or STOP, rationale / MVP-scope change / follow-up:
`;
function text(value: unknown, max = 1000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\x00-\x08\x0b\x0c\x0e-\x1f]/u.test(value)) throw new Error('Use bounded, nonempty interview context; no control characters.');
  return value.trim();
}
function email(value: unknown): string {
  const e = text(value, 254);
  if (!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/u.test(e)) throw new Error('Use an actual return email, not an invented contact.');
  return e;
}
export interface InterviewPackInput {
  expectedVersion: number; contextHash: string; path: 'founder' | 'team';
  founderName: string; returnEmail: string | null;
  emailSource: 'connected_account' | 'verified_context' | 'founder_supplied' | null;
  problem: string; user: string; topPain: string; thesis: string; reason: string;
  routes: { sourceId: string; name: string; fit: string; restrictions: string; participation: 'allowed' | 'check_rules' | 'restricted'; role: 'research' | 'acquisition' | 'both'; contact: string | null }[];
  outreach: string; strengthens: string; weakens: string; identityDisclosure: boolean; constraints: string;
}
type Route = InterviewPackInput['routes'][number] & { sourceUrl: string; sourceLimitation: string };
interface Request extends Omit<InterviewPackInput, 'routes'> {
  format: 'crumb-interviews-v1'; id: string; createdAt: string; projectRoot: string; project: string;
  target: { min: 2; max: 4; basis: 'completed_real_interviews' }; routes: Route[];
  questions: string[]; resultTemplate: string; disclosure: string; supportEmail: string;
}
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
function protect(root: string): void {
  const inGit = inspectGit(root);
  const git = (args: string[]) => spawnSync('git', ['--no-optional-locks', '-C', root, ...args], { encoding: 'utf8', windowsHide: true, timeout: 10000 });
  if (inGit) {
    const tracked = git(['ls-files', '-z', '--', directory]);
    if (tracked.status !== 0 || tracked.stdout) throw new Error('Interview artifacts are tracked or Git cannot be inspected. Preserve private data; no automatic untracking.');
  }
  const ignore = join(root, '.gitignore');
  const info = inspectPath(ignore);
  if (info && !info.isFile()) throw new Error('Preserve the non-file .gitignore.');
  const old = info ? readFileSync(ignore, 'utf8') : '';
  if (!old.split(/\r?\n/u).includes(`/${directory}/`) || inGit && git(['check-ignore', '--no-index', '-q', '--', `${directory}/probe`]).status !== 0) {
    const addition = `${old && !old.endsWith('\n') ? '\n' : ''}# Private interview packages\n/${directory}/\n`;
    if (info) appendFileSync(ignore, addition); else writeFileSync(ignore, addition, { flag: 'wx' });
  }
  if (inGit && git(['check-ignore', '--no-index', '-q', '--', `${directory}/probe`]).status !== 0) throw new Error('Interview artifact privacy protection failed.');
}
function requestPath(root: string, id: string, file: string): string {
  if (!/^[0-9a-f-]{36}$/u.test(id)) throw new Error('Use the returned request ID.');
  return selectedPath(root, `${directory}/${id}/${file}`);
}
function current(root: string, version: number, hash: string) {
  assertFounderProject(root);
  const saved = readPrebuild(root);
  if (!saved || saved.version !== version || saved.hash !== hash) throw new Error('Interview context changed or is unavailable. Read current same-project context and prepare the updated package.');
  return saved;
}
function readRequest(root: string, id: string): Request {
  const file = requestPath(root, id, 'REQUEST.json');
  const info = inspectPath(file);
  if (!info?.isFile() || info.size > 65536) throw new Error('Use the intact same-project interview request.');
  const envelope = JSON.parse(readFileSync(file, 'utf8')) as { request: Request; hash: string };
  if (sha256(json(envelope.request)) !== envelope.hash || envelope.request.id !== id || envelope.request.projectRoot !== root || envelope.request.format !== 'crumb-interviews-v1') throw new Error('Interview request ownership or integrity mismatch.');
  return envelope.request;
}
function markdown(r: Request): string {
  return [`# ${r.project}: interview package`, `Request ID: ${r.id}\nDate: ${r.createdAt}\nFounder: ${r.founderName}\nReturn email: ${r.returnEmail ?? 'Not provided'}`,
    `## Working hypothesis\nProblem: ${r.problem}\nUser: ${r.user}\nTop ranked pain: ${r.topPain}\nThesis: ${r.thesis}\nWhy now: ${r.reason}`,
    `Goal: approximately 2–4 completed real interviews, not contacts, replies or scheduled calls. More only if conflict, poor fit, distinct segments, a new pain or a remaining decision gap warrants it. No automatic GO from interview count.`,
    '## Starting points', ...r.routes.map(x => `- ${x.name}: ${x.sourceUrl}\n  Observed fit: ${x.fit}\n  Public contact: ${x.contact ?? 'Not found'}\n  ${x.role}; participation: ${x.participation}. ${x.restrictions}\n  Source limitation: ${x.sourceLimitation}`),
    `## Exact outreach draft\n${r.outreach}`, `Identity may be disclosed: ${r.identityDisclosure ? 'yes, only within the approved request' : 'no'}\nConstraints: ${r.constraints}\nChoosing the team is not permission to contact anyone. Research-only, restricted and unchecked routes are not approved recruitment routes.`,
    '## Interview guide', ...r.questions, 'Do not pitch. Follow concrete past behavior and interesting answers. Avoid hypothetical features; compliments are weak evidence. Public posts, simulated interviews and invented personas are not completed interviews.',
    `## Decision signals\nStrengthens: ${r.strengthens}\nWeakens: ${r.weakens}`, '## Return notes', 'Reply to the email thread with this request ID, or paste/upload this completed template here. Separate participant statements, interviewer interpretation and Crumb inference. Do not include unrelated private information.', r.resultTemplate, r.disclosure].join('\n\n') + '\n';
}
const csvCell = (s: string) => '"' + (/^[=+@\-\t\r]/u.test(s) ? "'" : '') + s.replaceAll('"', '""') + '"';
/** Existing project context and source IDs become portable preparation, never permission/evidence. */
export function prepareInterviewPack(target: string, input: InterviewPackInput) {
  const root = resolveProjectRoot(target);
  const saved = current(root, input?.expectedVersion, input?.contextHash);
  if (!input || !['founder', 'team'].includes(input.path) || typeof input.identityDisclosure !== 'boolean' || !Array.isArray(input.routes) || !input.routes.length || input.routes.length > 8) throw new Error('Prepare the complete pack with one path and 1–8 retained public routes.');
  const fields = ['founderName','problem','user','topPain','thesis','reason','outreach','strengthens','weakens','constraints'] as const;
  const clean = Object.fromEntries(fields.map(k => [k, text(input[k])])) as Pick<InterviewPackInput, typeof fields[number]>;
  if (/\r|\n/u.test(clean.founderName) || /\r|\n/u.test(saved.context.project.name) || /\r|\n/u.test(clean.user)) throw new Error('Email subject/identity fields must be single-line.');
  const returnAddress = input.returnEmail === null ? null : email(input.returnEmail);
  if (returnAddress ? !['connected_account','verified_context','founder_supplied'].includes(input.emailSource ?? '') : input.emailSource !== null) throw new Error('Identify the actual return-email source; do not invent an identity.');
  const routes = input.routes.map(x => {
    const source = saved.context.sources.find(s => s.id === x.sourceId);
    if (!source?.url || source.access !== 'inspected' || source.archived) throw new Error('Retain the actually inspected public source before packaging a route.');
    const contact = x.contact === null ? null : text(x.contact, 254);
    if (contact && !source.retainedText.includes(contact)) throw new Error('Public contact must actually appear in the retained source.');
    return { sourceId: source.id, sourceUrl: source.url, sourceLimitation: source.limitation, name: text(x.name,160), fit: text(x.fit,500), restrictions: text(x.restrictions,500), participation: x.participation, role: x.role, contact };
  });
  // Reuse route semantics/URL constraints rather than introducing a recruiting engine.
  planFirstUsers({ user: clean.user, pain: clean.topPain, market: 'distributed', habitats: routes.map(r => ({ name:r.name,sourceUrl:r.sourceUrl,observed:r.fit,participation:r.participation,role:r.role,fit:'high' })) });
  const request: Request = { ...clean, expectedVersion:saved.version,contextHash:saved.hash,path:input.path,returnEmail:returnAddress,emailSource:input.emailSource,identityDisclosure:input.identityDisclosure,
    format:'crumb-interviews-v1',id:randomUUID(),createdAt:new Date().toISOString(),projectRoot:root,project:saved.context.project.name,target:{min:2,max:4,basis:'completed_real_interviews'},routes,questions:problemInterview({...saved.context,definition:{...saved.context.definition,job:{...saved.context.definition.job,text:clean.problem}}}),resultTemplate,disclosure,supportEmail:interviewSupportEmail() };
  protect(root);
  const base = selectedPath(root, directory); mkdirSync(base, { recursive:true });
  const folder = selectedPath(root, `${directory}/${request.id}`); mkdirSync(folder);
  const body = markdown(request);
  writeFileSync(requestPath(root,request.id,'REQUEST.md'),body,{flag:'wx'});
  writeFileSync(requestPath(root,request.id,'ROUTES.csv'),['Name,URL,Public contact,Observed fit,Role,Participation,Restrictions',...routes.map(r=>[r.name,r.sourceUrl,r.contact??'',r.fit,r.role,r.participation,r.restrictions].map(csvCell).join(','))].join('\n')+'\n',{flag:'wx'});
  writeFileSync(requestPath(root,request.id,'REQUEST.json'),json({request,hash:sha256(json(request))}),{flag:'wx'});
  return { id:request.id,folder,files:['REQUEST.md','REQUEST.json','ROUTES.csv'],status:'prepared',completedInterviews:0,choice:interviewChoice,disclosure,returnEmailAsk:returnAddress?null:returnEmailAsk };
}

export interface InterviewEmailInput {
  id:string; operation:'preview'|'approve'|'submitted';
  displayedText?:string; quote?:string; turnId?:string; interpretation?:ReplyInterpretation;
  connectorResult?:{ provider:'gmail'; from:string; to:string; subject:string; messageId:string; threadId:string };
}
/** Core never sends mail; the host uses its native connector after this exact-scope check. */
export function interviewEmail(target:string,input:InterviewEmailInput) {
  const root=resolveProjectRoot(target),r=readRequest(root,input?.id);
  current(root,r.expectedVersion,r.contextHash);
  if (!r.returnEmail) return {status:'missing_return_email',ask:returnEmailAsk,sent:false};
  const body=markdown(r);
  if(readFileSync(requestPath(root,r.id,'REQUEST.md'),'utf8')!==body)throw new Error('Request artifact changed; prepare and display a fresh package.');
  const to=r.path==='team'?r.supportEmail:r.returnEmail;
  const subject=`[Crumb User Interviews] ${r.project} — ${r.user} — ${r.id}`;
  const mail={from:r.returnEmail,to,subject,body:`${replyInstruction}\n\n${body}`};
  const scope=r.path==='team'?"Approve: Send this request to Crumb's team and authorize outreach to these candidates using the message above? Only allowed acquisition routes, purpose above, identity setting and disclosed information are covered. No product build, publication or spending.":'Approve: Email this complete interview package to you? No candidate contact or product build is authorized.';
  const displayedText=[`From: ${mail.from}`,`To: ${to}`,`Subject: ${subject}`,mail.body,scope].join('\n\n');
  const scopeHash=sha256(displayedText);
  if(input.operation==='preview')return {status:'draft_only',mail,displayedText,scopeHash,sent:false,requires:'Show the exact outgoing package and obtain scoped approval. Use connected founder Gmail only; otherwise provide this ready-to-send fallback. Never claim submission without a successful connector result.'};
  const approvalPath=requestPath(root,r.id,'APPROVAL.json');
  if(input.operation==='approve') {
    if(input.displayedText!==displayedText||!input.turnId||!input.quote||!agreesWithPresentation(input.quote,input.interpretation))throw new Error('Use one genuine founder approval of the exact displayed interview-email scope; team choice or Act approval is not consent.');
    const approval={scopeHash,quote:text(input.quote),turnId:text(input.turnId,160)};
    if(inspectPath(approvalPath)){if(readFileSync(approvalPath,'utf8')!==json(approval))throw new Error('Preserve the existing approval; conflicting approval cannot overwrite it.');}
    else writeFileSync(approvalPath,json(approval),{flag:'wx'});
    return {status:'approved_not_sent',scopeHash,mail,sent:false};
  }
  if(input.operation!=='submitted')throw new Error('Use preview, approve or submitted.');
  const approval=JSON.parse(readFileSync(approvalPath,'utf8')) as {scopeHash:string};
  const c=input.connectorResult;
  if(approval.scopeHash!==scopeHash||!c||c.provider!=='gmail'||c.from!==mail.from||c.to!==mail.to||c.subject!==mail.subject)throw new Error('Record only a successful same-scope Gmail connector result from the founder account.');
  const submission={scopeHash,provider:c.provider,from:c.from,to:c.to,subject:c.subject,messageId:text(c.messageId,200),threadId:text(c.threadId,200),provenance:'host_reported_connector_result',completedInterviews:0};
  const file=requestPath(root,r.id,'SUBMISSION.json');
  if(inspectPath(file)){if(readFileSync(file,'utf8')!==json(submission))throw new Error('Conflicting submission; preserve the original thread.');}else writeFileSync(file,json(submission),{flag:'wx'});
  return {status:'submitted',...submission,verification:'Core does not independently verify Gmail; host must supply the actual successful result. No background monitoring.'};
}

export interface InterviewResult {
  requestId:string; participant:string; date:string; fit:string; recruitmentSource:string; interviewer:string;
  kind:'contacted'|'replied'|'scheduled'|'completed'|'public_post'|'simulation'; occurred:boolean;
  occurrenceEvidence:string; participantStatements:string; interviewerInterpretation:string; crumbInference:string;
  quote:string|null; quoteConsent:boolean;
}
/** Assessment is not automatic GO or a persisted thesis: use existing evaluation-update/review afterward. */
export function assessInterviewResults(target:string,input:{id:string;results:InterviewResult[]}) {
  const root=resolveProjectRoot(target),r=readRequest(root,input?.id);
  assertFounderProject(root);
  if(!Array.isArray(input.results)||input.results.length>30)throw new Error('Use up to thirty attributed results, never invented interviews.');
  const seen=new Set<string>();
  const results=input.results.map(x=>{
    if(x.requestId!==r.id||!['contacted','replied','scheduled','completed','public_post','simulation'].includes(x.kind)||typeof x.occurred!=='boolean'||typeof x.quoteConsent!=='boolean')throw new Error('Return attributed results for this request; keep simulations/public posts separate.');
    for(const k of ['participant','fit','recruitmentSource','interviewer','participantStatements','interviewerInterpretation','crumbInference'] as const)text(x[k],2000);
    if(!/^\d{4}-\d{2}-\d{2}$/u.test(x.date)||Number.isNaN(Date.parse(x.date)))throw new Error('Use an actual interview/result date.');
    const key=x.participant+'|'+x.date;if(seen.has(key))throw new Error('Duplicate participant/date cannot inflate interview counts.');seen.add(key);
    if(x.kind==='completed'&&(!x.occurred||!text(x.occurrenceEvidence)))throw new Error('A completed real interview needs occurrence evidence, not a schedule or request.');
    if(x.quote!==null&&!x.quoteConsent)throw new Error('Do not retain participant quotes without consent; use an attributed paraphrase.');
    if(x.quote!==null)text(x.quote,2000);
    return {...x,evidenceStatus:x.kind==='completed'?'reported_real_interview_not_independently_verified':'not_completed_interview'};
  });
  const counts=Object.fromEntries(['contacted','replied','scheduled','completed','public_post','simulation'].map(kind=>[kind,results.filter(x=>x.kind===kind).length]));
  return {requestId:r.id,counts,results,evaluationComplete:false,decision:'requires_qualitative_assessment',next:'Inspect respondent fit, recent/recurring painful behavior, workarounds, spend and convergence/conflict. Reconcile user, ranked pains, thesis, evaluation, MVP scope and next move through existing evaluation-update/finish-evaluation; record supplied interview notes as provided source material, not independently verified demand. More interviews only with a specific remaining gap. Read back; changed material thesis invalidates approval. Never count simulated/public/scheduled results as completed, and never auto-GO from 2–4 interviews.'};
}
