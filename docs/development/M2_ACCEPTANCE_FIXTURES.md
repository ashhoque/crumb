# M2 acceptance fixture evidence

All founder decisions below are synthetic. Files and subprocess results are real. The fixed stage instructions point only at available work. Each stage stops before a synthetic founder review permits another.

## fresh

**Confirmed intention:** Build a profitable solo business for reachable small firms, with founder-led sales and onboarding that fit around a day job.

**Confirmed user:** Owners of three-to-five-person bookkeeping firms who coordinate monthly client work and make the buying decision.

**Confirmed problem:** During monthly close, firm owners struggle to identify jobs that can proceed because document and status updates are scattered across email and staff conversations, delaying assignments despite repeated reminders.

**Reviewed evaluation:** The fictional findings give us a narrower question to discuss with users. They do not establish demand.

**Explicit Act reply:** Yes — move to Act

IDE context hash before/after: 2d086532d9fb66bdadeb382d3b0033de2570156a7fe1be0027f048531d10eb7e; unchanged.

**One journey:** Read the supplied client document lists and see which jobs can proceed

**Learning question:** Does this remove repeated readiness checks?

**KEEP:** No pre-existing customer code; retain the selected runtime.

**TEST / built:** Identify ready and waiting jobs

**PARK / excluded:** Automatic reminders; Accounts; Dashboard; Analytics platform; External integrations; Database persistence

**Capability traceability:**

- Identify ready and waiting jobs: See whether a bookkeeping owner can identify work that can proceed. Evaluated claim(s): scenario-learning; current user/problem basis hashes retained.

**Changed customer/stage files:** ENVIRONMENT.md, INPUT_NOTES.md, ready.py, test_ready.py, example.json

**Generated pack files:** STARTUP_MASTER.md, BUILD_PLAN.md, GROUNDWORK.md, STAGE_1.md, STAGE_2.md, STAGE_3.md

**Preserved:** No existing source files.

**Metadata:** .gitignore (private workspace exclusion); .customer-evidence/cec.sqlite (synthetic IDE and Act journal)

**Actual commands and output:**

```powershell
& 'C:/Python311/python.exe' '--version'
```

Exit 0.

```text
Python 3.11.4
```

```powershell
& 'C:/Python311/python.exe' '-c' 'import json; assert json.loads(''[1]'') == [1]; print(''JSON input works without external packages'')'
```

Exit 0.

```text
JSON input works without external packages
```

```powershell
& 'C:/Python311/python.exe' '-m' 'unittest' '-v' 'test_ready.py'
```

Exit 0.

```text
test_complete_cli_journey (test_ready.ReadinessTests.test_complete_cli_journey) ... ok
test_duplicate_clients_rejected (test_ready.ReadinessTests.test_duplicate_clients_rejected) ... ok
test_invalid_cli_input_has_useful_failure (test_ready.ReadinessTests.test_invalid_cli_input_has_useful_failure) ... ok
test_no_false_readiness_from_missing_requirements (test_ready.ReadinessTests.test_no_false_readiness_from_missing_requirements) ... ok

----------------------------------------------------------------------
Ran 4 tests in 0.090s

OK
```

**Failures:** None.

**Warnings:** Founder replies/approvals are authored synthetic inputs; this does not prove unscripted model behavior. Passing technical checks is not customer validation.

**Correct stop:** groundwork -> risk -> mvp. Each completed stage blocked another handoff. 2 synthetic founder continuation(s). Final awaiting_review; no release, validation or M3.

**Displayed Act summaries:**

Executive summary
We're building for Owners of three-to-five-person bookkeeping firms who coordinate monthly client work and make the buying decision..
The pain we're addressing: During monthly close, firm owners struggle to identify jobs that can proceed because document and status updates are scattered across email and staff conversations, delaying assignments despite repeated reminders.
One workflow: Read the supplied client document lists and see which jobs can proceed.
The first version needs to help us learn: Does this remove repeated readiness checks?

Building
- Identify ready and waiting jobs

Parking
- Automatic reminders
- Accounts

First build stage: Groundwork: inspect the environment. Verify the actual runtime and commands without replacing existing setup.

These capabilities test the core pain. Extra features would add work without answering that question.

Approve build | Adjust scope | View build plan
The extra detail is optional — you can continue without reading it.

Executive summary
Groundwork: inspect the environment: awaiting review. 1 checks passed, 0 failed, 0 not run.
Technical results do not establish customer validation.

Try this stage using the recorded run instructions. Your review is needed before the next stage.

& 'C:/Python311/python.exe' '--version'

View build plan | View technical results
The extra detail is optional — you can continue without reading it.

Executive summary
M0: resolve the file input risk: awaiting review. 1 checks passed, 0 failed, 0 not run.
Technical results do not establish customer validation.

Try this stage using the recorded run instructions. Your review is needed before the next stage.

& 'C:/Python311/python.exe' '-c' 'import json; assert json.loads(''[1]'') == [1]; print(''JSON input works without external packages'')'

View build plan | View technical results
The extra detail is optional — you can continue without reading it.

Executive summary
M1: complete client readiness: awaiting review. 1 checks passed, 0 failed, 0 not run.
Technical results do not establish customer validation.

Try this stage using the recorded run instructions. We have reached the planned stopping point.

& 'C:/Python311/python.exe' 'ready.py' 'example.json'

View build plan | View technical results
The extra detail is optional — you can continue without reading it.

## existing

**Confirmed intention:** For myself first; perhaps a business later.

**Confirmed user:** Self-directed investor comparing a shortlist.

**Confirmed problem:** For myself first, maybe sell later. I compare shortlisted stocks most weekends; criteria shift and I forget why I preferred one.

**Reviewed evaluation:** Personal rationale continuity is worth understanding; a differentiated commercial opportunity is not established.

**Explicit Act reply:** Yes — move to Act

IDE context hash before/after: 7ea92bd075a193c38a13e29f3a8b280d8782d090457b892166b64dbcc4e7c1f6; unchanged.

**One journey:** Read a local shortlist, compare the supplied facts, save one review note

**Learning question:** Does one comparison reduce repeated checking?

**KEEP:** Existing JSON parser (parser.mjs)

**TEST / built:** Compare supplied facts; Save one review note

**PARK / excluded:** Live market data; Ranking or return predictions; Accounts; Portfolio analytics; Team features; Existing dashboard (preserved, not expanded)

**Capability traceability:**

- Compare supplied facts: Learn whether this removes repeated comparison work; not investment advice or a demand claim. Evaluated claim(s): founder-context; current user/problem basis hashes retained.
- Save one review note: Learn whether this removes repeated comparison work; not investment advice or a demand claim. Evaluated claim(s): founder-context; current user/problem basis hashes retained.

**Changed customer/stage files:** compare.mjs, compare.test.mjs, example.json

**Generated pack files:** STARTUP_MASTER.md, BUILD_PLAN.md, GROUNDWORK.md, STAGE_1.md

**Preserved:** parser.mjs, dashboard.mjs

**Metadata:** .gitignore (private workspace exclusion); .customer-evidence/cec.sqlite (synthetic IDE and Act journal)

**Actual commands and output:**

```powershell
& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '--test' '--test-reporter=tap' 'compare.test.mjs'
```

Exit 1.

```text
TAP version 13
# Subtest: a supplied shortlist produces an actual persisted comparison and note
not ok 1 - a supplied shortlist produces an actual persisted comparison and note
  ---
  duration_ms: 94.8125
  type: 'test'
  location: 'C:\\Users\\Ash\\Documents\\Codex\\2026-09-23\\you-are-continuing-development-of-my\\work\\m2-acceptance-fixtures-1790464922176\\existing\\compare.test.mjs:11:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    0 !== 2
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 2
  actual: 0
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///C:/Users/Ash/Documents/Codex/2026-09-23/you-are-continuing-development-of-my/work/m2-acceptance-fixtures-1790464922176/existing/compare.test.mjs:14:61)
    Test.runInAsyncScope (node:async_hooks:227:14)
    Test.run (node:internal/test_runner/test:1382:25)
    Test.start (node:internal/test_runner/test:1242:17)
    startSubtestAfterBootstrap (node:internal/test_runner/harness:387:17)
  ...
# Subtest: invalid input produces a useful error and no persisted result
ok 2 - invalid input produces a useful error and no persisted result
  ---
  duration_ms: 96.9093
  type: 'test'
  ...
# Subtest: existing reviews and source files are preserved
ok 3 - existing reviews and source files are preserved
  ---
  duration_ms: 191.2171
  type: 'test'
  ...
# Subtest: missing dimensions and duplicate symbols are rejected; input stays unchanged
ok 4 - missing dimensions and duplicate symbols are rejected; input stays unchanged
  ---
  duration_ms: 0.8476
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 3
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 484.1356
```

```powershell
& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '--test' '--test-reporter=tap' 'compare.test.mjs'
```

Exit 0.

```text
TAP version 13
# Subtest: a supplied shortlist produces an actual persisted comparison and note
ok 1 - a supplied shortlist produces an actual persisted comparison and note
  ---
  duration_ms: 95.4221
  type: 'test'
  ...
# Subtest: invalid input produces a useful error and no persisted result
ok 2 - invalid input produces a useful error and no persisted result
  ---
  duration_ms: 84.9482
  type: 'test'
  ...
# Subtest: existing reviews and source files are preserved
ok 3 - existing reviews and source files are preserved
  ---
  duration_ms: 173.2892
  type: 'test'
  ...
# Subtest: missing dimensions and duplicate symbols are rejected; input stays unchanged
ok 4 - missing dimensions and duplicate symbols are rejected; input stays unchanged
  ---
  duration_ms: 0.6887
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 458.1396
```

**Failures:** An intentionally broken comparison dropped candidates: the actual test failed, a partial receipt was saved, then the fixture was repaired and all four tests passed.

**Warnings:** Founder replies/approvals are authored synthetic inputs; this does not prove unscripted model behavior. Passing technical checks is not customer validation.

**Correct stop:** mvp. Each completed stage blocked another handoff. 0 synthetic founder continuation(s). Final awaiting_review; no release, validation or M3.

**Displayed Act summaries:**

Executive summary
We're building for Self-directed investor comparing a shortlist..
The pain we're addressing: For myself first, maybe sell later. I compare shortlisted stocks most weekends; criteria shift and I forget why I preferred one.
One workflow: Read a local shortlist, compare the supplied facts, save one review note.
The first version needs to help us learn: Does one comparison reduce repeated checking?

Building
- Compare supplied facts
- Save one review note

Parking
- Existing dashboard

First build stage: M1: complete the comparison. Produce one real end-to-end comparison and saved note with useful failures.

These capabilities test the core pain. Extra features would add work without answering that question.

Approve build | Adjust scope | View build plan
The extra detail is optional — you can continue without reading it.

Executive summary
M1: complete the comparison: awaiting review. 1 checks passed, 0 failed, 0 not run.
Technical results do not establish customer validation.

Try this stage using the recorded run instructions. We have reached the planned stopping point.

& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'compare.mjs' 'example.json' 'review.json'

View build plan | View technical results
The extra detail is optional — you can continue without reading it.

## stock

**Confirmed intention:** Build a paid decision-support business for active US swing traders, small enough for a solo technical founder to run with limited support time.

**Confirmed user:** US self-directed swing traders who already screen momentum/growth stocks, maintain a shortlist, and compare candidates during scheduled evening or weekend reviews.

**Confirmed problem:** During a shortlist review, these traders struggle to compare plausible candidates consistently because technical, sector, fundamental and catalyst notes are scattered. They repeat the synthesis and lose track of their reasoning, using charts, research pages and spreadsheets today.

**Reviewed evaluation:** The refined problem is worth discussing with qualified traders. Public evidence supports related behavior, while paid demand and incremental value remain unproven.

**Explicit Act reply:** Yes — move to Act

IDE context hash before/after: 6a0b9abd7ca4922eada417a1bdeae4be9c99809369141b2c20ca97339a69ef8f; unchanged.

**One journey:** Read a local shortlist, compare the supplied facts, save one review note

**Learning question:** Does one comparison reduce repeated checking?

**KEEP:** No pre-existing customer code; retain the selected runtime.

**TEST / built:** Compare supplied facts; Save one review note

**PARK / excluded:** Live market data; Ranking or return predictions; Accounts; Portfolio analytics; Team features; Portfolio dashboard

**Capability traceability:**

- Compare supplied facts: Learn whether this removes repeated comparison work; not investment advice or a demand claim. Evaluated claim(s): comparison-hypothesis; current user/problem basis hashes retained.
- Save one review note: Learn whether this removes repeated comparison work; not investment advice or a demand claim. Evaluated claim(s): comparison-hypothesis; current user/problem basis hashes retained.

**Changed customer/stage files:** INPUT_NOTES.md, compare.mjs, compare.test.mjs, example.json

**Generated pack files:** STARTUP_MASTER.md, BUILD_PLAN.md, GROUNDWORK.md, STAGE_1.md, STAGE_2.md

**Preserved:** No existing source files.

**Metadata:** .gitignore (private workspace exclusion); .customer-evidence/cec.sqlite (synthetic IDE and Act journal)

**Actual commands and output:**

```powershell
& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '--input-type=module' '-e' 'import assert from ''node:assert/strict''; const data=JSON.parse("{\n  \"candidates\": [\n    {\n      \"symbol\": \"AAA\",\n      \"asOf\": \"Synthetic observation, not market data\",\n      \"technical\": \"Supplied trend note\",\n      \"sector\": \"Unknown\",\n      \"fundamental\": \"Supplied business note\",\n      \"catalyst\": \"Unknown\"\n    },\n    {\n      \"symbol\": \"BBB\",\n      \"asOf\": \"Synthetic observation, not market data\",\n      \"technical\": \"Supplied trend note\",\n      \"sector\": \"Unknown\",\n      \"fundamental\": \"Supplied business note\",\n      \"catalyst\": \"Unknown\"\n    }\n  ],\n  \"note\": \"Record which facts need checking next.\"\n}\n"); assert.equal(data.candidates.length,2); assert.ok(data.candidates.every(x=>x.technical && x.sector && x.fundamental && x.catalyst)); console.log(''Supplied shortlist notes can be read without live market data.'');'
```

Exit 0.

```text
Supplied shortlist notes can be read without live market data.
```

```powershell
& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '--test' '--test-reporter=tap' 'compare.test.mjs'
```

Exit 0.

```text
TAP version 13
# Subtest: a supplied shortlist produces an actual persisted comparison and note
ok 1 - a supplied shortlist produces an actual persisted comparison and note
  ---
  duration_ms: 93.3494
  type: 'test'
  ...
# Subtest: invalid input produces a useful error and no persisted result
ok 2 - invalid input produces a useful error and no persisted result
  ---
  duration_ms: 87.1403
  type: 'test'
  ...
# Subtest: existing reviews and source files are preserved
ok 3 - existing reviews and source files are preserved
  ---
  duration_ms: 171.0288
  type: 'test'
  ...
# Subtest: missing dimensions and duplicate symbols are rejected; input stays unchanged
ok 4 - missing dimensions and duplicate symbols are rejected; input stays unchanged
  ---
  duration_ms: 0.7176
  type: 'test'
  ...
1..4
# tests 4
# suites 0
# pass 4
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 447.6956
```

**Failures:** None.

**Warnings:** Founder replies/approvals are authored synthetic inputs; this does not prove unscripted model behavior. Passing technical checks is not customer validation. Public research is the historical M1-R3 dossier, not refreshed market evidence.

**Correct stop:** risk -> mvp. Each completed stage blocked another handoff. 1 synthetic founder continuation(s). Final awaiting_review; no release, validation or M3.

**Displayed Act summaries:**

Executive summary
We're building for US self-directed swing traders who already screen momentum/growth stocks, maintain a shortlist, and compare candidates during scheduled evening or weekend reviews..
The pain we're addressing: During a shortlist review, these traders struggle to compare plausible candidates consistently because technical, sector, fundamental and catalyst notes are scattered. They repeat the synthesis and lose track of their reasoning, using charts, research pages and spreadsheets today.
One workflow: Read a local shortlist, compare the supplied facts, save one review note.
The first version needs to help us learn: Does one comparison reduce repeated checking?

Building
- Compare supplied facts
- Save one review note

Parking
- Live prices
- Portfolio dashboard

First build stage: M0: verify supplied shortlist input. Verify that the local input works without a live market-data integration.

These capabilities test the core pain. Extra features would add work without answering that question.

Approve build | Adjust scope | View build plan
The extra detail is optional — you can continue without reading it.

Executive summary
M0: verify supplied shortlist input: awaiting review. 1 checks passed, 0 failed, 0 not run.
Technical results do not establish customer validation.

Try this stage using the recorded run instructions. Your review is needed before the next stage.

& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '--input-type=module' '-e' 'import assert from ''node:assert/strict''; const data=JSON.parse("{\n  \"candidates\": [\n    {\n      \"symbol\": \"AAA\",\n      \"asOf\": \"Synthetic observation, not market data\",\n      \"technical\": \"Supplied trend note\",\n      \"sector\": \"Unknown\",\n      \"fundamental\": \"Supplied business note\",\n      \"catalyst\": \"Unknown\"\n    },\n    {\n      \"symbol\": \"BBB\",\n      \"asOf\": \"Synthetic observation, not market data\",\n      \"technical\": \"Supplied trend note\",\n      \"sector\": \"Unknown\",\n      \"fundamental\": \"Supplied business note\",\n      \"catalyst\": \"Unknown\"\n    }\n  ],\n  \"note\": \"Record which facts need checking next.\"\n}\n"); assert.equal(data.candidates.length,2); assert.ok(data.candidates.every(x=>x.technical && x.sector && x.fundamental && x.catalyst)); console.log(''Supplied shortlist notes can be read without live market data.'');'

View build plan | View technical results
The extra detail is optional — you can continue without reading it.

Executive summary
M1: complete the comparison: awaiting review. 1 checks passed, 0 failed, 0 not run.
Technical results do not establish customer validation.

Try this stage using the recorded run instructions. We have reached the planned stopping point.

& 'C:\Users\Ash\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'compare.mjs' 'example.json' 'review.json'

View build plan | View technical results
The extra detail is optional — you can continue without reading it.
