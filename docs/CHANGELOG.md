# Changelog

All notable changes to the Company Design System are documented in this
file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to the Versioning Strategy defined in
[ARCHITECTURE.md](../ARCHITECTURE.md) (Semantic Versioning).

---

## [Unreleased]

### Added

* Project foundation documentation: `README.md`, `ARCHITECTURE.md`,
  `AGENTS.md`, `Design-System-Requirements.md`.
* Design philosophy and roadmap documentation
  (`docs/DESIGN-PHILOSOPHY.md`, `docs/ROADMAP.md`).
* CSS Framework specification index (`docs/spec/README.md`).
* Naming convention specification (`docs/spec/naming.md`).
* Design Token specification (`docs/spec/design-tokens.md`).
* Design Token flow diagram (`docs/diagrams/design-token-flow.md`).
* Contributing guidelines (`docs/CONTRIBUTING.md`).
* Kiro spec-driven requirements for the scaffold deliverable
  (`.kiro/specs/design-system-platform/requirements.md`).

No packages, source code, or releases exist yet. This entry will be
superseded once `packages/tokens`, `packages/css-core`,
`packages/generator`, and `packages/cli` are scaffolded per
[docs/ROADMAP.md](ROADMAP.md#phase-1--foundation).

---

## Versioning Policy

* **Major** — Breaking changes (e.g. a Design Token identifier is renamed
  or removed).
* **Minor** — New features (e.g. a new Design Token category or utility
  class group).
* **Patch** — Bug fixes that do not change any public API.

Public APIs, including CSS utility class names and Design Token
identifiers, remain stable across Minor and Patch releases.
