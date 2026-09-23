# ADR 0003: repository-local Codex foundation probe

Accepted layout; manual account invocation confirmed by the user on 2026-09-23.
Master §08.2, §11, §15 M0 task 6. Recorded 2026-09-23.

Use `.agents/skills/customer-evidence/SKILL.md` as the single canonical skill source
for this repository. Do not duplicate it into a separate `skills/` directory yet.
The master layout is illustrative; the installed host's supported discovery path
is the operative integration boundary. No global skill install, extra host, MCP
service, product orchestrator or plugin is introduced.

The M0 skill only supplies a foundation diagnostic/invocation probe. Its exact
marker is held in the skill body, not the invocation prompt, so a successful
response can demonstrate that the host loaded the instructions. The later
customer-learning workflow is explicitly absent.

Actual Codex CLI/app-server 0.155.0-alpha.9.2 returned this skill with `scope: repo`
and `enabled: true` using `skills/list` with the CEC repository as `cwd`, in an
isolated unauthenticated test profile. This verifies the real scanner and path;
it does not prove the existing account can invoke it.

The normal host launch in this task's sandbox failed to resolve its home directory.
Selecting the existing profile through the documented setting changed the failure
to Windows `Access is denied. (os error 5)`, even after filesystem permission grants.
No credentials were inspected/copied, no account was created or signed into, and
no automated authenticated probe turn reached execution.

The user subsequently reported the requested manual desktop invocation response:

```text
CEC_M0_SKILL_LOADED
The customer workflow is not implemented.
```

This satisfies the M0 invocation gate using user-reported manual evidence; the
reply was not independently observed by this task. The sandbox launcher failure
remains a warning, and its failed automated result is preserved. No M1 work is
authorized by this verification.

The task's generated working directory is outside the CEC repository. Its initial
skill catalog therefore cannot itself establish repository-local discovery.

References:
- [Official local skill discovery](https://learn.chatgpt.com/docs/build-skills)
- [Official app-server skill API](https://learn.chatgpt.com/docs/app-server)
- [Official state-location settings](https://learn.chatgpt.com/docs/config-file/environment-variables)
