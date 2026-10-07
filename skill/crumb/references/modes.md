# Conversation to build (M3-R1)

One domain model; modes are `conversation` and `build`. The current Codex local
host is executable. ChatGPT/Claude/Cursor descriptions are capability-aware text
handoffs, not implemented native integrations or file synchronization.

## Conversation

Read `conversation-context --resume` only after the founder explicitly continues
this project. For older saved IDE that predates these files, run
`conversation-refresh --resume` once; it derives artifacts from retained state without
research or onboarding. Select one to six evidence IDs with `conversation-detail --resume`
and `{"ids":["saved-id"]}` when deeper support matters. Never read a giant history
just to continue a normal turn. Sources retain dates/provenance and unknowns.

Use the canonical voice and momentum rules in SKILL.md; a useful next step need
not ask a question. Preferred names must come from explicit input. Accept clear natural assent
to the CURRENT displayed statement, including yup, agreed and sounds good. For
other clear semantic equivalents, `ide confirm` may include
`"interpretation":{"meaning":"agreement","explanation":"Why the actual reply agrees with the displayed statement"}`.
Keep the verbatim quote and actual source turn. Never use this for ambiguity,
conditional assent or consequential spending/deployment/outreach/deletion approval.
Ask one short clarification for maybe/probably/sort of. Guidance does not replace
`ide present` before requesting a confirmation. All five IDE gates remain.

Explicit final Act assent automatically saves BUILD_HANDOFF.md/json, compact
CRUMB_CONTEXT.md/json, separate CRUMB_RESEARCH.json and a project-owned manifest.
For a bounded exact-scope commitment, that one approval covers implementation and verification within the displayed limits; internal planning does not add another founder permission. It still requires a verified executable plan and stage before code. Legacy unbounded commitments keep their original pack review. Call `build-transition` with truthful host capabilities:
`{"host":"chatgpt","sharedProjectFiles":true,"canExecute":false}` ONLY when
these project files really are available to the destination. This renders:
open Work in this same Project, then **Continue the Crumb build.** Otherwise use
sharedProjectFiles:false and explain the file-access limitation. No adapter opens
another chat, uploads files or accesses unrelated private files.

## Build continuation

After scoped Act assent, run `continue-build` in this already build-capable host;
the founder need not type a special phrase or open another session. Its exact request
is `{"phrase":"Continue the Crumb build.","host":{"host":"codex","sharedProjectFiles":true,"canExecute":true},"paths":[],"permissionQuote":"actual scoped founder permission"}`.
The host capabilities are nested for this operation. Paths are relative to the
Core target's saved projectReference, never `../` escapes. Fresh projects with no
existing code use an empty paths array. Existing apps require permitted actual
source files in that bound root, not installation or note documents as app evidence.
The core reads/verifies both context and handoff, confirms current revision/Act,
and inspects only selected files. Existing repositories require inspection.
No restatement of intention/user/problem/research is needed. Missing or stale
artifacts must be refreshed from current saved agreements; material changes need
only the affected IDE confirmation/evaluation loop.

Use the returned handoffHash in the Act plan's execution metadata:
`{"mode":"build","handoffHash":"returned hash","automaticStages":true,"humanCheckpoints":["mvp"]}`.
The final MVP and intended stopping stage must be checkpoints. Read actual repository
instructions and verify stack/environment; do not adopt Crumb's own architecture.
Use `work-pack` to save the proposed scope and generate all six documents in one
operation. It is an unapproved review pack, not an instruction to code.

Review the generated Startup Master, Red Team, Technical Master, Business Master,
Groundwork and Build Plan. Ground research in saved evidence. Use current official
research when pricing/fees/eligibility affect today's decision; otherwise leave
them explicitly unknown/deferred. Generic document guidance is not proof that
technical risks or commercial assumptions are resolved. Resolve material objections
through IDE/new scope and regenerate the pack; do not edit a hashed approved pack.

For the current bounded exact-scope Act approval, inspect the generated pack yourself and preserve the approved promise, capabilities, cuts, privacy and other limits. Do not claim the founder read or approved an unseen pack. Authorize the derived internal plan using `act-approve` with `{"expectedVersion":currentVersion,"planHash":currentPlanHash,"scopeConfirmationId":currentActReceiptId}`, then `act-handoff`; no second founder question or invented quote. Material changes require a new displayed scope and approval. Legacy commitments without that explicit implementation/verification envelope retain a separate exact pack review and `quote` approval. Perform real edits/checks using available native
host tools and `act-result`. After passed exit criteria, request the next handoff
only if the core reports it authorized. A failed check stays on the current stage.
At awaiting_review, ask the founder to try the normal flow, one bad input and anything
confusing. Stop. Do not ask them to write internal milestone prompts.

For each authorized stage, read its compact `act-handoff`, Build Handoff, applicable
master/technical sections, repository instructions and targeted source only. Search
symbols before reading files; use targeted hunks and focused tests before broad
regressions. Do not reload every build document per call, broadly format code or
rewrite complete files without a concrete reason. Continue ordinary bug fixes and retests inside the unchanged approved scope. For a verification-infrastructure timeout before exercising the app, retry once with a fresh isolated browser/process; if it persists, try an available alternate verification route before declaring a real blocker. Do not repair the product for a browser-startup defect, request permission to test, or mark unchecked cases passed. Stop only for a genuine unavailable capability/access or persistent diagnosed blocker, with actual partial receipts and one actionable founder dependency. Do not estimate unmeasured token savings.

Portable files are context, not independent execution credentials. They are readable
by other hosts, but this implementation resumes execution only with the same local
project state. Cross-host database import/cloud sync is not implemented. The host
reports execution; the core does not independently attest arbitrary external commands.
