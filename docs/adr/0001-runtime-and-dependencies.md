# ADR 0001: minimal compiled Node foundation

Accepted for M0, 2026-09-23. Master §08.2.

Use the tested Node 24.19.0, npm 9.6.7, strict TypeScript and ESM. Compile with
NodeNext module resolution and explicit `.js` imports. Keep package publication
disabled. A clean installation uses the integrity-bearing npm lockfile and
`npm ci --ignore-scripts`; no global tooling is required.

Pin TypeScript 5.9.3 and @types/node 24.13.6 as development-only dependencies.
The compiler has no runtime package dependencies and is a portable JavaScript
compiler. The registry's newer TypeScript 7.0.2 adds native compiler packages;
M0 does not need that change. Node types match the runtime major and bring the
type-only undici-types dependency. Real compilation/tests decide suitability.

There are no production dependencies. Node's argument parser is sufficient for
`init` and `doctor`; Commander and a JSON Schema validator are deferred until
commands/contracts require them. No workflow or domain contracts exist in M0.

The pre-existing Codex-bundled Node runtime is reused; no system runtime or shell
profile is replaced. `.node-version` and the engines check pin the tested patch.
The machine-specific helper remains local. A moved/updated bundled runtime must
be reverified. First tested platform: Windows 25H2 x64; other OSes are untested.

Reference: [TypeScript Node module modes](https://www.typescriptlang.org/tsconfig/module.html).
