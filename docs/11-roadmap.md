# Roadmap

This document tracks the Design System Platform's progress toward the v1.0 release. Each milestone represents a major deliverable in the platform's evolution, listed in the order they must be completed.

---

## Milestones

| # | Milestone | Deliverable | Status |
|---|-----------|-------------|--------|
| 1 | Requirements | Complete functional and non-functional requirements specification covering design tokens, CSS framework, supported platforms, distribution channels, and project governance. | ✅ Done |
| 2 | Architecture | Monorepo layout, package dependency graph (`tokens` → `css-core` → `generator` → `cli`), data-flow design, platform consumption model, and CI/CD pipeline architecture. | ✅ Done |
| 3 | Design Tokens | Token file format, naming convention (`{category}.{group}.{variant}.{property}`), all eight token categories defined (colors, typography, spacing, radius, shadows, breakpoints, z-index, animations), and output format mapping. | ✅ Done |
| 4 | CSS Core | Reset/base layer, utility class system, responsive breakpoints, dark mode, RTL support, print styles, accessibility conventions, theme engine, and pre-composed components (Button, Card, Badge, Input, Alert, Table, Modal, Nav, Tabs) — all generated from Design Tokens. | ✅ Done |
| 5 | Generator | Build-time tooling that transforms Design Token definitions and CSS specifications into per-platform output artifacts, with CLI interface and extensible platform targets. | ✅ Done |
| 6 | CI/CD | GitLab CI pipeline implementing lint → test → build → publish → deploy-docs stages, publishing to npm, NuGet, CDN, and GitLab Pages. | ✅ Done |
| 7 | Documentation | Thirteen-file documentation set (`docs/00-index.md` through `docs/12-contributing.md`), covering vision, architecture, requirements, tokens, CSS, theming, generator, build, publishing, CI/CD, roadmap, and contributing guidelines. | ✅ Done |
| 8 | VS Code Extension | IDE tooling for design token autocomplete, validation, and live preview within the development environment. | 🔲 Planned |
| 9 | v1.0 Release | Production-ready release with all packages published, documentation deployed, CI/CD pipeline fully operational, and backward compatibility guarantees in effect. | 🔲 Planned |

---

## Status Legend

| Indicator | Meaning |
|-----------|---------|
| ✅ Done | Milestone deliverables are complete |
| 🔄 In Progress | Active work underway |
| 🔲 Planned | Not yet started |

---

## Supersedes / Deep Reference

This document presents the 9 milestones required by the Design System Platform's requirements specification. For a more detailed phase-based breakdown with expanded deliverable lists and success criteria, see [`docs/ROADMAP.md`](./ROADMAP.md).

The mapping between this document's milestones and `docs/ROADMAP.md`'s phases:

- **Phase 1 (Foundation)** → Requirements, Architecture, Design Tokens
- **Phase 2 (CSS Core)** → CSS Core
- **Phase 3 (Developer Experience)** → Generator, Documentation, v1.0 Release
- **Phase 6 (Ecosystem)** → VS Code Extension

CI/CD spans Phase 1's infrastructure setup and Phase 3's release automation.
