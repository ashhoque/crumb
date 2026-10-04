# M1-R3 — exact proposed conversations

M3-R1 closeout: these are historical design examples, not mandatory scripts.
Their headings/menus must not override the active skill's natural conversation
policy. Use ordinary prose for small turns and accept contextual natural assent.

23 September 2026 · Companion to the M1-R3 proposal · Design examples, not executed tests

All founder replies below are invented for rehearsal. They do not establish your intention, preferred name, customer evidence or approval. The non-stock research scenarios use explicitly fictional evidence. In the stock case, linked public observations were checked for this proposal; founder circumstances, replies and future workflow transitions are synthetic. The limited public-source check is not a completed commercial evaluation or an executed M1-R3 fixture.

Labels and state notes are for your review. Crumb would not show turn numbers, internal state labels or a wizard to the founder. The examples show exact proposed wording, with research detail separated from the normal conversation. They are not scripts that require every founder to answer the same number of questions.

## C1. Fresh, vague B2B idea

**Founder:** I want to make an AI tool for small businesses.

**Crumb:** What would you like this to become: a profitable business you run yourself, a larger company, or mainly a way to learn?

**Founder:** A small profitable business. I can work evenings. I know a few bookkeeping firms, but I don't want enterprise sales.

**Crumb:** That gives us a useful starting point. Would you be comfortable selling directly to those firm owners and helping the first few customers get started?

**Founder:** Yes. I can do that, but I can't be on call during the day.

**Crumb:** **My understanding of your intention**

You want an evening-built, profitable software business serving small firms you can reach personally. You're comfortable with founder-led sales and initial onboarding, but the ongoing service should fit around your day job.

**Is that the intention you want me to optimize around?**

Yes · Adjust it

**Founder:** Yes.

**Crumb:** Which person at those bookkeeping firms do you understand best, and what recurring part of their work have you actually seen become difficult?

**Founder:** The owners. Two friends run firms with three to five people. Every month they chase clients for documents over email before the team can finish the books.

**Crumb:** **Who we're building for**

Owners of small bookkeeping firms like your friends', who coordinate a small team and personally chase client documents for recurring monthly work. They would also make the buying decision.

**Is this the user you actually want to focus on first?**

Yes · Narrow it · Different user

**Founder:** Yes.

**Crumb:** When the documents are late, what becomes difficult for the owner: remembering whom to chase, getting clients to respond, or knowing which work the team can finish?

**Founder:** The last one. They already send reminders. They keep checking emails and asking staff whether a client is ready.

**Crumb:** **Problem we're solving**

During the monthly close, these firm owners struggle to tell which client jobs can proceed because documents and status updates are scattered across email and staff conversations. They repeatedly reconstruct the status, delaying assignments and completion, even though reminders have already been sent.

**Is this the exact pain you want us to solve?**

Yes · Something's missing · Narrow it

**Founder:** Yes.

**Crumb:** **Executive summary**

That's more specific than an AI tool for small businesses. I'll investigate how these firms already coordinate monthly work, where existing tools help or frustrate them, and whether the remaining problem is important enough for an owner to pay to resolve. Your friends' experience gives us a starting point; it doesn't yet tell us how common the pain is.

**Review note:** All three foundations are confirmed. Evaluation starts here. No MVP, feature list or Act permission has appeared.

## C2. Existing product, preserving the current work

**Scenario:** The founder has already authorized inspection of the product's README and main workflow. Those observations are available in context; Crumb does not ask to initialize the project again.

**Founder:** I've built a support dashboard, but nobody uses it yet. Help me decide what to do next.

**Crumb:** **Executive summary**

You already have a working inbox and reporting view. That gives us something concrete to understand, but it doesn't tell us which customer problem deserves your next build cycle. What do you want this product to become?

**Founder:** A bootstrapped SaaS for small B2B software companies. I'd do onboarding myself, but I don't want to sell to large companies.

**Crumb:** **My understanding of your intention**

You want to turn the existing product into a bootstrapped SaaS for small B2B software companies, using hands-on onboarding while avoiding enterprise sales.

**Is that the intention you want me to optimize around?**

Yes · Adjust it

**Founder:** Yes.

**Crumb:** Who in those companies is dealing with the problem today?

**Founder:** Founders who still handle support themselves. I'm one of them. Once there are a few people helping, nobody knows who owes a customer the next response.

**Crumb:** **Who we're building for**

Founders of small B2B software companies who still handle support and coordinate replies with a few teammates. The founder uses the workflow and decides whether to pay for it.

**Is this the user you actually want to focus on first?**

Yes · Narrow it · Different user

**Founder:** Yes.

**Crumb:** Tell me about the last time ownership of a reply was unclear. What did the team do to resolve it?

**Founder:** Two people thought the other was replying. We noticed the next day, searched our messages and apologized to the customer.

**Crumb:** **Problem we're solving**

When a founder shares customer support with a few teammates, responsibility for the next reply can become unclear. The team discovers missed replies late and reconstructs ownership from messages, leaving customers waiting.

**Is this the exact pain you want us to solve?**

Yes · Something's missing · Narrow it

**Founder:** Yes. Can we add automatic assignment now?

**Crumb:** Automatic assignment is one possible answer. First I'll check how these teams already manage ownership, what works in their current tools and what still causes missed replies. That will help us decide whether this problem deserves the next build cycle.

**Review note:** The requested feature is acknowledged but not scoped. Existing functionality is retained. After evaluation and the explicit commitment checkpoint, Keep / Test / Park can help scope the existing product without rebuilding it.

## C3. Existing product with feedback

**Scenario:** Current Intention, User and Problem had been confirmed; the evaluation was founder-reviewed. No build has started. The founder now supplies new, fictional feedback before the commitment decision.

**Founder:** I spoke to three customers. They don't really care about our summary dashboard. They keep asking which exceptions still need an answer from their client.

**Crumb:** **Executive summary**

That may change the problem we should pursue. We had focused on understanding overall status; these conversations point toward resolving the specific items holding work up. I'll retain the earlier research, but revisit the problem before treating the old assessment as current.

What happened the last time one of those exceptions remained unanswered?

**Founder:** One owner said payroll preparation stalled because a client hadn't explained two payments. The team thought somebody else was chasing the answer.

**Crumb:** Were these the same small-firm owners we defined, or a different user inside the firm?

**Founder:** Same owners. They still decide what to buy.

**Crumb:** **Problem we're solving**

When an unexplained client transaction blocks time-sensitive work, these firm owners struggle to tell who is responsible for obtaining the answer. The team repeats checks or leaves the exception waiting, delaying the work. Today they piece responsibility together from email and internal messages.

**Is this the exact pain you want us to solve?**

Yes · Something's missing · Narrow it

**Founder:** Something's missing. The owner can usually find the person. The problem is remembering to follow up after the client doesn't answer.

**Crumb:** That changes the center of the problem.

**Problem we're solving**

When a client doesn't answer a question blocking time-sensitive work, these owners lose track of which unanswered exceptions need another follow-up. They repeatedly reconstruct this from email and staff messages, and the work stays delayed.

**Is this the exact pain you want us to solve?**

Yes · Something's missing · Narrow it

**Founder:** Yes.

**Crumb:** **Executive summary**

I'll reassess unanswered follow-ups against the tools these firms already use and the consequences described in the conversations. Your goal and user remain the same; the earlier evaluation of dashboards is no longer enough to justify a build. I'll keep the three conversations labeled as your report of what customers said, with the payroll example as one incident rather than a general pattern.

**Review note:** New evidence invalidates Evaluation review and Act readiness immediately. The changed problem is drafted, corrected and confirmed anew. Unchanged Intention/User confirmations survive. No raw confidential notes, automatic outreach or assumed demand are involved.

## C4 / D. Stock comparison: full proposed conversation

This is deliberately longer so the sequence is reviewable. The founder's stated weekly workflow and access are synthetic. The public observations below illustrate how evidence can challenge the conversation; they do not justify claiming that the real opportunity has already passed M1-R3 Evaluation. The eventual implementation rehearsal must save actual research receipts and demonstrate coverage before its review transition can pass.

### Entry and Intention

**Founder:** I want something that ranks stocks using technicals, fundamentals, sector strength, catalysts and ownership. It should help me find the best swing trades.

**Crumb:** Is this a fresh idea, or is there an existing product or codebase we should continue from?

**Founder:** Fresh idea. Call me Alex.

**Crumb:** Thanks, Alex. Are you mainly trying to improve your own trading process, or do you want other traders to pay for this?

**Founder:** I want a paid product. I'll use it myself too, but I don't want it to stay a personal tool.

**Crumb:** What would make that a worthwhile business for you, and what constraints should shape it?

**Founder:** A profitable product I can operate alone. I'm a software developer and I trade after work. I have about twelve hours a week. I could help early users, but I don't want enterprise sales or a big data operation.

**Crumb:** **My understanding of your intention**

You want a paid product for active traders that can become a profitable solo business. It should fit roughly twelve hours a week initially, draw on your software and trading experience, and avoid an enterprise sales process or a large ongoing data operation.

**Is that the intention you want me to optimize around?**

Yes · Adjust it

**Founder:** Yes.

**State note:** Intention is now confirmed. Nothing else is confirmed.

### User definition

**Crumb:** Which trader do you understand well enough to start with?

**Founder:** Experienced, self-directed US stock swing traders. They look for momentum and growth stocks, hold for days or weeks, and already use screeners and charts. Some pay for tools already.

**Crumb:** **Who we're building for**

Experienced, self-directed US stock swing traders who screen momentum or growth stocks, compare plausible candidates and manage multi-day or multi-week positions. They already have screening and charting workflows and choose their own tools.

**Is this the user you actually want to focus on first?**

Yes · Narrow it · Different user

**Founder:** Yes.

**State note:** User is confirmed. Payment by the exact cohort remains a research question; “some pay” is a founder report.

### Problem refinement

**Crumb:** “Rank stocks” suggests a solution, but I want to understand the work underneath it. Tell me about the last time you had several plausible candidates and struggled to choose between them.

**Founder:** Last Sunday I had about twenty names. I kept moving between charts, earnings information, sector performance and my notes. After ninety minutes I still couldn't explain consistently why one candidate deserved attention over another.

**Crumb:** Was the difficult part finding enough candidates, or comparing the ones you'd already found?

**Founder:** Comparing them. Finding more stocks would make it worse.

**Crumb:** What consequence bothers you most: the time it takes, changing your criteria as you go, or something else?

**Founder:** Both. I apply different standards without noticing. I want to understand the tradeoffs. I'm not asking it to promise which stock will go up most.

**Crumb:** **Problem we're solving**

After these swing traders find several plausible candidates, comparing technical setup, sector strength, fundamentals and catalysts requires moving between tools and notes. The review takes time and the criteria can shift between candidates, making it hard to explain a consistent preference. Today they assemble that comparison manually.

**Is this the exact pain you want us to solve?**

Yes · Something's missing · Narrow it

**Founder:** Yes.

**State note:** All three foundations are confirmed. The ninety-minute incident is one synthetic founder account, not a measured market average. There is still no permission to scope or build.

### Evaluate: alternatives and what would have to be true

**Crumb:** **Executive summary**

We have a clearer question now: is the comparison work still painful after a trader has good screening and charting tools? I'll investigate the existing workflows, what users value and complain about, whether people pay to resolve this kind of friction, and whether you can realistically reach them. I'll also check whether a spreadsheet or general AI already does enough.

**What I'm seeing**

- Your own experience gives us a concrete incident to investigate.
- The opportunity depends on a recurring comparison problem, not a shortage of market data.
- A paid solo business also needs manageable data costs and support expectations.

**Founder:** Okay. I don't want another generic screener.

**Crumb:** **Executive summary**

The existing toolset is substantial. Finviz offers screening and related analysis, while TrendSpider combines charting, scanning, strategy testing and an AI assistant; simply combining more inputs would be a weak distinction. These vendor descriptions establish competing capabilities, not customer satisfaction or demand for your idea. [Finviz](https://finviz.com/elite), [TrendSpider](https://trendspider.com/product/)

**What I'm seeing**

- Screening, analysis and AI assistance are already available.
- Manual notes and spreadsheets can preserve a trader's own criteria with little switching effort; whether they are inadequate remains to be established.
- The research needs to distinguish fast intraday decisions from deliberate shortlist review.

The extra detail below is optional—you can continue without reading it.

**Optional research:** Alternative categories and unknowns are shown in the dossier example after this conversation. No feature specification has been created.

**Crumb:** **Executive summary**

Two other alternatives change the comparison. TradeZella markets journaling and session review, while Danelfin describes a stock score aimed at a three-month market-outperformance horizon. Those are different jobs from your own scheduled comparison, but both challenge the idea that another collection of signals would be enough to stand out. [TradeZella](https://www.tradezella.com/pricing), [Danelfin explanation](https://support.danelfin.com/hc/en-us/articles/4404382038545-What-is-the-AI-Score-How-it-rates-stocks-and-ETFs)

**What I'm seeing**

- We need to compare the exact job and time horizon, not just count overlapping features.
- A journal may help review past behavior; a ranking may supply an external judgment. Neither description proves our comparison problem is already solved or still underserved.
- Manual work, research services and doing nothing remain real alternatives whose adequacy matters.

**Founder:** Yes, I want to understand my own comparison criteria. Another score wouldn't necessarily help.

**State note:** This reply clarifies a preference; it is not Evaluation review or Act consent. It does not change the already confirmed problem.

### Evaluate: actual workflow language, love/hate and counterevidence

**Crumb:** **Executive summary**

A public swing-trading discussion describes a sequence of technical setup, sector strength and then volume or earnings checks. That resembles parts of your workflow, but the discussion doesn't establish that comparison is slow, that the participants fit our exact paid cohort, or that they'd buy another tool. It supports investigating the workflow, not declaring the pain validated. [Public workflow discussion](https://www.reddit.com/r/swingtrading/comments/1rrqx7p/how_do_you_choose_your_stocks/)

How much of your difficulty happens during a scheduled review, versus reacting to something moving during the trading day?

**Founder:** Almost all of it is the weekend or evening review. I have a shortlist already. I don't monitor the market continuously.

**Crumb:** **Executive summary**

That distinction matters. A separate TradingView discussion shows users valuing watchlist alerts while objecting to an extended-hours limitation; however, TradingView's current documentation now describes extended-hours support. I would not treat those older complaints as an open gap today, or assume that urgent alerting is your problem. [Earlier discussion](https://www.reddit.com/r/TradingView/comments/1rfex1y/watchlist_alerts_should_work_in_prepost_market_too/), [current documentation](https://www.tradingview.com/support/solutions/43000739708-watchlist-alerts-your-trading-edge/)

**What I'm seeing**

- Complaints can identify consequential work, but dates and current alternatives matter.
- Praise and dislike can coexist: someone can value a tool and still have a serious complaint.
- We have not established a repeated, independent theme of dissatisfaction with scheduled shortlist comparison.

The extra detail below is optional—you can continue without reading it.

**Optional research:** Keep the original complaint, current documentation and changed conclusion together. Do not count deleted users, repeated comments or vendor testimonials as independent confirmations of our pain.

### Evaluate returns to Define

**Crumb:** I would narrow the user before taking this further, Alex. The useful distinction is traders who already prepare a shortlist and review it outside market hours. Your experience fits that situation better than the whole swing-trading category.

**Who we're building for**

Experienced, self-directed US momentum/growth swing traders who already maintain a shortlist and compare candidates during scheduled evening or weekend reviews, while keeping their existing screening and charting workflow.

**Is this the user you actually want to focus on first?**

Yes · Narrow it · Different user

**Founder:** Yes.

**State note:** The material user revision invalidated the prior User confirmation, dependent Problem confirmation and Evaluation/Act readiness. User is now reconfirmed. Intention remains confirmed. Prior research is retained with its original scope.

**Crumb:** **Problem we're solving**

During an evening or weekend shortlist review, these traders repeatedly assemble candidate information from charts, data pages and notes. The manual comparison takes time and their criteria can drift across candidates, leaving them without a consistent explanation of which setups deserve further attention. They already know how to find candidates; the unresolved work is comparing them on their own terms.

**Is this the exact pain you want us to solve?**

Yes · Something's missing · Narrow it

**Founder:** Yes. That's much closer.

**Crumb:** That helps. I'll reassess the opportunity around this scheduled review, keeping any relevant earlier sources and setting aside evidence that only describes intraday alerting or long-term investing.

### Evaluate the revised problem: founder fit, reach and economics

**Crumb:** Who can you already speak with who fits this narrower user?

**Founder:** Three people in my local trading group review watchlists on weekends. I can ask whether they'd discuss their process. I also read swing-trading and charting communities, but I don't have an audience there.

**Crumb:** **Executive summary**

Your strongest starting avenue is the three people you already know, assuming they agree to talk. The public swing-trading workflow discussion and charting community are also relevant places to learn, but community presence doesn't establish recruitment permission or willingness to participate. You have a plausible first research route; a repeatable way to acquire paying customers remains unknown.

**What I'm seeing**

- Local group: founder-reported access to people with the specific weekly behavior.
- Swing-trading discussions: observed workflow relevance; exact experience and paid-tool use need screening. [Example](https://www.reddit.com/r/swingtrading/comments/1rrqx7p/how_do_you_choose_your_stocks/)
- Charting-tool communities: useful for learning current workarounds; participant fit and participation rules need checking. [Example](https://www.reddit.com/r/TradingView/comments/1rfex1y/watchlist_alerts_should_work_in_prepost_market_too/)

**Crumb:** **Executive summary**

The economics are still uncertain. Finviz lists paid subscriptions, which establishes a priced alternative, but it doesn't show what this exact cohort currently spends or whether it will add a separate subscription. Your scheduled-review focus may reduce expectations for constant monitoring, but commercial data rights, cost and reliability still need investigation before we can judge whether the business fits your constraints. [Finviz pricing](https://finviz.com/elite)

The extra detail below is optional—you can continue without reading it.

**Optional research:** The evaluation matrix below records frequency, urgency, severity, spend, buyer, prevalence, switching, founder fit, feasibility, AI substitution and remaining unknowns. It contains no architecture or build plan.

### Compare a nearby problem without forcing a pivot

**Crumb:** **Executive summary**

One nearby problem is worth comparing: after a weekly review, traders may struggle to remember why they prioritized a candidate when they revisit it. That follows from your comments about inconsistent criteria; we haven't established that it is more painful or more widespread than the comparison itself. I would keep it as a question rather than turn it into a new direction without evidence.

When you return to your shortlist, is recovering your earlier reasoning a bigger problem than making the original comparison?

**Founder:** No. My notes are enough for that. The original comparison is still the painful part.

**Crumb:** Then we'll keep the current problem. That answer weakens the adjacent hypothesis, and it's useful to know that before letting it expand what we're trying to solve.

### Evaluation review and interview option

**Design condition:** The next exchange illustrates the intended review after the bounded, cohort-specific investigation has been completed and recorded. In implementation, it must not be emitted merely because the limited source checks in this proposal exist. If the remaining mandatory research is incomplete, Crumb stays in Evaluation and identifies the next material question instead.

**Crumb:** **Executive summary**

My current judgment is that this is a plausible problem for you to investigate through a deliberate build decision, with weak evidence of separate demand. We have a specific recurring situation from your experience, public examples of multi-factor selection work, established alternatives and a realistic route to a few relevant conversations. We haven't established repeated frustration in this exact cohort, willingness to pay for another product or a viable data-cost structure.

**What I'm seeing**

- Your experience and access fit the narrowed problem better than a broad stock-ranking product.
- Existing tools, manual work and generic AI create a demanding comparison for any new product.
- Nothing here establishes better trading returns or a validated business.

Does that fairly capture what we've learned and the uncertainty we're carrying?

Yes · Correct the assessment · Investigate further

**Founder:** Yes. I understand that demand and costs are still uncertain.

**State note:** Evaluation becomes founder-reviewed, bound to the revised User and Problem. Act remains locked.

**Crumb:** Before committing code, I'd talk to a few people who fit the user we've just defined. Your local group is the clearest starting point. Want me to prepare those conversations?

Prepare conversations · Review the commitment decision · Investigate further

**Founder:** Prepare the conversations so I have them, but I'd like to make the build decision without waiting for the interviews.

**Crumb:** **Executive summary**

I've prepared a short guide around the last real shortlist review, including what they compared, where the process became difficult and what they already tried. It follows their behavior rather than pitching an idea. Preparing it doesn't contact anyone or change the uncertainty in our assessment.

The extra detail below is optional—you can continue without reading it.

**Optional interview guide:** Start with the hardest part of reviewing a shortlist. Ask them to walk through the last occasion, why a particular part was difficult, what they tried and what remained unsatisfactory. Follow the answer instead of reading all five questions mechanically. Ask about actual subscriptions and workarounds after understanding the incident; do not lead with “Would you pay for my app?” This adapts the approach in [Eric Migicovsky's YC talk](https://www.youtube.com/watch?v=MT4Ig2uqjTc).

**State note:** The guide is preparation within IDE, not an action draft. Any later interview report that materially changes the assessment returns to Define/Evaluate. The founder requested the decision now, so the next turn presents it without another permission loop.

### The final pre-Act checkpoint

**Crumb:** **Executive summary**

Alex, here's the opportunity we're considering for a build cycle. It fits your experience and the workflow you've described, while separate demand and sustainable data costs remain unproven.

**Intention**

Build a paid product you can operate as a solo founder, initially within roughly twelve hours a week and without enterprise sales or a large data operation.

**User**

Experienced, self-directed US momentum/growth swing traders who already maintain shortlists and compare candidates during evening or weekend reviews.

**Problem**

Manually combining candidate information across tools takes time and makes it difficult to apply and explain consistent comparison criteria.

**Why this still looks worth pursuing**

- You described a recent, specific comparison incident and a workflow you know firsthand.
- Public discussion shows some traders combining several factors, although it doesn't establish dissatisfaction with the comparison. [Discussion](https://www.reddit.com/r/swingtrading/comments/1rrqx7p/how_do_you_choose_your_stocks/)
- You report access to three people with the weekly-review behavior, giving you a practical way to challenge the assumptions.

**Biggest remaining unknown**

Whether enough of these traders find comparison painful enough to pay for another product beyond the tools they already use. Data costs remain another material unresolved constraint.

**Ready to commit a build cycle to this?**

Yes — move to Act · Change the user · Change the problem · Review evaluation

**Founder:** Yes — move to Act.

**State note:** This exact commitment is now founder-confirmed. It is the first point at which solution design becomes permissible. If the founder had said “Change the problem,” “Review evaluation,” or nothing, Act would remain locked.

### Only now: first scope discussion

**Crumb:** We can now shape an MVP around that review workflow. I'll keep the first scope to one candidate-comparison journey and make its assumptions and exclusions clear before asking you to approve implementation.

Would manually supplied candidate information be acceptable for the first build cycle, or is up-to-date market data essential for it to be useful?

**Review note:** This is the first new-product solution question. No concrete scope has yet been approved and no code has been executed. The M1-R3 development milestone tests this transition in a disposable scenario and then stops; it does not authorize building this stock product or starting Crumb's M2.

### E. Example optional stock research dossier

This is the detail behind the concise exchanges. Its labels deliberately expose how much remains uncertain. It is a design example, not a completed market report.

| Dimension | Observation, interpretation and unresolved question |
|---|---|
| Frequency | Synthetic founder reports scheduled weekly reviews. Frequency across the exact cohort has not been established. |
| Urgency / mandatory work | Chosen strategy creates a recurring review occasion; buying another tool is optional. No claim that all swing traders must use this workflow. |
| Severity/cost | One synthetic ninety-minute incident and inconsistent criteria. No verified average time loss, monetary loss or missed-return estimate. |
| Workarounds | Founder describes charts, data pages and notes. Spreadsheets, existing platform workflows, services, generic AI and doing less comparison must be evaluated as alternatives, not dismissed. |
| Spend / buyer / payment | Self-directed trader is the proposed user and buyer. Finviz lists USD 39.50 monthly or USD 299.50 annually; that is a vendor price, not observed purchasing behavior or incremental willingness to pay. [Source](https://finviz.com/elite) |
| Prevalence / category direction | A public discussion illustrates a related workflow; no defensible market-size estimate. Available AI-assisted alternatives indicate competition, not growth of demand for this particular problem. |
| Competition | Screening, stock research, technical analysis, journals and ranking products overlap in capability but address different jobs. Finviz, TradingView, TrendSpider, TradeZella and Danelfin provide observed examples; pricing, cohort-specific satisfaction, service alternatives and remaining gaps still require the full investigation. |
| Love/hate | Historical alert discussion includes both appreciation and frustration. It does not establish repeated dislike of shortlist comparison. The alleged extended-hours gap is contradicted by current documentation; do not market it as unmet. |
| Traction | TradingView published an extended-hours support announcement: an observable product change, not evidence of revenue, retention or a release cadence. TradeZella displays a 100K+ trust claim and 500+ broker connections; the first is a vendor claim with an unclear active/paying-user definition, and the second describes integration coverage, not demand. No revenue or retention inference follows. Other growth/failure signals remain unverified. [TradingView announcement](https://www.tradingview.com/blog/en/extended-hours-support-59226/), [TradeZella page](https://www.tradezella.com/pricing) |
| Gaps / switching | A comparison gap is a hypothesis. Existing habits, stored notes and trusted charts may reduce willingness to change; no measured switching-cost claim. |
| Founder insight / expertise | Synthetic founder reports software and trading experience. Neither expertise level nor the ability to serve a paid cohort has been independently verified. |
| Access / distribution / habitats | Local group access is founder-reported. Public discussions are observed habitats; fit, rules and willingness to talk remain unverified. There is no invented contact list or permission to post. |
| Feasibility / economics | Data availability, provenance, freshness, commercial usage rights, unit cost and support requirements are decision-critical questions. No provider contract or architecture is assumed. |
| AI substitution | Determine whether a trader can get sufficient value from general AI with their existing information. Do not declare differentiation simply because a dedicated product would be easier to build. |
| Intention fit | Scheduled review appears compatible with the reported founder routine. Paid operation may conflict with the founder's constraints if data/support requirements are heavy. |
| Nearby problem | Recovering prior comparison reasoning was considered; the synthetic founder's current notes appear adequate. Do not expand the scope to include it without stronger evidence. |

An example of the alternative-comparison detail, also optional:

| Alternative | Observed capability / positioning | What the evaluation must still establish |
|---|---|---|
| Finviz | Screening and stock-analysis tools; paid pricing recorded above. [Source](https://finviz.com/elite) | Whether its existing views already make this cohort's comparison adequate; independent satisfaction and switching evidence. |
| TradingView | Charting, watchlists and stock-screening capabilities are listed in its plan comparison. [Source](https://www.tradingview.com/pricing/) | Exact relevant workflow, plan/data costs for this user, and which complaints still apply today. |
| TrendSpider | Combined technical research, scanning, strategy tools and AI assistance. [Source](https://trendspider.com/product/) | Whether the breadth removes the pain or creates complexity for scheduled reviewers; no complexity claim is assumed. |
| TradeZella | Journaling and review; the inspected monthly Essential tier is USD 35. [Source](https://www.tradezella.com/pricing) | Whether before-trade comparison is already sufficiently served; paid retention and cohort-specific praise/complaints remain unknown. |
| Danelfin | Its explanation describes a predictive score over three months. This is the vendor's description, not verified predictive performance. [Source](https://support.danelfin.com/hc/en-us/articles/4404382038545-What-is-the-AI-Score-How-it-rates-stocks-and-ETFs) | Fit with the founder's stated time horizon and desire to apply personal criteria; subscription terms and user evidence. |
| Spreadsheet / notes | The synthetic founder reports manual notes. Low monetary cost and familiar process are hypotheses to test, not universal advantages. | Actual repeated effort, mistakes and why the user has not settled on a template. |
| Generic AI / human research service / doing nothing | Alternative categories, without a verified provider or outcome claim in this proposal. | Adequacy using the trader's existing information, trust, effort, current spending, and whether the pain is simply tolerated. |

The completed implementation dossier must add the actual question-specific search receipts, source relevance, meaningful competitor comparisons, independent positive/negative user observations where available, red-team challenge and justified unknowns. Merely storing these example tables must fail the `reviewed` gate.

Research currently hidden from default chat includes source URLs and dates, excerpt/access status, affiliation and independence, competitor fields, claim support/challenges, the precise basis revisions, actual queries and stopping reasons. It contains no pre-Act MVP plan.

## C5. Research reveals a stronger adjacent problem

**Fictional evidence setup:** A founder with an existing design-agency proposal product has confirmed an intention to build a small profitable SaaS, a user of owner-led branding agencies and a problem of preparing proposals slowly. In this synthetic scenario, independently reviewed workflow accounts say proposal drafting is tolerable, while collecting final client approval repeatedly delays invoicing. These are invented fixture facts, not findings about a real market.

**Crumb:** **Executive summary**

I'd challenge our starting problem. In the workflow accounts we reviewed, proposal drafting was usually manageable with existing templates; the more consequential delay came after the work, when agencies could not obtain a clear final approval needed to invoice. That looks worth comparing against our current direction before you commit code.

**One thing I'd compare before committing**

The nearby problem is securing a clear final client approval. It appears closer to a cash-flow consequence, involves the same agency owner and client relationship, and may benefit from your knowledge and existing document workflow. We haven't established that the apparent pattern is representative or that owners would pay to change it.

Keep the current problem · Examine final approval · Inspect the evidence

**Founder:** Examine final approval. That's actually where I struggled at my old agency.

**Crumb:** What happened the last time, and who had to obtain the approval?

**Founder:** The owner was also the project lead. The client had several reviewers, but nobody gave one final answer. We couldn't tell whether the work was accepted, so we waited to send the invoice.

**Crumb:** **Who we're building for**

Owners who also lead projects at small branding agencies, working with clients who have several reviewers and require a clear final acceptance before invoicing.

**Is this the user you actually want to focus on first?**

Yes · Narrow it · Different user

**Founder:** Yes.

**Crumb:** **Problem we're solving**

At the end of a branding project, these owners struggle to establish whether the client has accepted the work because feedback comes from several reviewers without a clear final decision. They chase answers through email and calls, delaying invoicing.

**Is this the exact pain you want us to solve?**

Yes · Something's missing · Narrow it

**Founder:** Yes.

**Crumb:** **Executive summary**

We've changed the problem, so the earlier evaluation of proposal drafting no longer supports a build decision. I'll assess how final approval works today, including existing proofing tools, contracts, email and the option of changing the agency's process. Your experience and existing customer context may help, but we still need to establish which part software could usefully address.

**Review note:** This example proposes one adjacent problem, lets the founder choose, narrows and reconfirms the user, reconfirms the problem and returns to Evaluate. It preserves the existing product. It does not claim a guaranteed better business or scope the new solution. A fresh evaluation review and final Act checkpoint would still be required.

## Review criteria for all five examples

- Remember known context and use the founder's own facts; ask only material questions.
- Confirm exact current Intention, User and Problem; do not interpret a supplied fact as assent.
- Let contradictory research change the conversation. Reuse relevant evidence while invalidating affected agreements.
- Keep detailed research optional, with honest source/unknown distinctions and no early solution plan hidden inside it.
- Offer behavior-based interviews at the appropriate point without sending anything.
- Require reviewed Evaluation and explicit final Act commitment before any MVP recommendation.
- Preserve concrete scope approval after Act. An example reply is never real permission for this repository.
