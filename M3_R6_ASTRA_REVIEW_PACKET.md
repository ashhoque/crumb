# M3-R6 — Astra review packet

Sol implementation is ready for review, not released. Main remains shipped R5.

## Verified baseline and authority

Remote/local main and global source HEAD were `9e0c8bfd884f6e92655d5c08bb00e8f732265968`;
R5 final gate was PASS WITH WARNINGS. Clean project checkout, authenticated origin
`https://github.com/ashhoque/crumb.git`, Node **24.19.0**. Created `m3-r6` from that
main. Native skill inventory found exactly one enabled user skill, at
`C:\Users\Ash\.agents\skills\crumb\SKILL.md`; no active legacy aliases.
Baseline SKILL SHA256 was `db563b0abc5cbf43ee8862654fd6cecf3f9757562040c94ccfff698c35b36231`.
Unrelated global `GLOBAL_CRUMB_SETUP.md` and `notes/` are preserved, not inspected.

CURRENT_PRODUCT_AUTHORITY.md (1,104 words) now holds stable current invariants.
PRODUCT_SPEC.md retains cumulative history with a pointer; AGENTS uses the new
authority and five INTERNAL consent/dependency subjects, not five visible intake
confirmations. README/setup describe current UX/installation without stale revision
claims. Doctor reports actual Node/SQLite, source revision, skill location and
STATUS path; legacy package/schema/private storage identifiers are unchanged.

## Architecture and smallest changes

Kept offline TypeScript/ESM Core, Node SQLite, Ajv, node:test, CLI/read-only MCP,
existing research, Market Pulse, Opportunity, First User, Bootstrap, Snapshot and
working-context engines. No dependency, backend, router or preference subsystem.

Source causes were stale cumulative authority/runtime history; a four-input
founder planner; guidance consulting only formal fields; and common inputs missing
from the locator. A live test additionally exposed notes ready for review while
formal thesis drafts remained empty.

- **Payload:** explicit seven-file source allowlist: SKILL, host/codex and research,
  local-tools, act, modes, learn. Previously nine source files. Conversations and
  interviews-master are preserved in docs/legacy-skills/crumb, along with the old
  research reference. Installer removes only hash-matching known old references;
  modified history stops installation. Runtime locator is the additional generated
  local file. Final source payload **9,074 vs 15,682 words** (~42% smaller).
- **SKILL:** **2,039 vs 2,348 words** (~13% smaller). Continuous personality,
  selective humor; CEO brief, Executive Ask, fastest credible learning and pre-Act
  preparation strengthened. One surgical clarification supports compact initial
  thesis review; no personality duplicated in host instructions.
- **Research:** **2,098 vs 2,299 words**. Superseded active M1-R3 section archived;
  fastest credible learning replaces cheapest-step wording. Slow-test escape hatch
  distinguishes proxy limits from outcomes, with safe parallel preparation.
- **Locator:** six common inputs added (research-decision, market-pulse,
  founder-move, first-user-plan, outreach-draft, validation-asset), plus compact
  enum/limit notes. Examples execute through actual CLI in tests. Generated locator
  is 5,865 bytes; it grows while reducing need to load specialist operation details.
- **planFounderMove:** optional bounded stage/evidence/horizon/faster-evidence/effort
  fields preserve older callers. Built/prototype/live with none/weak customer evidence
  selects first_users; long horizon with credible faster evidence selects parallel
  learning; high effort plus researchable gap selects Crumb research; current evidence
  and clarification stay fast. No output grants consequential permission.
- **nextIdeStep:** reuses sourced medium/high-confidence known/inferred customer and
  problem; rejects stale/unknown/weak/unsourced notes. One combined firsthand ask
  replaces serial missing-context intake. Notes alone never confirm foundations.
- **Thesis repair:** present-thesis fills only missing provisional drafts from
  credible objective/customer/problem notes, keeps existing truth and skipped/open
  intention, preserves attribution as supporting **assumption** claims rather than
  independent evidence, and uses existing basis/invalidation/exact-display checks.
  Formal Evaluation remains separate. Presentation creates no receipt or Act consent.

## TEXT evidence and semantic judgment

All live execution used discoverable **GPT-6.1 Sol Medium**, real installed skill
and host tools, isolated synthetic founders. Public research was live. Full exact
assistant messages, including failed attempts, are in M3_R6_LIVE_TRANSCRIPTS.md.

`closeout-host-1791258643017` at b65216d: **20 completed turns**, zero identity leaks.

- **14-turn personality/learning conversation:** unrelated Manchester pottery studios.
  Warmth, earned support, strong opinions, curiosity, selective wit and research voice
  passed. Three months of bills did not block historical analysis/preparation; Crumb
  explained confounders, proxy limits and required later outcomes. Glaze-temperature
  evidence changed the claim rather than forcing fuller kilns. Existing-format files,
  no backfilling; invitation/questions and a real local review brief prepared pre-Act.
  Across 14 substantive turns momentum stayed understandable. Early readiness/chasing
  questions asked firsthand truth; permission/file sharing/contact remain founder tasks.
- **Built/zero users:** Bristol repair beta automatically got one-line problem/user/pain,
  three direct public shop routes, research/recruitment distinction, invitation,
  five questions, competitor numbers, £10–20 hypothesis/£15 first paid offer and decision
  signal. It challenged ignored-reminder evidence. No founder search/link homework.
- **Model advisor:** routine invitation had no model talk. A 600-page request got one
  capacity/scope warning and narrower contract-first alternative; no fabricated costs,
  availability or claimed switching. Preference storage wasn't needed. Actual runtime
  has no dynamic model switch; thread-start harness selection is not product routing.
- **Connection/export:** existing records requested once in existing format, gaps allowed;
  no connector invented or broad access requested. Founder supplies private access and
  firsthand truth; Crumb performs research/calculations/preparation.

Initial Market→thesis run `1791258708659` timed out at 300 s with two rejected
full-dossier writes. The pottery opening also had one rejected thesis call. These
exposed the compact-draft bridge above; no failures are concealed.

Final installed retest `1791259292847` at **ed0cd80**: research/evidence/opinion precede
the exact thesis; **158.6 s**, five queries/eight commands, zero opening command failures
or discovery. Agreement follow-up **30.6 s** used one failed full-reply parse and one
successful correction using the verbatim agreement sentence. Independently inspected
the exact synthetic child context: **three foundation receipts**, every reviewed text
visible in prior assistant speech, quote contained in actual founder reply, no Act
approval and no Evaluation receipt. No send/build occurred. Test root's compact state
does not include child receipts, so this direct persistence check was necessary.

Personality contract stayed unchanged by the mechanical thesis repair. Captured actual
native instructions retain the generic skill-announcement rule and installed developer
exception; no proven higher-priority voice conflict. Host/codex.md is unchanged.

## Tests, efficiency and review issues

- Initial focused **28/28**; safety/First User/IDE **101/102**, only an obsolete
  case-sensitive wording guard failed, then corrected focused market/operator **15/15**.
- Thesis/receipt repair focused **20/20**; current contract/market/context **23/23**.
- Initial full **349/349**; final full **351/351**, exit 0, no failures/skips,
  **168.1 s**, `.m0-local/m3r6-full-final.log`.
- Initial sandbox-only EPERM failures were filesystem permission errors; normal-host
  reruns passed. New guards are contract checks, not humor/personality proof.
- Pottery opening **84.6 s**, four queries; built-users **140.6 s**, four queries.
  Ordinary no-tool replies **1.9–10.3 s**; saved updates/artifacts **36.6–42.9 s**.
  No Core source/tool rediscovery or duplicate exact queries; ordinary follow-ups reuse
  evidence with zero reads/web. Built-users read three distinct progressive references
  (research, learn, local-tools); locator expansion doesn't eliminate every reference.
- No token accounting claim: smaller payload is measured; source/model latency varies.
  Before/after thesis runs are observations, not a controlled performance benchmark.

**High-value Astra issues:** initial formal thesis fallback still says “Not yet
investigated”/buyer unknown despite current research in working notes. Crumb explained
that mismatch before exact display; receipts are correct, but the integrated review
presentation needs judgment. Formal response was longer than the intended CEO brief.
Occasional progress repetition and the natural assent sentence-extraction retry also
remain. Decide whether to improve the smallest render/basis seam; never silently
approve rewritten evidence or weaken Act. Synthetic founders remain a warning.

Implementation commits **6442f7a, b65216d, ed0cd80**, pushed on m3-r6. Documentation
closeout advances dev/global tip without product changes. Main remains **9e0c8bf**;
no merge/push. Global development candidate source is C:\Users\Ash\Documents\Codex\CEC.
All seven active files, generated locator and native guard are verified in sync.
Final SKILL SHA256: `a02c9649d6b6c676694df50c875e846086eae8229c688068b1ecee3f93b9a8a3`.
Host guard SHA256: `9de2e3a663886c1e7f953894b0359157acf6326ff6dfd6f9aef20e8196a269e0`.

M3-R6 READY FOR ASTRA REVIEW
