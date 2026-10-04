# M3-R3 — founder intelligence, voice and project context

Status: **PASS WITH WARNINGS**, subject to the GitHub closeout record below.
M4 was not started. These are synthetic host conversations, not
real founder or customer validation.

## Runtime trace and voice root cause

Codex sees the scoped global `AGENTS.md` entry, then the global Crumb wrapper at
`C:\Users\Ash\.agents\skills\crumb\SKILL.md`. That wrapper opens the canonical
source at `C:\Users\Ash\Documents\Codex\CEC\.agents\skills\crumb\SKILL.md`.
The repository skill can also be passed directly in a host turn. The Node build
compiles TypeScript and copies contracts; it does not generate the skill. The MCP
configuration points to compiled `dist/src/cli/mcp.js` in the global source
checkout. No assembled host prompt dump is exposed by this test interface, so
the final composition was verified through actual visible host turns.

Before M3-R3, a live synthetic turn said it had found the installed skill and
was following its workflow. Putting a stronger rule at the top of the source
skill alone did not stop progress-message narration. A scoped global host entry
instruction then made progress messages speak directly as Crumb; the pricing
and four other synthetic conversations showed no skill/workflow identity leak.
The host-level rule also directs Codex to open a supplied skill path instead of
searching for one. Product method stays in the skill.

## Implemented behavior

- The active skill now calls for a warm, opinionated teammate voice in all
  user-visible messages, evidence-earned excitement, constructive pushback and
  one useful next move. It keeps a tentative founder working model and notices
  adjacent opportunities without presenting a weak signal as a pivot.
- `project-bootstrap` reads a small set of high-information project files and
  up to three targeted paths. It excludes private/linked paths, caps read size,
  returns path hashes, and suppresses unchanged content when a snapshot is reused.
  Source text is data, not instructions.
- `working-context` applies bounded deltas for project facts, founder facts,
  source hashes and a calibrated opportunity. Facts have
  known/inferred/stale/unknown status, confidence and provenance. It is included
  only with explicitly resumed compact IDE context; new chats default to clean
  idea context. A different conversation cannot overwrite it without explicit
  resume. Working notes do not create confirmations or Act permission, and
  updates after Act confirmation are refused to preserve the handoff.
- `founder-move` returns a fast path for simple turns, at most two project passes
  for bootstrap, and one research batch plus an optional follow-up for a material
  external gap. The host still judges materiality. Opportunity levels require
  independent and direct evidence before recommending a test.
- Research guidance now requires opening a vendor page before quoting a precise
  current price. Search snippets alone cannot establish that figure.

## Focused and full checks

Pinned Node 24.19.0 build passed. Focused M3-R3, M3-R2 research and M3-R1
closeout checks passed **17/17**. The final full suite passed **320/320** with
zero failures, skips or cancellations. Tests cover bounded bootstrap and reuse,
CLI read-only behavior, compact/delta working notes, fresh/resume isolation,
confidence rules, opportunity levels, research budget and existing Act guards.
The installed-host harness records every visible message, identity leaks,
tool events and approximate elapsed time.

## Live synthetic host acceptance

- **Pricing / existing app:** Crumb read the beta description and package data,
  recommended editor-paid access and a testable starting offer without a new
  founder intake. A bounded live-web replay used one three-query search batch
  and one vendor-page opening before quoting an exact comparison. Approximate
  elapsed: 53 seconds without web; 109 seconds with live web.
- **Feature obsession:** Crumb challenged two unsupported features and steered
  toward recent user workflows. A warm second turn took 6.2 seconds and no
  commands. It still repeated an unanswered ambition question; see warnings.
- **Research surprise:** It identified repeated approval chasing and paid
  workarounds as a testable adjacent pain, without calling synthetic notes
  validated demand. Approximate elapsed: 60 seconds.
- **First payment:** It reacted with genuine excitement, explained what one
  payment supports and what it does not, and proposed watching the next real
  revision cycle. Approximate elapsed: 62 seconds.
- **Simple clarification:** The warm follow-up answered in one sentence with
  no commands or research in 2.6 seconds. A cold first invocation took 33
  seconds while the host loaded its skill context.

Fresh-chat isolation, explicit resume and Act protection also passed the focused
Core/CLI/MCP regressions. The actual-host existing-project/resume path was
exercised again through the **global wrapper** after syncing the canonical
source checkout to the development commit. Across its pricing, simple and
existing-project/resume turns, the installed host reported zero identity leaks.
The pricing follow-up took 6.5 seconds with no commands; the simple follow-up
took 1.9 seconds with no commands. “Looks good, don't build yet” left Act
unconfirmed, and explicit resume recovered the relevant decision without
recreating the history.

## Warnings

- In a two-turn feature conversation, Crumb repeated an unanswered ambition
  question after the founder moved to feature requests. One targeted instruction
  correction did not remove it; further prompt repair stopped under repository
  guidance. This needs another alpha trial.
- Cold host setup remains 10–62 seconds in these isolated scenarios, and the
  live-web pricing turn took about 109 seconds. Warm ordinary follow-up was
  2.6 seconds with zero commands. No claim of general model-latency improvement
  is made; timings are approximate and host-dependent.
- Synthetic conversations and public pricing comparisons cannot establish real
  customer demand or willingness to pay. Host semantics and unscripted founder
  voice still need human evaluation.

## Files and installation

Core/CLI: `src/application/project-bootstrap.ts`,
`src/application/prebuild.ts`, `src/domain/founder-intelligence.ts`,
`src/domain/ide.ts`, `src/domain/session.ts`, `src/cli/main.ts`.
Skill/host: `.agents/skills/crumb/SKILL.md`, its `references/local-tools.md`
and `references/research.md`, `scripts/verify-closeout-host.mjs`, and this
machine's scoped global `C:\Users\Ash\.codex\AGENTS.md` entry.
Tests/docs: `tests/m3r3-founder.test.ts`, `AGENTS.md`, `PLAN.md`, `STATUS.md`,
`MANUAL_SETUP.md`, this report. The global wrapper is retained; the canonical
source checkout must be synchronized to completed `main`.

## GitHub closeout

- Development branch: `m3-r3`.
- Revision commit: `0ade360be54618068984a20981a218dc606a46df`.
- Development branch pushed to `origin/m3-r3`; final documentation commit pending.
- Merge/resulting main commit and push: pending.
- Final verification on `main`: pending.
- Global source checkout on `m3-r3`, rebuilt with pinned Node; focused
  installation checks passed 9/9. Actual global-wrapper host discovery and
  synthetic pricing/fast/resume/Act checks passed with zero identity leaks.

## Five manual alpha prompts

1. “We got our first paid signup today. Are we finally onto something?”
2. “Here’s my existing app. Read what matters and help us pick a first price.”
3. “We’re choosing a payment model. What current public facts should we check?”
4. “Users keep paying assistants to chase approvals. Is that a stronger wedge?”
5. “I want to add three more features before talking to customers. Push back if I’m fooling myself.”
