# M3-R4 — market intelligence, founder copilot and first-user engine

Status: **PASS WITH WARNINGS**. M4 was not started. Live-host conversations and their project fixtures were synthetic; public sources were inspected in host trials, but no real founder or customer behavior was verified.

## Implemented

- `src/domain/market-intelligence.ts`: an early, bounded Market Pulse; a compact opportunity map that separates pain, frequency, workaround, spend, reach, growth, alternatives and engagement. It rejects inaccessible evidence as observed support and never infers TAM from buzz.
- `src/domain/first-user-engine.ts`: local/community route selection, separate research and acquisition habitats, draft-only outreach, honest pre-Act validation asset recommendations and an outreach outcome learning aid that treats silence as ambiguous.
- `src/domain/founder-intelligence.ts`: compact source/confidence-marked user behavior, market, habitat and first-user learning notes within the existing working context and Act boundaries.
- `src/cli/main.ts`: read-only internal planners `market-pulse`, `opportunity-map`, `first-user-plan`, `outreach-draft`, `validation-asset` and `first-user-learning`. The host still performs any public research; these commands do not browse or send.
- `.agents/skills/crumb/SKILL.md` and `references/{research,local-tools}.md`: continuous Crumb voice, early evidence gathering, opportunity and user judgment, actual small public candidate review, public-source limits, founder-controlled outreach and post-exposure learning. The existing IDE confirmations, Act gate and M3 Launch & Learn remain intact.
- `scripts/verify-closeout-host.mjs`: six M3-R4 host scenarios and an 11-turn continuity scenario. `tests/m3r4-market.test.ts` covers bounded research, calibration, habitat choice, outreach permission, learning and installed CLI behavior.

## Verification

- Focused M3-R4 and M3-R3 regression: 13/13 passed. After the learning addition, focused M3-R4 plus Launch & Learn: 34/34 passed. The final candidate-guidance edit passed the M3-R4 focused tests: 8/8.
- Full suite on the final revision: **328/328 passed**, zero failures or skips, including build/type checks. The preceding 327/327 baseline also passed.
- Live host: market, pricing, first users, hidden opportunity, feature pushback and founder win each completed two turns; continuity completed 11 turns after one `$crumb` invocation. No identity leaks were detected. A targeted first-user retest returned five public Toronto clinic starting points with source links, research/acquisition route separation and explicit uncertainty. No one was contacted. The revised founder-win flow also completed without claiming that ignored invites were demand evidence.
- Longest observed live turn: 96.9 seconds in the targeted first-user retest; no turn exceeded two minutes. The long continuity run took 126.4 seconds across 11 turns.

## Remaining warnings

- A paying-pilot live turn still opened with an analytical progress line before a warmer reaction after one targeted guidance repair. The response did recognize the milestone and qualify what payment proves. Stop further repair under the one-repair rule; use unscripted founder feedback to judge the desired energy.
- Cold host turns still searched for an already supplied skill path, adding latency. The source skill cannot prevent a search that happens before it is read. No turn crossed the two-minute recurring-failure threshold in this run.
- The planners rely on host-supplied public evidence and founder reports. They do not independently verify claims, grant outreach permission, or establish customer validation. The live candidates are starting points; their pain and willingness remain unknown.

## Seven short alpha prompts

1. `$crumb We got our first paying pilot today! They paid to fix our messy approval process. What should we do next?`
2. `$crumb This app already works. Read only what matters and help me decide its first price.`
3. `$crumb We help independent accountants chase missing documents. Check a small public market pulse and tell me whether the pain looks worth testing.`
4. `$crumb We imagined an AI dashboard, but users pay assistants to chase approvals. What's the stronger opportunity?`
5. `$crumb Find five plausible local clinics in Toronto for a scheduling interview. Show what you verified, and don't contact them.`
6. `$crumb Where do freelance editors discuss revision pain, and where could we appropriately find the first few users?`
7. `$crumb I want to build four more features before speaking to a customer. Push back if that's the wrong move.`

Recommended model: start with GPT-5.6 Sol High for ordinary Crumb revision work. Escalate a specific cross-layer architecture problem to GPT-6 Astra Work only after a careful trace and one targeted repair fail to explain it.
