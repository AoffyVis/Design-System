# 12 — Contributing

This document is the canonical contributor guide for the Design System Platform.
It describes how to set up a local environment, follow project conventions, pass
required checks, get a Pull Request reviewed and merged, and propose changes to
Design Tokens.

---

## Local Development Setup

The monorepo uses [pnpm](https://pnpm.io/) workspaces. pnpm is chosen for
faster installs and a smaller on-disk footprint via its content-addressable
store.

1. **Clone** the repository.
2. **Enable pnpm** via Corepack (bundled with Node.js 16.9+):
   ```bash
   corepack enable
   ```
3. **Install** dependencies from the repository root:
   ```bash
   pnpm install
   ```
4. **Build** all packages in dependency order:
   ```bash
   pnpm build
   ```
5. **Run the test suite**:
   ```bash
   pnpm test
   ```

Packages build in topological order: `tokens` → `css-core` → `generator` → `cli`.
Root scripts orchestrate this automatically via `pnpm-workspace.yaml`.

---

## Branch Naming & Commit Conventions

### Branch Naming

Branch from `main`. Use the pattern:

```text
{type}/{short-description}
```

Valid types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`.

Examples:

```text
feat/spacing-utilities
fix/dark-mode-toggle
docs/theme-guide
chore/ci-pipeline
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
{type}({scope}): {short summary}
```

`scope` is the affected package or area: `tokens`, `css-core`, `generator`,
`cli`, `spec`, `ci`.

Examples:

```text
feat(tokens): add elevation token category
fix(css-core): correct focus-visible ring color
docs(spec): document naming convention for utility classes
```

---

## Required Checks Before Merge

Every Pull Request must pass the following gates before it can be merged:

| # | Check                      | Description                                                  |
|---|----------------------------|--------------------------------------------------------------|
| 1 | **Lint**                   | Code and documentation linting, including the Link Validator |
| 2 | **Unit Tests**             | Full test suite across all packages                          |
| 3 | **Visual Regression Tests**| Required when a change affects generated CSS output          |
| 4 | **Build**                  | All packages compile without errors                          |
| 5 | **Bundle Size Check**      | Ensures CSS output stays within performance budget           |

No package is published unless every gate passes.

---

## Pull Request Review Process

1. Open a Pull Request against `main` with a description of the change and
   its motivation.
2. At least one reviewer evaluates the change against the Architecture Review
   Checklist in [AGENTS.md](../AGENTS.md): architecture alignment, Design Token
   compliance, technical debt, scalability, impact on existing users, and
   simplification opportunities.
3. The reviewer verifies that documentation and tests were updated alongside the
   code change (per the Documentation Rules and Testing Rules in
   [AGENTS.md](../AGENTS.md)).
4. Changes that violate a project principle are rejected with a reason,
   the architectural impact, and a recommended alternative — never rejected
   without explanation.
5. Once approved and all required checks pass, the author or reviewer merges
   the Pull Request.

---

## Proposing a New or Modified Design Token

1. **Confirm uniqueness** — verify the value cannot be expressed by an existing
   token before proposing a new one.
2. **Open a Pull Request** adding or modifying the token definition under
   `packages/tokens/src/`, following the file format in
   [docs/spec/design-tokens.md](spec/design-tokens.md) and the naming
   convention in [docs/spec/naming.md](spec/naming.md).
3. **Classify the change:**
   - *Adding* a token is a non-breaking (minor) change.
   - *Renaming or removing* a token identifier is a **breaking change** and
     requires:
     - A major version bump.
     - A migration guide entry.
     - Reviewer sign-off from the Lead System Architect role described in
       [AGENTS.md](../AGENTS.md).
4. **Include regenerated outputs** — CSS Custom Properties, JSON, and TypeScript
   output must be committed in the same Pull Request. Generated output must
   never be committed out of sync with its token source.

---

## Supersedes / Deep Reference

This document reorganizes and condenses the content of
[docs/CONTRIBUTING.md](CONTRIBUTING.md). Refer to that file for additional
context such as Documentation Expectations and Code of Conduct.

---

*[← Back to Documentation Index](00-index.md)*
