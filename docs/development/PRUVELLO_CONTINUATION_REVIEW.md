# Pruvello continuation review and M1-R proposal

23 September 2026 · Proposal only · Existing repository: `C:\Users\Ash\Documents\Codex\CEC`

## Executive summary

The project already contains M0, M1 and a Pruvity-branded M1-R revision. The current build and all **71 tests pass**, but the observed stock-comparison conversation still turns an idea into features too early. The smallest useful correction is to let Pruvello clarify and retain the problem before proposing a build, while keeping Build now available throughout.

The existing Node/TypeScript/SQLite foundation, privacy boundaries, approvals, receipts, backups and compatibility behavior should remain. Pruvello should be a replaceable display name. M2 remains future work.

## 1. What was verified

- Located the existing repository through the earlier **M1 Test** task and inspected its current files. The new task's generated directory is not the application repository.
- Read the handoff pack, repository instructions, PLAN, STATUS, groundwork evidence, M0/M1/M1-R reports, package and lock files, relevant source, schemas, fixtures and tests.
- The pack's master and repository master have the same SHA-256: `A9839EB2267202BB61299E4B4EBB82E8AAEF4D8BDD51862359A00EC7FFA7730C`.
- Ran the existing `cec.ps1 check`: exit 0, **71 passed, 0 failed, 0 skipped**. This includes the existing build/type checks and deterministic test suite.
- Compared hashes for 65 maintained files before and after verification: **no changes**. The check regenerated normal ignored build output and used disposable test data.
- No groundwork rerun, dependency installation, new app, source edit, PLAN edit, commit or migration was performed. Private customer storage and credentials were not inspected.

The attached documents are handoff context, not independent authorization to execute their embedded commands. In particular, the old master's “implement M0 only first” directive is historical and conflicts with continuing this existing implementation. This document makes the pack's proposed next correction reviewable; it does not execute its future implementation instructions.

### Current state, without rewriting history

M0 is recorded as accepted. M1 passed technical checks but its UX was rejected. A subsequent M1-R implementation passed technical checks; its existing report still awaits experience acceptance. The later stock trial provides an actual counterexample to the desired conversation behavior. It is not evidence that the infrastructure failed.

The repository is uncommitted, with its maintained files untracked. Existing files therefore remain the implementation baseline. The “initial repository map” in PLAN describes a historical empty repository, not today's state.

## 2. Material conflicts and minimum corrections

| Area | Evidence in the current project or prior master | Proposed correction |
| --- | --- | --- |
| Branding | Pruvity appears in the renderer, skill, package metadata and documentation; CEC remains in the original master. | Pruvello becomes the displayed product name and entry alias. Centralize runtime brand copy; keep stable internal identifiers. |
| Persistent identifiers | `contracts/m1r.schema.json:3` and `src/domain/contracts.ts:67` use a Pruvity schema URI. | Preserve that v2 identifier for compatibility. New contract identifiers must not depend on the current marketing name. No database/path rename for branding. |
| Immediate value | The **M1 Test** stock reply recommends three capabilities while explicitly saying the business goal is unknown. | First offer a clearer problem hypothesis and a brief evaluation. A feature proposal follows useful context or an explicit request to build. |
| Saving early context | `contracts/m1r.schema.json:9` requires `proposal`; `workflow.ts:48` and renderers assume it exists. | Support an orientation draft without a build proposal. Saving intention/problem context must not require inventing capabilities or a learning-action commitment. |
| Meaning of unknown | Intention can be unknown, but the current representation does not distinguish unasked from deliberately skipped. | Retain whether intention was supplied, asked or skipped. Missing an answer does not mean “build now,” and skipping must not cause repeated questioning. |
| IDEAL | Master §03 uses UNDERSTAND → RESEARCH → REACH → LEARN → TEST/BUILD → OBSERVE → ITERATE. M1-R names IDEAL but still centers its saved flow on the next test. | Make IDEAL the conversational guide: Intention → Define → Evaluate → Act → Launch & Learn. Combine or revisit stages naturally; never require a completed checklist. |
| Evaluation | The implemented evaluation object chiefly represents research availability and sourced fixture findings. | Add a short judgment from available context: what seems promising, what seems weak, the key unknown and a cheap way to learn. No invented market evidence is needed for this preview. |
| Question count | Master §§03, 04, 05, 06, 11, 14 and 16 allow three questions; the current skill already says at most two. | Reconcile the master to normally one, at most two material questions. Test whole conversations, including compound questions. |
| Default response | Master §06.3 prescribes NEXT TEST / WHY THIS / DO NOW / PARK / OBSERVE. Current M1-R already implements a short Executive Summary and optional detail. | Preserve the new renderer approach and update the master. Apply it to orientation, correction and evaluation as well as build proposals. |
| Brevity and personality coverage | `conversation.ts` checks saved summary sentences and total proposal words. The opening test counts question marks; the suite does not judge natural problem progression or tone. | Retain useful automated limits and add transcript reviews for understanding, question load, tone, premature scope and skipped/reused context. |
| Build now timing | The skill explicitly offers it at proposed-test and detail branches. | Recognize it from every conversational stage. If a concrete scope already has authorization, proceed; otherwise show one compact scope for review without business homework. |
| Research depth | Master §03.2 defaults to three searches and five retained sources. | In M2, use a declared time/query budget with a stop when further searching adds little useful evidence. Source count is not a substitute for adequate coverage. M1-R still performs no live research. |
| Competitors and users | Existing M1-R topic labels already cover competitors, substitutes and habitats, but there is no implementation of deep evaluation. | Specify M2 depth: workflows, buyer, pricing, repeated praise/complaints, switching friction, actual metrics versus proxies, and relevant online/professional/physical user habitats. Retain traceable sources and limitations. |
| Startup master and red team | The original master excludes generic business-plan generation and broad roadmap generation. It lacks the direction update's optional persistent startup master and claim review. | Distinguish useful retained startup context from a compulsory business plan. M2 creates it when useful, summarizes it briefly and reviews consequential claims for evidence, contradictions and disproof. |
| Staged building | Existing M1-R can execute one approved slice. It has no staged customer-MVP plan. | Preserve that useful build path. M3 adds appropriately sized stages and review points, with portable Markdown context; it does not rerun groundwork on existing apps. |
| Launch and repeat learning | `workflow-store.ts:18–20` enforces revision 1 and one cycle; receipts retain unrecorded exposure. | Keep this limit in the correction. Plan deliberate multi-stage support in M3 and outcome/feedback continuity in M4. Do not portray code completion as customer exposure. |
| Milestone meanings | Original M3 is recurring feedback; M4 is paid-beta readiness. The new direction makes M3 Act and M4 Launch & Learn. | Rewrite the forward roadmap and reassign necessary recovery/privacy gates explicitly. Keep commercial ideas as deferred hypotheses rather than silently scheduling payment work. |
| Acceptance history | PLAN and STATUS describe the prior M1-R as implemented with a pending trial. | Append the observed conversation failure and the corrective scope. Preserve historical pass results, reports and approval records. Do not claim the new UX is accepted yet. |

### Already aligned: preserve these

Existing-project inspection permissions, source-versus-assumption labels, unknown answers, custom intention, short summaries, optional detail, zero forced interviews, scope-bound approval, immutable history, real check receipts and resume behavior are valuable existing work. The 120-word default limit is stricter than the update's approximate 60–150-word target and can stay. Short openings need no padding. The current three-capability limit remains a ceiling, never a quota.

## 3. Proposed minimum implementation boundary

### A. Retain an understanding before choosing an action

Add a versioned draft variant for orientation using the existing JSON draft storage. It carries the current intention, problem, provenance, important unknowns, concise evaluation and the next useful question/action. A proposed action is absent until there is a reason to choose one.

An actionable variant retains the existing complete proposal contract. Only an actionable draft can be approved for implementation. Draft edits retain optimistic version checks and invalidate stale approval. Keep v1/v2 loading and old approved snapshots byte-for-byte; no storage-table migration appears necessary for this correction because drafts already store versioned JSON bodies.

The host still interprets the founder's language. Structured validation can enforce shape and limits; transcript evaluation must check the quality of reasoning. Do not claim a schema can prove that the founder's problem was understood.

### B. Separate availability from advice

The short evaluation may use the founder's statements and permitted code observations, with inferences labeled. “Research not run” is a capability state, not the evaluation itself. Research, competitor and source actions in M1-R must continue to explain their limits honestly. Do not add a research engine to make these examples work.

### C. Keep renaming cheap

Use a small brand configuration for runtime display name and tagline. Add a Pruvello-facing skill entry while keeping `$pruvity` and `$customer-evidence` compatibility aliases. Keep one substantive workflow reference rather than copying its instructions across aliases. Documentation and skill metadata necessarily have a small, explicit rename checklist.

Preserve `.customer-evidence`, `cec.sqlite`, SQL identifiers, existing contract IDs, package identity and launcher compatibility. The current private package can retain its internal name; its description can use Pruvello. New schemas and durable fields use stable neutral names. No new runtime dependency is proposed.

### D. Files likely to change after approval

- Current skill and conversation references; Pruvello entry/legacy aliases and discovery expectations.
- Draft contracts, validation, workflow handling and renderers to support pre-proposal context.
- A small runtime brand module, relevant CLI copy, targeted fixtures and tests.
- Master specification, PLAN, STATUS, README and trial guide; a new ADR for compatible orientation drafts.
- A new `M1_R_REPORT.md` for the correction, linking to the existing historical `M1-R_REPORT.md` rather than overwriting it.

The existing privacy/storage/SQLite/backup foundation should only change if a demonstrated defect requires it. No M2 capability, new project, dashboard, CRM, outreach sender, cloud sync, multi-agent system or additional coding-agent integration is in this proposed correction.

## 4. Exact conversation examples

These are proposed product copy using synthetic scenarios. They are not reports of newly executed builds, actual customer findings or live research. Stage labels below are reviewer annotations, not screens shown to the founder. Quoted Pruvello replies are intentionally short.

### Shared opening when context is absent

**Pruvello**

> **Executive summary:** We’ll start from where you are and work out what matters next. You can choose Build now at any point.
>
> Are we starting fresh, or do you already have a project in progress?
>
> **Starting fresh · Existing project**

If the opening message or retained context answers this, skip the question.

### A. Fresh founder with only an idea

**Founder:** “Starting fresh. Agencies waste time chasing clients for missing files.”

**Pruvello — Intention and an initial problem hypothesis**

> **Executive summary:** I think the problem may be stalled client work, with file chasing as the symptom. That’s a hypothesis we can sharpen without planning a whole product.
>
> What are you hoping this becomes?
>
> **Answer in your own words · Build now**

**Founder:** “A profitable solo business. I saw this at my old agency.”

**Pruvello — Define**

> **Executive summary:** A narrow, recurring problem could fit the business you want. My working picture is an agency project manager trying to start work while missing material is scattered across messages.
>
> Last time you saw this, what actually held up the project?
>
> **Tell me · Correct my understanding · Build now**

**Founder:** “Nobody knew which files were still missing, so the manager checked every email.”

**Pruvello — Evaluate**

> **Executive summary:** The narrower problem is reconstructing what’s missing before work can start. Your experience suggests a real workflow cost; how often it happens and whether agencies would pay remain unknown. I’d first examine one recent handoff to see where the manager lost time.
>
> The detail below is optional—you can continue without reading it.
>
> **Review that handoff · Build now · Why?**

**Founder:** “Build now.”

**Pruvello — Act**

> **Executive summary:** We can build now. I’d keep the test to entering required and received files, then showing what is missing. This tests clarity; it leaves willingness to pay unknown.
>
> **Build this checklist · Adjust scope · Why?**

**Founder:** “Build this checklist.”

Implementation proceeds with the existing approval/receipt path, without another confirmation. If checks genuinely pass, the completion copy can be:

**Pruvello — Launch & Learn preparation**

> **Executive summary:** The checklist works in the local checks. Whether it saves an agency time is still unknown. Try it on one handoff and note where someone still has to search their messages.
>
> The detail below is optional—you can continue without reading it.
>
> **Try the example · View checks**

### B. Existing project with no customer contact

**Founder:** “I already have an invoice tracker. No users yet; I want a profitable solo business.”

**Pruvello — Relevant inspection, with Intention already known**

> **Executive summary:** We can start with the tracker you have and keep its working parts. Your goal is a profitable solo business; customer demand is still an open question.
>
> May I read its instructions, README, package file, invoice module and test to understand the current workflow?
>
> **Read those files · I’ll describe it · Build now**

**Founder:** “Yes.”

For the existing synthetic fixture, after reading those files:

**Pruvello — Define from the existing application**

> **Executive summary:** The code totals unpaid invoices, but it doesn’t help someone choose which overdue invoice to follow up on. I suspect the missing value is deciding what needs attention during a weekly review, rather than another total.
>
> Is that the problem you intended to solve?
>
> **Yes · Correct my understanding · Build now**

**Founder:** “Yes. Small agency owners review this every week.”

**Pruvello — Evaluate**

> **Executive summary:** A weekly decision gives us a specific job to test. We still don’t know how owners choose an invoice today or whether the oldest one is the right priority. I’d ask one owner to walk through their last review; you can build first if you prefer.
>
> The detail below is optional—you can continue without reading it.
>
> **Prepare that question · Build now · Why?**

**Founder:** “Build now; try oldest first.”

**Pruvello — Act**

> **Executive summary:** We’ll keep the working total and add a view of unpaid, overdue invoices ordered oldest first. That tests your proposed ordering while preserving the current JavaScript app. Automatic reminders can wait.
>
> **Build this view · Adjust scope · Why?**

After approval and genuinely passing implementation checks:

**Pruvello — Launch & Learn preparation**

> **Executive summary:** The overdue view works, and the existing total still passes its check. We haven’t yet seen an owner use the ordering. The useful next observation is whether they choose the first invoice or need different context.
>
> The detail below is optional—you can continue without reading it.
>
> **Try the view · View checks**

### C. Existing project with customer feedback

**Founder:** “Same invoice project; you already have permission to read those files. I want a sustainable B2B company. In this synthetic scenario, two pilot users couldn’t choose what to chase, and one asked for automatic reminders.”

**Pruvello — Reuse context; Define and Evaluate**

> **Executive summary:** The feedback points to trouble prioritizing follow-ups. A reminder request may be a proposed solution, but it doesn’t yet tell us why choosing is hard. I’d separate those before adding automation.
>
> Did they struggle to identify overdue invoices, or to decide which deserved attention first?
>
> **Clarify · View evidence · Build now**

**Founder:** “They could see the invoices. They lost track of who they’d already chased.”

**Pruvello — Correct the problem before choosing features**

> **Executive summary:** That changes the problem: they’re reconstructing follow-up history, not missing an overdue sort. Your reported feedback supports testing that workflow; it doesn’t establish demand for automatic reminders. I’d focus on whether they can find the last follow-up quickly.
>
> The detail below is optional—you can continue without reading it.
>
> **Review one example · Build now · View evidence**

**Founder:** “Build now.”

**Pruvello — Act, with a different scope justified by the correction**

> **Executive summary:** Keep the existing invoice total and add one way to record and display an invoice’s last manual follow-up. That tests whether visible history resolves the confusion. Automated sending stays parked.
>
> **Build this test · Adjust scope · Why?**

After approval, actual implementation and passing checks:

**Pruvello — Launch & Learn preparation**

> **Executive summary:** The local example now records and shows the last follow-up. That is a technical result; the pilot users haven’t tried this change. Watch whether they can decide what to do next without reconstructing the history elsewhere.
>
> The detail below is optional—you can continue without reading it.
>
> **Try the example · View checks**

This branch deliberately differs from the existing fixture, which proposes the same oldest-first view for both no-feedback and feedback cases. The correction must demonstrate that new information can change the proposed test. Actual post-build feedback ingestion and another approved cycle remain M4 work.

### D. Stock-comparison regression

Use the original idea from **M1 Test**: the founder can find promising stocks but struggles to compare them using popularity/volume, CEO buying or ownership, sector, growth, catalysts, Fibonacci notes and risk/reward. No repository fixture for that conversation was found; add a synthetic regression fixture after approval.

**Founder:** “Starting fresh. I can find promising stocks, but comparing them using my swing-trading criteria is difficult.”

**Pruvello — Intention; no feature list**

> **Executive summary:** I think the difficulty is making a consistent comparison when several candidates look promising. We should clarify what that decision needs to achieve before choosing features.
>
> Is this mainly a tool for your own trading, or something you want to sell?
>
> **For myself · A business · Build now**

**Founder:** “For myself first. Maybe sell it later.”

**Pruvello — Define**

> **Executive summary:** Your immediate goal is a clearer personal decision, with a business as a later possibility. My hypothesis is that you’re repeatedly assembling the same evidence but struggling to weigh conflicting criteria.
>
> In your last comparison, was gathering the information or making the trade-off harder?
>
> **Gathering information · Making the trade-off · Build now**

**Founder:** “The trade-off. I have the information in different notes.”

**Pruvello — Evaluate**

> **Executive summary:** The problem is comparing conflicting evidence consistently, rather than finding more stocks. Your own notes give us a concrete test; whether dedicated software helps more than a spreadsheet or general AI remains unknown. I’d first replay one past comparison and see where the reasoning breaks down.
>
> The detail below is optional—you can continue without reading it.
>
> **Replay a comparison · Build now · View research**

**Founder:** “View research.”

**Pruvello — Optional detail, truthful about availability**

> **Executive summary:** No research has run, and live research isn’t available in this prototype. A useful later search would compare how traders use notes, spreadsheets and dedicated tools, especially where they lose track of trade-offs. You can continue without that research.
>
> **Back · Build now**

**Founder:** “Build now.”

**Pruvello — Act**

> **Executive summary:** We can build a small comparison using two synthetic candidates and your own criteria. It will display the notes side by side and make missing information visible. It tests comparison clarity; it won’t recommend a trade or claim which stock will perform best.
>
> **Build this comparison · Adjust scope · Why?**

After approval, actual implementation and passing checks:

**Pruvello — Launch & Learn for a personal tool**

> **Executive summary:** The synthetic comparison works in the local checks. The next useful test is whether you can explain the trade-offs more clearly than with separate notes. Your experience can guide a personal tool; a commercial product would still need evidence from other intended users.
>
> The detail below is optional—you can continue without reading it.
>
> **Try the comparison · View checks**

These examples concern product behavior, not stock selection or financial advice. No live market claim is made.

### Build now immediately, including skipped questions

If the founder's first message explicitly requests a small build, do not force the preceding conversation. Reflect the supplied goal and uncertainty in two or three sentences, show only any still-unspecified scope, and proceed once that concrete scope is authorized. “Unknown,” “skip,” and “I don't want business guidance” are valid; retain the context and avoid asking again. Choosing Build now before a scope exists expresses a preference for building, not approval of capabilities the founder has never seen.

## 5. Acceptance tests for the correction

Existing passing tests are the regression baseline. Add checks that can fail for the observed problem, rather than only confirming that fixtures already contain the desired answers.

| Test | Required observation |
| --- | --- |
| Raw idea, no build request | Fresh agency and stock inputs produce an intention/problem turn, no recommended feature list, and no fabricated approval. |
| Conversational IDEAL | A transcript establishes or explicitly skips Intention, reframes Define, offers a short Evaluate, and reaches Act only with useful context or a build request. No stage-completion wizard. |
| Context already supplied | A rich opening skips already-answered entry/intention questions. A returning session resumes rather than restarts. |
| Orientation persistence | Save, close and reopen a draft with no action proposal. Problem, goal, skipped answers and uncertainty survive without creating a cycle. |
| Approval boundary | An orientation-only draft cannot generate an implementation handoff. The same existing scope approval works once; changed scope rejects stale approval. |
| Immediate Build now | At opening, Define, Evaluate and optional detail, explicit build preference reaches a small scope without mandatory interviews/research/known buyer. Already-authorized concrete scope is not reconfirmed. |
| Brevity | Normal substantial replies start with an executive summary of 2–5 short sentences; retain the 120-word default ceiling including choices. Openings can be shorter. Future research summaries target 100–200 words before expansion. |
| Question load | At most two material questions per normal turn, normally one. Count independent asks, not just question marks; no multipart questionnaire disguised as one question. |
| Progressive disclosure | Reasoning, evidence, sources and checks remain optional. Expansion preserves the draft and approval state; Back and Build now remain usable. No unseen capabilities are approved. |
| Existing project, no users | Named permitted files inform a correct implementation summary. Existing stack and file hashes are preserved during orientation; code never becomes evidence of demand. |
| Feedback changes the decision | In the invoice transcript, learning that follow-up history is missing changes the draft away from oldest-first sorting. The founder does not paste the same feedback twice. |
| Evidence honesty | Founder reports, code observations, assumptions and actual public sources remain distinct. Unavailable research is not fabricated; a proxy never becomes private revenue. |
| Tone | Human review finds specific, calm and useful copy with uncertainty stated directly; no hype, lectures, consultant jargon, patronizing correction or automatic pivot. A phrase denylist alone is insufficient. |
| Stock regression | Personal-versus-commercial intent is surfaced or explicitly skipped; the comparison problem is reframed; generic substitutes are an uncertainty. The rejected three-feature recommendation fails the rubric. |
| Brand compatibility | Changing display branding does not change schema IDs, database location, saved hashes or old approvals. Both legacy entry aliases remain usable. |
| Existing regressions | All current storage, privacy, immutable history, source handling, offline, receipt and backup checks still pass, along with v1/v2 compatibility. |

Use deterministic tests for contracts/rendering/persistence and observed conversational rehearsals for meaning and tone. Record the actual prompt and reply, questions, repeated context, corrections and acceptance result. Do not label authored example conversations or passing unit tests as a successful independent founder trial.

## 6. Proposed master and PLAN edits

1. **Master authority and thesis:** add current display branding and describe the initial value as a clearer problem with low reading effort. Keep solo technical B2B founders as the initial focus without forcing every user's goal to be venture scale.
2. **Master §§03–06 and §11:** replace the old loop/output rules with conversational IDEAL, one-or-two-question limits, executive summaries, optional detail and a Build now escape. Preserve Keep / Test / Park for appropriate Act decisions.
3. **Master research requirements:** specify bounded depth, stopping criteria, problem-language research, competitor learning, substitutes, source limitations, metric-versus-proxy distinctions and user habitats. Maintain permitted host research and the offline deterministic core.
4. **Master context and building:** define the optional startup master and red-team review for M2; proportionate staged implementation and portable Markdown for M3. These must not become mandatory founder reading or a prescribed number of milestones.
5. **Master acceptance and validation:** add the transcript criteria above; measure whether the problem became clearer, not just how fast a build was approved. Preserve source integrity, privacy and recovery requirements.
6. **PLAN/STATUS:** retain completed work and historical results. Add an unchecked “Pruvello M1-R correction” section with the precise proposed files/tests and observed stock failure. Replace only the forward roadmap. Technical pass and founder UX acceptance remain separate statuses.

### Revised milestone roadmap

| Milestone | Scope | Exit evidence |
| --- | --- | --- |
| M1-R correction | Conversational IDEAL orientation, useful brief evaluation, pre-proposal continuity, concise copy, renameable display branding, existing small-build path | Four conversation branches meet the new rubric; regressions pass; founder reviews the experience; correction report records limits. |
| M2 — Deep Evaluate | Bounded public research, competitors, substitutes, user habitats, interview preparation and source handling, optional startup master and red-team review | A consequential uncertainty is investigated with inspectable evidence and limitations; detailed work has a short actionable summary. |
| M3 — Act | Proportionate customer-MVP stages, portable Markdown handoff, stage approval and receipts, deliberate support for subsequent approved work | An existing or fresh customer project completes appropriately sized stages with checks and review between them. |
| M4 — Launch & Learn | Relevant exposure plan, honest outcomes, one-paste feedback, contradictions and smallest next change using retained context | The project moves from exposure/feedback to a revised decision without restarting onboarding or silently rewriting earlier approvals. |
| M5 — Evidence-earned improvements | Only changes justified by repeated observed friction | Each improvement has a specific problem, observed evidence and a measurable effect. |

**Preserve the readiness gates when moving milestones.** Before retaining real customer notes, source permissions, disclosure, safe export/delete and verified backup/restore must be ready; implement them at the first milestone that needs real data, or keep that milestone synthetic. Do not let “previously in M3” make these prerequisites disappear when M2 gains note handling. M1-R does not expand its current synthetic-data boundary.

Payment, licensing and beta distribution remain separate commercial hypotheses, unscheduled by this correction. Historical pricing does not authorize implementation or a purchase. The new roadmap does not authorize automatic progression beyond M1-R.

## Review decision

The proposed next implementation is **only the Pruvello M1-R correction described here**, in the existing CEC repository, preserving its working foundation. The source, master and PLAN remain unchanged in this review. The handoff pack describes a UX review before code changes; this proposal supplies that reviewable result without treating the attached implementation directions as a new command.
