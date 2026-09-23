# Pruvello repository instructions

Use `PRODUCT_SPEC.md` as product authority and `PLAN.md` / `STATUS.md` for
milestone state. The user's approved Pruvello M1-R correction supersedes conflicting
branding/UX requirements in the master. Implement only the authorized milestone.

- Use the pinned Node version in `.node-version`, npm and the repository lockfile.
  On this machine, dot-source `Enter-CECEnvironment.ps1` in the same PowerShell
  invocation as development commands. It is a local, untracked environment helper.
- The preferred Windows shortcut is `cec.ps1 check`; it selects the pinned runtime.
- Run `cec.ps1 check` or `npm run check` with the pinned runtime for TypeScript and tests.
- Keep `node:sqlite` imports inside `src/persistence/`; no third-party database
  binding is approved. Keep core behavior independent of external networks.
- Never inspect `.customer-evidence/`, `.env` files, credential stores or customer
  notes as part of repository discovery. Use synthetic test fixtures only in M1-R.
- The initializer must protect private paths from Git before writing storage and
  must stop if any private path is already tracked. Never automatically untrack data.
- Preserve target project code, manifests, instructions, Git settings and conventions.
  Do not copy CEC's stack into a customer's repository.
- Report executed checks accurately and distinguish untested host/release claims.

The user approved the continuation proposal and explicitly said "approved, start". Implement its M1-R correction without requesting that approval again. It ends after one approved test and
actual implementation receipt, with a minimal local backup. No M2 research, Reach
Pack or customer-source import is authorized. Founder-reported synthetic feedback
may inform a draft but does not establish validation. No multi-agent system, hosted service
or later-milestone workflow belongs in this slice.

Keep CEC_MASTER_SPEC_v0.5.md and the historical M0/M1/M1-R reports unchanged.
Record this correction in M1_R_REPORT.md. Branding belongs in display configuration;
never rename persistent storage/contracts or re-scaffold the existing project.
