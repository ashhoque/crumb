#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { requireTestedRuntime } from '../application/runtime.js';
import { brand } from '../domain/brand.js';
import { readPrebuild, savePrebuild, compactPrebuild, exportPrebuild, importPrebuild, transitionIde } from '../application/prebuild.js';
import { prebuildSections, renderPrebuildSummary, renderPrebuildDetail, renderStartupMaster, renderFullResearch } from './prebuild-render.js';
import { emptyIde, ideSchema, upgradeContext } from '../domain/ide.js';
import * as act from '../application/act.js';
import { actPlanSchema } from '../domain/act.js';
import { renderActSummary } from './act-render.js';
import { compactAct } from '../application/act.js';
import * as learn from '../application/learn.js';
import { notesSchema } from '../domain/learn.js';
import { renderLearnSummary } from './learn-render.js';
import { currentConversation, syncConversationArtifacts, readyToBuild, continueBuild, conversationDetail } from '../application/session.js';
import { prepareWorkPack } from '../application/work.js';
import { confirmedReply } from './conversation-render.js';
import { researchPlan, emptyQuality } from '../domain/evaluation-quality.js';
import { interviewFollowUp } from '../domain/interviews.js';
import { discoveryPlan } from '../domain/first-user-discovery.js';
import type { HostSurface } from '../domain/session.js';

try {
  requireTestedRuntime();
  const { positionals, values } = parseArgs({ allowPositionals: true, strict: true, options: { json: { type: 'boolean', default: false }, section: { type: 'string' }, page: { type: 'string' }, collapsible: { type: 'boolean', default: false } } });
  const [command, action, target, ...extra] = positionals;
  if ((values.section !== undefined || values.page !== undefined || values.collapsible) && !(command === 'internal' && action === 'detail')) throw new Error('Detail options belong only to internal detail.');
  const print = (value: unknown): void => console.log(JSON.stringify(value, null, 2));
  const readInput = async (): Promise<unknown> => {
    let bytes = 0;
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      const buffer = Buffer.from(chunk as Uint8Array);
      bytes += buffer.length;
      const limit = command === 'internal' && ['prebuild', 'restore-context'].includes(action ?? '') ? 307_200 : 65_536;
      if (bytes > limit) throw new Error(`Request exceeds ${limit / 1024} KiB. Retain compact context and selected evidence.`);
      chunks.push(buffer);
    }
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks))); }
    catch { throw new Error('Provide one valid UTF-8 JSON request on stdin. No input was saved.'); }
  };
  if (command === 'doctor' && action === undefined) {
    const { sqliteVersion } = await import('../persistence/sqlite.js');
    print({ product: brand.name, milestone: 'M3-R1', node: process.versions.node, sqlite: sqliteVersion(), platform: process.platform, architecture: process.arch, customerWorkflow: 'conversation IDE; portable handoff; reviewed Work Build Pack; approved stages and human checkpoints; founder-controlled Launch & Learn', customerValidation: 'not established' });
  } else if (command === 'demo' && target === undefined && action !== undefined) {
    const { prepareDemo } = await import('../application/demo.js');
    print(prepareDemo(action));
  } else if (command === 'init' && target === undefined) {
    const { initializeProject } = await import('../application/initialize.js');
    print(initializeProject(action ?? process.cwd()));
  } else if (command === 'status' && target === undefined) {
    const { readWorkflow, compactContext } = await import('../application/workflow.js');
    const { renderStatus } = await import('./render.js');
    const root = action ?? process.cwd();
    if (values.json) print(compactContext(root));
    else {
      const state = readWorkflow(root), prebuild = readPrebuild(root);
      const newerContext = prebuild && (!state.cycle || state.cycle.draft.contractVersion !== 5 || state.cycle.draft.context.hash !== prebuild.hash);
      const currentAction = !state.cycle && state.draft?.draft.contractVersion === 5 && state.draft.draft.context.hash === prebuild?.hash;
      const staged=act.readAct(root);
      const learning=learn.readLearn(root);
      console.log(learning && learn.isLearnCurrent(root,learning) ? renderLearnSummary(learning) : staged && prebuild ? renderActSummary(staged,prebuild.context) : newerContext && !currentAction ? renderPrebuildSummary(prebuild) : renderStatus(state));
    }
  } else if (command === 'backup' && action === 'create' && extra.length === 0) {
    const { createBackup } = await import('../application/backup.js');
    print(createBackup(target ?? process.cwd()));
  } else if (command === 'internal' && action && extra.length === 0) {
    const root = target ?? process.cwd();
    const workflow = await import('../application/workflow.js');
    const render = await import('./render.js');
    const printAct = (saved: ReturnType<typeof act.saveActPlan>):void => print({...compactAct(saved),summary:renderActSummary(saved,readPrebuild(root)!.context)});
    const printLearn = (saved: NonNullable<ReturnType<typeof learn.readLearn>>):void => print({...learn.compactLearn(saved),summary:renderLearnSummary(saved)});
    switch (action) {
      case 'conversation-context': print(currentConversation(root)); break;
      case 'conversation-detail': print(conversationDetail(root,await readInput())); break;
      case 'conversation-refresh': {const s=syncConversationArtifacts(root);print(s?currentConversation(root):null);break;}
      case 'build-transition': console.log(readyToBuild(root,await readInput() as HostSurface)); break;
      case 'continue-build': print(continueBuild(root,await readInput())); break;
      case 'work-pack': printAct(prepareWorkPack(root,await readInput())); break;
      case 'learn-prepare': printLearn(learn.prepareLaunch(root,await readInput())); break;
      case 'learn-notes-schema': print(notesSchema); break;
      case 'learn-import': printLearn(learn.importNotes(root,await readInput())); break;
      case 'learn-organize': printLearn(learn.organizeNotes(root,await readInput())); break;
      case 'learn-summarize': printLearn(learn.summarizeLearning(root,await readInput())); break;
      case 'learn-decide': printLearn(learn.decideLearning(root,await readInput())); break;
      case 'learn-context': {const s=learn.readLearn(root);print(s?{...learn.compactLearn(s),current:learn.isLearnCurrent(root,s)}:null);break;}
      case 'learn-pack': {const s=learn.readLearn(root);if(!s)throw new Error('Prepare the launch from the reviewed MVP first.');print(s.record.pack);break;}
      case 'learn-dossier': print(learn.readLearn(root)); break;
      case 'act-schema': print(actPlanSchema); break;
      case 'act-plan': printAct(act.saveActPlan(root,await readInput())); break;
      case 'act-approve': printAct(act.approveActPlan(root,await readInput())); break;
      case 'act-pack': printAct(act.generateBuildPack(root,await readInput())); break;
      case 'act-result': printAct(act.recordActStage(root,await readInput())); break;
      case 'act-review': printAct(act.reviewActStage(root,await readInput())); break;
      case 'act-handoff': print(act.actHandoff(root)); break;
      case 'act-context': {const saved=act.readAct(root);print(saved?compactAct(saved):null);break;}
      case 'act-dossier': print(act.readAct(root)); break;
      case 'schema': print(ideSchema); break;
      case 'evaluation-plan': {const s=readPrebuild(root);if(!s||s.context.contractVersion!==2)throw new Error('Use the saved intention, user and problem to begin the research plan.');print(researchPlan(s.context));break;}
      case 'interview-followup': {
        const input=await readInput();
        if(!input||typeof input!=='object'||!('answer' in input)||typeof input.answer!=='string'||!input.answer.trim()||input.answer.length>4000)throw new Error('Use one relevant, minimized answer to suggest the next interview question.');
        print({question:interviewFollowUp(input.answer),recorded:false});break;
      }
      case 'discovery-plan': {const s=readPrebuild(root);if(!s||s.context.contractVersion!==2)throw new Error('Use the confirmed current IDE context to prepare first-user discovery.');print(discoveryPlan(s.context));break;}
      case 'template': {
        const saved = readPrebuild(root);
        print(saved ? { ...(saved.context.contractVersion === 1 ? upgradeContext(saved.context) : saved.context), expectedVersion: saved.version } : {...emptyIde(),quality:emptyQuality()}); break;
      }
      case 'ide': { const input=await readInput();const saved = transitionIde(root,input);const confirming=!!input&&typeof input==='object'&&'operation'in input&&input.operation==='confirm';const summary=confirming&&saved.context.contractVersion===2&&saved.context.ide.confirmations.at(-1)?.subject==='act'?readyToBuild(root,{host:'codex',canExecute:true,sharedProjectFiles:true}):confirming?confirmedReply(saved):renderPrebuildSummary(saved);print({ version: saved.version, hash: saved.hash, context: compactPrebuild(saved), summary }); break; }
      case 'prebuild': {
        const input = await readInput();
        if (!input || typeof input !== 'object' || !('contractVersion' in input) || input.contractVersion !== 2) throw new Error('Use internal template for current IDE v2. Legacy exports remain readable historical data.');
        const saved = savePrebuild(root, input);
        print({ version: saved.version, hash: saved.hash, context: compactPrebuild(saved), summary: renderPrebuildSummary(saved) }); break;
      }
      case 'dossier': print(readPrebuild(root)); break;
      case 'export-context': print(exportPrebuild(root)); break;
      case 'restore-context': print(compactPrebuild(importPrebuild(root, await readInput()))); break;
      case 'master': {
        const saved = readPrebuild(root);
        if (!saved) throw new Error('No pre-build context yet.');
        console.log(renderStartupMaster(saved)); break;
      }
      case 'research': {
        const saved = readPrebuild(root);
        if (!saved) throw new Error('No pre-build context yet.');
        console.log(renderFullResearch(saved)); break;
      }
      case 'inspect': {
        const { inspectArtifacts } = await import('../privacy/artifacts.js');
        print(inspectArtifacts(root, await readInput())); break;
      }
      case 'draft': {
        const saved = workflow.saveDraft(root, await readInput());
        print({ ...saved, summary: render.renderSummary(saved), review: render.renderDraft(saved) }); break;
      }
      case 'approve': print(workflow.approveDraft(root, await readInput())); break;
      case 'receipt': print(workflow.recordReceipt(root, await readInput())); break;
      case 'context': print(workflow.compactContext(root)); break;
      case 'review': {
        const learning=learn.readLearn(root);if(learning&&learn.isLearnCurrent(root,learning)){console.log(renderLearnSummary(learning));break;}
        const state = workflow.readWorkflow(root);
        const saved = readPrebuild(root);
        const staged = act.readAct(root);
        if(staged && saved){console.log(renderActSummary(staged,saved.context));break;}
        const currentAction = !state.cycle && state.draft?.draft.contractVersion === 5 && state.draft.draft.context.hash === saved?.hash;
        console.log(saved && !currentAction && (!state.cycle || state.cycle.draft.contractVersion !== 5 || state.cycle.draft.context.hash !== saved.hash) ? renderPrebuildSummary(saved) : render.renderStatus(state)); break;
      }
      case 'detail': {
        const section = values.section ?? 'why';
        const prebuild = readPrebuild(root);
        if (prebuild && prebuildSections.includes(section as typeof prebuildSections[number])) {
          console.log(renderPrebuildDetail(prebuild, section as typeof prebuildSections[number], Number(values.page ?? 1), values.collapsible)); break;
        }
        if (!render.detailSections.includes(section as typeof render.detailSections[number])) throw new Error('Choose why, definition, evidence, research, competitors, sources or checks.');
        const state = workflow.readWorkflow(root);
        if (!state.draft) throw new Error('No draft yet. Begin with the short first interaction.');
        console.log(render.renderDetail(state.draft, section as typeof render.detailSections[number], Number(values.page ?? 1), values.collapsible, state.cycle !== null, state.latestReceipt)); break;
      }
      case 'handoff': console.log(render.renderHandoff(workflow.approvedHandoff(root))); break;
      default: throw new Error('Unknown internal operation. Use the skill reference; no action was taken.');
    }
  } else {
    throw new Error(`Usage: cec doctor | init [folder] | status [folder] [--json] | backup create [folder]. Use $${brand.skill} for the conversation.`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'CEC operation failed. No success was recorded.');
  process.exitCode = 1;
}
