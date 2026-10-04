# Crumb repository instructions

Use PRODUCT_SPEC.md v0.12 as product authority and PLAN.md / STATUS.md for state.
The current authorized work is the focused M3-R1 product-quality correction,
preserving Conversation Mode to Work/Build Mode. Do not start another milestone.
Reuse the approved milestones. Record actual work in M3_R1_REPORT.md; stop before
any later revision or M4. The R1 mode/pack/checkpoint policy supersedes earlier
per-stage-only wording for new R1 plans; legacy M2 runs retain their review policy.
On 26 September 2026 the founder accepted M1-R3 well enough to proceed and
authorized M2: Act plus small shared conversation improvements. Continue this
existing repository; do not redesign M1-R3, re-scaffold or restart groundwork.
The founder has now approved M2 and authorized M3 Launch & Learn. Record current
work is preserved in M3_REPORT.md. Reuse confirmed IDE and the reviewed MVP.

- Preserve all existing code, uncommitted work and Git history. The founder now
  authorizes committing and pushing completed work regularly to `main` on
  `origin`; review staged files for private data and run relevant checks first.
  Do not create a replacement application.
- Use Node 24.19.0, the existing lockfile and npm. cec.ps1 check selects the pinned
  runtime; direct pinned Node scripts/check.mjs is equivalent. Do not change global
  runtimes or Git settings. Enter-CECEnvironment.ps1 is a local untracked helper.
- Run appropriate tests, including all M1-R3 regressions. Report actual commands,
  exit codes and limitations. Synthetic dialogue is not a real founder trial.
- Keep node:sqlite imports in src/persistence/. The core stays offline; no new
  database binding, backend, model SDK or dependencies are needed for M3.
- Never inspect .customer-evidence/, .env, credentials or private customer notes
  during discovery. Use synthetic target fixtures; no raw confidential imports.
- Protect private paths from Git before storage writes; stop on tracked private
  data. Never automatically untrack files or relax privacy checks.
- Keep the five M1-R3 confirmations and their invalidation rules. No Act scope,
  feature plan or implementation before current confirmed IDE and explicit Act.
- M2 adds a separate append-only stage journal and scoped customer build packs.
  Preserve M1 cycles/receipts and prebuild revisions. Park means preserve.
- Respect customer stacks and instructions. Unknown customer environments get
  proportionate groundwork; known working setup is reused. Do not copy Crumb's
  runtime/database or install unnecessary dependencies into a customer application.
- Execute only the approved stage with the current handoff; record actual results,
  stop for review, and never equate passing tests with customer validation.
- No autonomous outreach, spending, deployment, billing, broad UI work or autonomous agent
  delegation. Freeform host behavior still needs founder evaluation.

Keep CEC_MASTER_SPEC_v0.5.md and every existing M0/M1/M1-R/M1-R2/M1-R3 report,
test guide and historical rehearsal record unchanged. Update active documents
with actual M3 behavior. Preserve M2 reports and acceptance evidence as history.
M3 uses pseudonymous, attributed evidence; synthetic fixtures remain labeled.
Passing tests, outreach, opinions, usage, commitments and payments stay distinct.
No automatic feature builds follow feedback. Branding stays in display configuration; persistent
identifiers, package identity, private paths and historical contracts remain stable.
