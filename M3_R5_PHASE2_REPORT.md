# M3-R5 Phase 2 review — 4 October 2026

**M3-R5 BLOCKED.** Useful founder behavior improved, but installed-host review
continuity and tool efficiency do not satisfy release acceptance. No main merge.
Review began with the Phase 1 packet and BEFORE/AFTER transcripts, followed by
the relevant skill, installer, guide, thesis, context and host-test surfaces.
No broad redesign, new dependency, delegation or M4 work.

## Changes and architecture judgment

- `ba64c04`: connect the installed skill to built Core with a checked local runtime
  locator; allow provisional research when user/problem are known and intent is
  still open; include counterevidence, all unknowns and technical risk in the
  recorded thesis; prepare concrete offers and outreach in the current turn.
- `0095123`: start compact, isolated working notes through the existing Core
  store without fabricating a complete Evaluation dossier. Preserve version and
  conversation checks, prohibit overwrites, and keep Act unapproved. Add exact
  tool examples and stop optional planners from becoming a setup prerequisite.

One bundled review is a reasonable foundation-review mechanism only when the
founder sees the recorded material and Evaluation still passes its full checks.
Oversized theses now fail rather than silently omitting material risks. The Core
remains offline, MCP remains read-only, and existing persistence is reused.

## Live evidence and release blockers

All inputs were synthetic; these are actual installed Codex host runs, not real
customer trials. The host used its configured model, with no override. This
review does not certify the nested host as GPT-6 Astra Medium. One active global
Crumb skill and all ten read-only MCP tools were discovered/exercised.

Final transcript: `C:\Users\Ash\Documents\Codex\CEC\.m0-local\closeout-host-1791152918116\results.json`.
Earlier failed attempt: `C:\Users\Ash\Documents\Codex\CEC\.m0-local\closeout-host-1791152415903\results.json`.

1. **Review continuity fails.** The stock thesis was recorded at version 2, but
   the host displayed its own rewritten synthesis rather than the recorded text.
   After “Looks good, don't build yet,” it said “we'll keep the thesis as reviewed”
   without any tool call. Direct Core inspection still showed version 2, no
   confirmations, and null reviewBasis. Do not fabricate a receipt after the fact:
   the displayed text and recorded review differ. The build gate correctly stayed
   closed. Safe refusal to build is necessary but does not satisfy bundled-review
   acceptance or reliable saved continuity.
2. **Runtime discovery still wastes substantial time.** After one targeted repair,
   initial pricing needed 29 command executions, three failed commands and 186 s;
   it reread references and inspected Core source despite the installed instructions.
   The first attempt had timed out at 300 s. The workspace rule says to stop after
   one targeted repair when the same failure persists; no further repair loop was
   attempted. Skill prose alone has not made runtime use reliable enough.

The next authorized repair should stay narrow: make the host use the documented
presentation/confirmation contract and complete ordinary context calls without
source discovery. Acceptance must compare the shown thesis, persisted review and
unapproved Act, then repeat existing-app pricing. Do not relax consent to pass.

## Product judgment

| Area | Actual result |
| --- | --- |
| Direction / business abstraction | Pass in restaurant flow: plain firsthand context led to a narrow manual quote-check service and a paid test, without framework knowledge or a next-step menu. |
| Founder coordination / methodology | Zero prompts instructing research methods, source choice, numbers, channels or drafting. No startup methodology knowledge required in these flows. The thesis display was explicitly requested as a test; automatic timing of that review is not proved. |
| Autonomy ladder / questions | Reused supplied intent, inspected existing app, researched alternatives and made provisional recommendations. Core also permits investigation with open intent. Live runtime efficiency remains a blocker. |
| Highest-leverage bottleneck | Correctly emphasized payment and repeated workflow pain before features. Restaurants: repeated submission and willingness to pay; editors: an active client project and a paid month. |
| Prediction | On hearing about two editors, drafted the invitation and past-behavior questions without being asked. Saved likely_next_need and updated it. Useful anticipatory behavior is shown; causal benefit from that field alone is not isolated. |
| Market intelligence / reframing | Combined anecdotal owner language with commercial alternatives; narrowed generic quote comparison to pack-size/unit checking. Existing app positioned around revisions, deadlines and client status rather than cheap review links. Research influenced the recommendation. |
| Quantitative rigor | Published price anchors, with hypotheses separated from customer proof. No invented market size, revenue, buyer count or savings. Currency/tax/date/billing detail in live prose could be more consistent. |
| Pricing | Inferred solo-editor buyer; proposed $12/editor/month and an exact one-month offer. Supplied competitor anchors but omitted an explicit recommended range, a remaining acceptance gap. Restaurant $40–75/month range and $50 pilot were clearly hypotheses; service time/cost remains untested. |
| First users | Used family restaurant and two known editors; drafted a concrete invitation, interview questions and paid test. No actual contact, lead validation or acquisition result. Public prospect discovery was not retested in this narrow review. |
| Existing app | Read Reviewlane project context and went straight to pricing, with no re-onboarding. Backend tool exploration undermined convenience. |
| Personality | Generally direct, supportive and opinionated; no forced jokes. Restaurant/thesis answers remain somewhat formal and long. |
| Provisional truth / learning | Restaurant and editor notes persisted with known/inferred status and confidence. Contacts remained contacts, not validation. No-build direction retained in chat; reviewed thesis did not persist. |

### Question, coordination and timing audit

Founder-facing questions exclude question marks inside outreach/interview drafts.
Intent and firsthand context were already supplied in direction; pricing had a
specific request and inspectable app. Zero intent questions is appropriate here,
not evidence that fresh ambiguous ideas never need one.

| Flow/turn | Seconds | Intent Q | Q before research | Q before recommendation | Review Q | Web actions | Commands (failed) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Restaurant direction | 107.8 | 0 | 0 | 0 | 1 | 4 | 9 (2) |
| Existing-app pricing | 185.7 | 0 | 0 | 0 | 0 | 4 | 29 (3) |
| Two-editor follow-up | 23.0 | 0 | 0 | 0 | 0 | 0 | 2 (0) |
| Pricing no-build reply | 3.9 | 0 | 0 | 0 | 0 | 0 | 0 (0) |
| Saved thesis review | 53.6 | 0 | 0 | 0 | 1 | 2 | 6 (1) |
| Thesis no-build reply | 1.9 | 0 | 0 | 0 | 0 | 0 | 0 (0) |

Total: two founder confirmation questions; zero founder methodology-coordination
events. Raw question marks: 3/1/1/0/1/0. Web actions are harness events, not unique
queries/pages. Warm replies were fast; initial research/setup latency is unresolved.
No measured token-cost reduction is claimed.

### Independent price spot-check (retrieved 2026-10-04)

Official [Frame.io pricing](https://frame.io/pricing) shows Pro $15/member/month
plus tax and a free plan. [Wipster pricing](https://www.wipster.io/pricing) shows
Light $11.95/month and Team $25/user/month, alongside lower annual-billing figures
($9.95 and $19.95). These support the live monthly anchors; retain billing scope
when comparing. High confidence in displayed amounts, not in founder demand.

[ShelfCount](https://getshelfcount.com/) shows $50/month;
[Stockifi](https://www.stockifi.io/pricing) starts at EUR200/month with setup/size
qualification. Those amounts/periods match the restaurant output. Dollar currency
and regional applicability should not be silently assumed. Mise's $19.99 anchor
could not be independently retrieved by this reviewer and remains unverified.
The trader-flow prices were not independently rechecked here. Public prices are
substitute-spend anchors, not proof anyone will buy either synthetic product.

## Verification and global installation

- Focused first correction: **23/23**. Latest context-start regressions: **11/11**.
- Final supported Node 24.19.0 check: **333/333**, zero failures/skips, 151.8 s,
  at `0095123`; log `.m0-local/m3r5-phase2-final-check.log`. Later edits are docs only.
- Installer fixture install/check passed; global eight-file hash and generated
  runtime-locator checks passed. No customer stores or synced sources were changed.
- Actual-host six turns completed, but semantic acceptance is **BLOCKED** as above.
- Notes verified through readPrebuild: restaurant child context and pricing's
  `synthetic-context` both persisted. The harness only enumerated `crumb-contexts`,
  so pricing's empty notes list required this independent check; no false save
  claim was found in pricing. The pricing store reached version 2.

Global skill: `C:\Users\Ash\.agents\skills\crumb\SKILL.md`.
SHA256: `5195785fe7faf929266159bd1f26f2ab35d803b73c2b8f47a2b44fb2cbf7f1ec`.
Runtime locator points to pinned Node and `C:\Users\Ash\Documents\Codex\CEC\dist\src\cli\main.js`.
The global checkout remains tested candidate `0095123` on `m3-r5-phase1`;
untracked `GLOBAL_CRUMB_SETUP.md` is preserved. This is not a production acceptance.

## GitHub closeout

Development branch: `m3-r5-phase1`. Both tested code changes (`ba64c04`, `0095123`)
were committed and pushed. This report and active status documents form a separate
documentation closeout commit; its exact hash/push confirmation is in the final
delivery. No force push.

Main/resulting main: `f188f03f14b13a97d3f66879432a23fb392e4205`.
No M3-R5 merge commit, no main verification run and no main push: complete revision
acceptance has not passed. Existing main was preserved. No M4.
