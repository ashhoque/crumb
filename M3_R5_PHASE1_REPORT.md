# M3-R5 Phase 1 — ASTRA REVIEW PACKET

**Status:** implementation and installed-skill acceptance candidate for separate
Astra review. Development branch `m3-r5-phase1`; no M4 work or `main` merge.
`main` remains at M3-R4 commit `f188f03f14b13a97d3f66879432a23fb392e4205`.

## Root causes and runtime path

The prior conversation guidance required individual foundation confirmations before
research, delaying Market Pulse, first-user work and a business recommendation.
The active skill was also a global wrapper around a long repository skill, while
project-local aliases remained discoverable. The old wrapper left an implicit
invocation policy behind. These entry paths created contradictory timing and
identity guidance. The installed host loads the global skill, then uses
`src/domain/guide.ts`, `src/application/prebuild.ts` and `src/domain/ide.ts` for
canonical next-step and consent decisions. Existing Market Pulse, founder model,
first-user engine, project snapshot and research contracts remain in place.

The branch now keeps the versioned source at `skill/crumb/`. Installation copies
its eight files directly to `C:\Users\Ash\.agents\skills\crumb`, verifies
hashes, and removes the known stale policy. The previous aliases are preserved
only in `docs/legacy-skills/`. The active skill is 1,378 words and loads
specialist references when relevant. The host inventory found one enabled
global `crumb` skill and no active local or legacy aliases. The installation
checkout at `C:\Users\Ash\Documents\Codex\CEC` tracks the Phase 1 branch;
its pre-existing untracked setup note was preserved.

## Behavior delivered

- **Business abstraction and direction:** A founder can describe an idea in
  ordinary language. Crumb forms a working user/problem interpretation, checks
  current public signals and recommends a narrow direction and next reversible
  move. IDEAL stays internal.
- **Autonomy ladder:** Reuse current context, inspect a few permitted files,
  investigate a material gap, synthesize, prepare a test or outreach draft, then
  seek founder judgment. External sends and build remain separate approvals.
- **Provisional research:** Known draft intention/user/problem now route to
  investigation before three confirmation turns. One displayed working thesis
  may collect foundation review and, only after full Evaluation quality checks,
  Evaluation review. An ambiguous reply or stale thesis cannot create receipts.
  `Looks good, but don't build yet` never approves Act.
- **Market, numbers and first users:** The direct skill activates a bounded
  early Market Pulse, seeks sourced numeric anchors, distinguishes anecdote from
  market size, chooses a likely narrow user, and prepares first-user work. The
  existing claim schema retains metric value, unit, period and source links;
  research sources retain retrieval date. No new market or outreach engine was
  added.

## Installed-skill observations

These are synthetic founder conversations through the installed Codex host,
not real customer interviews or evidence of demand. All ten read-only MCP tools
were exercised. The host used its configured model; no model override was set.

| Flow | Questions / research timing | Observed result | Wall time |
| --- | --- | --- | --- |
| Ordinary-language voice-note idea | 1 question, 3 web actions on turn 1; 0 questions, 4 web actions after firsthand context | Reframed from transcription to decisions and owners after construction site walks; named a narrow PM segment, an anecdotal 10–15 minute burden, relevant alternatives and a next test. No TAM claim. | 73 s + 194 s |
| Existing Reviewlane beta | 2 visible question marks, 5 web actions on turn 1; 0 questions and no web on turn 2 | Found a client-simple editor wedge, cited current competitor prices, proposed a small trial, and used two founder-known editors as the immediate first-user route. No message sent. | 88 s + 3 s |
| Reviewed stock-comparison, no build | 0 questions, no web | Recommended user learning while the saved Act state remained unapproved; spoke directly as Crumb. | 33 s |

The founder supplied no research instructions, startup jargon, pricing metric,
channel choice or outreach script in these flows: **zero methodology prompts**.
The editor case's first-turn two question marks include a founder-intent question
and a later thesis-review question. The first-user route was derived from the
founder's two existing contacts. One run drafted an exact invitation; the final
retest instead prepared the interview ask and next trial. Public discussion and
vendor prices were treated as signals, not customer proof. Example price anchors
in model output included a US$15/month Frame.io plan and a US$19 one-time
template; current prices require renewed source checks before use in a real
business decision.

Live transcripts and tool timings:

- `C:\Users\Ash\Documents\Codex\CEC\.m0-local\closeout-host-1791150973331\results.json` — two-turn autonomy and pricing retest; its old wording detector produced one false identity-leak flag on an ordinary outreach phrase.
- `C:\Users\Ash\Documents\Codex\CEC\.m0-local\closeout-host-1791151466454\results.json` — corrected pricing/first-user retest, completed with zero identity leaks.
- `C:\Users\Ash\Documents\Codex\CEC\.m0-local\closeout-host-1791151591770\results.json` — final no-build flow, completed with zero identity leaks.

## Verification and branch state

Focused M3-R3/R4/R5 checks: **17/17**. IDE and Act regressions: **72/72**.
Conversation/quality regressions after updating old confirmation-first
expectations: **18/18**. Full supported Node 24.19.0 check: **331/331**,
zero failures or skips. The global installation hash check passed for all eight
files. The implementation commits are `b73233a` (provisional research), `6c57f96`
(direct skill and thesis review), `5c57aa6` (live founder follow-up), and
`8cd123e` (acceptance detector correction); each was pushed to
`origin/m3-r5-phase1`. This report closes the branch documentation. No force
push. `main` was not changed.

## Warnings and Astra judgments

The 194-second research turn is too slow for an ordinary founder conversation.
The live host did useful research, but a fresh synthetic conversation did not
persist its provisional thesis into the IDE store; continuity depended on that
chat. The source code supports one thesis receipt, but the live model did not
exercise that transition in the fresh flow. First-user work used founder-known
contacts and interview preparation; it did not produce a verified candidate
shortlist or send anything. Quantitative market size remains unknown, correctly,
because this research did not establish a sourced population and spending base.

Astra should judge whether one concise thesis is sufficient founder review for a
complete Evaluation receipt, whether the live host should persist provisional
work earlier, and how to reduce web-research latency without sacrificing the
source checks. The founder requested GPT-5.6 Sol High for Phase 1; this task's
configured model could not be changed in-session, and the live host used its
configured default. That model mismatch should be considered in review.
