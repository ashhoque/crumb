# Crumb repository instructions

Use `PRODUCT_SPEC.md` as product authority and `PLAN.md` / `STATUS.md` for
milestone state. The user approved M1-R2 on 23 September 2026. The initial code and
document checkpoint was pushed to ashhoque/crumb at a601e85 before this work.
M1-R2 implementation and its checks are recorded in M1_R2_REPORT.md. Stop before
the revised M2 unless the founder explicitly authorizes that milestone.

- Use the pinned Node version in `.node-version`, npm and the repository lockfile.
  On this machine, dot-source `Enter-CECEnvironment.ps1` in the same PowerShell
  invocation as development commands. It is a local, untracked environment helper.
- The preferred Windows shortcut is `cec.ps1 check`; it selects the pinned runtime.
- Run `cec.ps1 check` or `npm run check` with the pinned runtime for TypeScript and tests.
- Keep `node:sqlite` imports inside `src/persistence/`; no third-party database
  binding is approved. Keep core behavior independent of external networks.
- Never inspect `.customer-evidence/`, `.env` files, credential stores or customer
  notes as part of repository discovery. Use synthetic fixtures for tests; bounded
  permitted public host research is authorized for M1-R2. No raw confidential
  customer-source import is authorized. Founder reports are not verified evidence.
- The initializer must protect private paths from Git before writing storage and
  must stop if any private path is already tracked. Never automatically untrack data.
- Preserve target project code, manifests, instructions, Git settings and conventions.
  Do not copy CEC's stack into a customer's repository.
- Report executed checks accurately and distinguish untested host/release claims.

M1-R2 brings meaningful pre-build Evaluate, competitor learning, user language,
metrics/proxies, habitats/avenues, interview preparation, optional startup master
and red team forward from the old M2. Keep the local core offline; the host conducts
permitted research. No outreach, spending, deployment, hosted backend, crawler or
staged/repeated build engine belongs in this milestone. Preserve the existing
explicit-build path, approvals, receipts and immutable history.

Keep CEC_MASTER_SPEC_v0.5.md and the historical M0/M1/M1-R reports unchanged.
Keep M1_R_REPORT.md unchanged and record this milestone in M1_R2_REPORT.md.
Branding belongs in display configuration;
never rename persistent storage/contracts or re-scaffold the existing project.
