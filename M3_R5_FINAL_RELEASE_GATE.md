# M3-R5 final Astra release gate — 5 October 2026

**PASS WITH WARNINGS.** GPT-6 Astra Medium live acceptance of the globally
installed candidate at `23a8582`. No product/personality correction was necessary.
Only a fresh four-turn founder scenario and release evidence were added.

## Identity

Sol traced actual assistant commentary to the host's generic skill-announcement
instruction conflicting with lower-level Crumb skill content. The scoped native
developer exception in `skill/crumb/host/codex.md` resolves that conflict and
retains safety boundaries. This gate inspected actual `agentMessage` commentary
and final answers, not invocation UI/tool metadata. The native assembled developer
message contains the installed exception.

Five completed fresh Astra sessions have zero identity narration:

- Casual: “Let’s make the choice smaller: which idea deserves the first test?
  We don’t need to pick your forever business today.”
- Founder: “Put the first effort into finding which first-visit surprises actually
  erase the profit—and whether they belong in the recurring price or a separate
  first-clean charge. Your sister’s spreadsheet gives us a concrete place to start.
  I’ll check local pricing and routes to other independent cleaners before
  recommending a small paid test.”
- Pricing: “I’ll look at what the app does, who gets value from it, and what they
  already pay for alternatives. That should give us a price worth testing.”
- Export: “Last month’s records give us something concrete to judge. I’ll check
  what the app already captures so we can measure how often jobs run over and
  what those overruns cost.”
- Thesis: “I’ll pick up the business thesis and check what the evidence supports,
  where we’re still making assumptions, and which risks deserve your review.”

Completed evidence: 13 turns across casual (1), founder (4), pricing (3),
export (3), thesis (2). Exact assistant messages, including progress, appear in
M3_R5_FINAL_RELEASE_TRANSCRIPTS.md.

## Regression judgment

- **Founder flow:** fresh Hamilton residential-cleaner scenario. Crumb investigated
  first-clean versus recurring underquoting, used five bounded queries, surfaced
  relevant current prices, challenged premature full operations-assistant scope,
  and chose the existing spreadsheet as the next useful evidence. Warm, opinionated,
  conversational; humor remained optional. Concise follow-ups retained direction.
- **First users:** plain-language problem, solo fixed-price cleaner hypothesis,
  lost labour margin, three public Hamilton business routes with direct links,
  usable invitation and four past-behavior questions. Solo status/pain/interest
  explicitly unverified; research discussion was not treated as permission to
  promote. Founder did not need to ask where users were.
- **Pricing:** no re-onboarding. Opened current My Music Staff/Duet evidence,
  explicit conflicting prices/currency limitations, per-teacher model,
  C$9–15 recommended range, C$12/month exact paid offer, no introductory discount.
  Both follow-ups retained that offer and explained what behavior would change it.
- **Manual work:** offered existing-format export immediately, allowed missing
  columns/times, no manual reconstruction. Actual three-row CSV analysis correctly
  calculated 2/3 overruns, 2 excess hours, 50 extra labour cost, contribution falling
  from 225 to 175 (22.2%), and margin from 50% to 38.9%. No invented integration.
- **Thesis/Act:** displayed text exactly matched recorded presentation. “Looks good,
  don't build yet” produced four matching reviewed receipts (intention, user,
  problem, evaluation); Act remained unconfirmed. No build or external send.

## Verification and latency

- Focused identity/runtime: **7/7**, exit 0.
- Development full suite: **342/342**, zero failures/skips, exit 0, 152.2 seconds.
  `.m0-local/final-astra-dev-full.log`.
- Live founder/pricing/export: `closeout-host-1791194918317`, completed, zero leaks,
  zero failed commands. Founder research 108.3 seconds; pricing 116.2 seconds.
  No repeated Crumb skill/locator/capability discovery or duplicate query batch.
- Ordinary no-tool follow-ups: 6.9–9.2 seconds. Pricing's saved follow-up took
  30.2 seconds. Export analysis took 64.2 seconds; its two additional SKILL reads
  were the separate spreadsheet skill (full read then range), not Crumb rediscovery.
- Thesis retest: `closeout-host-1791195075765`, completed, zero leaks/failures;
  presentation 65.9 seconds, receipt confirmation 30.8 seconds.
- Casual: completed in `closeout-host-1791194837649`. That run's subsequent offline
  thesis turn timed out at 180 seconds after recording a presentation, before
  displaying it. It also searched for absent session fields and repeated scoped
  context/research retrieval. Its first commentary disclosed the synthetic replay's
  disabled-web boundary. This interrupted attempt is retained, not counted as a
  passing session. One retest under the existing normal live 300-second limit
  completed in 65.9 seconds without those redundant calls; no product change or
  weakened identity gate. Timeout/reliability remains a warning.

## Authorized release closeout

The final user request authorizes dev commit/push, main merge, final main checks,
main push/remote verification, and exact-main global sync after this decision.
The main check log is `.m0-local/final-astra-main-full.log`; final assistant
closeout records the resulting commits and verification. No M3-R6/M4 work.

Global target: `C:\Users\Ash\.agents\skills\crumb`.
Runtime source checkout: `C:\Users\Ash\Documents\Codex\CEC`.
Expected SKILL SHA256:
`db563b0abc5cbf43ee8862654fd6cecf3f9757562040c94ccfff698c35b36231`.
Expected host guard SHA256:
`9de2e3a663886c1e7f953894b0359157acf6326ff6dfd6f9aef20e8196a269e0`.
Installer verifies all nine source files, generated runtime locator and effective
native developer guard; source checkout/build must match shipped main.

Remaining warnings: synthetic founder testing; roughly two-minute research;
one interrupted offline thesis attempt; occasional progress/final repetition;
previous native Luna Low question duplication; host-driven working-note persistence.
The identity guarantee depends on the supported installed Codex developer bridge;
custom clients replacing developer instructions must preserve it. No unsupported
adapter claim. These do not overturn the proven release behavior above.
