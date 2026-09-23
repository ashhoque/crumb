# Pruvello independent conversational forward-test

Date: 2026-09-23. This is an authored agent rehearsal using developer-supplied synthetic founder turns. No real founder/customer interview, market research, customer validation, software implementation, approval or deployment occurred. Replies below are exact proposed host replies, not claims of measured customer behavior.

State versions v1/v2/v3 below mean saved draft revisions; all new records use contractVersion 3.

## Stock comparison: completed turns

Founder: “Starting fresh. I can find promising stocks, but comparing them using my swing-trading criteria is difficult. I look at sector tailwinds, growth, volume, insider buying, technical setup, catalysts and risk/reward.”

**Executive Summary**

I think the difficulty is making a consistent comparison when several candidates look promising. Your criteria give us a useful starting point, but we should clarify what you want this to become before choosing features.

Is this mainly a tool for your own trading, or something you want to sell?

**For myself · A business · Build now**

Founder: “For myself first. Maybe sell it later. I already have the information in different notes; the hard part is weighing conflicting criteria.”

**Executive Summary**

Your immediate goal is a clearer personal comparison, with selling as a later possibility. The difficulty is weighing conflicting evidence already in your notes. Whether dedicated software helps more than a spreadsheet or general AI remains unknown.

I’d replay one past comparison using two synthetic candidates to see where the reasoning gets stuck.

The detail below is optional—you can continue without reading it.

**Replay a comparison · Build now · Why?**

State: target `C:\Users\Ash\AppData\Local\Temp\pruvity-m1r-CLhwG0`; v1 orientation with asked/unknown intention, no proposal/decision; v2 provided/custom intention and a learning proposal with zero capabilities, decision context_ready. Current hash: `ed107d0fd54c56dcf2d26351d9a6878f701edbe39d68f6a5bce69cad1bef92d9`. Research not_run, no approved cycle.

## Fresh: explicit unknown business intention

Founder: “Agencies keep chasing clients for missing files. I don't know what business I want yet.”

**Executive Summary**

We can leave your business goal open. My working hypothesis is that chasing files is a symptom of client work getting stuck.

The last time this happened, what was missing and what work did it hold up?

**Tell me · Correct my understanding · Build now**

State: target `C:\Users\Ash\AppData\Local\Temp\pruvity-m1r-sUuKP8`; v1 orientation, intention skipped/unknown, proposal and decision null. Unknown intention retained without repeating it. Problem sourced to the founder; stalled work is explicitly a hypothesis. Hash: `fd65ced35864789d58962b6b35fee23d45d0316dabdf5379cacac8e2e40f3663`.

## Existing invoice fixture: no users

Permission already supplied for AGENTS.md, README.md, package.json, app.mjs and app.test.mjs. Inspected only these five files through internal inspect. They contain dependency-free JavaScript ESM, an unpaid-total function and a test. The test was read, not executed. Fixture instructions preserve existing files and require a separate module for any future approved addition.

Founder: “I want a profitable solo business. No users yet.”

**Executive Summary**

Your goal is a profitable solo business. The code totals unpaid invoices, but it does not support choosing a follow-up. My working hypothesis is that an agency owner needs help deciding which invoice to chase; with no users yet, that still needs checking.

Is choosing the next follow-up the problem you want this project to solve?

**Yes · Correct my understanding · Build now**

State: target `C:\Users\Ash\AppData\Local\Temp\pruvity-m1r-p2X0pY`; v1 orientation, intention provided/solo_profit, proposal and decision null. Selection difficulty remains an assumption; code is not demand evidence. Hash: `aa19bff0d3d76c5e29731f294e46ee5961f8958b4276882560c3f320b05259fb`.

## Existing invoice fixture: feedback and correction

Same five-file inspection permission, separate disposable target and inspection.

Founder: “I want a sustainable B2B company. Two synthetic pilot users could not choose what to chase; one asked for reminders.”

**Executive Summary**

The code totals unpaid invoices; your reported pilot feedback points to a separate difficulty choosing follow-ups. For your B2B goal, the reminder request is a clue, but it does not yet explain what makes choosing hard.

When they could not choose what to chase, what information were they missing?

**Tell me · View evidence · Build now**

Founder: “They can see overdue invoices. They lose track of who was already chased.”

**Executive Summary**

The feedback changes the problem to reconstructing follow-up history. That gives us a concrete workflow to examine, while demand for automated reminders remains unknown. The inspected fixture only totals invoices, so it does not explain where pilots see overdue items.

I’d review one synthetic follow-up example to see what they need to know about the last contact.

The detail below is optional—you can continue without reading it.

**Review one example · Build now · View evidence**

State: target `C:\Users\Ash\AppData\Local\Temp\pruvity-m1r-LknpKq`; v1 orientation, provided/custom intention preserving “sustainable B2B company,” contact_reported and sourced synthetic founder feedback. Correction saved as v2, with both reports retained, a follow-up-history problem, assessment and zero-capability learning proposal, decision context_ready. No reminders or overdue ordering were proposed as software. The reported overdue view is distinguished from the inspected total-only fixture. Current hash: `832337e200d54ab5a59265e4d276a3ccac159cc4af0eccb499287d5bf6866efc`.

## Actual execution and friction

- Used the skill and its conversation/local-tool references, demo fresh/existing/feedback, internal inspect, internal context/draft/review and doctor. New context was persisted because the skill explicitly requires v3 orientation records; complete learning proposals were saved only once a useful action had a reason. All application input/output concerned disposable synthetic targets.
- The initial stock fixture read failed because fixtures/orientation/stock.json did not yet exist; the parent subsequently reported adding it. No later failed attempt was made.
- The first launcher save exited 1: “Provide one valid UTF-8 JSON request on stdin. No input was saved.” The same request succeeded through pinned Node. The synthetic request was ASCII-only; this does not itself establish an encoding bug.
- Exact failed command, in exec_command's default shell without shell/login overrides (in-process script invocation, not pwsh -File):

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Get-Content -LiteralPath 'C:\Users\Ash\Documents\Codex\2026-09-23\you-are-continuing-development-of-my\work\pruvello-forward-draft.json' -Raw -Encoding utf8 | & 'C:\Users\Ash\Documents\Codex\CEC\cec.ps1' @('internal', 'draft', 'C:\Users\Ash\AppData\Local\Temp\pruvity-m1r-CLhwG0')
```

Verified shell: PowerShell Core 7.6.5 at `C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\powershell\pwsh.exe`. Successful internal calls replace the launcher with pinned `node\bin\node.exe` and `CEC\dist\src\cli\main.js`.
- Three invoice draft attempts initially failed “Artifact observations must reference a selected, permitted artifact.” I had authored one source as “README.md; app.mjs.” Replacing that host-authored source with the exact selected path “app.mjs” made all saves succeed. This was a host contract mistake, not a corrupt artifact.
- A scratch orchestration call failed because structuredClone is unavailable in functions.exec. It made no mutations; JSON serialization cloning resolved it. This is tooling friction, not a Pruvello customer problem.
- Actual generated summaries add generic choices and optional-detail boilerplate even when asking a simple question. Learning summaries repeat the recommendation as Scope, append “Local only; no spending, sending or deployment,” and produce double punctuation when journey already ends with a period. The exact replies above are authored, shorter contextual host replies; the CLI does not generate that full UX automatically.
- The no-user reply still anchors on follow-up selection based on sparse code. It labels this a hypothesis and invites correction, but an open question about the unfinished job could reduce leading the founder.
- The fresh question asks both what was missing and what work it held up in one natural question. It is within the two-material-question limit but slightly heavier than asking only what stopped the work.
- The corrected feedback branch exposes a useful fixture/report mismatch rather than inventing an overdue screen. It does not resolve where pilots see overdue items or establish that a history feature would work.
- No live research, full check suite, customer storage/credentials, repository edits, code builds or real source imports. Disposable request files were removed after saving; synthetic target state was retained for inspection.

This rehearsal shows the authored host can preserve skipped goals, distinguish code from demand, avoid a premature feature list, and change direction after feedback. It does not establish actual customer usability, commercial demand or behavior of every future host response.

## Final stock turn: explicit build request

Founder: “Build now; skip research.”

**Executive Summary**

We can build now and leave research skipped. I propose a side-by-side view of two synthetic candidates using sector tailwinds, growth, volume, insider buying, technical setup, catalysts and risk/reward, with missing notes clearly marked. This tests whether the comparison makes trade-offs easier to explain.

**Build this comparison · Adjust scope · Why?**

Saved on the original stock target as version 3, hash `ccaeb358184442b244e9985f1e8ec407033641c106504f8a6dd4db7e56c28110`. Phase: proposal. Method: build. Decision basis: build_requested, with the exact synthetic founder request as its source. Both capabilities are shown: side-by-side notes across all seven criteria, and marking missing notes. Research remains not_run, with the explicit skip retained in constraints. No approval command was called; the revised scope awaits assent. No implementation or receipt was created.

The previous learning proposal was replaced by a narrow build proposal; the founder was not asked to repeat their intention, answer an interview, or run research. Choosing Build now changed the method but did not approve previously unseen capabilities.

After the earlier observations, the parent reported fixing duplicate trailing punctuation and updating local-tools.md to use direct pinned Node for JSON input. These are parent-reported subsequent changes, not fixes independently verified by this rehearsal. No suite was rerun and no repository files were edited.


