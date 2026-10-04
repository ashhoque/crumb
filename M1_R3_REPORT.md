# M1-R3 — IDE before Act

Implemented in the existing repository following the founder's 23 September 2026 approval. The local implementation is complete; founder UX acceptance remains pending. The revision preserves the working infrastructure and history and stops before M2. No commit or push was performed.

## What changed

M1-R2 allowed a provided intention, a research-ready status or an explicit build request to lead into solution scope. M1-R3 requires five distinct agreements: current Intention, User and Problem confirmation; founder review of Evaluation; and explicit final Act consent. The same guard protects action drafting, scope approval and executable handoff. Act consent permits scope discussion, not implementation of an unseen scope.

The application now issues a displayed statement and binds its confirmation to that statement, context generation and a distinct founder turn. Edits invalidate the affected and downstream agreements. Changing a statement and later restoring its wording cannot revive old consent. Name changes, optional-detail reads and whitespace-only formatting retain substantive confirmation. Historical records remain immutable and readable.

Evaluation retains M1-R2 evidence, sources, competitors, user language, habitats and red-team work. It adds relevant inquiry links, 28 coverage dimensions in total, nine alternative categories, counterevidence, a decision synthesis and a redefinition state. Agent review and founder review are separate operations. Research unavailable or incomplete cannot become a completed review by setting a flag.

The Crumb skill now guides the natural confirmation and Define/Evaluate loop. Its four-choice commitment summary uses the exact question **Ready to commit a build cycle to this?** Interviews and an optional opportunity brief stay within IDE; solution sections remain gated. Legacy upgrades and portable imports replace stale “build now” summaries with current confirmation guidance.

No dependencies, stack changes or new database migration were needed. New prebuild JSON v2 and action contract v5 use neutral identifiers. The existing append-only store, artifact checks, concrete-scope approval, receipts and backup mechanisms remain. Package identity, private storage paths, runtime pin and older schemas were preserved. Display branding stays renameable.

## Executed verification

**185/185 tests passed**, with zero failures, skips or cancellations, using Node **24.19.0** and npm **9.6.7**. The full `npm run check` includes TypeScript compilation and offline core tests. See [verification record](docs/development/M1_R3_VERIFICATION.json). Earlier runs exposed retired-bypass expectations, a changed doctor label and a renderer fixture that depended on the replaced legacy brief; those were corrected and the full suite rerun.

After a final tightening to reject uncertain/conditional replies such as “Yes?” and “Yes, maybe,” TypeScript rebuilt successfully and all **39 IDE guard/integration tests** passed again. The other implementation paths were unchanged.

The original 140-test baseline passed before implementation. Older payload and immutable-history tests now construct explicitly labeled historical fixtures because creating new work through those retired formats is intentionally rejected. Their fixture constructor is test-only and is not imported by production. New R3 tests call the real application and command interfaces; no production test bypass was added.

The real command-interface test confirms all five agreements, creates and separately approves a synthetic scope, obtains its handoff, runs a disposable assertion, records the actual result and verifies backup integrity. This checks the existing approval/receipt infrastructure; it does not implement the stock product, a staged builder or M2.

All four skill packages passed structural validation: Crumb and the Pruvello, Pruvity and customer-evidence aliases. Installed-profile host probing failed before a response with a home-directory startup error. A separate isolated, unauthenticated probe discovered Crumb and all three aliases as enabled repository skills. It did **not** invoke an authenticated model. No credentials were read or copied for that probe. Fresh installed-host conversation behavior remains unverified.

## Conversation evidence

Five authored conversations ran against real local persistence and transitions. Every earlier displayed turn asserted Act was locked and no action draft existed. These are scripts, not independent reviews or free-running installed-host generations. All founder replies are synthetic; the other four scenarios also use explicitly fictional research. The stock scenario uses inspected public observations alongside its invented founder.

| Scenario | Displayed turns | Explicit Act choice | First MVP discussion | Redefinition |
|---|---:|---:|---:|---|
| Fresh vague B2B | 25 | 24 | 25 | None needed in the script |
| Existing product | 24 | 23 | 24 | Existing selected file preserved |
| Existing product with feedback | 31 | 30 | 31 | User and Problem reconfirmed |
| Stock comparison | 33 | 32 | 33 | User and Problem reconfirmed |
| Better adjacent problem | 32 | 31 | 32 | User and Problem reconfirmed |

See [executed transcripts](docs/development/M1_R3_REHEARSALS.md), [machine-readable results](docs/development/M1_R3_REHEARSAL_RESULTS.json), and [optional stock research](docs/development/M1_R3_STOCK_RESEARCH.md). The approved [conversation designs](docs/development/M1_R3_CONVERSATION_EXAMPLES.md) remain separate from executed evidence.

The stock path moves from broad swing traders to traders who already keep shortlists and review them in scheduled sessions. It investigates paid screeners/charting, AI ranking, journals, services, manual work, spreadsheets, generic AI and doing nothing. It retains isolated love/hate observations without inventing repeated themes, commercial demand, revenue or prevalence. [Current TradingView documentation](https://www.tradingview.com/support/solutions/43000739708-watchlist-alerts-your-trading-edge/) counters an older extended-hours-alert complaint. Two nearby pains are compared without an automatic pivot. Founder fit is an invented self-report; habitats are observed communities with unverified recruitment routes. No outreach occurred.

Semantic review of these authored transcripts found: separate confirmations, concrete problem questions, no repeated fresh-project intake for existing products, an optional behavior-based interview route, clear uncertainty, and no solution recommendation before final assent. The longest main Crumb turn is the stock commitment summary at 185 words. This is author review of the supplied examples, not evidence that arbitrary future model outputs will behave identically or that the founder accepts the experience.

## Acceptance coverage

| Approved requirement | Evidence and result |
|---|---|
| R3-01–06: required agreements and separate scope approval | Missing-prerequisite, isolated missing-receipt, current-consent and actual command-interface tests passed. Displaying a checkpoint alone leaves Act locked. |
| R3-07–10: material changes and redefinition | Intention/User/Problem/evidence changes revoke dependent consent and stale approval/handoff; reverting wording cannot recover it. Define/Evaluate loops passed. |
| R3-11: cosmetic changes | Name, detail reads and whitespace-only edits preserve substantive confirmations. Exact context references still require a refreshed scope after any saved revision. |
| R3-12–13: forged, stale and concurrent consent | Protected metadata, wrong receipt identity, synthetic/live mismatch, replayed turns, stale presentations and concurrent writes tested. Human transcript authenticity remains a host responsibility. |
| R3-14–15: legacy and bypass behavior | Actual APIs/CLI reject v1–v4 new action paths, including explicit-build v3/v4. Absent context, portable consent and old approvals cannot authorize new work; history stays readable. |
| R3-16: meaningful Evaluation | Missing dimensions, relevant run links, alternatives, counterevidence, synthesis, habitat routes and challenges fail review. Unavailable research cannot complete it. Quality of prose/relevance still needs host judgment. |
| R3-17–18: evidence distinctions | Existing provenance tests plus the stock dossier preserve independent recurrence versus anecdote, date/access limits, obsolete-gap counterevidence, reported vendor totals, activity proxies and unknown revenue. |
| R3-19–22: pre-Act boundary and checkpoint | Ordered prompts, pre-Act opportunity/interview views, forbidden action choices, upgraded/imported summaries, exact four choices and rejection of generic final “Yes” passed. |
| R3-23–26: conversations, stock depth and optional detail | Five local scripts, 33-turn stock path, per-turn gate assertions, full optional dossier and author semantic review completed. Free-running host behavior and founder acceptance remain unverified. |
| R3-27–28: recovery and infrastructure | Portable imports clear consent, exact database backups retain lineage, history remains immutable, and existing privacy/offline/initialization/artifact/receipt checks pass. |

## Preservation and limits

The branch remains `main`, remote remains `https://github.com/ashhoque/crumb.git`, and HEAD remains `c218317a2b17d6f4a7194ef5c875b5d26ed48d48`. Historical M0/M1/M1-R/M1-R2 reports, the original master, runtime pin, package/lockfile, older contract files and persistence/privacy implementation were compared with the captured baseline and are byte-for-byte unchanged. No reset, rebase, force-push or re-scaffolding occurred. Changes are uncommitted and local.

The core verifies structural consistency and state transitions. It cannot authenticate a host-supplied founder quote, independently verify public-source truth, guarantee semantic research depth or prevent an external agent from executing code outside its tools. Freeform prose is governed by the skill and needs conversation review; it is not made safe by a keyword filter. Public observations and synthetic confirmations are not customer validation.

The existing single approved-cycle limit remains. Repeated/staged building, launch/outcome ingestion, outreach, deployment, billing and raw confidential-source import were not added. No actual customer workspace was read for verification. M2 requires a separate instruction. The next product check is the [founder trial](M1_R3_TEST_GUIDE.md), not another automatic milestone.
