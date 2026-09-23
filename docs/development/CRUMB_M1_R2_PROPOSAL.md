# Crumb — M1-R2 proposal

**The business copilot for AI builders**  
23 September 2026 · Proposal for approval · Existing repository: `C:\Users\Ash\Documents\Codex\CEC`

## Executive summary

Your criticism is supported by the implementation. M1-R added useful orientation and persistence, but it still treats a short evaluation preview as sufficient to recommend a test. It also advertises “Build now” throughout the conversation. I recommend replacing that default with a substantial, sourced Evaluate stage while keeping an explicit build request as an escape route.

This proposal covers all ten requested items. **No repository code, skills, PLAN, STATUS or master specification has been changed for M1-R2.** The prior approval applied to M1-R; this new milestone awaits your approval. The public research below is work performed to make this proposal reviewable, not a claim that the current product already supports it.

The intended experience is: **understand the ambition → sharpen the problem → investigate the opportunity → offer a considered choice**. More research should produce a better short answer, not more mandatory reading.

## 1. Exactly where the current implementation jumps ahead

Locations below refer to the current files under the existing repository root above.

| Current location | What it does | Why it causes the problem |
|---|---|---|
| `src/cli/render.ts:10` | The first message advertises Build now and includes it among the opening choices. | Building is promoted before intention or problem understanding. |
| `src/domain/conversation.ts:19` | Even a draft with no proposal ends with `Build now | Correct my understanding | Why?`. | The main action is the same during Intention, Define and Evaluate. |
| `src/domain/conversation.ts:34` | `context_ready` requires only an assessment, a problem value, and intention marked provided **or skipped**. | A few sentences can authorize a normal action recommendation. Research, competitor understanding, user language and habitats are irrelevant to this check. |
| `src/domain/contracts.ts:55` | Assessment contains promising, weak, criticalUnknown and **cheapestCheck**. | The model represents evaluation primarily as a bridge to a test. It cannot represent the full opportunity assessment requested here. |
| `.agents/skills/pruvello/SKILL.md:67` | Instructs the host to give a useful **E preview** before action and says not to force research. | The host is following a shallow evaluation standard, rather than overlooking an existing deep one. |
| `.agents/skills/pruvello/SKILL.md:80` | Defines `context_ready` using supplied/skipped intention, problem understanding and brief evaluation. | The guidance reinforces the permissive code check. |
| `.agents/skills/pruvello/references/conversations.md:189` | The stock example recommends replaying a past comparison immediately after the problem reframe. | The example teaches the exact early-test behavior you rejected. The fresh and existing examples similarly jump to a walkthrough or question preparation. |
| `src/cli/render.ts:39` and `:41` | Research is an “M2 preview”; the renderer says research is optional and suggests building a smaller test. | Opening research redirects the founder toward action rather than investigating. |
| `src/cli/render.ts:13` and `:74` | Detail sections omit user language, gaps, adjacency, habitats, startup master and red team; detail footers keep promoting Build now. | Progressive disclosure has too little substantive content and the wrong next action. |
| `tests/orientation.test.ts:42`, `:48`, `:109` | Tests require Build now during orientation and accept a learning proposal after skipped intention plus brief assessment. | The tests protect the old behavior. Passing them does not demonstrate the experience you now require. |
| `PRODUCT_SPEC.md:316`, `:322`, `:332`, `:1314` | Evaluate is brief; research, habitats, interviews and startup master remain assigned to old M2. | Product authority and milestone allocation also need correction. |

There is a second structural limitation: `src/application/workflow.ts:47` caps the whole draft at 16 KiB, and `:64` forbids new drafts once the single existing cycle is approved. A research dossier cannot simply be squeezed into that draft or overwrite its immutable history. The pre-build working context needs its own small, versioned storage boundary.

**What the previous completion claim meant:** M1-R met its then-approved implementation checks: 83 tests were recorded as passing. That remains technical history. Your subsequent trial rejects its conversational behavior as sufficient for the intended product. M1-R2 must be judged against the revised experience, not described as already complete.

## 2. Minimum changes required

### A. Change the normal transition rule

Intention and Define retain context with no proposed action. Evaluate performs bounded research and produces a decision-relevant synthesis. Only then does the normal conversation recommend interviews or a small MVP.

“Meaningful Evaluate” means the agent has examined the relevant questions, considered counterevidence and explained the remaining uncertainty. It does **not** mean every answer is positive, every unknown is eliminated, or a fixed number of pages has been collected.

Internally, retain coverage of:

1. Problem quality and founder fit, including intention, frequency, urgency, consequence, buyer, existing effort/spend and reachability.
2. Important competitors and substitutes, including manual work, doing nothing and generic AI.
3. Users’ own problem language, praise and complaints, with recurrence assessed honestly.
4. Reported traction separately from public proxies; unknowns where unavailable.
5. Possible gaps, and at most two justified adjacent opportunities.
6. Specific user habitats and a few credible participation routes.
7. A synthesis of promising, weak, known, inferred, unknown and contradictory findings.

For each relevant area, store findings or an explicit limitation after a real attempt. “Not relevant” needs a reason tied to the founder’s intention. Filling every field with “unknown” without investigation does not complete Evaluate.

A personal-tool goal changes the breadth and interpretation: usefulness, recurring effort and whether existing tools suffice matter more than market size or enterprise budgets. Commercial claims remain conditional when the founder is undecided. A skipped intention is preserved without repeated questioning; Crumb can clarify the problem and show conditional comparisons, but must not pretend it understands the ambition or declare a commercial evaluation complete.

### B. Make research real, bounded and inspectable

Use the existing host’s permitted search/browser tools. Keep the local application offline: it validates and saves research supplied by the host; it does not become a scraper or require a hosted service.

Initial default budget: **up to 12 search queries and 24 inspected pages**, stopping earlier when two successive useful searches add no material finding. These are ceilings, not a completeness score. Budget changes follow the founder’s request. Record the actual stop reason, access failures and uncovered questions. A search-result snippet is explicitly weaker than an inspected page; never label it as a full review. No repeated attempts to bypass a restriction.

Each consequential claim retains its source, publication/event date if known, retrieval date, access mode, relevant observation or short permitted excerpt, and limitation. Derived conclusions point to supporting and challenging claims. Record facts as vendor-reported, public discussion, founder-reported, artifact-observed, inference, assumption or unknown. Synthetic fixtures remain separately labelled.

A funding announcement is an actual reported financing event if sourced; it does not establish customer traction. Releases, hiring, traffic estimates and community activity are proxies, never private revenue or retention. Repeated praise or complaints require distinct supporting observations and a check for duplication or promotion; otherwise report an isolated observation.

If research is unavailable, preserve the work and say what could not be checked. Offer to use sources the founder supplies or resume research. Do not silently convert failure into “let’s test.” An explicit “build now” still works.

### C. Extend continuity without replacing the foundation

Add a neutral versioned pre-build context and research dossier beside the existing immutable cycles. Store compact conversation state separately from optional detail; generate the startup master from the same referenced claims. A small additive SQLite change is warranted for this new capability, not for branding.

Recommended shape: append-only pre-build context revisions containing intention, definition, research receipt/claims, evaluation coverage, habitats, adjacent comparisons and red-team notes. The current revision is resumed without rewriting an approved foundation. Enforce bounded records and reject oversize input clearly; do not truncate evidence to pass the old draft limit. Start with a 256 KiB dossier limit, separate from the existing compact action draft.

When an action is selected, a neutral v4 action draft references the exact dossier revision/hash. Its normal basis is `evaluation_ready`; an explicit request uses `build_requested` and retains the founder’s words. Existing v1/v2/v3 contracts, saved hashes and approved snapshots remain unchanged. Legacy drafts may be read and their context reused, but the normal Crumb flow must not inherit an old `context_ready` flag as proof that Evaluate was completed.

Editing a material claim, intention, problem or proposed scope invalidates the corresponding unapproved recommendation/master reference. Approved history remains immutable. Research opening, saving and master generation require no new build approval.

The existing one-cycle build/receipt path remains available. M1-R2 does not add the staged or repeated build-cycle engine planned for new M2. If a returning project has already used its recorded cycle, Crumb can still retain a new evaluation and prepare a portable, reviewed handoff for ordinary coding; it must not reset storage or claim that a second tracked cycle was recorded. This distinction stays in implementation receipts, not routine business conversation.

### D. Replace the conversation defaults and examples

Before Evaluate is ready, choices follow the current question: clarify intention, correct the problem, examine relevant findings. Build remains available through natural language, but is not a repeated primary button.

After Evaluate, show at most three useful options. Usually: **Talk to likely users · Shape the smallest MVP · Open research**. If an adjacent problem warrants attention, it can replace one option. Other routes remain accessible conversationally; there is no four-to-eight-button menu.

Normal substantial replies: roughly 60–150 words. Research synthesis: roughly 100–200 words. Start with a 2–5 sentence executive summary, followed where useful by What I’m seeing, What still matters, and Next. Use the exact optional-detail sentence requested. Limit questions by their meaning, not just question marks.

### E. Add interview preparation, optional master and red team

Offer behavior-based interviews after Evaluate. Preparation does not send a message, claim a scheduled interview, or create completed customer evidence. Offer the startup master once enough evaluation exists; the founder can accept or skip it without reading the full document. Red-team important claims, retaining counterevidence and disproof conditions.

### F. Make the display change and update authority

Use **Crumb** and **The business copilot for AI builders** in display configuration and current-facing copy. Add a Crumb entry and retain Pruvello, Pruvity and customer-evidence as compatibility aliases. Keep package identity, database/private paths and historical schema identifiers. Update the active master, PLAN, STATUS, instructions and examples after approval; preserve milestone reports.

## 3. Six exact revised conversations

These are proposed transcripts, not executed acceptance results. Founder statements, repositories and feedback in these examples are fictional. Examples A–D use explicitly **synthetic research fixtures** to demonstrate the desired behavior; they are not market findings. Example E uses the actual public research in sections 4–6. In the product, synthetic and live research must never be mixed without labels.

Reviewer annotations identify the work between messages; those annotations are not a visible wizard. Crumb skips any question already answered by the message or saved context. Short openings need not be padded to meet a word target.

### A. Fresh, vague idea

**Founder:** “Starting fresh. I want to make an AI tool for agencies.”

**Crumb:**

> **Executive summary**  
> We have a broad starting point, but the useful problem is still hiding inside it. Your ambition will help me decide which opportunities are worth investigating.
>
> **What still matters**  
> Before we judge the idea, what are you hoping this becomes—a tool for yourself, a profitable small business, or something else?

**Founder:** “A profitable solo business. I used to run a small web agency.”

**Crumb:**

> **Executive summary**  
> I’ll prioritize a recurring problem you understand and can reach buyers for, with support demands one person could handle. A large market matters less here than a clear reason for a small group to pay.
>
> **What I’m seeing**
> - Your agency experience gives us a place to look beyond generic AI features.
>
> **What still matters**  
> What recurring job caused the most avoidable frustration when you ran the agency?

**Founder:** “Chasing clients for website content. We kept delaying kickoffs.”

**Crumb:**

> **Executive summary**  
> I think the narrower problem is knowing whether a project is actually ready to start. Chasing content is one symptom; the cost may be repeatedly rescheduling people around an incomplete handoff.
>
> **What I’m seeing**
> - Likely user: the person coordinating delivery.
> - Working hypothesis: missing or unusable inputs make kickoff dates unreliable.
>
> **What still matters**  
> In the most recent example you remember, what was missing and what work had to move?

**Founder:** “The copy arrived, but nobody had approved it. Two designers lost a morning. It happened most weeks.”

**Crumb:**

> **Executive summary**  
> That makes the problem clearer: content arriving is different from content being ready to use. Your example points to approval ambiguity disrupting delivery, rather than simply too few reminders.
>
> **What I’m seeing**
> - You report recurring disruption with a concrete staffing consequence.
> - We still need to understand how other agencies handle readiness and approvals.
>
> **Next**  
> I’ll examine existing intake and approval workflows, users’ complaints, and where small-agency delivery leads discuss this work. Then I’ll compare the opportunity against your solo-business goal.

**Between turns:** Crumb investigates; it does not ask the founder to operate search. For this proposed transcript only, the synthetic dossier says collection tools already handle reminders; approval ownership remains an uncertain gap; no willingness to pay is established.

**Crumb:**

> **Executive summary**  
> I would narrow this to “ready to start” handoffs for small web agencies. The alternatives already address collecting files, while the possible opening is deciding whether the right person has approved usable content. That is promising enough to investigate further, but we do not yet know whether it deserves a separate product.
>
> **What I’m seeing**
> - Your experience fits the workflow and gives you a plausible route to initial conversations.
> - Another reminder tool would have a weak distinction.
>
> **What still matters**
> - The gap may be an ownership habit that existing tools can already support.
>
> **Next**  
> Talk to agency delivery leads · Explore the readiness gap · Open research
>
> **The extra detail below is optional—you can continue without reading it.**

### B. Specific B2B idea

**Founder:** “I want software that collects missing receipts from small bookkeeping firms’ clients. I want a sustainable bootstrapped company; I know three firm owners.”

**Crumb:**

> **Executive summary**  
> You have already given me the ambition and a plausible way to reach buyers. I’ll evaluate this around recurring firm-level value and manageable delivery costs, rather than venture-scale growth.
>
> **What I’m seeing**
> - The firm may buy, but bookkeepers and their clients both affect whether it works.
> - “Collect receipts” could hide several different problems.
>
> **What still matters**  
> When a receipt is missing, is the bookkeeper mainly chasing a reply, matching the document to a transaction, or resolving an exception?

**Founder:** “Matching it. Clients send something, but it is often unclear which transaction it belongs to. Month-end gets delayed.”

**Crumb:**

> **Executive summary**  
> Then the stronger problem statement is “resolve unmatched transaction evidence before month-end.” Sending more reminders may increase the inbox without removing the blocker.
>
> **What I’m seeing**
> - Trigger: a transaction cannot be closed with the evidence available.
> - Possible consequence: repeated reconciliation work and delayed close.
>
> **What still matters**  
> Is that based on your own bookkeeping work, something the owners told you, or a hypothesis?

**Founder:** “Two owners described it to me. I haven’t seen their process.”

**Crumb:**

> **Executive summary**  
> We have owner-reported pain, with the actual workflow still unobserved. I’ll keep those separate while checking whether existing capture and practice-management tools already resolve the matching problem.
>
> **What I’m seeing**
> - Your owner relationships are useful access, not confirmed customers.
> - Integration effort could outweigh the value of a narrow fix.
>
> **Next**  
> I’ll research the alternatives, exception-handling complaints, public pricing and bookkeeper communities before recommending interviews or software.

**After the bounded synthetic research fixture has been evaluated:**

**Crumb:**

> **Executive summary**  
> This looks more plausible as an exception-resolution workflow than a general receipt collector. The alternatives already cover capture, so the key question is what stays unresolved after capture and who spends time fixing it. I would keep the current focus while checking that distinction.
>
> **What I’m seeing**
> - The buyer is identifiable, and you can ask for introductions without building an audience first.
> - Existing systems and integration requirements make replacement a demanding starting point.
>
> **What still matters**
> - We have not established exception frequency or whether firms pay to remove it.
>
> **Next**  
> Prepare owner interviews · Shape a tiny exception workflow · Open research
>
> **The extra detail below is optional—you can continue without reading it.**

### C. Existing project, no users

**Founder:** “I have an invoice tracker, no users yet. I want a profitable solo business. You can read the README and the invoice list and detail components.”

**Crumb:**

> **Executive summary**  
> I’ll start with the tracker you have and the goal you’ve already given me. The useful question is which recurring decision it improves for someone who could become a customer.
>
> **Next**  
> I’ll inspect those three files, preserve the working flow, and give you a sharper problem statement before evaluating the opportunity.

**After the permitted inspection in this fictional repository:**

**Crumb:**

> **Executive summary**  
> The tracker can show unpaid invoices and open an invoice’s details. That establishes what the code does; it does not yet explain why someone would leave their current process.
>
> **What I’m seeing**
> - One possible problem is choosing which overdue account needs attention today.
> - Another is remembering what happened during the last follow-up.
>
> **What still matters**  
> Who did you originally build this for, and what did they do before opening your tracker?

**Founder:** “Small agency owners. They use a spreadsheet and search email to remember what clients promised.”

**Crumb:**

> **Executive summary**  
> That suggests the painful handoff is from “this invoice is late” to “here is the right follow-up.” The spreadsheet may already solve the list; finding the latest promise may be the missing context.
>
> **What I’m seeing**
> - The existing list and detail view could support either direction.
> - The importance of this problem is still your hypothesis.
>
> **Next**  
> I’ll compare accounting reminders, receivables tools and email-based workarounds, then examine where agency owners discuss follow-up friction.

**After the bounded synthetic research fixture:**

**Crumb:**

> **Executive summary**  
> I would keep your working tracker and reconsider what it is for. The alternatives make a plain overdue list a weak distinction; preserving the context behind the next follow-up looks more specific. We still need to establish whether owners lose enough time on that task to change tools.
>
> **What I’m seeing**
> - Your list and detail view remain reusable.
> - Email history is both a useful substitute and a source of switching friction.
>
> **What still matters**
> - The adjacent context problem could matter more than prioritizing by invoice age.
>
> **Next**  
> Compare those two problems · Talk to agency owners · Open research
>
> **The extra detail below is optional—you can continue without reading it.**

### D. Existing project with customer feedback

**Saved context:** profitable solo business, invoice tracker for small agencies, permitted code observations retained.

**Founder:** “Three owners tried it. Two asked for reminders, but one said the real issue was not knowing what had already been promised. Keep the current tracker.”

**Crumb:**

> **Executive summary**  
> The feedback points to two different problems, and the reminder request may be masking one of them. I’ll keep the tracker and your solo-business goal while separating the owners’ reported words from our interpretation.
>
> **What I’m seeing**
> - Reminders could help people remember to act.
> - Promise history could help them decide what to say when they act.
>
> **What still matters**  
> Did the owners asking for reminders describe a missed follow-up, or a follow-up they postponed because they lacked context?

**Founder:** “Both said they had to search their inbox first. I interpreted that as needing reminders.”

**Crumb:**

> **Executive summary**  
> That changes the interpretation: the common friction may be reconstructing the conversation before following up. The owners’ behavior is more informative than the feature label we attached to it.
>
> **What I’m seeing**
> - Your report connects all three cases to missing context, but the sample is small.
> - Reminder scheduling no longer deserves to be our default next build.
>
> **Next**  
> I’ll revisit the evaluation around promise history, including existing receivables tools, email workflows and the cost of keeping that context current.

**After updated synthetic research, with previous conclusions and contradictions retained:**

**Crumb:**

> **Executive summary**  
> Promise history is now the stronger problem hypothesis for this project. Your reported feedback supports it, while the alternatives warn us that manually maintaining another record could create more work. I would explore that trade-off before adding reminders.
>
> **What I’m seeing**
> - Keep: the working invoice workflow.
> - Reconsider: the assumption that scheduling is the main blocker.
>
> **What still matters**
> - Can useful context stay current without duplicate entry or a large email integration?
>
> **Next**  
> Prepare follow-up interviews · Shape the smallest context workflow · Open updated research
>
> **The extra detail below is optional—you can continue without reading it.**

### E. The stock-comparison case

**Founder:** “I want a tool that compares stocks using my criteria and tells me which has the best chance of giving the highest return.”

**Crumb:**

> **Executive summary**  
> We can make the comparison problem clearer before choosing what to build. First, I need to place the idea in the work you have already done.
>
> **Next**  
> Are you starting fresh, or do you already have a project in progress?

**Founder:** “Fresh.”

**Crumb:**

> **Executive summary**  
> A personal comparison tool and a business for traders would need different evidence. I’ll judge the opportunity against what you want it to become.
>
> **What still matters**  
> Is this mainly for your own decisions, a business, or something else?

**Founder:** “For myself first. Maybe sell it later.”

**Crumb:**

> **Executive summary**  
> I’ll optimize for making your own decisions easier; selling it stays a separate hypothesis. A useful tool can help you compare evidence consistently, but that does not establish an ability to predict the highest return.
>
> **What I’m seeing**
> - There may be a more specific problem between finding candidates and choosing among them.
>
> **What still matters**  
> Once you have a shortlist, where do you get stuck: gathering comparable information, weighing conflicting criteria, or remembering why you preferred one candidate?

**Founder:** “I have the information in notes. I keep weighing the criteria differently. Then I forget why I preferred one. I do this most weekends.”

**Crumb:**

> **Executive summary**  
> The clearer problem is keeping a consistent, reviewable rationale when comparing a shortlist. Your notes already hold information; the friction is how you weigh it and preserve the decision.
>
> **What I’m seeing**
> - You report a recurring personal workflow.
> - A ranking alone could hide the trade-offs you actually need to understand.
>
> **Next**  
> I’ll investigate screeners, research and charting tools, trading journals, AI investing products, and spreadsheet workflows. I’ll also look for people describing this decision friction and places they discuss it.

**Between turns:** actual public-source evaluation, represented in sections 4–6. No MVP capabilities or interview assignment precedes this work.

**Crumb’s exact next message is the short synthesis in section 4.1.** The detailed research is available behind that message, not delivered as a mandatory report.

### F. “I just want to build”

**Founder:** “I don’t care about the research. I just want to build the stock comparison tool now.”

**Crumb:**

> **Executive summary**  
> We can build now. We have not finished checking the opportunity, so I’d keep this extremely small and treat it as a learning tool.
>
> **What I’m seeing**
> - A local comparison of two fictional candidates can make your criteria visible.
> - It will show your reasoning, without claiming to predict returns.
>
> **Next**  
> Proposed scope: enter two candidates and your criteria, compare them side by side, and save your rationale. No live prices or trading connection.
>
> Build this scope · Adjust it

**Founder:** “Build this scope.”

Crumb uses the existing approved implementation path, preserving the target’s conventions. It asks no intention question, requires no interviews, and does not claim Evaluate is complete. If this exact scope was already authorized, it proceeds without asking again. In this proposal no build is performed.

## 4. A realistic full Evaluate synthesis

### 4.1 What the founder actually sees

This continues the stock dialogue. Its personal history is fictional; the external findings are sourced. This is decision-support product research, not a recommendation about buying investments.

> **Executive summary**  
> Your recurring problem looks more like preserving a consistent decision rationale than finding another stock screener. Comparison and ranking already exist in established tools, so a simple comparison screen would have a weak distinction. I see a possible opening around remembering why you preferred one candidate, but not evidence yet that others would pay for it. [Existing comparison workflow](https://www.stockrover.com/stock-comparison/)
>
> **What I’m seeing**
> - Public discussions describe difficulty comparing a shortlist and inconsistent data; these are useful signals, not customer validation. [Comparison discussion](https://www.reddit.com/r/ValueInvesting/comments/1fwowwz/), [data concerns](https://www.reddit.com/r/stocks/comments/1kp95x1/)
> - For your personal goal, a small improvement over notes could be worthwhile without becoming a business.
>
> **What still matters**
> - A spreadsheet or general AI may already be sufficient.
> - Data reconciliation is a nearby problem worth comparing, not an automatic pivot.
>
> **Next**  
> Interview likely users · Shape the smallest MVP · Open research
>
> **The extra detail below is optional—you can continue without reading it.**

“Shape the smallest MVP” means the founder chooses that route. Crumb has not already generated or approved three features. “Interview likely users” is adapted to self-directed investors in this example, not indiscriminately to professional or high-frequency traders.

### 4.2 The underlying assessment

Sources were retrieved through the available web tools on **23 September 2026**. Page extraction does not independently verify vendor claims or guarantee a live rather than cached response. The inspected sample includes official product/pricing material, public problem discussions and a product-release announcement. It is a bounded demonstration, not an exhaustive market study; no paid product was tested, account created or person contacted.

| Question | Assessment | Basis and limitation |
|---|---|---|
| Frequency | Recurring for this example founder; population frequency unknown. | The fictional founder reports weekend comparisons. A public shortlist-comparison question corroborates the existence of a similar task, not its frequency. [Discussion](https://www.reddit.com/r/ValueInvesting/comments/1fwowwz/) |
| Urgency | There is a decision occasion, but no demonstrated must-act deadline. | Inference from the workflow. “Financial decision” does not automatically mean urgent software demand. |
| Pain and consequence | Inconsistent reasoning and repeated work are plausible pains. No measured time or financial loss. | Founder report plus inference. Do not promise improved investment returns. |
| Mandatory or ignorable | Using a dedicated comparison tool is optional. | The founder can continue using notes, defer a decision or use existing software. This is a substitute hypothesis, not observed switching behavior. |
| Widespread | Similar concerns appear publicly; prevalence is unknown. | Small, self-selected discussions cannot establish market size. Some replies promote products. |
| Category direction | Products are adding AI features; category revenue growth is unestablished here. | A Danelfin release is a product-activity signal, not proof that customers or profits are growing. [Release](https://blog.danelfin.com/introducing-danelfin-elite-the-most-advanced-ai-driven-investment-plan) |
| User and buyer | Founder is the current user. A commercial self-directed-investor buyer remains hypothetical. | Intention supplied in the fictional scenario; no buyer interviews or purchase evidence. |
| Existing spend and effort | Paid alternatives have public prices, and this founder uses notes. | Prices demonstrate offers, not purchase volume or willingness to pay for this idea. See section 5. |
| Reachability | Relevant public discussion spaces and an investor association exist. | Community existence does not confer recruitment permission or imply interest. See section 6. |
| Founder fit | Personal workflow access and ability to build a prototype fit the immediate goal. | Distribution, data expertise, licensed data costs and customer support capacity remain unknown. |
| Generic AI substitute | Comparing supplied notes with a reusable prompt is a credible substitute hypothesis. | Not benchmarked in this research. Dedicated software must earn its advantage over a simpler process. |
| Dedicated software advantage | Potentially durable rationale, consistent criteria and inspectable changes over time. | Proposed value, not a proven missing feature or unmet market need. Existing products may already be sufficient. |

**Known externally:** overlapping product workflows and public offers; a small set of problem discussions. **Known only within the example:** the founder’s goal and reported routine. **Inferred:** rationale continuity may be a useful focus. **Unknown:** improvement over substitutes, prevalence, willingness to switch/pay, acquisition cost and data economics. **Contradiction:** the initial idea assumes comparison is missing, but existing tools already support it.

### 4.3 Adjacent opportunities: compare, do not pivot

Current focus is the founder’s consistent shortlist comparison. Two adjacent possibilities are shown because one follows the founder’s stated difficulty and another follows observed public data concerns. Neither is declared a better business.

| Dimension | Current: consistent shortlist comparison | Adjacent 1: decision-rationale history | Adjacent 2: data discrepancy reconciliation |
|---|---|---|---|
| Pain/urgency | Reported indecision; no measured consequence | Reported forgetting of reasoning; time saved unknown | Public concern about inconsistent figures; actual losses unverified |
| Frequency | Weekend routine in the example | Potentially each revisit; inference | Frequency unknown |
| Current spending | Research subscriptions exist; this founder’s spend unknown | Journal products exist; spend for this exact use unknown | Willingness to pay for reconciliation unknown |
| Reachability | Comparison discussions | Overlapping investor communities; fit unverified | Screener/data discussions; fit unverified |
| Competition/gap | Comparison is already available | Journals and notes are strong substitutes; unmet gap unproven | Existing data vendors may solve it; reconciliation can be technically difficult |
| Founder fit | Direct personal access | Closest to the founder’s stated memory problem | Data expertise and licensing knowledge unknown |
| Reusable code | No code supplied in this fresh fixture | Future comparison records could be reused; no reuse claimed yet | Likely different data work; current reuse unknown |
| Cost of learning | Low for a manual workflow comparison | Low for reviewing existing notes, after Evaluate | Higher if reliable feeds/licensing are needed; begin with examples, not integrations |

The adjacent rationale idea is inferred from the fictional founder’s words; the discrepancy hypothesis is supported only as a problem signal by the [screener discussion](https://www.reddit.com/r/stocks/comments/1kp95x1/). User comments are not verified defects in the named products. The possible gap is what remains to investigate, not a conclusion manufactured by subtracting feature lists.

**Recommendation:** preserve the personal-tool intention. Choose whether to understand other people’s behavior, shape a tiny personal workflow, or inspect the unresolved comparison. Do not claim a commercial opportunity has been validated.

### 4.4 Red-team excerpt

| Important claim | Evidence / inference / assumption | Contradiction | What would disprove it | Cheapest useful next learning, after Evaluate |
|---|---|---|---|---|
| “Rationale history would help this founder.” | Founder reports forgetting; usefulness is an inference. | Existing notes may already retain enough. | A consistent note template removes the friction. | Compare one past decision with the existing note process. |
| “Other investors share enough pain to pay.” | Some public comparison questions; payment is an assumption. | Free tools and low-effort workarounds exist. | Recent examples show rare pain and no meaningful effort to solve it. | Behavior interviews about actual recent comparisons. |
| “Another comparison product is differentiated.” | No supporting differentiation evidence yet. | Established comparison workflows. | The target task works adequately in an existing product. | Inspect that exact workflow before coding the same thing. |
| “Data reconciliation could be better.” | Public concerns; opportunity is inference. | Sources may differ for legitimate definitions, dates or adjustments. | Explaining definitions resolves the confusion, or reliable resolution costs exceed value. | Examine a few permitted, non-sensitive discrepancy examples. |
| “A high ranking predicts highest return.” | Unsupported in this proposal. | A preference ranking is not an outcome guarantee. | No credible evidence currently justifies the claim. | Remove the promise; evaluate reasoning usefulness separately. |

## 5. Competitor detail behind progressive disclosure

### 5.1 Interaction, not a report dump

The synthesis offers three next choices. If the founder chooses **Open research**, the next short reply offers **Competitors · What users are saying · Opportunity and habitats**. The last route reveals **Market gaps · Adjacent opportunities · User habitats**. “Why?”, “View sources” and “Open full research” remain recognized natural-language requests at any point. These are alternative views, not mandatory clicks.

An opened detail page stays focused and paginated. Where supported, the same detail can be collapsed. Opening detail does not create a proposal, approve scope or reset the conversation. Navigating back returns to the same short synthesis.

### 5.2 What “View competitors” reveals in this example

This is the optional full comparison behind the short answer. Prices below are displayed US-dollar offers retrieved on 23 September 2026, with billing terms shown where ascertainable; promotions, taxes and data entitlements can differ. No subscription is recommended or purchased.

| Alternative / category | Target, workflow and positioning | Public price observed | What it changes in our thinking |
|---|---|---|---|
| **Finviz — screener / direct overlap** | Traders and investors narrowing candidates through filters, charts and views; Elite also advertises comparison of up to 25 stocks. | $39.50 monthly or $299.50 annually. [Official offer](https://finviz.com/elite) | Candidate discovery and comparison are established capabilities. A gap needs to be more specific. |
| **Stock Rover — research, comparison and ranking / direct overlap** | Individual investors and portfolio users; screening, fundamental research, portfolio workflows and ranked screening on a higher plan. | Premium $34 monthly or $348 annually; Premium Plus $70 monthly or $588 annually. [Official plans](https://www.stockrover.com/plans/) | Research depth and custom criteria overlap the idea substantially. |
| **Koyfin — research platform / adjacent incumbent** | Investors researching stocks and portfolios, with dashboards, screens and watchlists. | Free plan; displayed Plus $39/month under annual pricing. [Official plans](https://www.koyfin.com/pricing/) | Replacing a broader research environment may be unnecessary; integration or a narrow complementary workflow is only a hypothesis. |
| **TradingView — technical analysis / substitute** | Chart-centered analysis, watchlists, alerts and screeners. | Free tier; displayed Essential $12.95/month billed annually. [Official plans](https://www.tradingview.com/pricing/) | Do not assume every investor needs another charting or screening surface. |
| **TraderSync — trading journal / adjacent** | Logging and reviewing trades, analytics and AI-assisted performance reflection. | Pro displays $29.95 monthly and $269.52/year for annual billing. [Official plans](https://tradersync.com/pricing/) | A rationale-history direction competes with journaling and review habits, not only screeners. |
| **Danelfin — AI investing / adjacent competitor** | AI scoring, stock rankings and related analytics. The vendor describes its score as estimating relative performance probability. This is its claim, not a verified promise from Crumb. | Plus $264/year, displayed as $22/month; Pro $708/year. [Plans](https://danelfin.com/pricing/annual), [vendor score explanation](https://support.danelfin.com/hc/en-us/articles/4404382038545-What-is-the-AI-Score-How-it-rates-stocks-and-ETFs) | “Uses AI to rank stocks” is already a positioning category; Crumb must distinguish decision support from unsupported prediction. |
| **Spreadsheet, broker watchlist and notes — manual / indirect substitutes** | A public contributor describes exporting a broker watchlist to add custom metrics. | Incremental cost depends on the founder’s existing tools; not verified here. [Public workflow description](https://www.reddit.com/r/ValueInvesting/comments/1fwowwz/) | Familiarity and flexibility can outweigh the appeal of a new app. |
| **General AI with supplied notes — substitute hypothesis** | Reusable prompts might organize criteria and expose trade-offs. | No new purchase required for the example’s proposed comparison; actual account/tool access unknown. | Test adequacy before claiming a durable-software advantage. No benchmark was run. |
| **Human research/advice services; doing nothing** | Paying for human help, continuing the current routine or postponing comparison are conceptual alternatives. | No provider or price verified in this bounded sample. | Services were not material to this personal-workflow decision; commercial scope would require a deeper assessment. Doing nothing remains plausible. |

**Deeper card example — Stock Rover**

The vendor explicitly presents a stock/ETF comparison workflow; that is a direct challenge to a “comparison is missing” thesis. [Comparison page](https://www.stockrover.com/stock-comparison/)

Public-reaction evidence appears in the next section. Repeated product-specific complaints, actual onboarding time and measured switching costs remain unestablished in this sample.

**Our inference:** a broad analytical product may demand more setup than this founder wants. **Unknown:** actual setup time, switching cost and whether it already preserves enough rationale. **Possible gap:** only a simpler, durable reasoning workflow that proves better for the selected user. Existing features are counterevidence, not an excuse to declare the gap empty or solved.

### 5.3 “What users are saying”

| Observation | Meaning | Limit |
|---|---|---|
| A poster asks for a convenient way to compare many fundamentals across an already selected shortlist. Replies recommend existing tools. | The problem language resembles post-screening comparison, and available solutions matter. [Thread](https://www.reddit.com/r/ValueInvesting/comments/1fwowwz/) | This is an older, archived discussion with mixed advice and promotional replies. It is not a current recruitment list. |
| A screener user praises chart usefulness but questions data consistency and missing fields. | Praise and frustration can coexist; raw feature breadth may not solve trust. [Thread](https://www.reddit.com/r/stocks/comments/1kp95x1/) | A user report is not a verified accuracy defect. Product behavior may have changed. |
| A separate value-investing discussion includes concern about data errors and slow updates for smaller companies. | Data confidence is a recurring theme across this small sample, involving different products. [Thread](https://www.reddit.com/r/ValueInvesting/comments/1s3acqs/is_there_a_finviz_alternative_thats_actually/) | No representative frequency, verified identity or independently established error rate. Do not relabel it “users hate Finviz.” |
| Positive comments mention comparison tables, charting and screening usefulness. | Preserve what people already value rather than assuming competitors are bad. [Comparison thread](https://www.reddit.com/r/ValueInvesting/comments/1fwowwz/), [screener thread](https://www.reddit.com/r/stocks/comments/1kp95x1/) | Too little evidence to rank overall customer love or satisfaction by vendor. |

For each competitor, the stored card includes love, hate, recurrence, complexity, onboarding, missing workflow and switching friction. **Unknown is a valid result of an attempted search.** The system must not fill empty cells with invented complaints or convert marketing copy into user praise.

Two additional search results—an older spreadsheet-comparison discussion and a paid-journal discussion—could not be fully opened. They are excluded from the substantive findings above. That limitation is part of the receipt, not silently treated as successful inspection.

### 5.4 Traction: exact separation

| Type | Actual observation | Permitted conclusion |
|---|---|---|
| Reported metric | TradingView’s pricing page says its platform is used by 100 million traders. [Source](https://www.tradingview.com/pricing/) | A vendor-reported user-scale claim. Definition, period, paid share, active use and independent verification are unknown. |
| Public proxy | Danelfin published an Elite-plan introduction describing expanded capabilities. [Source](https://blog.danelfin.com/introducing-danelfin-elite-the-most-advanced-ai-driven-investment-plan) | Evidence of a product announcement. It does not establish revenue, retention, profitability or a growth rate. |
| Not established | Comparable revenue, ARR, paying-customer growth and retention for the sampled tools. | Unknown from this research. Do not infer them from prices, website presence or product breadth. |

The inspected evidence cannot support a ranking of which competitor is growing fastest. A single announcement also cannot establish a sustained release cadence. Further traction research is available if it would change the founder’s decision.

## 6. Example User Habitat Map and three first-user avenues

Target: self-directed investors who compare shortlists and revisit their reasoning. These are **places to learn about a workflow**, not qualified buyers or a lead database.

| Habitat | What was found | Likely people and relevance | Participation/contact path | Limitation |
|---|---|---|---|---|
| **Online: r/ValueInvesting** | The comparison discussion examined above. [Observed thread](https://www.reddit.com/r/ValueInvesting/comments/1fwowwz/) | Persona fit is an inference. | Read relevant public discussions. The example thread is archived. Check current community rules and moderator guidance before any new research invitation. | No recruiting permission, buyer status or individual interest established. |
| **Online: r/stocks** | An inspected screener discussion describes data and workflow frustrations. [Observed thread](https://www.reddit.com/r/stocks/comments/1kp95x1/) | Investors using several information sources; useful for understanding comparisons and trust. | Observe problem language; verify a current permitted discussion or moderator route before the founder participates. | Broad audience; a screener user is not necessarily a rationale-history user. Rules and recruitment route have not been verified in this proposal. |
| **Professional/educational: AAII chapters and events** | Public search material describes investor education and local chapter meetings. [AAII](https://www.aaii.com/), [chapter-community article](https://www.aaii.com/journal/article/456668-aaii-local-chapters-are-growing-and-rebuilding-community) | Self-directed investors learning and exchanging practices; buyer relevance is unverified. | Founder can inspect the relevant chapter’s public event/organizer information and ask about an appropriate research format. No organizer has been contacted. | Full chapter-directory content was not retrievable here. Location, membership conditions and permission need verification before recommending a specific event. |
| **Physical: a relevant investor-club or chapter meeting** | AAII’s public material supports the existence of local meetings, not a selected nearby venue. | People who may discuss their research process in person. | Find a suitable local event after the founder supplies a location and verify organizer rules. | Founder location is unknown; do not infer it from the operating system or name. Some meetings may be online. |

The three strongest **avenues** are the two specific communities and a relevant AAII chapter. The physical row describes a possible form of the third route, not a fourth invented lead. None includes invented email addresses, identified prospects, claimed buying authority or permission to contact someone.

Crumb should prioritize relevance over list length. If only one route is well supported, show one. For a different user—such as a truck driver—the map would instead research that person’s actual work and peer environments. Generic founder communities are not a universal default.

## 7. The interview option after Evaluate

When the founder chooses **Interview likely users**, Crumb responds:

> **Executive summary**  
> Let’s learn how people make these comparisons before asking them to react to your product. The useful evidence is a recent decision, the work it took, and what their current tools failed to do.
>
> **What I’m seeing**
> - We have plausible places to find relevant people, but no confirmed participants.
> - Their existing process may be good enough; that would be useful to learn.
>
> **Next**  
> I can prepare a short conversation guide and a draft invitation for you to review. I’ll start with the guide; nothing will be sent.
>
> **The extra detail below is optional—you can continue without reading it.**

Optional guide, adapted to this problem from [Eric Migicovsky’s YC talk](https://www.youtube.com/watch?v=MT4Ig2uqjTc):

1. Which part of comparing a shortlist usually takes the most effort?
2. Walk me through the most recent comparison you made.
3. Where did that process become difficult, and what happened as a result?
4. Which tools or workarounds did you use to get through it?
5. What still frustrated you about that approach?

Follow the answer rather than mechanically asking all five. If they describe conflicting data, explore the actual discrepancy and what they did next. If they describe forgetting a rationale, ask how they tried to recover it. Avoid pitching a solution, asking for hypothetical buying intent, or describing approval as validation.

An invitation is draft text only. A habitat is not a contact, a draft is not a sent message, a scheduled interview is not a completed interview, and notes do not automatically validate the solution.

## 8. Natural use of the founder’s name and optional startup master

### Name example

**Founder:** “Call me Alex.”

Crumb records only that explicitly supplied preference. A later reframe may say:

> **Executive summary**  
> Alex, I think the more specific problem is recovering your reasoning when you revisit a shortlist. That gives us something clearer to evaluate than “an AI stock picker.”

The following turn does not repeat the name. If no name is known, the same sentence works without it. The optional “By the way, what should I call you?” is never a required field or an interruption to useful work. A Windows username, unrelated file or guessed identity is not a preferred name.

### Master offer after Evaluate

When the founder chooses to shape an MVP:

> **Executive summary**  
> We have enough context to shape a small personal workflow, with the business case still open. I can save the research and important uncertainties in a startup master so the coding agent carries the reasoning forward.
>
> **What I’m seeing**
> - You only need the short summary; the full document is for continuity.
> - I’ll include the strongest reasons this direction could be wrong.
>
> **Next**  
> Save the master and shape scope · Shape scope without it · Adjust the direction
>
> **The extra detail below is optional—you can continue without reading it.**

The startup master is a **project-specific artifact**, distinct from Crumb’s `PRODUCT_SPEC.md`. It contains the executive summary, intention, thesis, problem/user/buyer/workaround, research and market evidence, competitors, love/hate, traction metrics/proxies, gaps, adjacency, founder fit, habitats and routes, interview plan, MVP hypothesis/non-goals, technical and business-model hypotheses, useful economics, validation plan, risks, contradictions, sources and unknowns. Irrelevant commercial sections for a personal tool say why they are not applicable.

Red-team notes follow section 4.4’s evidence/inference/assumption/contradiction/disproof/learning structure. The master references a specific evaluation revision, becomes visibly stale when material context changes, and cannot silently expand an approved build. Generating it is optional and does not count as customer evidence.

## 9. New acceptance tests

These are proposed acceptance requirements, **not tests claimed to have run**. Keep the prior 83-test result as history; update assertions that intentionally encode superseded UX while retaining their compatibility/security coverage. Do not preserve an incorrect expectation merely to preserve a test count.

| ID | Scenario and observable pass condition |
|---|---|
| R2-01 | Fresh/existing entry appears only when unknown; supplied or saved context prevents repeated onboarding. |
| R2-02 | Personal, solo profit, bootstrapped, high-growth, enterprise, impact, learning and custom intentions change advice appropriately. Personal use never receives an unexplained venture-scale hurdle. |
| R2-03 | Skipped/undecided intention survives resume without repeated prompting or an invented goal. Commercial judgments remain conditional; explicit build remains available. |
| R2-04 | Vague agency idea receives a materially narrower problem, distinguishing symptom and consequence. Human transcript review verifies improvement rather than paraphrase. |
| R2-05 | Intention/Define replies contain no default interview assignment, feature list, learning proposal or Build now primary CTA. Plain-language explicit build requests still work. |
| R2-06 | A non-null brief assessment cannot satisfy normal action readiness. Missing research, only marketing pages, or unexplained unknown coverage cannot silently mark Evaluate ready. |
| R2-07 | Relevant problem-quality dimensions, substitutes, user language, competitor learning, traction, gaps and habitats are addressed by findings or justified limitations. No numerical success score. |
| R2-08 | Research stops at its budget or a recorded diminishing-return condition. Access errors, snippet-only findings and uninspected pages remain distinguishable. |
| R2-09 | Important findings reference valid source records with dates/access mode/limitations. Inferences link evidence; synthetic and live provenance cannot be confused. |
| R2-10 | Disclosed revenue/users/funding retain their actual meaning. A hiring post, release or traffic estimate cannot be rendered as private revenue or growth. |
| R2-11 | Repeated praise/complaints require distinct supporting observations; duplicated promotional posts do not create a consensus. Sparse evidence renders as sparse. |
| R2-12 | Competitor cards cover relevant target/workflow/positioning/price/capabilities/love/hate/friction/gaps. Unknown fields remain unknown; no competitor automatically triggers a pivot. |
| R2-13 | Current opportunity plus at most two alternatives; all required comparison dimensions are qualitative and changing focus requires the founder’s choice. |
| R2-14 | Habitats are specific to the persona; online/professional/physical routes are considered where relevant. Observed places, inferred fit and unverified access remain separate. |
| R2-15 | Avenues contain no invented identity/email/buyer/interest/permission. Archived threads cannot be offered as active reply routes. Nothing sends autonomously. |
| R2-16 | Interview option appears after meaningful Evaluate by default. Guide follows recent behavior and actual answers, rather than pitching or “would you buy?” |
| R2-17 | Explicit build before/during failed research records the actual request, retains unfinished evaluation honestly and uses the existing scope approval rules without repeated permission. |
| R2-18 | The stock fixture covers screeners, research, technical analysis, journals, ranking/comparison, AI investing, manual workflows, user language/praise/complaints, pricing, traction, communities and gaps. No unsupported highest-return promise. |
| R2-19 | Existing/no-users example preserves selected project files and distinguishes code facts from demand. Research can challenge the current direction without discarding code. |
| R2-20 | Corrected feedback changes the evaluation and invalidates stale unapproved scope/master references while preserving previous claims, contradictions and approved history. |
| R2-21 | Normal replies remain roughly 60–150 words; synthesis roughly 100–200; executive summaries 2–5 sentences. No more than two material questions and three choices. Short sufficient replies are allowed. |
| R2-22 | Optional detail has the exact requested sentence, stays optional, paginates without lost sources, and returns to the same state. Menus never dump all views at once. |
| R2-23 | Warmth comes from helpful phrasing; names appear only from explicit/relevant preference and not every turn. No file-path identity guessing, hype or framework lecture. |
| R2-24 | Optional master contains applicable required sections and meaningful red-team challenges, with traceable claims and no invented economics. Skipping it does not prevent Act. |
| R2-25 | Pre-build context and research resume in a new process, including after an older approved cycle. Concurrent revisions and dossier/action hash mismatches are rejected safely. |
| R2-26 | v1/v2/v3 approved data, hashes, receipts and legacy aliases remain readable and unchanged. Rebranding does not rename durable identifiers. |
| R2-27 | Additive storage initialization/migration is idempotent and transactional; interrupted writes leave prior state usable. Backup includes the added context and can be verified without altering the original. |
| R2-28 | Core tests run with network disabled. Malicious source text, secret-bearing URLs, oversized records and unauthorized artifact paths are rejected or treated as untrusted data, never instructions. |
| R2-29 | Six end-to-end conversational rehearsals exercise real save/resume/detail/action boundaries. Each transcript records research performed, fixture substitutions, unsupported claims and deviations from the intended UX. |
| R2-30 | M1_R2_REPORT separates deterministic results, source-backed host rehearsal, scripted fixture results, host limitations and actual founder acceptance. No next milestone starts automatically. |

**Verification approach after approval:** deterministic contracts/storage/rendering regressions; scenario-based conversation review; a sourced host research rehearsal; existing privacy/approval/receipt/backup checks; and your trial of the changed flow. Software assertions cannot prove that a reframe is insightful or that research is sufficiently useful. A failed conversational case remains visible even if all code tests pass.

The current nested authenticated-host limitation must be reported if it remains. Scanner discovery is not a substitute for an observed full conversation. Likewise, this written proposal is not a test execution.

## 10. Exact PLAN and master-spec changes recommended

The two companion files contain the **complete proposed replacement documents**, not just an outline. They are review copies in this task's outputs; the repository originals remain untouched.

- [Proposed PLAN.md](PROPOSED_PLAN.md)
- [Proposed PRODUCT_SPEC.md v0.7](PROPOSED_PRODUCT_SPEC.md)

### PLAN.md

Replace the current introductory status with:

> Authority: proposed PRODUCT_SPEC.md v0.7 and the M1-R2 proposal, subject to founder approval.  
> Current requested milestone: **M1-R2 — Complete pre-build IDE experience**.  
> Status: **proposal complete; implementation not started; awaiting approval**.

Add the M1-R2 checklist, current product finding, acceptance/reporting rules and this roadmap above the retained history:

| Milestone | Revised function |
|---|---|
| M1-R2 | Complete pre-build IDE |
| M2 | Act / staged MVP builder |
| M3 | Launch & Learn |
| M4 | Crumb pilot readiness |
| M5 | Evidence-earned improvements |

Preserve the existing plan from **“Pruvello M1-R correction — approved 2026-09-23”** onward as historical text, including prior checklists and results. Add an explicit note that old forward-roadmap statements are superseded. Do not uncheck completed historical implementation work or silently turn the rejected experience into a failure of all underlying code.

After your approval, the status changes to **approved / in progress**, the approval is recorded, and only then does the checklist begin. No implementation checkbox is pre-completed.

### PRODUCT_SPEC.md

| Section | Exact replacement/addition in the companion master |
|---|---|
| Title, status and current-facing brand | Crumb; requested tagline; proposed v0.7; AI builders with B2B founders as an initial cohort hypothesis, not mandatory ambition. Historical product names remain where describing actual history. |
| Executive summary and §00.1 | State the substantial pre-build purpose, proposal/approval boundary, M1-R technical history and founder UX rejection; preserve infrastructure and durable identifiers. |
| §02 P02/P03 | Qualify build/launch advice so it applies after Evaluate or an explicit build request; remove its ability to imply an early default build. |
| Entire §03 | Replace preview-based IDEAL with the exact Intention, Define, substantive Evaluate, research/competitor/user-language/traction/habitat/adjacency rules, interview timing, optional master/red team and explicit build escape in the proposed text. |
| Entire §04 | Six entry/regression paths: fresh, specific B2B, existing/no users, existing/feedback, stock comparison and explicit build. |
| §06.2–06.4 | Crumb entry, revised word ranges and exact optional-detail sentence; contextual choices; Warm/Sharp/Curious/Practical/Concise; careful optional name use. |
| §08.4 | Host research within the requested evaluation; core remains offline; no separate approval for every research/context save. |
| §09.1 orientation subsection | Preserve historical v3; add independent versioned pre-build context, bounded research dossier, source/claim provenance and a neutral v4 action reference with explicit readiness/request basis. |
| §11.1 | Replace the generic short-recommendation sequence with context reuse, problem improvement, research, concise synthesis and correctly timed choices; preserve approved implementation continuity. |
| §14 | Preserve historical M1-R criteria, label their historical role and add all R2-01–R2-30 requirements verbatim. |
| Entire §15 | Preserve milestone history and set the revised functional roadmap, M1-R2 scope/exit and readiness prerequisites. |
| Entire §16 | Proposal-only now; approval before edits; M1-R2-only implementation; actual checks and M1_R2_REPORT; stop before M2. |
| Remaining sections | Keep existing product hypotheses and infrastructure requirements, with display-brand wording updated. Those future/full-product statements do not imply implementation or authorize additional milestones. |

The detailed startup-master requirements are in §03.3 of the proposed master. A generated project master will use a neutral name such as `STARTUP_MASTER.md`, not a brand-derived schema or package identifier. Its default private storage/export handling follows the existing project's data boundaries.

### Related implementation files after approval

These are the intended change areas, not changes performed now:

| Area | Necessary change |
|---|---|
| `src/domain/brand.ts` and current-facing copy | Display brand and entry name; preserve durable identity. |
| `src/domain/contracts.ts`, neutral new contracts, `src/domain/conversation.ts` | Represent the new pre-build record, research/claims/readiness and context-dependent short responses. Preserve old validators for old records. |
| `src/application/workflow.ts` and persistence adapter | Save/resume research independent of approved cycles; safe additive migration, version/hash checks and recovery coverage. |
| `src/cli/render.ts` and internal command routing | Contextual next choices, research views, habitats, master/red team and sourced compact status. No repeated Build now footer. |
| `.agents/skills/crumb/` plus existing aliases | Primary Crumb behavior and focused references for research, conversations, interviews and master generation; compatibility forwarding for existing entry names. |
| Fixtures and tests | Replace superseded UX assertions; add the new meaningful acceptance cases and retain infrastructure regressions. |
| `AGENTS.md`, `README.md`, `STATUS.md`, test guide | Align current milestone and brand; replace the old blanket “no live research/M2” restriction with the approved bounded public-research scope. Preserve actual host limitations. |
| `M1_R2_REPORT.md` | Record what actually changed and ran, remaining limits, and founder acceptance status after implementation. |

The minimum is a targeted extension of the current application and skill. No new app scaffold, new repository, replacement runtime, crawler, dashboard, hosted research backend or unrelated dependency upgrade is proposed.

## Decision requested

Approve this M1-R2 proposal, or specify the parts you want changed. Approval authorizes updating the active master and PLAN and implementing **M1-R2 only**, followed by relevant checks and `M1_R2_REPORT.md`. Work stops before the revised M2.

**Current state: proposal only. No repository implementation or authority document has been modified.**
