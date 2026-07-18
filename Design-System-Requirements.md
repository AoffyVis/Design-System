# Design System Platform Requirements

## Vision

Build an internal Design System Platform supporting multiple frontend
frameworks and languages from a single source of truth (Design Tokens).

## Goals

-   Shared CSS framework
-   Design Tokens
-   Component standards
-   Publish to npm, NuGet, CDN
-   Automated CI/CD with GitLab

## Functional Requirements

### Design Tokens

-   Colors
-   Typography
-   Spacing
-   Radius
-   Shadows
-   Breakpoints
-   Z-index
-   Animations

### CSS Framework

-   Reset/Base
-   Utility classes
-   Component classes (Button, Card, Badge, Input, Alert, Table, Modal, Nav, Tabs)
-   Table presentation states for sorting, filtering, and pagination (consumer logic remains application-owned)
-   Responsive
-   Dark mode
-   Theme support
-   RTL
-   Print
-   Accessibility

### Supported Platforms

-   React
-   Next.js
-   Vue
-   Angular
-   Svelte
-   Blazor
-   ASP.NET MVC / Razor
-   Laravel
-   Plain HTML

### Distribution

-   GitLab Package Registry (npm)
-   GitLab Package Registry (NuGet)
-   CDN (Azure CDN / CloudFront)
-   GitLab Pages (Documentation)

## Non-functional Requirements

-   Monorepo
-   Semantic Versioning
-   Unit Tests
-   Visual Regression Tests
-   Documentation
-   Performance-focused
-   Backward compatibility policy

## CI/CD

1.  Lint
2.  Test
3.  Build
4.  Publish
5.  Deploy Docs

## Repository Structure

``` text
packages/
  tokens/
  css-core/
  generator/
  cli/
examples/
docs/
.gitlab-ci.yml
```

## Milestones

1.  Requirements
2.  Architecture
3.  Design Tokens
4.  CSS Core
5.  Generator
6.  CI/CD
7.  Documentation
8.  VS Code Extension
9.  v1.0 Release

---

## คำอธิบายไฟล์ในโปรเจกต์ (ภาษาไทย)

### `.kiro/specs/` — Spec files (แผนงานของแต่ละ package)

แต่ละ spec folder มี 3 ไฟล์:
- **`requirements.md`** — ข้อกำหนด (ต้องทำอะไรบ้าง, acceptance criteria)
- **`design.md`** — ออกแบบ architecture, data flow, types, testing strategy
- **`tasks.md`** — แตก task ย่อย พร้อม dependency graph (ติ๊ก [x] เมื่อเสร็จ)

| Spec Folder | คืออะไร | สถานะ |
|---|---|---|
| `design-system-platform/` | Documentation scaffold + Link_Validator — เขียน docs 13 ไฟล์ + สร้าง script ตรวจลิงก์เสีย | ✅ Done |
| `tokens-package/` | `packages/tokens` — Pipeline อ่าน JSON token → validate → resolve references → generate CSS/JSON/TS | ✅ Done |
| `css-core-package/` | `packages/css-core` — อ่าน tokens.css แล้ว generate utility CSS (spacing, color, typography, radius, shadow, z-index, motion, layout, border) + component CSS (button, card, badge, input, alert, table, modal, nav, tabs) + responsive + dark mode + a11y + print | ✅ Done |
| `roadmap-homepage-site/` | `apps/roadmap-site` — เว็บ Next.js แสดง Homepage, Roadmap (parse จาก docs/ROADMAP.md), Demo (render CSS จริง), Docs (reference guide) | ✅ Done |
| `generator-package/` | `packages/generator` + `packages/cli` — Unified orchestrator รวม pipeline ทั้งหมด + CLI interface (`ds-generate`) | ✅ Done |

---

### `docs/` — Documentation Set (เอกสารประกอบโปรเจกต์)

| ไฟล์ | คืออะไร |
|---|---|
| `00-index.md` | สารบัญ — ลิงก์ไปทุกไฟล์ใน docs/ |
| `01-vision.md` | วิสัยทัศน์ — ปัญหาที่แก้, เป้าหมาย, กลุ่มผู้ใช้ |
| `02-architecture.md` | สถาปัตยกรรม — monorepo layout, data flow, package dependency |
| `03-requirements.md` | ข้อกำหนดเชิงฟังก์ชัน + non-functional (performance, a11y, security) |
| `04-design-token.md` | Token format, naming convention, 8 categories, validation rules |
| `05-css-spec.md` | CSS framework spec — reset, utilities, responsive, dark mode, RTL, print, a11y |
| `06-theme.md` | ระบบ Theme — override mechanism, light/dark/brand, activation per platform |
| `07-generator.md` | Generator — inputs, outputs per platform, CLI options, extensibility, error reporting |
| `08-build.md` | Build commands — ลำดับ build, output locations |
| `09-publish.md` | Publishing — npm, NuGet, CDN, GitLab Pages, versioning policy |
| `10-ci-cd.md` | CI/CD pipeline — lint → test → build → publish → deploy stages |
| `11-roadmap.md` | Roadmap 9 milestones + status indicators |
| `12-contributing.md` | Contributing guide — setup, branching, PR process, token proposals |
| `ROADMAP.md` | Detailed phase-based roadmap (Phase 1–6) ที่ roadmap-site parse มาแสดง |
| `SESSION-SUMMARY.md` | บันทึก session ทุกครั้งที่ AI ทำงาน (token usage, cost, files changed) |

---

### `docs/spec/` — Technical Specifications (spec เชิงลึก)

| ไฟล์ | คืออะไร |
|---|---|
| `design-tokens.md` | Token file format spec ละเอียด (JSON schema, types, references, validation) |
| `naming.md` | Naming convention — token identifiers, CSS custom properties, utility classes |
| `components.md` | Component Layer spec — .btn, .card, .badge, .input, .alert, .table, .modal, .nav, .tabs; table sorting/filter/pagination presentation states |
| `layout.md` | Layout utilities spec — flex, grid, display, container, gap, margin-auto |
| `borders.md` | Border utilities spec — border-width, border-side, border-style, border-color |

---

### `packages/` — Source Code (โค้ดจริง)

| Package | คืออะไร | Output |
|---|---|---|
| `tokens/` | Token pipeline — parse JSON → validate → resolve → generate | `dist/tokens.css`, `dist/tokens.json`, `dist/tokens.d.ts` |
| `css-core/` | CSS framework generator — อ่าน tokens.css แล้วสร้าง layered utility CSS | `dist/core.css` (~86KB) |
| `generator/` | Unified orchestrator — รวม tokens + css-core + themes เป็น pipeline เดียว | `dist/` (7 files) |
| `cli/` | CLI wrapper — `ds-generate --tokens ... --output ... --verbose` | (executable) |

---

### `apps/roadmap-site/` — Roadmap & Documentation Website

เว็บ Next.js 16 (App Router + Turbopack) มี 4 หน้า:
- **`/`** — Homepage (overview, vision, supported platforms)
- **`/roadmap`** — Roadmap page (parse `docs/ROADMAP.md` แสดงเป็น timeline)
- **`/demo`** — Interactive demo (render CSS จริงจาก packages/, playground, components)
- **`/docs`** — Documentation reference (tokens, utilities, components ทุกตัว + live examples)
