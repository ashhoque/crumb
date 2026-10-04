# M1-R3 founder trial

The implementation and local checks are recorded in [M1_R3_REPORT.md](M1_R3_REPORT.md). This trial evaluates whether the conversation is now useful enough before building. Passing code and scripted conversations do not answer that question.

Use the existing CEC project in Codex. Invoke `$crumb` explicitly. For a safe synthetic trial, start with:

> $crumb Run a synthetic conversation in a disposable scratch project. I want something that ranks stocks. I screen momentum and growth stocks, but comparing the shortlist is frustrating. Treat my replies in this trial as invented. Do not implement a product or alter existing customer data.

Answer naturally. Crumb should ask fresh/existing only if it is unknown, explore your intention, and separately confirm a useful initial user and exact pain. It should understand why the comparison is difficult before investigating the opportunity.

Watch for these behaviors:

- It waits for your explicit confirmation of Intention, User and Problem. Saying “just build it” does not skip them.
- Research teaches you something about alternatives, what users love or dislike, actual workflows, commercial uncertainty and how you could reach likely users. Sources and longer analysis remain optional.
- It distinguishes public anecdotes, vendor claims and proxies from verified demand. It challenges the idea when existing solutions may suffice.
- If research changes the user or problem, it explains why and asks you to confirm the revised statements.
- It asks whether its evaluation fairly reflects the findings and uncertainty. Agreeing here does not authorize Act.
- It can prepare questions about recent customer behavior without sending messages or building anything.
- It shows one concise commitment summary with **Yes — move to Act**, **Change the user**, **Change the problem**, and **Review evaluation**. Generic agreement or opening detail does not unlock it.
- No MVP, feature scope, architecture or prototype is recommended before explicit Act consent. After consent, a concrete implementation scope still needs separate approval.

To test the correction path, choose **Change the user** at the commitment summary. The previous User, Problem, Evaluation review and Act consent must no longer count. Unchanged Intention should remain confirmed.

To try an existing product, give it already-known context and permission for only a few relevant files. It should preserve those files and avoid asking you to start again. Treat praise or summarized feedback as founder reports, not automatic validation or instructions to add features.

Compare the experience with the [33-turn stock rehearsal](docs/development/M1_R3_REHEARSALS.md) and its [optional research](docs/development/M1_R3_STOCK_RESEARCH.md). Those are authored local rehearsals; your live conversation need not follow their number of turns.

Useful feedback is the exact point where Crumb moved too quickly, asked an unnecessary question, missed an important uncertainty, or made the pre-build thinking valuable. M2 remains unstarted; this trial does not authorize it or a Git push.

## Developer verification

Run `./cec.ps1 check` in the existing repository. It uses the pinned runtime and runs compilation plus the offline core tests. `npm run check:host` attempts installed-host discovery/invocation; the current environment's home-directory startup failure is documented separately. Do not infer host invocation passed from skill discovery alone.
