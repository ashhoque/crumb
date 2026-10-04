# M3-R2 — first-alpha interaction revision

Status: **PASS WITH WARNINGS**. Scope is initiative, grounding, direct voice,
conversation isolation and latency. M4 was not started.

## Root causes and changes

- The skill began by reading the repository's latest saved context, and the MCP
  and CLI exposed that same context without a current-chat continuation decision.
  Fresh CLI and MCP reads now return no saved idea. Explicit continuation uses
  `--resume` or a scoped MCP read with the current conversation identifier. A
  fresh template cannot overwrite the previous saved idea because revision
  concurrency checks reject it.
- Proactive research was host guidance without a decision-level bound. The skill
  now asks whether a missing external fact materially affects the immediate
  decision, investigates it when useful, reuses current evidence and stops after
  enough support. The offline `research-decision` operation has a zero-research
  path and a three-query/six-page initial cap. It does not perform web research.
- External figures could be stated too precisely for their source. The skill now
  requires source, retrieval date, entity and relevant locality. Core classifies
  inspected public listings separately from directly verified current evidence,
  estimates and unverified claims. Missing city/region triggers the minimum
  locality question rather than an arbitrary branch choice.
- Crumb's active instructions now prohibit user-facing skill/state/tool narration,
  favor natural collaborative language and put one or two predictable useful
  facts beside the immediate answer. Ordinary turns should avoid history/repo
  reads and research calls when no material external gap exists.

## Files changed

Core and entry points: `src/application/read-context.ts`,
`src/domain/research-decision.ts`, `src/cli/main.ts`, `src/cli/mcp.ts`, `cec.ps1`.
Voice and host instructions: `.agents/skills/crumb/SKILL.md` and
`references/local-tools.md`, `references/modes.md`, `references/research.md`
under that skill. Verification: `tests/m3r1-closeout.test.ts`,
`tests/m3r2-research.test.ts`, `tests/session.test.ts`, and
`scripts/verify-closeout-host.mjs`. Current docs: `PLAN.md`, `STATUS.md`, this report.

## Verification and acceptance

- Pinned Node 24.19.0 build passed. Focused final-state run: **38/38**, including
  fresh/resume isolation, no overwrite, bounded MCP/CLI behavior, research
  decisions, provenance/locality, natural confirmation and Act protection.
- Full `npm run check`: **314/314**, zero failures or skips. It ran before the last
  narrow evidence-classification and isolation-test edits; the focused rerun
  covered those edits. Final full verification on merged `main` is reported in
  the revision closeout.
- A/B (identity/collaboration): active skill and existing conversation render
  regression checks; host-model phrasing still needs an unscripted trial.
- C/D/E/F/J (money, competition, uncertainty, locality, bounds): synthetic Core
  planner and evidence-classification checks passed. Actual public lookup remains
  host work and was not claimed as a live research result.
- G/H/I (fresh chat, explicit resume, fast path): CLI and MCP synthetic entry
  point checks passed; fresh reads avoid opening saved idea data and zero-gap
  planning does not initialize a project.
- K/L (Act hold and natural assent): preserved regression checks passed.

## Warnings and next tester conversations

The host must recognize explicit continuation and supply the current chat scope;
Core cannot authenticate a model's interpretation of the founder's words. New
ideas in a repository with an older saved idea need a separate project context
before persistence; this revision prevents accidental overwrite but does not add
multi-idea storage to one database. Live web research quality and actual response
time depend on the host and were not measured by remote wall-clock tests.

1. Start a different business idea in the same repository after a developed one;
   check that Crumb never mentions the old customer or Act readiness. Then ask
   explicitly to resume the old idea and check that only the relevant state returns.
2. Discuss a product pricing or positioning decision without requesting research;
   check whether Crumb finds a few current public alternatives, qualifies exact
   prices and gives a concise recommendation.
3. Give a simple clarification that needs no public facts, then say "Looks good,
   but don't build yet." Check that the answer stays quick and conversational,
   adds no research dump and leaves Act closed.
