# Contributing

Version: 1.0.0

Status: Draft

---

# Purpose

This document describes how to set up a local development environment,
propose changes, and get a Pull Request merged into the Company Design
System.

It implements the AI Agent workflow described in
[AGENTS.md](../AGENTS.md) for human contributors as well.

---

# Local Development Setup

This project uses [pnpm](https://pnpm.io/) as its package manager for
monorepo workspaces. pnpm was chosen over npm/yarn for faster installs and
a smaller on-disk footprint via its content-addressable store, which matters
as the number of packages under `packages/*` and `examples/*` grows.

1. Clone the repository.
2. Enable pnpm via Corepack (bundled with Node.js 16.9+):
   ```bash
   corepack enable
   ```
3. Install dependencies from the repository root (monorepo workspace):
   ```bash
   pnpm install
   ```
4. Build all packages:
   ```bash
   pnpm build
   ```
5. Run the test suite:
   ```bash
   pnpm test
   ```
6. Run the framework locally against an example app under `examples/`.

A package's individual build/test scripts are documented alongside the
package once implemented; the root scripts above orchestrate all packages
in dependency order (`tokens` → `css-core` → `generator` → `cli`) via pnpm
workspaces (`pnpm-workspace.yaml`).

---

# Branching

* Branch from `main`.
* Branch names use the pattern `{type}/{short-description}`:
  ```text
  feat/spacing-utilities
  fix/dark-mode-toggle
  docs/theme-guide
  chore/ci-pipeline
  ```
* `type` is one of `feat`, `fix`, `docs`, `chore`, `refactor`, `test`,
  `perf`.

---

# Commit Messages

Commit messages follow
[Conventional Commits](https://www.conventionalcommits.org/):

```text
{type}({scope}): {short summary}
```

```text
feat(tokens): add elevation token category
fix(css-core): correct focus-visible ring color
docs(spec): document naming convention for utility classes
```

`scope` is the affected package or area (`tokens`, `css-core`, `generator`,
`cli`, `spec`, `ci`).

---

# Required Checks Before Merge

A Pull Request must pass all of the following before it can be merged,
matching the CI/CD pipeline in [ARCHITECTURE.md](../ARCHITECTURE.md):

1. Lint
2. Unit Tests
3. Visual Regression Tests (when the change affects generated CSS)
4. Build
5. Bundle Size Check

No package is published unless every gate above passes.

---

# Pull Request Review Process

1. Open a Pull Request against `main` with a description of the change and
   its motivation.
2. At least one reviewer evaluates the change against the Architecture
   Review Checklist in [AGENTS.md](../AGENTS.md):
   architecture alignment, Design Token compliance, technical debt,
   scalability, impact on existing users, and simplification opportunities.
3. Reviewer verifies documentation and tests were updated alongside the
   code change, per the Documentation Rules and Testing Rules in
   [AGENTS.md](../AGENTS.md).
4. Changes that violate a project principle are rejected with a reason,
   architectural impact, and a recommended alternative — never rejected
   without explanation.
5. Once approved and all required checks pass, the author or reviewer
   merges the Pull Request.

---

# Proposing a New or Modified Design Token

1. Confirm the value cannot be expressed by an existing token before
   proposing a new one.
2. Open a Pull Request that adds or modifies the token definition under
   `packages/tokens/src/`, following the file format and naming convention
   in [docs/spec/design-tokens.md](spec/design-tokens.md) and
   [docs/spec/naming.md](spec/naming.md).
3. Adding a token is a non-breaking change. Renaming or removing a token
   identifier is a breaking change and requires:
   * A major version bump.
   * A migration guide entry.
   * Reviewer sign-off from the Lead System Architect role described in
     [AGENTS.md](../AGENTS.md).
4. Include the regenerated CSS Custom Properties, JSON, and TypeScript
   output as part of the same Pull Request — generated output must never
   be committed out of sync with its token source.

---

# Documentation Expectations

Every feature Pull Request includes, per [AGENTS.md](../AGENTS.md):

* Documentation for the change.
* A usage example.
* Implementation notes for anything non-obvious.

---

# Code of Conduct

Contributors are expected to engage respectfully and constructively.
Disagreements about architecture are resolved by referring to the Source of
Truth order defined in [AGENTS.md](../AGENTS.md#source-of-truth):
`ARCHITECTURE.md` → `Design-System-Requirements.md` → `README.md` →
Project Source Code.
