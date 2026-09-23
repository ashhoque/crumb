# ADR 0002: local SQLite and guarded initialization

Accepted for M0, 2026-09-23. Master §08.2, §09.3, AC39/40.

Use `node:sqlite` behind `src/persistence/sqlite.ts`. Groundwork passed all required
SQLite behaviors; M0 reruns them against the compiled adapter. No alternate binding,
ORM or migration dependency is justified. Connections enforce foreign keys, WAL,
a finite busy timeout, disabled extensions, and synchronous transactions.

Default storage is `<project>/.customer-evidence/cec.sqlite`. M0 writes only a
SQLite application identifier and format version, never business/customer data.
No domain tables or migrations are created. A recognized existing foundation is
idempotent; unknown files, foreign databases and future versions are refused.

Before storage is created, inspect Git's index for the exact private directory
(including nested projects), append a root-anchored private ignore rule when
needed, and verify it through Git. Never untrack, commit, or initialize Git on a
user's behalf. Non-Git folders still receive the ignore rule for future Git use.
Ignore-file bytes are preserved as a prefix; only the protective rule is appended.

Reject symlinks/junctions at the supplied root or owned paths, hard-linked owned
files, unsafe path collisions, unreadable Git state, and tracked private data.
Do not read `.env`, target source code, credentials, or target package scripts.

This is a local single-user application, not a security boundary against another
process with the same filesystem rights. SQLite WAL is supported only on a normal
local filesystem. There is no encrypted-at-rest or cross-process initialization
guarantee; OS permissions and disk protection remain outside this M0 prototype.

Reference: [Node 24 SQLite API](https://nodejs.org/docs/latest-v24.x/api/sqlite.html).
