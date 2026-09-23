# ADR 0005: Pruvity M1-R, compact conversation and compatible state

Accepted 2026-09-23 after the user approved the proposed flows. Their Pruvity/IDEAL
requirements supersede conflicting CEC branding and M1 response shape in the master.

Keep the strict TypeScript/Node/SQLite architecture and dependency lock. Add draft
contract version 2 rather than changing persisted v1 snapshots: intention, suspected
consequence, founder-reported feedback, evaluation preview and a short reviewed
brief. The existing JSON body columns need no SQLite migration. Read/approve/resume
v1 unchanged; never rewrite approved snapshots or their hashes. Approval/receipt
contracts remain v1. The internal legacy .customer-evidence path, cec.sqlite and
cec.ps1 remain compatibility names, not user-facing positioning.

Default responses start Executive Summary, list the complete capability scope, one
recommended action and at most three choices. Enforce <=120 words for new drafts
before saving; the host shortens its own prose instead of asking the founder to.
Do not truncate capabilities to meet this budget. Optional detail paginates to
bounded sections; HTML details is opt-in with escaped content. Keep long acceptance
criteria in the internal handoff and requested detail. Build now approves the
displayed build scope, not an unseen draft or a different learning method.

Evaluation states are a preview contract, not a research engine. Available findings
must be explicitly synthetic fixtures with source/date/limitation and a disclosed
metric/public proxy/public observation type. No live findings are gathered in M1-R.
Source structure is validated, not source truth. Code tests and supplied feedback
never automatically promote customer validation. Prior feedback is separate from
whether this new approved test has been released or exposed.

Primary skill is .agents/skills/pruvity. Retain customer-evidence as a narrow legacy
alias so old invocations remain useful. No global installation or customer-project
skill copying. The host remains the conversational reasoner and implementer.

No dependencies added, no network engine, no M2 work. Synthetic rehearsals check
implementation and response budgets, not independent founder usability.
