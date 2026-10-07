# User interview MVP patch — development handoff

## Decision: BLOCKED on installed-host delivery proof

Base: `911dec9615cc37c47f662b76a8c769b1544a35c4` (released R6 main).
Branch: `user-interview-mvp`. No milestone restart, main merge or main push.
Checkout: `C:\Users\Ash\.codex\.chatgpt-projects\g-p-6ac1da47a3e48191b05023e7662b2815\crumb`.
The original checkout was the older `alpha-testing-layer` installer branch;
its commits and the existing R6 proof files were preserved. The patch uses
released R6, not the old installer implementation.

## Small canonical changes

- `src/application/interview-pack.ts`: existing project/version/hash and retained
  source IDs become private Markdown/JSON/CSV packages. Reuses `problemInterview`
  (unchanged canonical five questions), `planFirstUsers`, selected-path/link guards
  and conservative reply approval. No new question engine, database or network agent.
- `src/cli/main.ts`: supported `interview-pack`, `interview-email`,
  `interview-results` operations. Preparation does not change Evaluation/Act state.
- `skill/crumb/SKILL.md` and progressive `references/interview-delivery.md`:
  preparation before the final founder/team choice; actual connected capabilities;
  unknown-email ask; scoped approval; full fallback; attributed result reconciliation
  through existing evaluation-update/finish-evaluation. Personality unchanged.
- `references/learn.md`: removes the conflicting blanket email prohibition only
  for this separately approved package handoff. Other learning commands still
  have no outreach capability.
- `scripts/sync-global-skill.mjs`: installs the reference and compact contracts.
- `src/domain/evaluation-quality.ts`: normal recommendation is approximately
  2–4 completed real interviews. No new business gate or mechanical GO by count.
- Focused tests and the existing host harness: two opt-in unrelated B2B dry runs,
  request-artifact/operation checks in addition to semantic transcript review.

## Delivered through supported operations

`crumb-interviews/<unique-id>/REQUEST.md`, `REQUEST.json`, `ROUTES.csv` include
context, pain/thesis, candidate sources/contacts/fit/restrictions, neutral invitation,
the existing five questions, constraints/disclosure, return details and result template.
The directory is protected from Git before private writes. Linked paths, tracked
packages, fabricated retained contacts, stale context and altered requests are rejected.

Founder-led preview contains the full package addressed to the founder. Team-led
preview addresses the configured support inbox and includes the full request inline,
so unsupported attachments cannot drop context. The default inbox lives only in
`interviewSupportEmail()`; override with `CRUMB_INTERVIEW_SUPPORT_EMAIL` in the
actual Core/host environment. Subject retains project, user and request ID.
The thread says: **Return findings and any follow-up questions by replying to this thread.**

One exact displayed-scope approval covers sending the team request and only its
permitted recruitment routes, purpose, invitation and identity disclosure. It never
authorizes product builds, arbitrary prospects, publication or spending. Choosing
the team alone is not approval. Gmail sends remain native host actions, not Core
network calls. Submission records require matching successful host-reported Gmail
message/thread details; Core does not independently verify that connector receipt.
Gmail unavailable means complete ready-to-send draft/files, never a false submission.
Team unavailable means founder-led fallback, never a promised booking or turnaround.

Results distinguish contact/reply/scheduled/completed/public-post/simulation.
Completed reports require occurrence evidence and attribution; duplicate respondents
cannot inflate counts. Quote consent is required. Participant statements, interviewer
interpretation and Crumb inference remain separate. Qualitative assessment can
produce GO, ONE GAP or PIVOT/STOP; four reports alone do not complete Evaluation.
Existing evaluation persistence and thesis invalidation remain authoritative.

## Verification

Pinned Node 24.19.0; existing lockfile/dependencies unchanged. Build and explicit
typecheck passed. Final focused interview/evaluation/runtime/approval checks: **55/55**.
The focused interview package file contributes 21 behavioral tests, including a real
supported CLI invocation and mock Gmail completion. No actual email/candidate contact.
Final full suite: **390/390 passed**, 173.8s. Build/typecheck and focused checks
preceded this final stable full run. Existing Act/security/evaluation regressions
are included. No merge is justified by these results without the missing live delivery.

Earlier failures are retained in ignored logs: Windows sandbox EPERM for existing
temporary-project tests (normal approved test execution resolved it); one isolated
installation check failed during concurrent source/sync changes and then passed;
the historical instruction assertion expected the superseded blanket prohibition.
It now checks no unapproved sends and that team choice is not contact consent.
No domain, Act or provenance assertion was weakened.

## Actual installed-host dry runs: failed delivery, not PASS

See `docs/interview-mvp-proof/live-dry-runs.json` for seven actual Sol Medium turns.
Founder-led opening: 84.9s; follow-ups 37.4s / 13.3s. Team-led opening: 71.7s;
follow-ups 25.8s / 6.1s / 23.6s. Eleven searches total; zero identity leaks,
product implementation, external emails or prospect contacts. Research supported
hypotheses only. Conflicting rehearsal notes were not completed real interviews.

The first actual failing operation was the host attempting to read the exact
installed skill with `Get-Content -LiteralPath ...\crumb\SKILL.md`. Error:
**Failed to create unified exec process: helper_unknown_error: setup refresh had errors**.
It failed before executing the command. The later runtime read failed too; available
file-tool alternatives also returned failure. This is upstream of our CLI, validation
and artifact persistence. No `interview-pack` invocation or request artifact was
demonstrated through the ordinary host.

Actual founder output: “local file access failed ... can't claim it's saved as a
project document.” It did offer the exact founder/team choice and public routes.
The team fallback subsequently drafted a findings email **to the founder**, not the
required configured support request. No request ID/structured team artifacts were
created. This is an acceptance failure; useful prose does not establish the patch.

The initial harness selection bug accidentally selected a historical resume test;
the targeted harness repair selected only the two new cases and retained the proper
sandbox. No security restriction was bypassed. Completed model turns were manually
rejected as delivery proof; the harness now also fails missing actual pack operations
or request artifacts automatically.

## Remaining dependency / release boundary

Restore ordinary installed-host file/command execution, then rerun:
`node scripts/verify-closeout-host.mjs --interviews --live-web --model=gpt-6.1-sol`.
The smallest prerequisite is a successful read of the installed canonical skill and
runtime, followed by the actual supported pack operation in the disposable project.
Do not inject manually completed artifacts or caller payloads as ordinary host proof.
Connected Gmail is unavailable here; the connected path is mocked, not live-certified.
Real interviewing, response rates and founder value remain unobserved.

Global hashes in `docs/interview-mvp-proof/candidate-hashes.json` identify an explicitly
installed **development candidate**, not a new shipped-main release. All eight source
skill files match that candidate. Main remains the existing R6 alpha.
