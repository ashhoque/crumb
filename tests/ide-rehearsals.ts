import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { emptyIde, assertAct, ideState, ideTopics, extraTopics, alternativeKinds, type IdeContext, type Subject } from '../src/domain/ide.js';
import { competitorFields, type FindingView } from '../src/domain/prebuild.js';
import { savePrebuild, readPrebuild, transitionIde } from '../src/application/prebuild.js';
import { saveDraft, readWorkflow, approvedHandoff } from '../src/application/workflow.js';
import { inspectArtifacts } from '../src/privacy/artifacts.js';
import { renderPrebuildSummary, renderPrebuildDetail, renderFullResearch } from '../src/cli/prebuild-render.js';
import { actionFor } from './ide-fixtures.js';

// Authored conversations exercise the real local core. They are not generated
// installed-host sessions, independent agent reviews, or actual founder consent.
export const scenarios = [
  { id: 'fresh-b2b', title: 'Fresh vague B2B idea', entry: 'fresh',
    opening: 'I want to make an AI tool for small businesses.',
    intentionReply: 'A profitable evening-built business. I know two bookkeeping owners and can do sales and onboarding, but cannot be on call all day.',
    intention: 'Build a profitable solo business for reachable small firms, with founder-led sales and onboarding that fit around a day job.',
    userReply: 'Owners of bookkeeping firms with three to five staff, like my friends. They chase client documents every month and decide what software to buy.',
    user: 'Owners of three-to-five-person bookkeeping firms who coordinate monthly client work and make the buying decision.',
    question: 'When documents arrive late, is the hard part sending reminders or knowing which jobs the team can finish?',
    problemReply: 'Knowing which jobs can proceed. They already send reminders, then repeatedly check emails and ask staff what is ready.',
    problem: 'During monthly close, firm owners struggle to identify jobs that can proceed because document and status updates are scattered across email and staff conversations, delaying assignments despite repeated reminders.',
    finding: 'Fictional workflow examples suggest status reconstruction persists even when reminders work. Existing practice-management tools may already solve it.',
    substitute: 'Existing practice-management software and a shared status sheet may be adequate.',
  },
  { id: 'existing', title: 'Existing product', entry: 'existing',
    opening: 'I already have a support dashboard. Help me decide what deserves the next build cycle.',
    intentionReply: 'A bootstrapped SaaS for small B2B companies. I can do hands-on onboarding but do not want enterprise sales.',
    intention: 'Turn the existing product into a bootstrapped SaaS for small B2B software companies, using hands-on onboarding and avoiding enterprise sales.',
    userReply: 'Founders who still answer support with a few teammates. The founder would buy it.',
    user: 'Founders of small B2B software companies who still handle support and coordinate replies with a few teammates.',
    question: 'On the last missed customer response, what became unclear: priority, ownership or the reply itself?',
    problemReply: 'Ownership. Each person thought someone else owed the next answer, and the customer waited.',
    problem: 'When several teammates help with support, the founder loses track of who owes the next response because ownership is scattered across chats and the inbox, leaving customers waiting.',
    finding: 'Fictional feedback points to handoff ambiguity. Shared-inbox assignment may already remove it without changing the existing product.',
    substitute: 'Shared-inbox assignment and explicit team rules may suffice.',
  },
  { id: 'feedback', title: 'Existing product with reported feedback', entry: 'existing',
    opening: 'Three owners tried my bookkeeping dashboard and said it was useful, but have not returned.',
    intentionReply: 'A paid solo business serving bookkeeping owners, with personal onboarding and manageable support.',
    intention: 'Build a paid solo business serving bookkeeping owners with personal onboarding and manageable support.',
    userReply: 'Small-firm owners. They oversee the monthly close and approve purchases.',
    user: 'Small bookkeeping-firm owners who oversee monthly close and approve software purchases.',
    question: 'What did those owners actually do after calling it useful?',
    problemReply: 'They did not return. Two said staff still check email for documents and the owner rechecks status. Those are my notes, not independently verified interviews.',
    problem: 'Owners repeatedly reconstruct client readiness during monthly close because staff updates and documents remain in email, delaying handoffs despite access to a dashboard.',
    finding: 'Reported praise and non-return conflict. The fictional follow-up suggests staff, not owners, perform the recurring check; the owner remains the buyer.',
    substitute: 'Email and a shared checklist may already fit staff habits better.',
    revisedUser: 'Bookkeeping staff who check client readiness during monthly close; the firm owner remains the buying decision-maker.',
    revisedProblem: 'Before handing a client job to a colleague, bookkeeping staff recheck email and documents because they cannot tell whether the remaining work is ready, causing repeated checks and uncertain handoffs.',
    loopReply: 'Focus on staff checking readiness, with the owner as buyer. The repeated check is the pain; the praise did not prove adoption.',
  },
  { id: 'stock', title: 'Stock comparison, public sources and Define/Evaluate loop', entry: 'fresh',
    opening: 'I want something that ranks stocks. I screen momentum and growth names but struggle to compare them.',
    intentionReply: 'A paid decision-support business for active US swing traders, small enough for me to run alone. I can code and interview people, but cannot support them throughout market hours.',
    intention: 'Build a paid decision-support business for active US swing traders, small enough for a solo technical founder to run with limited support time.',
    userReply: 'Self-directed US swing traders like me who find momentum and growth stocks and hold for days or weeks. They would pay personally.',
    user: 'US self-directed swing traders who screen momentum and growth stocks for multi-day or multi-week positions.',
    question: 'Once you already have plausible candidates, what happened in your last comparison that made the choice difficult?',
    problemReply: 'At the weekend I compared charts, sector strength, earnings notes and a spreadsheet. I kept changing the criteria and repeating the synthesis. The list was not the hard part.',
    problem: 'After screening plausible stocks, swing traders repeat manual comparisons because technical, sector, fundamental and catalyst notes are scattered, leaving the reasoning inconsistent.',
    finding: 'Scheduled shortlist reviews are closer to your experience than general stock discovery. Public posts show related behavior, but do not establish that this exact cohort will pay. Would you focus on traders who already keep a shortlist and review it in scheduled sessions?',
    substitute: 'Existing charting, screening, spreadsheets, free broker workflows and generic AI may suffice.',
    revisedUser: 'US self-directed swing traders who already screen momentum/growth stocks, maintain a shortlist, and compare candidates during scheduled evening or weekend reviews.',
    revisedProblem: 'During a shortlist review, these traders struggle to compare plausible candidates consistently because technical, sector, fundamental and catalyst notes are scattered. They repeat the synthesis and lose track of their reasoning, using charts, research pages and spreadsheets today.',
    loopReply: 'Yes, that is closer. I do it each weekend. I know two traders I could ask, but nobody has agreed to pay and I have no commercial data agreement.',
  },
  { id: 'adjacent', title: 'Research reveals a better adjacent problem', entry: 'fresh',
    opening: 'I want to help small field-service firms schedule their jobs.',
    intentionReply: 'A small paid business for firms I know through my previous operations work. I can do direct sales.',
    intention: 'Build a small paid business for reachable field-service firms, using prior operations knowledge and direct sales.',
    userReply: 'The dispatcher at a five-to-ten-technician firm. The owner buys the software.',
    user: 'Dispatchers at five-to-ten-technician field-service firms, with the owner as buyer.',
    question: 'On the last difficult day, was making the schedule the problem, or did something break after it was agreed?',
    problemReply: 'I assumed planning was the problem. I know the workflow but have not confirmed the recurring pain.',
    problem: 'Dispatchers may struggle to create a workable daily schedule using calls and a shared calendar; the frequency and consequence are still uncertain.',
    finding: 'In this fictional research, routine planning works. The stronger reported pain is a missed handoff when an urgent change arrives after technicians have left. One nearby alternative is confirming that a changed assignment was received. Would you investigate that pain first?',
    substitute: 'Calls and acknowledgement in the existing dispatch app may suffice.',
    revisedUser: 'Dispatchers coordinating same-day job changes with technicians already in the field at small service firms.',
    revisedProblem: 'When a job changes after technicians leave, dispatchers cannot tell whether the revised assignment was received because calls and messages are disconnected, causing repeated calls or wasted travel.',
    loopReply: 'Yes. That is closer to what I saw in operations. Compare that handoff pain before committing to scheduling.',
  },
] as const;
type Scenario = typeof scenarios[number];
export interface RehearsalTurn { role: 'Founder' | 'Crumb'; text: string; state: ReturnType<typeof ideState>; version: number; actLocked: boolean }
export interface RehearsalResult { id: string; title: string; turns: RehearsalTurn[]; transcript: string; research: string; firstSolutionTurn: number; finalVersion: number }

function reported(c: IdeContext, text: string): void {
  const source = { id: 'scenario-founder', title: 'Invented rehearsal replies', url: null, kind: 'founder' as const, provenance: 'synthetic_fixture' as const, access: 'provided' as const, retrievedOn: '2026-09-23', publishedOn: null, delivery: 'provided' as const, retainedText: text, limitation: 'Invented replies for local rehearsal, not actual founder or customer evidence.', archived: false, independenceKey: 'scenario-founder', affiliation: 'independent' as const };
  c.sources = [source];
  c.claims = [{ id: 'scenario-report', statement: text, basis: 'founder_reported', sourceIds: [source.id], supports: [], challenges: [], limitation: source.limitation, important: false, repetition: 'single', metric: null, quote: null }];
}
const view = (text: string): FindingView => ({ text, claimIds: ['scenario-report'], basis: 'observed' });

function evaluation(c: IdeContext, s: Scenario): IdeContext {
  if (s.id === 'stock') {
    const stock = JSON.parse(readFileSync(new URL('../../fixtures/m1r3/stock.json', import.meta.url), 'utf8')) as IdeContext;
    // Preserve the conversation's foundation, receipt lineage and selected files.
    return { ...stock, expectedVersion: c.expectedVersion, ide: c.ide, project: c.project, preferredName: c.preferredName, intention: c.intention, definition: c.definition, sources: [...stock.sources, ...c.sources], claims: [...stock.claims, ...c.claims] };
  }
  c.stage = 'evaluate';
  c.sources.push({ ...c.sources[0]!, id: 'scenario-discussion', title: 'Fictional research discussion', kind: 'discussion', access: 'inspected', delivery: 'unknown', retainedText: `${s.finding} ${s.substitute}`, independenceKey: 'scenario-discussion' });
  c.claims.push({ id: 'scenario-learning', statement: s.finding, basis: 'public_observation', sourceIds: ['scenario-discussion'], supports: [], challenges: [], limitation: 'Entirely fictional findings for workflow testing.', important: true, repetition: 'single', metric: null, quote: null });
  c.research = [{ id: 'scenario-research', question: 'For this fictional cohort, what do current workarounds, behavior and founder constraints leave unresolved?', capability: 'synthetic_fixture', queryBudget: 3, pageBudget: 2, budgetReason: null, queries: [{ text: 'Fictional cohort workflow and alternatives', materialFinding: true }], inspectedSourceIds: ['scenario-discussion','scenario-founder'], stopReason: 'coverage_sufficient', limitation: 'Scripted hypothetical research, not an actual market investigation. No commercial conclusion.' }];
  const coverage = (topic: typeof ideTopics[number]) => ({ topic, status: 'unknown_after_search' as const, claimIds: [], runIds: ['scenario-research'], reason: `The fictional ${topic} inquiry leaves the real-world answer unknown; scripted findings only illustrate the conversation.` });
  c.evaluation = { status: 'ready', coverage: c.evaluation.coverage.map(x => ({ ...coverage(x.topic), topic: x.topic })), promising: ['The invented founder describes a specific recurring workflow.', 'The invented founder reports access to people who perform this work; their interest is unknown.'], weak: [s.substitute], unknowns: ['Will the intended user change behavior and pay beyond the existing workaround?'], contradictions: ['Encouraging descriptions are not evidence of adoption or willingness to pay.'], conclusion: 'The fictional findings give us a narrower question to discuss with users. They do not establish demand.' };
  c.investigation = { coverage: extraTopics.map(topic => ({ ...coverage(topic), topic })), questions: ideTopics.map(topic => ({ topic, runIds: ['scenario-research'], relevance: `Consider ${topic} against this scenario’s user, problem and founder constraints; real evidence remains unavailable.` })), alternatives: alternativeKinds.map(kind => ({ kind, competitorIds: ['scenario-alternative'], runIds: ['scenario-research'], conclusion: `${s.substitute} This ${kind} comparison is hypothetical; no provider gap is established.` })), counterevidence: s.substitute, decision: 'Prefer conversations about recent behavior; any build decision explicitly accepts untested demand.', redefinition: null };
  c.competitors = [{ id: 'scenario-alternative', name: 'Existing workflow (fictional comparison)', categories: ['manual'], fields: Object.fromEntries(competitorFields.map(key => [key, key === 'workflow' ? { text: s.substitute, claimIds: ['scenario-learning'], basis: 'observed' } : { text: null, claimIds: [], basis: 'unknown' }])) as IdeContext['competitors'][number]['fields'], tractionClaimIds: [] }];
  c.habitats = [{ id: 'scenario-habitat', kind: 'professional', place: 'Founder’s reported professional contacts (invented)', observedClaimIds: ['scenario-report'], likelyUsers: c.definition.user.text!, relevance: 'Potential interview route, not recruited users.', participation: { route: 'The founder can seek consent to talk about recent work.', verified: false, sourceIds: ['scenario-founder'] }, limitation: 'Invented access; no outreach performed.' }]; c.firstUserAvenues = ['scenario-habitat'];
  c.redTeam = [{ claimId: 'scenario-learning', evidence: 'Fictional behavioral description.', inference: 'The refined pain may be important.', assumption: 'The intended user experiences it frequently enough to act.', contradiction: s.substitute, disproof: 'Actual users show the existing workflow is adequate.', cheapestLearning: 'Discuss a recent occurrence and observe the workaround.' }];
  return c;
}

export function rehearse(root: string, s: Scenario): RehearsalResult {
  let c = emptyIde(); c.project.entry = s.entry; c.project.name = s.title;
  if (s.entry === 'existing') {
    writeFileSync(join(root, 'README.md'), '# Existing product\nWorking code remains here.\n');
    c.project.artifacts = inspectArtifacts(root, { paths: ['README.md'], permissionGranted: true, permissionQuote: 'Synthetic fixture authorizes reading only README.md.' }).map(({path,sha256})=>({path,sha256}));
    c.project.permissionQuote = 'Synthetic fixture authorizes reading only README.md.';
  }
  savePrebuild(root, c);
  const current = (): IdeContext => { const saved = readPrebuild(root)!; assert.equal(saved.context.contractVersion, 2); return { ...structuredClone(saved.context as IdeContext), expectedVersion: saved.version }; };
  const turns: RehearsalTurn[] = [];
  let act = false;
  const say = (role: RehearsalTurn['role'], text: string): void => {
    const saved = readPrebuild(root)!, context = saved.context as IdeContext;
    if (!act) { assert.throws(() => assertAct(context)); assert.equal(readWorkflow(root).draft, null); }
    else assert.doesNotThrow(() => assertAct(context));
    if (role === 'Crumb' && !act) assert.doesNotMatch(text, /\bMVP\b|prototype|architecture|feature list/i, 'No early solution recommendation in the authored transcript.');
    turns.push({role,text,state:ideState(context),version:saved.version,actLocked:!act});
  };
  const confirm = (subject: Subject): void => {
    const shown = transitionIde(root,{operation:'present',subject,expectedVersion:readPrebuild(root)!.version});
    say('Crumb',renderPrebuildSummary(shown));
    const quote = subject === 'act' ? 'Yes — move to Act' : 'Yes.';
    // The founder line precedes applying it; the next turn shows the new state.
    say('Founder',quote);
    transitionIde(root,{operation:'confirm',expectedVersion:shown.version,presentationId:(shown.context as IdeContext).ide.presentation!.id,quote,turnId:randomUUID()});
    if (subject === 'act') act=true;
  };
  say('Founder',s.opening);
  if (s.entry === 'fresh') { say('Crumb','Are you starting fresh, or do you already have a project in progress?'); say('Founder','Starting fresh.'); }
  else say('Crumb','We can build on the current project. The selected README gives us context; usage and customer value still need investigation.');
  say('Crumb','What would you like this to become, and which constraints should shape the opportunity?'); say('Founder',s.intentionReply);
  c=current(); reported(c,s.intentionReply);
  c.intention={status:'provided',goal:'solo_profit',statement:s.intention,advice:'Optimize for the stated business goal and support constraints; demand is unproven.'}; savePrebuild(root,c); confirm('intention');
  say('Crumb','Which person and existing workflow do you understand well enough to focus on first?'); say('Founder',s.userReply);
  c=current(); c.sources[0]!.retainedText += ' ' + s.userReply; c.claims[0]!.statement = c.sources[0]!.retainedText;
  c.definition.user=view(s.user);
  if(s.id==='stock') c.definition.buyer=view('The individual trader would pay personally; willingness to pay is unknown.');
  savePrebuild(root,c); confirm('user');
  say('Crumb',s.question); say('Founder',s.problemReply);
  c=current(); c.sources[0]!.retainedText += ' ' + s.problemReply; c.claims[0]!.statement = c.sources[0]!.retainedText;
  c.definition.problem=view(s.problem);
  if(s.id==='stock') Object.assign(c.definition,{
    trigger:view('A weekend shortlist review before a multi-day or multi-week position.'),
    job:view('Compare already screened candidates and explain the preference consistently.'),
    workaround:view('Charts, sector and earnings notes, and a spreadsheet.'),
    pain:view('Repeated synthesis and changing comparison criteria.'),
    consequence:view('Extra comparison work and inconsistent reasoning; no measured financial effect.'),
    frequency:view('The last comparison occurred at the weekend; cohort frequency remains unknown.'),
    reason_for_belief:view('The invented founder describes their last comparison; this is not customer validation.'),
  });
  if(s.id==='feedback') c.feedbackClaimIds=['scenario-report']; savePrebuild(root,c); confirm('problem');
  say('Crumb','That helps. I’ll investigate existing approaches, where people still struggle, whether this fits your intention, and how you could reach the intended user. Public discussion will guide the questions; it cannot establish demand.');
  c=evaluation(current(),s); savePrebuild(root,c);
  if ('revisedUser' in s) {
    c=current(); c.investigation.redefinition=s.finding; savePrebuild(root,c);
    assert.equal(ideState(current()).evaluation,'requires_redefinition');
    say('Crumb',s.finding); say('Founder',s.loopReply);
    c=current(); c.sources.find(x=>x.id==='scenario-founder')!.retainedText += ' ' + s.loopReply;
    c.claims.find(x=>x.id==='scenario-report')!.statement = c.sources.find(x=>x.id==='scenario-founder')!.retainedText;
    c.definition.user=view(s.revisedUser); c.definition.problem=view(s.revisedProblem); c.investigation.redefinition=null; savePrebuild(root,c);
    confirm('user'); confirm('problem');
    say('Crumb','I’ve reconsidered the findings against that narrower definition. The alternatives and remaining uncertainty still matter; the change does not establish that people will pay.');
  }
  if(s.id==='stock') say('Crumb','One proposed nearby gap does not survive the evidence check: current TradingView documentation supports extended-hours watchlist alerts. Journaling is another nearby problem, but established tools already serve it and your strongest firsthand insight is before the trade.');
  transitionIde(root,{operation:'review',expectedVersion:readPrebuild(root)!.version}); confirm('evaluation');
  say('Crumb','Before committing code, I’d talk to a few people who fit the user we’ve defined. We have possible places to begin, but no verified recruitment permission. Want me to prepare those conversations?');
  say('Founder','Prepare the questions so I can decide.');
  say('Crumb',renderPrebuildDetail(readPrebuild(root)!,'interview'));
  say('Founder','I understand that demand remains uncertain. I would like to review the build-cycle commitment.');
  confirm('act');
  const firstSolutionTurn=turns.length+1;
  say('Crumb',s.id==='stock'?'Now we can discuss an MVP hypothesis: compare a small supplied shortlist using the trader’s stated criteria and retain the reasoning. Live trading, return predictions and broad discovery stay outside this proposal. The concrete scope still needs your approval.':'Now we can discuss a small MVP hypothesis for the confirmed workflow. I’ll preserve the existing project and present a concrete scope for separate approval before implementation.');
  const saved=readPrebuild(root)!;
  // Use the established generic synthetic scope to exercise the action boundary;
  // this does not claim a complete founder-product design or execute the scope.
  saveDraft(root,actionFor(saved)); assert.equal(readWorkflow(root).cycle,null); assert.throws(()=>approvedHandoff(root));
  if(s.entry==='existing') assert.equal(readFileSync(join(root,'README.md'),'utf8'),'# Existing product\nWorking code remains here.\n');
  const transcript=`# ${s.title}\n\nScripted local-core rehearsal. All founder replies are invented. ${s.id==='stock'?'Public observations were inspected; the founder and consent are synthetic.':'Research findings are fictional.'} No outreach, product build or scope approval occurred.\n\n`+turns.map((t,i)=>`## ${i+1}. ${t.role}\n\n${t.text}\n\n_State after this displayed turn: ${JSON.stringify(t.state)}. Act ${t.actLocked?'locked':'unlocked'}; context revision ${t.version}._`).join('\n\n');
  return {id:s.id,title:s.title,turns,transcript,research:renderFullResearch(saved),firstSolutionTurn,finalVersion:saved.version};
}
