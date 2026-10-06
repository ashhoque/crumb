# M3-R6 first-user-ready alpha — independent review packet

Target: October 7, 2026, America/Toronto. This implementation phase does not merge
main. Synthetic founder scenarios and actual public research are distinguished.

## Baseline and scope

- Base: shipped main `25f834cfd5ae704ccd73fc0db3634c24102f7b10`.
- Existing `m3-r6` was behind shipped main; fast-forwarded it without discarding
  earlier work. First implementation commit: `5e3ebdf8aeb48c941f8598338f4db24bbd8b17e8`, pushed.
- Pinned Node 24.19.0, npm 9.6.7, existing lockfile/engines. No new dependencies.
- Current source, rather than the October 5 audit snapshot, determined patches.
- Kept offline Core, existing interviews/research/first-user modules, exact thesis
  receipts, invalidation, Act plans, stage automation, identity guard and voice.
- Deferred M4, broad cleanup, model routing, market-sizing architecture and new
  acquisition/build systems. Unrelated changes preserved; no force push.

## Root causes and smallest changes

| Current callsite | Finding and change |
|---|---|
| `src/cli/prebuild-render.ts:interviewGuide`, `src/domain/ide.ts:validateIde` | Interviews were gated behind evaluation. Current v2 preparation now precedes review; actual execution remains separately protected. |
| `src/domain/interviews.ts:problemInterview` | Reused the existing five concepts; canonical wording now matches the requested past-behavior questions. No Interview Engine. |
| `validateIde`, `validatePrebuild`, `renderStartupMaster` | Planning/master choices conflated preparation with Act. V2 provisional documents render before completion, explicitly without build authorization. Legacy readiness semantics retained. |
| `src/domain/evaluation-quality.ts:validateQuality`, `ide.ts:assertEvaluationComplete` | Behavioral uncertainty rejected a learning build. Optional decision/experiment metadata inside the existing quality contract binds promise, 1–3 capabilities, cuts, limits, signals and test date. Bounded review requires material research/alternatives and technical checks; unrelated dimensions can remain honestly unexamined. Full-build gates remain. |
| `ide.ts:presentationText`, `act.ts:validateActPlan` | Exact Act display includes the learning scope. Build capabilities must match it; material edits invalidate existing bases. No parallel state machine. |
| `ide.ts`, `guide.ts` | Negative conclusions required positive reasons and then offered a build. ONE GAP/PIVOT can retain zero promising reasons; neither can enter Act. |
| `project-bootstrap.ts:assertFounderProject`, `prebuild.ts:saveWorkingContext` | Runtime checkout could masquerade as app evidence/notes. Reject the real installation root and descendants; preserve path, symlink, source, version and conversation guards. Unrelated disposable app inspection remains valid. |
| Canonical `SKILL.md`, runtime locator | Run → do → ask, ranked pains, complete discovery packs and automatic provisional MVP preparation use existing modules. Corrected active contradictory stage-approval instructions. |
| Runtime `template`/`prebuild` contract, finding diagnostics | Live build requests invented enums, omitted supporting claims and mixed public research with feedback. Added actual enum/provenance instructions and exact offending-field diagnostics; no coercion or weakened validation. One targeted live retest. |
| Canonical resume instruction | An empty app-root context caused a needless request to paste locally available notes. Explicit resume now checks same-project handoff/one-level notes before asking; no automatic cross-project import. |

## Baseline failures included

- Initial focused reproduction: 1/3 passed; early interview output had zero
  questions and installation-root inspection did not reject.
- Fresh-session save/reload and cross-conversation conflict already passed.
- First full candidate: 356/357; a historical early-choice gate had been relaxed
  unnecessarily. Restored the legacy gate and verified the repair.
- First actual build journey: preparation succeeded but formal persistence failed
  (inferred/high confidence; invalid stage/entry; unsupported finding; text on an
  unknown view; public claims in feedback). No runnable product or tests existed.
  Crumb reported the failure and did not bypass Act despite the founder's approval.
- First actual resume: scoped MCP read the empty app root and asked for a handoff.
  Notes existed in the same project. Targeted retest found them and prepared a
  decision card without founder reconstruction.

## Current proof

Baseline full suite: 352/352. Focused preparation/quality/IDE/Act: 66/66.
Legacy repair: 62/62. Bounded-scope tests: 7/7. Write-diagnostic/legacy tests:
65/65. Interim complete suite: 359/359. Final results recorded at closeout below.

Actual installed-host testing uses GPT-6.1 Sol / Medium, normal `$crumb` entry,
separate disposable projects, public web and mocked/synthetic founder inputs.
No external messages, deployment, spending or private data import. Product writes
are permitted only in the build scenario after scoped founder consent and Core checks.
See `M3_R6_ALPHA_LIVE_TRANSCRIPTS.md` for sanitized actual assistant speech,
timing, calls, failures and outcomes. Offline fixtures are not live proof.

- A: translation-agency handovers: bounded research, ranked pains, ONE GAP,
  linked discovery pack; narrowed after correction; analysed supplied five-job
  CSV without causal/validation claims; prepared a paper test. Ten text turns,
  only first invocation; no identity narration or repeated capability discovery.
- B: built Manchester print-proof app: four named shops with direct URLs,
  observed fit, published business routes, restrictions, neutral invitation,
  five questions, lead CSV and strengthening/weakening signals. No restart of
  idea discovery. Nothing sent or built.
- D/E: cleaning-margin forecast: alternatives and counterevidence, prepared
  retrospective comparison instead of a six-month wait, no test claimed running.
  Fictional interviews rejected as evidence; hostile retrieved instructions
  did not authorize a build. Unavailable connection led to an existing export,
  not manual reconstruction, in A.
- F: explicit fresh-session resume retest succeeded; same-project notes and
  discovery artifacts reused, decision card prepared, Act still denied.
- C: BLOCKED. Fresh retest rejected `brief.kind`, then metric provenance, and
  timed out at 300s during preparation. It never reached authorization/build.
  First attempt likewise failed to deliver after the founder's scoped approval.
  No Act journal/product files were produced. Guards correctly prevented execution,
  but the required user journey does not work reliably.

Retained ten sanitized artifacts are under `docs/m3r6-alpha-proof/`; the README
separates synthetic inputs, actual public observations and unexecuted plans.
Seven fresh openings / 22 actual turns contain zero assistant identity narration.
Synthetic testing is not a real closed-alpha user trial.

## Efficiency and coordination

No runtime model-switch/delegation router was added; testing explicitly selects
the supported balanced model. Reuse, compact context and bounded public batches
remain the efficiency mechanism. Simple follow-ups used no research or repeated
stable reads. Initial research: A 185.8s, B 143.1s, D 130.3s; first failed build
preparation 297.9s including invalid storage attempts. Those failures are not
necessary external latency and remain a release concern until retest proves recovery.

First-user access, questions, invitations and artifacts were prepared proactively.
Private records/consent remain founder inputs. The failed resume was unnecessary
coordination; fixed in the narrow retest. A's paper-test preparation advanced
without building or contacting anyone. No unsupported demand claims accepted.

## Minimal remaining reproduction / isolated review request

Run `scripts/verify-closeout-host.mjs --model=gpt-6.1-sol --sessions=alpha-build
--live-web --capture-instructions` against the installed candidate. Founder asks
for the local synthetic proof prototype and preparation before approval. Expected:
valid retained evaluation, exact scope/limits, then authorized runnable/tested
artifact. Actual: rejection while assembling the existing formal dossier.

First failed values included stage=`prototype`, entry=`idea`, an inferred/high
working fact, a finding with empty supporting claims, an unknown view with text,
and public observations in feedback. One contract/diagnostic correction eliminated
some failures but retest invented `brief.kind` and misclassified a reported metric.
The validators are rejecting bad evidence correctly; do not loosen them.

Next isolated task: make the existing evaluation input boundary reliably usable
for a bounded experiment without freehand reconstruction of the full dossier,
then prove exact consent through the existing stages. Preserve provenance,
technical/privacy checks and receipts. This needs implementation/interface review,
not personality polishing or a new planner/state machine. No Astra escalation was
dispatched. Sol Medium remains the least-cost appropriate default; an unresolved
receipt/approval ambiguity should be presented as one explicit review question.

`AGENTS.md` requires stopping after one targeted repair when the same failure
persists. The fresh write-contract repair was tried; repeating prompt additions
or source searches in founder sessions is not an acceptable workaround.

## Closeout

Final source verification and exact revision/hash results are recorded below.
This is BLOCKED, not a release PASS. Main remains `25f834c`; no merge in this phase.

- Verified implementation commit: `db86dad17698f78979b31bf9b4cd3253f2ae0cb9`,
  pushed to `origin/m3-r6`. Review-packet closeout is a documentation-only child
  commit; it does not change the runtime verified here.
- Final pinned `node scripts/check.mjs`: build/typecheck + **361/361**, exit 0,
  154.8s test time. Final focused prebuild/alpha: **66/66**, exit 0; provisional
  master/IDE: **48/48**. A prior final run was 360/361 solely because the legacy
  master error wording changed; original legacy wording restored and reverified.
- Global candidate: `C:\Users\Ash\.agents\skills\crumb`; locator points to
  the built `m3-r6` checkout, not shipped main. `sync-global-skill.mjs` verifies
  all seven canonical installed files, locator and the unchanged host guard.
- SKILL SHA-256: `83a91202832a53e2091351398141efb5304afbc63089784ed52ffcfcb786a25e`.
- Runtime locator SHA-256: `1b2155f29c60408449790b0f4996377fe1558ff36a5d3dd779bfcb521c2373ac`.
- Compiled runtime aggregate: `0282d7ea13294406110ec31a98240fe02fc3a3576cd80273d610bb2fef9e6898`
  (SHA-256 of JSON of sorted `dist/src` relative paths and their SHA-256 values).
- Host identity guard SHA-256: `9de2e3a663886c1e7f953894b0359157acf6326ff6dfd6f9aef20e8196a269e0`.
- Actual live runs: `1791318285729` (A/B/D/E + initial resume), `1791318487514`
  (first C), `1791319118321` (C retest), `1791319159128` (corrected resume).
  Ordinary no-research turns generally 4–13s; CSV analysis 58.3s; corrected
  fresh-session resume 89.9s. First research batches used 5/5/6 queries for A/B/D;
  no Core capability/source rediscovery, but A reread the locator once. C retest used 17 commands, 2 failed
  writes, 3 search queries and 2 locator reads; this overhead is not accepted as
  unavoidable research latency.
- Remaining blockers: formal evaluation assembly prevents reliable GO → scoped
  authorization → runnable tested product. No completed build/user-feedback
  journey proven. Preserve the safe failure, not a release PASS.
- Remaining warnings: synthetic founder testing; necessary research latency;
  occasional conditional future phrasing rather than immediate artifact work;
  resumed source wording called retained public observations “synthetic” too
  broadly. Source provenance should remain explicit; no validation claimed.

M3-R6 BLOCKED
