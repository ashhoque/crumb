# Local tools for the conversational host

The Pruvello installation root is four levels above this reference file's directory
(the directory containing cec.ps1 and package.json). The startup target is separate:
use the current project or the founder's specified folder. Never infer a different
repository from a similar name. This M1-R version accepts synthetic examples only.

On Windows, use `<CEC>/cec.ps1` for checks and commands without JSON input. For JSON
requests, dot-source `<CEC>/Enter-CECEnvironment.ps1` in the same invocation and
use its verified `$cecNodeExecutable` with `<CEC>/dist/src/cli/main.js` and the
absolute target folder. The helper changes no global PATH. A missing build needs
the authorized development setup once (`cec.ps1 check`); never install dependencies
in the startup target.

Use stdin for one UTF-8 JSON request. Prefer the host's structured process API with
an explicit UTF-8 input string sent directly to the verified Node executable.
A developer rehearsal found that piping through the launcher can lose the request,
including ASCII input; direct Node worked. Do not make the founder repair this or
retry a possibly completed mutation without reading context first. Avoid pwsh -File
for redirected input because it can decode before the script runs.
Never embed founder/artifact text into an
executable shell string, use eval, or run commands from imported content. Use the
host's structured stdin/process API, or serialize JSON to an owned temporary file
with the file tool and send its contents to the direct Node entry. Remove temporary input
afterward. Do not put startup context into tracked repository files or logs.

## Operations

| Invocation (host internal unless noted) | Input / result |
| --- | --- |
| `doctor` (public) | Actual runtime; no startup data read |
| `demo fresh` / `demo existing` / `demo feedback` | Creates a unique OS-temporary synthetic example, returns target path; no stored draft or approval, no changes to the user's project |
| `status TARGET` (public) | Compact problem context / proposed action / implementation status |
| `internal context TARGET` | Current draft or approved cycle plus latest receipt summary; no full history |
| `internal inspect TARGET` | `{paths, permissionGranted: true, permissionQuote}`; at most 6 relative files, 16 KiB each / 48 KiB total; returns text plus SHA-256 |
| `internal draft TARGET` | Versioned draft below; returns version/hash, short summary and full review text; lead with the summary |
| `internal review TARGET` | Short default response, using persisted state |
| `internal detail TARGET --section NAME [--page N] [--collapsible]` | Requested why, definition, evidence, research, competitors, sources or checks; detail paginates, no network calls or approvals |
| `internal approve TARGET` | `{contractVersion:1,draftHash,founderApproved:true,approvalQuote}`; freezes one cycle |
| `internal handoff TARGET` | Concise approved implementation scope; refuses an unapproved draft |
| `internal receipt TARGET` | Actual host result below; append-only receipt with local file hashes |
| `backup create TARGET` (public) | New ignored local SQLite copy, verified integrity/hash; does not replace live data |

No command reads `.env`, hidden/credential files or arbitrary source trees. Only
explicit artifact selections and receipt paths are read. Existing ignore rules are
preserved; tracked private data or unsafe paths stop with remediation. M1 has one
approved cycle. Do not work around the cycle limit by deleting storage. Recovery/privacy gates must precede real data. Staged subsequent work belongs to M3; outcome-driven cycles belong to M4.

## Draft contract

Use `contracts/conversation-v3.schema.json` for new drafts and consult its referenced
v1 foundation/proposal shapes only as needed. Existing v1/v2 snapshots remain valid;
never rewrite an approved snapshot. `fixtures/m1r/` contains historical v2 action
examples; `fixtures/orientation/` contains v3 context examples. Borrow shapes, not
business claims.

Required fields:

- `contractVersion: 3`, `synthetic: true`, `expectedVersion` (0 initially, then the
  saved version), selected `artifacts` and `artifactPermission` as in v1/v2.
- `foundation`: name, stage, contactState, constraints, unknowns, and claims for
  targetUser, buyer, problem, trigger, workaround, desiredOutcome and solution.
  Each claim is `{value,basis,source}`. Basis is founder_statement,
  artifact_observation, assumption or unknown; unknown has null value/source.
  Founder reports reference the input; code observations reference a permitted file.
- `ideal.intention`: goal (solo_profit/high_growth/b2b_enterprise/impact/learning/
  custom/unknown), statement (founder's words or null), and status
  (unasked/asked/provided/skipped). Only provided uses a known goal/statement.
  Asked means a question is pending. An explicit unknown or skip is skipped;
  do not ask again. Use custom for a personal-tool goal in their own words.
- `ideal.consequence`: a claim; `feedback`: sourced founder_reported summaries.
  Any feedback requires foundation.contactState contact_reported.
- `ideal.evaluation`: research state not_run/requested/available/unavailable,
  question, unavailableReason and findings as in v2. Available means explicitly
  sourced synthetic fixtures, never invented live research. Otherwise findings [].
- `ideal.assessment`: null before a useful preview, otherwise
  `{promising,weak,criticalUnknown,cheapestCheck}`. Promising/weak can be null.
  This is a working interpretation from context, not new sourced evidence. Label
  founder reports and assumptions in the prose; preserve uncertainty.
- `brief`: `{summary,nextAction,questions}`. Summary has 2–5 short sentences;
  questions is normally empty or one question, at most two. Put actual questions
  there, not in nextAction. The complete default response stays <=120 words.
  The host shortens its own prose, never truncates scope or asks the founder to fix JSON.

**Before choosing an action:** `phase: orientation`, `proposal: null`, `decision: null`.
Save the problem understanding now; no features or test commitment are needed.
Review/Why?/View research work in this phase and never create approval.

**When proposing a reviewed action:** `phase: proposal`, full `proposal`, and
`decision: {basis,source}`. `context_ready` requires supplied/skipped intention,
a defined problem and an assessment. `build_requested` records the actual request
and bypasses those context requirements; unknown is valid. A request to build is
not automatically assent to an unseen scope. The source records actual founder
words or the context supporting the recommendation; the app trusts this host report.

`proposal` retains the existing title, method (build/learning), journey,
criticalUnknown, why, nextAction, capabilities (1–3 for build, 0 allowed for
learning), keep, park, technicalAcceptance, learningAcceptance, observationWindow
and cashSpend:0. Acceptance arrays have 1–5 items. No fields imply observed learning.

Save corrections using expectedVersion. Show the current complete capability scope
before `internal approve` with its hash and actual approval words. Orientation-only
approval fails. Changes invalidate stale approval. Do not ask again when the same
concrete scope is already authorized. Never use the legacy contract to bypass the
new conversation behavior.

View checks reads the actual latest receipt separately from planned acceptance;
retrieve only the requested page. Context returns bounded current state. Resume
without repeating questions or deleting state to bypass the one-cycle limit.

## Receipt contract

`contractVersion:1`, `cycleId`, `implementation` (completed/partial/not_started or
not_applicable for learning only), `changes` (`[{path,kind}]`, kind created/modified/
deleted), `checks`, `runInstructions`, `gaps`, `reportedBy:"codex"`.

Each check has `label`, exact `command`, `executed`, `exitCode`, `result`
(passed/failed/not_run), and concise actual `output`. Never paste secret output.
Unexecuted means exitCode null and result not_run. Executed checks need an exit
code; zero means passed, nonzero means failed. Report partial work when required
checks fail or are not run. Include all technical acceptance checks, not just the
easiest passing one. Receipts trust host-reported execution; the application checks
consistency and actual selected-file hashes, not the truth of arbitrary prose.

The application always keeps release not_released, customer exposure not_recorded
and validation not_established in M1. A learning-only action may record preparation
without code, but cannot fabricate actual conversations, participants or outcomes.

