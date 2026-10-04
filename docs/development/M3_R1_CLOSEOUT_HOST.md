# M3-R1 installed-host closeout evidence

3 October 2026. Actual installed Codex inference and MCP calls; synthetic founder inputs and disposable fixture state. Network research was disabled: these are not fresh market research or customer-validation results.

Status: incomplete. Existing-project fixture preparation failed after one targeted repair. No remaining live scenarios are claimed as run.

## MCP

All ten read-only tools completed through the installed Codex app-server. Returned JSON sizes were bounded (251–5337 bytes in this run); these are byte counts, not token savings.

## Fresh B2B conversation

### Turn 1: completed

Synthetic founder: $crumb I want a small paid business helping independent restaurant managers compare supplier quotes. I have evenings to work on it.

Actual Crumb response:

I’m using the Crumb skill to shape this around a small paid offer and the time you have in the evenings.

You’re aiming to build a small paid business helping independent restaurant managers compare supplier quotes, with the work fitting into your evenings.

That time constraint matters: we’ll assess sales effort and support demands alongside whether managers would pay.

Does that capture the aim you want me to optimize around?

Tools observed: userMessage, commandExecution, mcpToolCall, reasoning

### Turn 2: completed

Synthetic founder: I'm not sure whether the owner or the person placing orders is the right user.

Actual Crumb response:

That distinction affects both the workflow and who can approve payment. I’ll keep the initial user open while we clarify it.

They could be different people: the person comparing quotes may use the service, while the owner may approve payment. In some restaurants, one person does both. We should leave that open until we understand the workflow.

Your broader aim can stay the same: a small paid business helping independent restaurants compare supplier quotes, manageable in your evenings. Does that capture your aim, with the initial user still undecided?

Tools observed: userMessage, mcpToolCall, commandExecution, reasoning

### Turn 3: completed

Synthetic founder: I don't know which API we'd need. You figure that out. Keep it direct, no jokes.

Actual Crumb response:

I’ll handle the API investigation and keep the replies direct. First I’ll check whether there’s relevant saved research.

I’ll investigate the API requirements. The first technical question is how quotes arrive—files, emails, or supplier systems—which determines whether an API is needed. There’s no saved API research, and live research is unavailable here, so I can’t verify a provider yet.

Before that, is the goal a small paid business helping independent restaurants compare supplier quotes, with the work fitting into your evenings? We can leave the exact user open.

Tools observed: userMessage, mcpToolCall, reasoning, commandExecution

## Blocker

Invalid IDE context: /project/artifacts/0 must NOT have additional properties

The first existing-project setup lacked selected repository evidence. The targeted repair attached inspectArtifacts output; that output also contains text, whereas saved project.artifacts accepts a narrower shape. Stop under the one-repair rule; this is a test-harness boundary failure, not a passing existing-project scenario.

## Not run

Existing-project conversation; customer-feedback conversation; natural-affirmation/correction/pause live sequence; stock Evaluate/discovery/interview/technical sequence; live Chat-to-Work/Build Pack sequence; all 22 supplied conversation cases. Deterministic regressions cover many of these, but do not replace these missing live tests.
