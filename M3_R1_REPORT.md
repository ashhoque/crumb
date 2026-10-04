# Focused M3-R1 product-quality correction — 27 September 2026

**M3-R1 PASS WITH WARNINGS.** Final TypeScript build and **298/298 tests passed**,
zero failures/skips; exit 0. This is the authorized focused correction within
M3-R1, not a new milestone. Work is stopped pending founder feedback.

## Result

1. **Personality:** acknowledgements reflect the intention and what was clarified;
   no automatic hype. Safe preferred/host-approved display names have explicit
   provenance and are used occasionally. Natural confirmations and ambiguity
   handling remain intact.
2. **Conversation UX:** conclusion first, one next question, short ordinary turns,
   optional research detail. Competitor summary punctuation and duplicate labels
   are cleaned up. An interview recommendation offers the guide or build commitment
   without appending the full commitment recap immediately.
3. **Founder effort:** the research plan assigns investigation to Crumb. Founder
   questions concern intent, experience, access and constraints. A conservative
   guard catches common implementation questions delegated to the founder; the
   host remains responsible for semantic judgment. Existing-project feasibility
   requires permitted repository observations, using existing file/hash checks.
4. **Technical Evaluate:** retained coverage addresses data/APIs, freshness/quality,
   licensing/access, rate/cost, integrations, complexity/latency, model versus
   deterministic work, failures, security/privacy and vendor/build-buy. At most
   three options and a rationale connect to the evidence. The central risk is
   surfaced briefly; the full technical view is optional and paginated.
5. **YC behavior:** research uses problem lenses without fake scoring, records
   founder edge and its limits, recommends direct learning for behavioral unknowns,
   and carries a smallest-useful-test/manual-alternative challenge into the pack.
   These are decisions and guidance, not a founder-facing rubric or lecture.
6. **Competitors:** the ordinary Evaluation now surfaces a competitor's strengths,
   friction and possible gap. Existing breadth, traction facts/proxies, source
   provenance and repetition checks are retained. The stock refresh explicitly
   distinguishes one anecdote from consensus and includes current counterevidence.
7. **First users:** a specific source-supported avenue appears before Act, with
   relevance and participation limits, without requiring a founder request.
8. **Interviews:** the main guide retains difficulty, latest occurrence, why,
   attempted remedies and dissatisfaction. Freeform pitch/pricing questions no
   longer replace or extend the discovery framework. Answer-led follow-ups are
   suggested one at a time; the helper stores/sends nothing. Interviews remain
   optional and no new Act gate was introduced.

The quality contract is optional for historical compatibility and included in fresh
native templates. Host guidance adopts it for new/materially refreshed research.
Once saved it cannot be dropped. Its changes invalidate Evaluation and Act, while
preserving unchanged Intention/User/Problem. Compact context retains only the
summary/risk/founder-fit/learning; full coverage stays with cached research. The
Build Pack reuses these findings instead of asking the founder to reconstruct them.

## Stock rehearsal

**PASS.** [Executed transcript](docs/development/M3_R1_QUALITY_STOCK_REHEARSAL.md).
Founder dialogue, display name and the changed-problem turn are synthetic. Actual
public research is documented separately in the [source notes](docs/development/M3_R1_QUALITY_RESEARCH.md).
Eight inspected pages refresh the technical/competitor/habitat questions; prior
landscape evidence remains historical, not newly revalidated in full.

- Confirmed user: US self-directed swing traders maintaining a momentum/growth
  shortlist and comparing candidates in scheduled evening/weekend reviews.
- Confirmed pain: repeated synthesis of scattered technical, sector, fundamental
  and catalyst notes makes comparison reasoning inconsistent. The synthetic
  clarification narrows this to a repeatable rationale, not live buying signals.
- Crumb investigates the data interpretation, presents options and risk, and
  proactively mentions r/swingtrading with unverified participation rules. No
  founder database/API/community-design question is asked.
- Delayed holdings are not live institutional buying. Existing charting/screening
  capabilities challenge broad missing-feature claims. The founder's reported
  experience/access are plausible help, not verified advantage or demand.
- Conversations are recommended about the actual comparison behavior. The correct
  five-concept guide precedes the final commitment. A changed problem invalidates
  the affected confirmations; unchanged intention/user are preserved, then the
  problem and Evaluation are confirmed again before explicit Act.
- Current context/handoff survives the same-Project transition wording and local
  build continuation. All six documents are generated for review. The proposed
  scope is one supplied-fact comparison journey with two capabilities: compare
  supplied facts and retain one review note. Live prices and a portfolio dashboard
  stay parked. No product code executes before pack approval.
- No users recruited, outreach sent, interviews held, payments received, returns
  predicted or customer validation claimed. This is a scripted core/renderer test,
  not an independent or unscripted host-agent trial.

## Verification actually run

Pinned Node **24.19.0**. Commands ran in the existing CEC repository:

```powershell
& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/check.mjs
```

The check compiles TypeScript and runs every compiled test through the existing
network-denying offline guard. Final result: **298 passed / 0 failed / 0 skipped**,
143116.9994 ms; exit 0. The unchanged pre-edit baseline was 286/286, 141886.6575 ms.
The focused test file passed 12/12; the intermediate compatibility subset passed
61/61. An earlier complete run also passed 298/298, then the final suite was rerun
after the short interview-offer adjustment.

Focused command after building:

```text
node --import ./scripts/offline-guard.mjs --test --test-reporter=tap dist/tests/evaluation-quality.test.js
```

The full suite covers all M1-R3 gates/invalidation, M2 fresh/existing/stock real-edit
and real-test fixtures, M3 scenarios A–F, and M3-R1 compact context, natural assent,
stale handoffs, six-document packs, failed-check stops and human checkpoints.
New tests cover research ownership, technical completion/provenance, repository
inspection, quality retention/invalidation, safe occasional names, proactive habitats,
cached detail, correct/adaptive interviews, optional learning and the stock loop.
Initial fixture duplicate-source records and review-path assertions were corrected;
no failing test is reported as a pass. Actual commercial APIs were not called.

[Machine-readable verification](docs/development/M3_R1_QUALITY_VERIFICATION.json)
records counts and preservation. `git diff --check` passed. Baseline hashes show
no missing snapshotted files and no changes to historical milestone fixtures or
M1-R3/M2/M3 reports. Existing dirty work/history was preserved on main at
`c218317a2b17d6f4a7194ef5c875b5d26ed48d48`. No scaffold, dependency change, groundwork
rerun, schema migration, commit or push occurred. Private root conversation artifacts,
customer evidence and credentials were not inspected or modified for this correction.

## Files changed in this correction

- Domain: `evaluation-quality.ts` and `interviews.ts` added; `ide.ts`, `guide.ts`,
  `session.ts` updated.
- Application: `prebuild.ts`, `session.ts`, `work-pack.ts` updated.
- CLI: `main.ts`, `prebuild-render.ts`, `conversation-render.ts` updated.
- Tests/fixture: `tests/evaluation-quality.test.ts`, `fixtures/m3r1-quality/stock.json`.
- Guidance: Crumb SKILL.md and research, interviews-master, local-tools, act references.
- Active docs: PRODUCT_SPEC v0.12, PLAN, STATUS, AGENTS, README, this report,
  M3_R1_QUALITY_TEST_GUIDE and docs/development index, contract, research,
  stock transcript and verification. Earlier report content is preserved below.

## Warnings and next step

- A host still conducts research, chooses wording and interprets meaning. Structural
  references and keyword guards do not prove truth or cover every possible question.
  Legacy records without quality are readable, not retroactively certified under
  the new technical contract. Do not fabricate a backfill.
- The stock refresh is bounded. Real user pain, willingness to pay, community access,
  commercial data rights/cost and measured API reliability remain unverified.
- ChatGPT/Claude/Cursor remain honest text/portable adapters, not native connectors
  or cloud sync. Existing same-local-project execution boundaries are unchanged.
- Automated/scripted results cannot establish conversational enjoyment or customer
  validation. No hosted backend, billing, CRM, autonomous outreach, extra trading
  features, multi-agent organization or later milestone was added.

**Exact next step:** run one unscripted disposable-project trial using
[M3_R1_QUALITY_TEST_GUIDE.md](M3_R1_QUALITY_TEST_GUIDE.md). Judge warmth, unnecessary
questions, proactive research/habitats, technical clarity and the corrected interview
guide; then report what felt wrong. Do not automatically start another milestone.

---

## Original M3-R1 architecture delivery (historical)

# M3-R1 — Conversation Mode to Work/Build Mode

Status: **M3-R1 PASS WITH WARNINGS**. Final suite: **286/286 passed**, zero
failures/skips; exit 0. Stop before any later revision or M4.

## Implementation

Continued the existing repository on main, preserving HEAD
`c218317a2b17d6f4a7194ef5c875b5d26ed48d48`, the existing dirty working tree and
M0/M1/M1-R/M1-R2/M1-R3/M2/M3 history. No scaffold, reset, dependency change,
Crumb groundwork rerun, commit, push or later milestone was performed.

Reused the IDE confirmations/invalidation, compact guidance, research provenance,
selected-file privacy checks, Act scope/stage journal, hashed build packs, real
host receipts and all existing regression fixtures. No database migration is added.

- **Conversation:** natural assent to the current presentation, semantic host
  interpretation for other clear equivalents, ambiguity/conditional-negative veto,
  specific short acknowledgements and proactive progression. Explicit preferred
  names remain optional. All five IDE gates and source-turn/current-presentation
  checks remain. Final Act assent saves context/handoff, not code authorization.
- **Current context:** owned CRUMB_CONTEXT.md/json, separate CRUMB_RESEARCH.json,
  and a provider-neutral session manifest. Ordinary reads return current facts and
  guidance; selected evidence IDs retrieve deeper saved support. Research is reused
  unless material change, freshness, coverage or a founder request justifies refresh.
- **Handoff:** BUILD_HANDOFF.md/json carries the exact confirmed foundation,
  Evaluation, opportunity, constraints, uncertainty, references, project/revision
  and Act receipt. Edited/unowned artifacts are preserved; missing/stale files
  prevent continuation. Context saved in SQLite remains recoverable after a file
  conflict; the error identifies what to resolve/refresh.
- **Transition:** capability-aware ChatGPT wording says to open Work in the same
  Project and send **Continue the Crumb build.** It never claims to open the chat.
  Missing shared file access is explicitly reported. Internally the modes are
  conversation/build; Claude/Cursor/portable wording shares the same domain state.
- **Build continuation:** verifies the current handoff and context, Act consent and
  selected repository before preparing scope. Existing projects require permitted
  inspection; fresh empty repositories do not invent files to inspect. No transcript
  or re-entry of the startup is required.
- **Build Pack:** one operation produces Startup Master, Red Team, Technical Master,
  Business Master, Groundwork and Build Plan, plus stage instructions. All six share
  the confirmed intention/user/problem. The master contains WHAT/WHY/HOW, retained
  challenges, sources, uncertainties and scope boundaries. Technical guidance retains
  the customer stack with earned scale triggers. Commercial assumptions/fees remain
  labeled; current research is required through the host when decision-critical.
- **Execution:** the founder approves the exact pack/scope and automatic-stage policy.
  Passing exit criteria can advance preapproved stages; failure stays on the current
  stage. Declared human checkpoints, intended stop and final MVP cannot auto-advance.
  Human instructions ask for the normal flow, a bad input and confusing parts.
  Passing software tests remains distinct from customer validation and release.

## Interfaces and compatibility

New internal operations: conversation-context, conversation-refresh,
conversation-detail, build-transition, continue-build, work-pack. Existing IDE/Act
commands, SQLite identifiers and historical records remain compatible. New plans
may carry provider-neutral execution metadata binding a handoff hash, automatic
policy and human checkpoints. Already-existing M2 plans without that metadata
retain manual review after every stage. The updated native skill selects R1 for new
guided work; the legacy API remains available for compatibility, not as a native
workflow shortcut around the new transition.

## Verification

All checks used the pinned Node 24.19.0 runtime. The full check command was:

```powershell
& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' scripts/check.mjs
```

The check compiles TypeScript, then runs the actual test suite under the existing
offline guard. No live market/customer data or external communications were used.

| Run | Result |
| --- | --- |
| Unchanged baseline before implementation | 270/270 passed; 0 failed/skipped |
| Compatibility run after initial changes | 270/270 passed; 0 failed/skipped |
| New R1 targeted tests during development | Caught empty-project inspection rejection; fixed. Also corrected heading/error-text expectations. |
| First expanded full run | 284/286 passed; two outdated doctor/clarification expectations corrected |
| Final full run | 286/286 passed; 0 failed/cancelled/skipped; exit 0; 141,742.481 ms |
| TypeScript | Compiled successfully for the final run |
| Git whitespace check | Exit 0 |

Sixteen new R1 tests cover natural/semantic assent, ambiguity, each missing IDE gate,
context/provenance reuse and selective retrieval, explicit name handling, ChatGPT
wording and unsupported capabilities, edited/missing/stale context, cross-project
ownership, six coherent pack documents, tamper rejection, CLI continuation and real
stage execution. Existing M1-R3/M2/M3 tests retain their substantive gates; only
intentional confirmation wording, optional-detail copy and doctor expectations changed.

## Scenario results — all passed in the final run

All founder dialogue and product usage in these fixtures are synthetic and labeled.

| Scenario | What is exercised |
| --- | --- |
| R1 fresh project | Confirmed IDE → saved handoff → CLI continuation without transcript → all six proposed pack documents; no code authorization implied |
| R1 existing project | Preserved parser KEEP and unrelated dashboard PARK; two TEST capabilities: compare supplied facts and save one review note |
| R1 real execution | Actual Node process exits 1 and cannot advance; real existing-parser assertion exits 0 and advances approved risk stage; real compare.mjs/compare.test.mjs edits; child test runner passes 4/4; final state awaiting_review |
| Existing M2 fresh fixture | Real Python readiness journey and actual tests; original manual checkpoints preserved |
| Existing M2 existing/stock fixtures | Real JavaScript comparison edits/checks; current IDE retained, parked work preserved, original stops retained |
| Existing M3 A–F | Positive, mixed, negative, changed-pain, no-response and stock learning scenarios remain in the full regression suite |

The synthetic stock user is a self-directed investor comparing a shortlist. The
problem is repeated comparison with shifting criteria and forgotten rationale.
The scope is one supplied-facts comparison plus one saved review note. Existing
parser code is retained; dashboard work stays parked. No live prices, accounts,
trading-performance prediction or automatic trading features are added.

A persistent review sample was generated under the task's outputs directory:
`M3_R1_SYNTHETIC_BUILD_PACK/`. Its plan remains **proposed**, with no product code
built. In that fixture the returned current-context JSON was 2,489 UTF-8 bytes
versus 26,678 bytes for the full saved dossier. This measures emitted fixture data,
not model token billing, latency or a universal savings guarantee.

## Files changed in this revision

New implementation: src/domain/reply.ts, src/domain/session.ts,
src/application/session.ts, src/application/work.ts, src/application/work-pack.ts,
src/cli/conversation-render.ts. New acceptance tests: tests/session.test.ts.

Updated implementation: src/application/prebuild.ts, act.ts, build-pack.ts;
src/domain/ide.ts, guide.ts, act.ts, conversation.ts;
src/cli/main.ts, act-render.ts; cec.ps1.

Updated regression expectations: tests/ide.test.ts, ide-conversations.test.ts,
learn.test.ts, cli.test.ts.

Updated documentation: PRODUCT_SPEC.md, PLAN.md, STATUS.md, README.md, AGENTS.md,
docs/development/README.md, .agents/skills/crumb/SKILL.md and its act/local-tools
references. Added modes reference, this report and M3_R1_TEST_GUIDE.md.
Prior milestone reports, fixtures, package identity, lockfile and runtime selection
were preserved. Existing uncommitted milestone files are not new R1 work.
The final baseline-hash comparison found zero missing files and zero changes to
historical reports, fixtures or dependencies. See docs/development/M3_R1_VERIFICATION.json.

## Warnings and deferred capabilities

1. ChatGPT Work, Claude and Cursor are **text handoff adapters**, not tested native
   connectors. The verified executable path is the same local Codex project.
   Portable documents do not transfer SQLite execution authority between projects.
   There is no cloud sync, automatic upload or automatic new-chat creation.
2. The conversational host supplies semantic judgment and prepares scope/research.
   The deterministic core checks state/provenance/approval/receipts, not the truth
   of every semantic interpretation. Freeform personality still needs founder UX
   testing; these fixtures are not a live unscripted trial.
3. Build Pack output is an evidence-bound review candidate, not proof that all
   technical/commercial uncertainties are resolved. Material objections require
   review and a revised scope/IDE loop. The offline core does not perform new web
   research or claim current payment-provider prices. The host researches current
   facts only when they affect the current decision; no provider is selected here.
4. Execution receipts record host-observed results, not independently attested
   arbitrary external commands. Selected-file hashes cannot police every possible
   host action. Human checkpoints and the host's permission boundaries still matter.
5. No billing, hosted backend, CRM, autonomous outreach, dashboard, team features,
   multi-agent team, deployment or next revision has been implemented.

The ChatGPT wording boundary was checked against
[official Project documentation](https://learn.chatgpt.com/docs/projects): Chat and
Work can share Project sources, while local project folders are a separate access
arrangement. The adapter does not infer that access merely from a host name.

## Recommended next step

Run one unscripted disposable-project trial using M3_R1_TEST_GUIDE.md: natural
confirmations, explicit Act, then **Continue the Crumb build.**, review the pack,
approve the bounded stage policy and try the human checkpoint. Report repeated
questions, unclear transitions and unnecessary detail. Do not start a later
revision or M4 automatically; wait for the founder's explicit decision.

## Final M3-R1 closeout — 3 October 2026

**M3-R1 PASS WITH WARNINGS.** The continuation below resolves the fixture blocker
and completes the live gate with the stated limits. Existing changes/history
were preserved on main at c218317a2b17d6f4a7194ef5c875b5d26ed48d48. No commits,
pushes, dependencies, global Git/config changes, full-file rewrites or M4 work.

**Implemented:** ordinary IDE turns use prose regardless of length; retired fixed
foundation/Act menus and compulsory headings/footer rules. Formal research remains
structured. Natural assent, corrections, pauses, contextual confirmations and all
IDE gates remain. The Act recap again contains the actual intention/user/problem,
reasons and uncertainty. End-of-Evaluate guidance reuses habitats, offers the
behavior-focused interview path and asks missing locality separately. Discovery
plans are bounded to six queries/ten pages; scoped candidate cards require permitted
use before suggestion, retain source access labels and preserve opt-outs. No search,
identity, permission, interview or outreach is fabricated by the deterministic core.

**Context/build/MCP:** compact context and relevant evidence retrieval remain the
normal host path; stage instructions now explicitly limit document/code loading.
No token-saving estimate. A new local stdio adapter delegates ten bounded reads
to Core without initialization, migrations, writes or approval operations. Codex
called all ten successfully. This is not hosted MCP or tested Claude/Cursor/Replit
support. Existing handoff freshness, six-document Build Pack and staged real-file/
test-process checkpoints passed scripted integration tests. The continuation below
also verifies the live handoff and six-document review pack; implementation was not
authorized in that live scenario.

**Files inspected:** AGENTS.md; relevant PLAN/master/report sections; active Crumb
skill and conversation/research/interview/local-tool/mode references; IDE, guide,
reply, discovery, evaluation-quality, session, prebuild renderer/application,
Act/work-pack modules; their schema/privacy/persistence callers; focused tests and
the installed-host probe. No wholesale master/report or private-customer reload.

**Files changed (resumed patch plus closeout):**
- Runtime: src/domain/{ide,guide,first-user-discovery,session}.ts;
  src/application/{prebuild,session,act,read-context}.ts;
  src/cli/{main,prebuild-render,mcp}.ts.
- Tests/harness: tests/{ide,session,evaluation-quality,m3r1-ux-discovery,m3r1-closeout}.test.ts;
  scripts/verify-closeout-host.mjs; fixtures/m3r1-closeout/conversation-cases.json.
- Guidance: .agents/skills/crumb/SKILL.md and references/{conversations,local-tools,
  research,modes}.md; affected PRODUCT_SPEC.md and PLAN.md sections; this appended
  entry; docs/development/M3_R1_CLOSEOUT_HOST.md and M3_R1_CLOSEOUT_VERIFICATION.json.

**Actual checks:** pinned Node 24.19.0 build exit 0; full scripts/test.mjs run
308/308 passed, zero failed/skipped; final focused discovery/closeout/quality run
22/22 passed after the isolated source-access label correction. Git diff --check
found no whitespace errors (existing Windows line-ending notices remain). The first
sandbox attempts could not create temporary fixtures/find the Codex home; normal
profile execution resolved those environment restrictions. Installed skill probe
passed. Actual MCP stdio and installed Codex initialize/list/call paths passed;
unknown mutations and outside-project arguments were rejected.

**Initial live host:** synthetic fresh-B2B founder, three completed turns: evening
business constraints, uncertain user/buyer, and “I don't know which API…you figure
that out; no jokes.” Crumb used compact MCP context, kept the intention unconfirmed,
offered natural prose without menus, accepted responsibility for investigation and
disclosed unavailable live research. No Act or implementation occurred. Earlier
live output exposed a stale Yes/Adjust rule; that rule was removed and the final
fresh-founder run no longer displayed it. One 90-second timeout was retried once
with a 180-second bound. All inputs are synthetic; no unscripted founder acceptance,
new public-source investigation or customer validation is claimed.

### Closeout continuation — 3 October 2026

**Root cause and minimum fix:** `inspectArtifacts` intentionally returns
`{path, sha256, text}` for inspection. The live fixture assigned that entire object
to `project.artifacts`, whose authoritative type/schema accepts only `{path, sha256}`.
This is accidental fixture serialization (case A), not missing domain data. The
fixture now uses `.map(({path,sha256})=>({path,sha256}))`, matching existing producers.
No runtime type/schema, migration, validation rule or architecture changed.

**Files inspected for the mismatch:** scripts/verify-closeout-host.mjs;
src/privacy/artifacts.ts; src/domain/prebuild.ts; relevant save/fixture callers;
tests/{m3r1-closeout,ide,session,evaluation-quality}.test.ts. Subsequent live checks
read only the necessary host guidance, read-context/Act pack shapes and disposable
synthetic outputs. Existing repository work remains preserved.

**Exact files changed in this continuation:**
- scripts/verify-closeout-host.mjs: reference mapping; fixture-only regression path;
  selected-session/MCP-reuse options; fresh-session resume; visible-question assent
  scenario; explicit Act-to-pack sequence; bounded live-web option, state snapshots
  and failure/web-action diagnostics. Live research has a 300-second turn bound;
  ordinary turns retain 180 seconds.
- tests/m3r1-closeout.test.ts: rejects raw inspection text in saved IDE, verifies
  reference round-trip, and invokes the actual harness's existing-project fixture.
- .agents/skills/crumb/references/local-tools.md: one targeted clarification of
  existing research enums/provenance after a live host save failure. No enum added.
- M3_R1_REPORT.md: this affected closeout section. Other master/PLAN/report content
  was not regenerated. Earlier closeout transcript/JSON retain the initial blocked
  attempt as historical evidence; this continuation supersedes that status.

**Focused checks, in requested order:** pinned Node 24.19.0
`scripts/build.mjs` exited 0; artifact/schema test 1/1 passed; actual existing-project
fixture test 1/1 passed; `node --test dist/tests/ide.test.js dist/tests/session.test.js`
passed 55/55, no failures/skips. A duplicate normal-profile regression run also
passed 55/55 after the initially quiet sandbox process was mistaken for a stall;
both logs are retained, not counted as additional coverage. After final harness
edits, both new tests passed together 2/2 and `node --check` passed. The previous
308/308 full suite, 22/22 focused results, installed-skill check and all ten real
Codex MCP calls are reused; no full-suite rerun or claim of 310 tests passing.
No production runtime change required another broad run.

**Installed Codex live acceptance (synthetic founder inputs, real model/tools):**

| Scenario | Actual result |
|---|---|
| Existing project + return | Two turns plus a new-session resume; parser and startup retained, no idea reset or Act approval. Parser bytes/hash independently unchanged. Resume used compact saved context without replaying the transcript. |
| Customer feedback | Two turns; synthetic notes were not called actual usage. Discovery stayed parked; material problem refinement revoked dependent agreement and requested reconfirmation. |
| Natural confirmation | Five-turn visible-question replay accepted `yup` for user and `sounds right` for problem. Correction revoked affected agreement; uncertainty left Act closed. An earlier opening `yup` without a visible prior question conservatively re-presented the statement. |
| Stock Evaluate | Four turns; reused confirmed intention/user/problem and cached research, proactively offered relevant avenues and the five behavior-focused interview questions, explained data freshness/technical limits, and provided an explicitly requested sourced formal summary. No premature MVP or winning-trade claim. |
| Explicit Act → Work → Build Pack | Four turns; final commitment presented, explicit assent recorded, compact context/handoff saved, exact same-Project Work instruction given without claiming automatic navigation, then six documents generated without restating the startup. |
| Supplied conversation cases | All 22 completed through installed Crumb. These are hypothetical policy exercises, not 22 independently seeded startup states or actual discovery receipts. Missing restaurant/candidate receipts stayed unknown; no invented identities, permission, private-group access, outreach or validation. |
| Current external research | Bounded live host search/retrieval exercised SEC, TradingView and a public swing-trading discussion. Saved public evidence stayed separate from synthetic founder notes. Evaluation became `limited`; its old review was revoked, with Act still closed. |

**Independent artifact audit:** the six masters/reviews/plans all contain the same
confirmed intention/user/problem; every generated pack hash matches. The pack is
`proposed`, scope approval false, latest product-test receipt null. It proposes
one journey and three capabilities, with live data, institutional signals, screening
and billing parked. Implementation and product tests were deliberately not run in
this live review-only scenario. Existing scripted stage/checkpoint tests remain
the evidence for execution behavior. The proposed pack conservatively requests
review at both its groundwork and MVP stages; automatic progression was not live
exercised. No token-saving estimate is made.

**Live research repair and limitations:** the first attempt invoked web tools but
timed out at 180 seconds while its save commands guessed invalid `access:public`
and `evaluation.status:researching` (also `kind:official`). The single targeted
guidance change names the existing valid fields. The retry completed and saved
revision 11, including a `host_research` receipt with three queries and three source
references marked inspected/live. During that retry the core rejected duplicate
source URLs; the host corrected this once by refreshing the existing SEC/Pine
records, then saved successfully. Tool diagnostics retain the actual three-query
search and page-retrieval events; batched tool summaries do not independently list
every opened page. No candidate collection, participation-permission check,
interview, provider/API execution, license verification or customer validation was
performed. Public discussion remains anecdotal; actual demand remains unknown.

**Retained evidence:** `.m0-local/closeout-host-1791068405150/results.json`
(existing/resume), `1791068532632` (feedback/stock/handoff), `1791068788443`
(visible-question assent), `1791068846753` (22 cases), `1791068648433`
(initial live-web failure), and `1791069016415` (completed live-web retry) use the
same `closeout-host-<id>/results.json` naming. Focused logs are
`closeout-resume-integration.log` and `closeout-resume-integration-host.log`;
`closeout-resume-audit.json` records pack/research/parser checks. These are local
ignored test artifacts, not a portable customer research corpus.

**Freeze recommendation:** M3-R1 can freeze with the above warnings. No unresolved
artifact-schema blocker remains. This is installed Codex testing; native ChatGPT
Work UI/file transfer and other providers are not verified integrations. The Work
instruction was exercised using declared shared-project capability in a synthetic
scenario. Founder UX judgment remains manual. Try a disposable conversation about
restaurant supplier comparisons, answer the displayed confirmation with `yup`,
correct the audience, then say “looks good, don't build yet”; expect retained
context, one useful question, and no build authorization. Next: perform that short
founder check and explicitly authorize M4 when satisfied. Billing/trial, hosted MCP,
full provider integrations, CRM and autonomous outreach remain deferred. No M4,
push, deployment or new product implementation was performed. Stop and wait.
