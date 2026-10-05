# M3-R5 surgical release unblock — 5 October 2026

**Sol fix is ready for final Astra release check.** M3-R5 is not declared PASS;
final release judgment belongs to Astra. No main merge or M3-R6/M4 work.

## Root cause and exact layer

The leak was **assistant-generated commentary**, recorded as an `agentMessage`,
not host/UI invocation metadata. Fresh Astra Medium reproduction:

> I’m using the Crumb skill to work out a price from the app’s buyer, value, and available comparisons. This replay has web research disabled, so I’ll flag where stored pricing evidence limits the recommendation.

Its own persisted instruction trace contains the host's generic base instruction:

> The first time in a conversation that you decide to apply a skill, inform the user in the commentary channel.

Crumb's existing “You are Crumb”/“Never announce a skill” protection was supplied
as skill content. It did not resolve the higher instruction-layer conflict.
Sol Medium's four fresh baseline openings were clean; Astra reproduced the failure.
This was model-dependent compliance, not a UI false positive.

The narrow fix is `skill/crumb/host/codex.md`: a scoped developer-level exception
to generic skill announcements for Crumb founder workflows. It explicitly excludes
Crumb development and unrelated skills, preserves approval boundaries, and defers
all personality/product method to the existing SKILL.md. No persona rewrite.

`scripts/sync-global-skill.mjs` now installs/verifies nine files and uses the native
Codex config API to update only `developer_instructions`. The marked block replaces
only itself and preserves unrelated instructions/settings. Model/effort settings
were unchanged. This is the supported [developer instruction setting](https://learn.chatgpt.com/docs/config-file/config-reference).

The acceptance adapter previously replaced configured developer instructions with
its synthetic test boundary. It now reads the effective installed value and appends
that boundary. Capture mode verifies the guard is present in the actual native
developer message; normal native mode supplies no test developer override.

## Why deterministic tests missed it; protection now

The old R3 test checked identity wording/order inside SKILL.md. It did not assemble
host base/developer/skill instructions. The existing live detector correctly failed
both Astra runs; those historical failures remain intact.

New behavioral tests and release gates:

- Validate actual assistant events, including first commentary and later final/
  progress messages. Invocation UI/tool events are not mistaken for speech.
- Reject skill/workflow invocation narration, internal revision names and runtime
  file narration; require real assistant text for an opening. Record exact leaks.
- Test safe guard replacement, idempotence, preserved unrelated instructions and
  refusal of malformed/duplicate installation markers.
- Exercise the same composition function used by the adapter; preserve the installed
  guard in the developer payload. Refuse missing/stale effective installation.
- Native capture checks the real assembled developer message. `--baseline` exists
  only for explicit failure reproduction; it is not used for passing acceptance.

## Before/after and fresh acceptance

Fresh failure: `.m0-local/closeout-host-1791192215499/results.json`, Astra Medium,
exit 1. Fresh after-patch control: `.m0-local/closeout-host-1791192804881/results.json`,
same model/scenario, exit 0, zero leaks. Exact first assistant message afterward:

> I’ll look at who the app serves and what it replaces, then put a concrete price and first offer on it.

The trace retains the generic announcement instruction AND includes the installed
exception in a developer message. The canonical skill's identity prefix was not
changed to manufacture this result.

Four fresh Sol Medium sessions completed normally, `.m0-local/closeout-host-1791192819521/results.json`:

| Founder request | Exact first assistant message | Result |
|---|---|---|
| Casual start | Two ideas can make the starting line surprisingly crowded. Let’s get them side by side before picking where to spend your time. | Zero leakage |
| New bike-shop business | Six finished bikes taking up workshop space is a concrete place to start. I’ll check what shops already use for pickup reminders and prepare a small Saturday test to learn whether this pain extends beyond your brother’s shop. | Zero leakage |
| Existing-project pricing | I’ll look at who the app serves and what it replaces, then put a concrete price and first offer on it. | Zero leakage |
| First users | Your friend’s empty slots give us a concrete starting point. The key question is whether other groomers lose enough revenue—and can reach suitable customers quickly enough—to pay for help filling them. I’ll check local starting points and the tools they already buy. | Zero leakage |

All **20 turns** completed, zero assistant identity leaks and failed commands.
The bike-shop conversation continued **12 turns with `$crumb` only on turn 1**.
Voice, useful pushback, situational wit, direction, uncertainty, one clear next state,
and existing-format export requests persisted. The first-user flow still produced
three direct public routes, outreach and four past-behavior questions automatically.
No external contact, build, deployment or payment occurred.

## Cheap warning fixes and efficiency

- Pricing now preserves price/billing/promotion terms until material new evidence
  warrants an explained change. Live three-turn regression kept C$9/month, no free
  first month, after two untried prospects were mentioned. Both follow-ups used
  zero tools (11.8 s and 5.9 s). Range C$8–12, comparators, exact offer and uncertainty
  remained explicit. No pricing architecture changed.
- Progress guidance now requests incremental findings rather than full repeated
  thesis/offer/project summaries. Pricing progress did not restate the whole offer;
  ordinary follow-ups had no tool-driven progress filler. Some short finding/win
  reactions still repeat between progress and final; Astra should judge that taste.
- Pricing research took **129.8 s**, seven commands, six queries and one locator
  read, no Core discovery or duplicate exact query. This remains a latency warning.
  The broader first-user flow took 159.7 s. No evidence was sacrificed for speed.
- A clear redundant locator read appeared in two startup flows: local-tools.md had
  its own “read once” instruction after SKILL.md had already loaded the locator.
  That reference now explicitly reuses the conversation's loaded paths/contracts.
  Final fresh pricing verified one locator read, five commands/five searches,
  zero rediscovery and unchanged CAD9 offer across all three turns.
- Normal no-tool follow-ups stayed around 6–15 seconds; saved updates took about
  30–54 seconds. One fee question legitimately researched a legal evidence gap.
  Follow-ups never reread Crumb's skill/references/locator or rediscovered Core.

## Verification and global candidate

- Identity/runtime tests: 7/7; identity/runtime/market checks: 15/15.
- Act, IDE, UX, personality and relevant R5 suites: **106/106**, 115.8 s, exit 0.
- Full suite: **342/342**, no failures/skips, **148.9 s**, exit 0;
  `.m0-local/m3r5-identity-final-check.log`. Original 339 plus three behavioral tests.
- Final native acceptance: `.m0-local/closeout-host-1791193859794/results.json`
  and `1791193997735`, configured **Luna Low**, no test developer override,
  actual assembled developer guard checked, zero identity leakage, exit 0.
- Final fresh pricing: `.m0-local/closeout-host-1791193869577/results.json`,
  **Sol Medium**, three turns, zero leaks/failures, one startup locator read,
  **129.6 s** research; **12.0 s** and **5.4 s** no-tool follow-ups. Price/offer,
  range, comparator currency limits and next state remained clear. No fake speed win.
- Implementation commits: `d3f687a` and `ed1ad12`, both pushed to `m3-r5-phase1`.
- Global source: `C:\Users\Ash\Documents\Codex\CEC`; installed skill:
  `C:\Users\Ash\.agents\skills\crumb`, synchronized at `ed1ad12`.
- SKILL SHA256: `db563b0abc5cbf43ee8862654fd6cecf3f9757562040c94ccfff698c35b36231`.
- Host guard SHA256: `9de2e3a663886c1e7f953894b0359157acf6326ff6dfd6f9aef20e8196a269e0`.
- Main stays at `f188f03`; no merge/push. Unrelated global setup file preserved.

Remaining warnings: public-research latency, some repeated short progress reactions,
host-driven working-note writes (not every in-chat learning turn writes durable notes),
and synthetic founder evidence. Native Luna Low repeated the same question in
commentary and final messages with distinct event IDs: genuine assistant duplication,
not UI metadata. It remains visible in the transcript; no detector/deduplication
change conceals it. Selected Sol Medium flows retain the improved conversation.
Custom Codex clients that replace developer
instructions must retain the installed guard. No universal claim is made for
unimplemented ChatGPT/Claude/Cursor adapters. Final personality/release acceptance
still belongs to Astra.

Full exact visible messages are in M3_R5_IDENTITY_UNBLOCK_TRANSCRIPTS.md. The
documentation closeout advances the dev/global checkout tip without changing
the installed skill or guard hashes above. Final assistant closeout reports that
commit and verified push. No main release has been shipped.
