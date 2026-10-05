# ASTRA REVIEW PACKET — M3-R5 release unblock

**Implementation ready for final Astra review; release remains pending Astra.**
5 October 2026. Development branch `m3-r5-phase1`; no main merge is authorized
in this pass. M3-R5 remains pending final Astra product/personality review. No M4.

## Previous blockers and implementation

1. **Thesis review persistence.** Core now requires `displayedText` for bundled
   confirmation and compares it with the recorded presentation, allowing only
   whitespace/NFC changes. Material rewriting is rejected, changed foundations
   invalidate review, and Evaluation still needs full coverage. Thesis CLI replies
   now return one presentation and compact receipts rather than a competing old
   conversation summary. The installed skill calls confirmation in the actual
   assent turn before acknowledging saved review. Core cannot independently
   authenticate a host transcript; the live audit compares text and receipts.
   A live correction exposed dossier-reconstruction failures. The targeted
   `revise-foundation` transition now retains the founder quote/source, updates
   the provisional statement, invalidates downstream review and refuses changes
   after approved Act. Working-note-only edits do not replace a recorded thesis.
2. **Runtime discovery.** The installed locator contains pinned paths and common
   request contracts. New `--input-file` accepts bounded UTF-8 JSON, removing
   Windows pipeline workarounds and preserving literal dollars/quotes. The host
   retains target/version/presentation/hashes, uses unchanged Project Snapshot
   content, skips optional planners for obvious moves, and reuses references.
   No custom cache, router, dependency or parallel workflow was introduced.
   The targeted repair also exposes allowed working-fact keys, 320-character
   value/240-character source limits and required target creation. JSON file edits
   avoid shell interpolation; fresh reversible work uses compact notes rather
   than attempting to build a full evidence dossier.
3. **Pricing range.** Canonical policy separately requires observed market anchors,
   our recommended range, billing model/buyer, exact first test offer and the
   evidence that would change the recommendation. Recommended ranges remain
   hypotheses when payment evidence is absent.

## Latest alpha activation and response contract

The existing First User Engine now activates whenever customer evidence is the
bottleneck, including before formal foundation confirmation. The skill completes
a compact pack with problem/user/pain, research versus acquisition habitats,
direct URLs, a feasible 3–10 public starting set, draft invitation and 3–5
past-behavior questions. Inaccessible or restricted routes are not leads; fewer
verified matches are preferable to invented names. External sends stay gated.

Substantial replies lead with a recommendation and use whitespace, 2–4 reasons
and decision-useful evidence. The close is one clear state: reversible work done
or proceeding, one founder-only input, or consequential approval. No forced card
template or routine next-step question. Private-data analysis tries existing
context/files and actual supported connections before requesting the smallest
export once; manual reconstruction is the final fallback.

Personality remains canonical in `skill/crumb/SKILL.md` (the coworker paragraph).
`references/modes.md` now points there rather than imposing a question on every
reply. No `No hype` or formal-language override was found in the active skill
references. Research follows this same voice. Humor/memorability/taste are left
for Astra; this pass adds no joke catalog.

## Runtime/model capability and verification

The installed app-server lists GPT-6.1 Sol and GPT-5.6 Sol. The acceptance harness
selects GPT-6.1 Sol with Medium effort. That is per-thread host selection; Core
stays offline with no automatic model routing, API integration or agent engine.
Mechanical work uses existing local tooling. No dynamic router was built.

Focused thesis/runtime/R3/R4 checks: **23/23**. IDE/Act/conversation regressions:
**78/78**. Final CLI/runtime path checks: **4/4**. Final supported Node 24.19.0
full suite after the corrective transition: **339/339**, no failures/skips,
**153.1 s**, log `.m0-local/m3r5-unblock-correction-final-check.log`. The final
focused run **11/11** additionally verifies approved-Act refusal and the locator
contracts. Earlier 337/338-test runs are historical. Later runtime guidance and
fixture-arrival changes did not change Core; installer checks/focused tests passed.

Code commits `ab98b8b` and `e769acf` were pushed to origin. The global installation
was built and verified at `e769acf`, eight source files and locator in sync. Global
skill: `C:\Users\Ash\.agents\skills\crumb\SKILL.md`; checkout:
`C:\Users\Ash\Documents\Codex\CEC`. Untracked GLOBAL_CRUMB_SETUP.md preserved.

## Installed-host acceptance

Initial implementation transcript:
`.m0-local/closeout-host-1791178947904/results.json` (14 completed turns, exposed
correction/note-save failures that prompted the single targeted repair).
Final repair transcript, semantic audit completed:
`.m0-local/closeout-host-1791179789828/results.json`. Synthetic projects and
founder statements; public research uses real host tools. All ten read-only MCP
tools exercised. No messages sent, product code built, spending or deployment.

All **14 final live turns completed**. Zero failed commands, Core source discovery
or visible skill-identity leaks. A literal substring check confirms the shown
thesis matches the recorded presentation; all four review receipts retain that
same text and founder quote. The weekend-only user correction persisted and left
only intention confirmed, reviewBasis null and Act unapproved. Tests also cover
incomplete Evaluation, stale replies, material replacement and approved-Act refusal.

Pricing returned **US$12–19/editor/month**, an exact **US$15/30-day offer**, free
client viewers and payment/repeat-use/renewal criteria for another price test.
Observed Frame.io/Filestage plans were cited with different billing scopes and
explicit toggle/checkout uncertainty, rather than treating enterprise spend as
proof of solo-editor value. Sources were opened by the live host on October 5;
this review did not separately reverify every vendor page. No customer validation
or real willingness to pay was claimed. Pricing notes and two-editor access/new
deadline pain persisted, with no repeated onboarding.

First User Pack: next-day cancellation recovery for Ottawa paper-waitlist
groomers; strongest pain and evenings constraint; a linked groomer discussion for
research; **three public starting points with direct routes**:
[Dogging It](https://doggingit.ca/),
[Chapel Hill Grooming](https://chapelhillgrooming.com/),
[Riverside South](https://riversidesouthpetshop.setmore.com/).
The host inspected public pages, prepared an invitation/four past-behavior
questions, and retained limits: paper-list use, pain and interest were unknown.
Public inquiry routes were not permission to send or promote. After a reported
owner already filled slots by text, Crumb parked the recovery price, changed the
next investigation to acceptance tracking and saved the learning. No automatic pivot.

Private-data fallback: no scheduling connector was supplied or exercised; the
configured Crumb MCP exposes context only. Crumb requested one small anonymized completed-job export, not
manual historical totals. Once supplied, it read/calculated the synthetic sample:
9 quoted vs 11 actual hours, extra labor cost 50, revenue 450, amount remaining
after labor 175 vs expected 225. Currency and hour-cost basis were qualified;
three synthetic jobs did not become demand evidence. Analysis and next move saved.
Use temporary untracked request files; never include those private payloads in Git.

### BEFORE / AFTER efficiency

Tool events below mean commands, read-only MCP, file edits and web events;
reasoning/user messages are excluded. Web events can bundle queries/pages.

| Comparable case | Before seconds / tool events | After seconds / tool events | Commands before → after | Queries before → after | Reference reads before → after |
| --- | --- | --- | --- | --- | --- |
| Existing-app pricing (Phase 2 → final) | 185.7 / 33 | 122.7 / 14 | 29 → 7 | 6 → 5 | 4 → 2 |
| Display saved thesis (Phase 2 → final) | 53.6 / 21 | 68.0 / 6 | 6 → 4 | 4 → 0 | 4 → 0 |
| Founder correction (first attempt → repaired) | 106.0 / 7 | 20.1 / 2 | 7 → 1 | 0 → 0 | 0 → 0 |
| First User Pack (first attempt → repaired) | 193.1 / 14 | 123.4 / 12 | 10 → 6 | 3 → 3 | 2 → 2 |

The Phase 2 restaurant direction baseline was 107.8 s; Ottawa grooming is a
different task with prospect discovery and is not a like-for-like speed comparison.
Before models were configured defaults; final uses explicit Sol Medium, so timings
do not isolate code changes from model/source variability. Reduced commands and
eliminated discovery failures are observed, not a measured token-cost saving.

Every final follow-up had zero stable skill/reference/runtime rereads and zero
web queries. Startup reads remained bounded: one skill read per session, zero to
two references. Groomer startup read runtime.json twice—one redundant read remains.
The locator is host-reused knowledge, not a persistent model cache or capability
enforcement layer. Necessary note writes were retained rather than skipped to
manufacture faster timing.

### Response UX and momentum audit

Fourteen answers reviewed; **12 substantive answers**, excluding the two short
review acknowledgements/correction statements, satisfy the requested ten-answer
minimum. Words below are approximate final-answer whitespace counts. The thesis
is the main presentation warning; other substantial answers had useful hierarchy,
whitespace, numbers/links when relevant and a visible next state. No rigid cards.

| Final turn | Words | Seconds | Commands / queries | UX / momentum observation |
| --- | ---: | ---: | --- | --- |
| Thesis 1 | 424 | 68.0 | 4 / 0 | Exact material shown; review requested. Too verbose/flat: Astra polish. |
| Thesis 2 | 46 | 30.7 | 1 / 0 | Saved review clear; no build. Short state update. |
| Thesis 3 | 42 | 20.1 | 1 / 0 | Provisional correction/invalidation clear. Short state update. |
| Pricing 1 | 366 | 122.7 | 7 / 5 | Recommendation, range/model, offer, links and change evidence obvious. |
| Pricing 2 | 174 | 34.6 | 1 / 0 | Invitation/questions prepared; uses the two known contacts. |
| Pricing 3 | 166 | 10.9 | 0 / 0 | Price-change criteria; holds a consistent first offer. |
| Pricing 4 | 178 | 34.0 | 1 / 0 | Sharper deadline hypothesis and next learning step; saves it. |
| Users 1 | 455 | 123.4 | 6 / 3 | Reachable three-point pack; clear recommendation. Long but scannable. |
| Users 2 | 192 | 16.2 | 0 / 0 | Three tailored invitations ready; URLs reused. |
| Users 3 | 93 | 7.6 | 0 / 0 | Short invitation plus what answers would teach us. |
| Users 4 | 140 | 57.9 | 2 / 0 | Parks the offer and investigates acceptance tracking; learning saved. |
| Export 1 | 116 | 65.9 | 7 / 0 | One visibly separated artifact request; no manual totals. |
| Export 2 | 151 | 50.1 | 3 / 0 | Compact calculation/table; assumptions and next step clear. |
| Export 3 | 119 | 7.8 | 0 / 0 | Recurring avoidable cost is the next business test; no build. |

Founder input audit: **zero intention questions**, since intent/constraints or an
existing-app decision were provided; **zero questions before research or the first
recommendation** in pricing/users; **one thesis-review question** and **one request
for a private export**. Draft invitation/interview questions are not founder intake.
No founder had to ask for research, sources, direct links, channel choice or drafts.
The harness contains one explicit next-business-step probe (export turn 3); turn 2
already gave a next step, so it is not evidence of necessary founder coordination.
Other follow-ups supplied private access, new learning, a wording preference or
asked how evidence changes a decision. No startup-methodology knowledge required.

## Remaining Astra judgments

- Calibrate the exact thesis presentation (including repeated fixture counterevidence
  and double punctuation) without losing material risks or binding review to unseen text.
  Its verbatim-render contract now works; that does not make its prose ideal.
- Decide whether 366–455-word research/First User Pack answers should reveal more
  detail progressively. Final voice remains opinionated/supportive, without a
  new joke/personality system; memorability and humor need Astra's taste review.
- Initial research still takes about two minutes; meaningful state updates can take
  30–58 s. One startup locator reread remains. Tool efficiency improved but not all
  turn latencies decreased. No token totals or cost improvement were measured.
- Live proof is synthetic and bounded. Real founder psychology, actual interviews,
  platform participation permissions, willingness to pay and the causal benefit
  of likely_next_need alone are unproven. Anticipatory offers/drafts are observed.
  The export fallback was exercised; a connected scheduling-data path was not.
- The host must truthfully supply displayedText/source turns. Core verifies matching
  material and structural provenance, not independent authentication of a human transcript.

## Git and installation closeout

Development branch: `m3-r5-phase1`. Implementation revision commit:
`e769acf57683ffd091ef28c4e96c3b8cb757d76f`; both code commits pushed. This packet and
active documents receive a separate documentation commit; exact hash/remote push
verification is in the final delivery. Global installed skill SHA256:
`580f4cebc4f557b83963d311c62413b7cdef0019ad99505605b8879a33aeb8e6`.

Main remains `f188f03f14b13a97d3f66879432a23fb392e4205`. No merge, main test run or main
push in this phase. Final revision/product acceptance belongs to Astra; this is
an implementation handoff, not an M3-R5 release PASS. No M4.
