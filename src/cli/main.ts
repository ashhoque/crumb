#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { requireTestedRuntime } from '../application/runtime.js';
import { brand } from '../domain/brand.js';
import { readPrebuild, savePrebuild, compactPrebuild, exportPrebuild, importPrebuild } from '../application/prebuild.js';
import { prebuildSections, renderPrebuildSummary, renderPrebuildDetail, renderStartupMaster, renderFullResearch } from './prebuild-render.js';
import { emptyPrebuild, prebuildSchema } from '../domain/prebuild.js';

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
    print({ product: brand.name, milestone: 'M1-R2', node: process.versions.node, sqlite: sqliteVersion(), platform: process.platform, architecture: process.arch, customerWorkflow: 'pre-build evaluation with permitted host research; existing first-cycle build path', customerValidation: 'not established' });
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
      const newerContext = prebuild && (!state.cycle || state.cycle.draft.contractVersion !== 4 || state.cycle.draft.context.hash !== prebuild.hash);
      const currentAction = !state.cycle && state.draft?.draft.contractVersion === 4 && state.draft.draft.context.hash === prebuild?.hash;
      console.log(newerContext && !currentAction ? renderPrebuildSummary(prebuild) : renderStatus(state));
    }
  } else if (command === 'backup' && action === 'create' && extra.length === 0) {
    const { createBackup } = await import('../application/backup.js');
    print(createBackup(target ?? process.cwd()));
  } else if (command === 'internal' && action && extra.length === 0) {
    const root = target ?? process.cwd();
    const workflow = await import('../application/workflow.js');
    const render = await import('./render.js');
    switch (action) {
      case 'schema': print(prebuildSchema); break;
      case 'template': {
        const saved = readPrebuild(root);
        print(saved ? { ...saved.context, expectedVersion: saved.version } : emptyPrebuild()); break;
      }
      case 'prebuild': {
        const saved = savePrebuild(root, await readInput());
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
        const state = workflow.readWorkflow(root);
        const saved = readPrebuild(root);
        const currentAction = !state.cycle && state.draft?.draft.contractVersion === 4 && state.draft.draft.context.hash === saved?.hash;
        console.log(saved && !currentAction && (!state.cycle || state.cycle.draft.contractVersion !== 4 || state.cycle.draft.context.hash !== saved.hash) ? renderPrebuildSummary(saved) : render.renderStatus(state)); break;
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
