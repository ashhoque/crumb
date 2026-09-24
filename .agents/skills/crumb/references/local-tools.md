# Local tools for Crumb M1-R2

The founder speaks naturally. You operate these tools and present their meaning,
not JSON, IDs or internal validation fields. Installation root is the repository
containing this skill; target is the founder's explicitly selected existing folder.
Never initialize a different project to get around an existing cycle or error.

## Runtime and current context

Use the repository's pinned Node 24.19.0. `cec.ps1 check` builds and runs the suite;
routine conversation does not rerun all tests. The existing launcher can select the
runtime. For JSON stdin on Windows, prefer direct pinned Node with a UTF-8 input
file or a process API; one PowerShell launcher pipeline previously lost input.
Do not change global runtimes, profiles or credentials.

Internal command shape after building:

```text
node <install>/dist/src/cli/main.js internal <operation> <target>
```

`context` returns compact old workflow plus the current pre-build summary when
present. `template` returns the latest editable pre-build context with its expected
version, or an empty starting shape without creating storage. `schema` prints its
strict neutral contract. `dossier` retrieves full optional context for updates.
Do not treat an old v3 `context_ready` preview as completed M1-R2 evaluation.

## Save pre-build work independently of a proposal

Send a JSON object on stdin to `prebuild`. It validates before saving and returns
version/hash plus a compact summary. Use the actual previous version for concurrent
updates. Context revisions are immutable and can continue after an old approved
cycle. No feature list, scope, approval or new build is needed to save understanding.

The template/schema define:

- Project entry, optional preferred name with its explicit source, Intention and
  its provided/unasked/asked/skipped/undecided disposition.
- Definition views: text or unknown, linked claim IDs and observed/inferred basis.
- Sources with provenance, access, dates, short retained text and limits; claims
  with sources, support/challenge links, actual reported metric fields where relevant,
  exact quotes if used, recurrence and importance.
- Bounded research runs and coverage. `ready` is a researched, qualified synthesis,
  not market validation. Record actual tools/queries and failures honestly.
- Competitors, at most two adjacent comparisons, specific habitats and up to three
  first-user avenues, red-team review and optional master fields.
- Short founder-facing brief and contextual typed choices. During I/D or incomplete
  Evaluate, use respond/correct/evaluate or research views. Normal interview,
  shape_mvp and master choices require ready evaluation. `build_requested` requires
  an actual retained founder request.

Use the `synthetic` flag for the scenario honestly. Real founder context must not
contain synthetic_fixture sources/runs. Actual public research and founder reports
retain their separate provenance even in a demonstration. No raw confidential
customer-source import. `artifact` source titles name exact selected file paths;
record the permission and hashes from `inspect`, not invented observations. Keep only
`path` and `sha256` in project.artifacts; inspect also returns metadata.

For `inspect`, send `{ "paths": ["README.md"], "permissionGranted": true,
"permissionQuote": "the actual permission covering this selection" }` on stdin.
Do not invent permission. The operation reads only the selected permitted files;
documentation observations are not proof that code runs. Its input contract is
also in `contracts/m1.schema.json` under `$defs.inspect`.

Keep the transition in brief.next and the actual question in brief.questions.
The renderer suppresses exact repeated questions. Substantial saved summaries
need 2–5 sentences; a brief acknowledgment with no findings needs no padding.

Do not repeatedly ask the founder to supply missing fields. Infer cautiously,
research, or leave unknowns. Errors are feedback for you to correct, not homework
to hand back to the founder. The 256 KiB dossier cap retains selected evidence;
it is not permission to copy entire pages.

## Read optional views

```text
internal detail <target> --section competitors --page 1
internal detail <target> --section users
internal detail <target> --section habitats
internal master <target>
internal research <target>
```

Sections: why, definition, evidence, research, competitors, users, gaps, adjacent,
habitats, sources, interview, red-team. `checks` retains the existing build view.
`--collapsible` is optional only on supported hosts. Research/master commands give
the requested full material; don't dump it in the normal reply. The stored summary
is normally enough to resume, while source/detail views preserve traceability.

`export-context` emits a hash-checked JSON snapshot; `restore-context` imports that
snapshot only into a target without pre-build history, rechecking permitted file
hashes. It never overwrites existing context or restores a cycle. `backup create`
retains the whole SQLite workspace including approved history and research, with
an integrity check. Raw confidential data remains outside this milestone's scope.

## Transition to the preserved build path

Only after the founder selects an action, create a v4 draft using
`contracts/conversation-v4.schema.json`. It keeps the existing complete one-workflow
proposal and artifact permissions and adds `context: {version,hash}` plus decision
basis `evaluation_ready` or `build_requested`. The latter source must match the
saved explicit request. Its `synthetic` flag matches the context. Legacy ideal
fields remain for compatibility; use no legacy research findings (`not_run`),
because the actual research is the referenced dossier. Map a personal/bootstrapped
goal to the legacy `custom` value while preserving the founder's words. Map an
undecided disposition to legacy `skipped`; preserve its null/unknown intention.
Copy all selected context file hashes into the action artifacts so approval can
recheck them. The linked dossier remains the full, authoritative business context.

Save through `draft`, show complete small scope, and use existing `approve` with
the current draft hash and actual approval quote. Reuse approval already given for
that exact scope. A changed dossier or draft invalidates unapproved scope. Approved
cycles and their previous evidence remain immutable. Material context changes clear
an unchanged startup master in the new revision. Revisit the evidence and red team
before generating a refreshed master; the old document remains in history. `handoff` retrieves the
approved first-cycle scope; implement under target conventions and record actual
checks/files through `receipt`, then verify a backup. Passing code is not demand.

An existing approved cycle remains the original scope; don't ask `draft` to create
a second tracked cycle. Save the new evaluation, then provide a small reviewed
portable handoff for ordinary coding when requested. Explain this recordkeeping
limit only if it matters; don't block the builder or pretend a second cycle exists.
The staged/repeated builder is future M2.
