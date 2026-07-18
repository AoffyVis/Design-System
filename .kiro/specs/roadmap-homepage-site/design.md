# Design Document: Roadmap_Site (Roadmap & Homepage Site)

## Overview

The Roadmap_Site is a standalone Next.js (App Router) + TypeScript application that gives any employee a scannable, always-current view of the Company Design System platform's purpose and roadmap, without requiring them to read raw markdown in the repository.

It lives at `apps/roadmap-site/` — a sibling of `packages/`, `docs/`, `examples/`, and `scripts/` — and has no build-time or runtime import from anything under `packages/`. This satisfies Requirement 1 and keeps the site's dependency graph independent of the design-token generation pipeline.

The site has two content strategies, deliberately different, because the requirements treat them differently:

- **Homepage** (Requirement 2): introduces the platform (name, overview, vision, supported platforms). The requirements do not impose a build-time parsing or anti-duplication rule on this content (Requirement 7's anti-hardcode rule is explicitly scoped to "Phase name, Objective, Deliverables, or Success_Criteria" — Roadmap content only). Homepage copy is therefore maintained as a small, explicit content module (`src/content/homepage-content.ts`) authored to mirror `README.md`'s Overview/Vision/Supported Platforms sections. This is the simplest solution that satisfies Requirement 2 without adding an unneeded second parser.
- **Roadmap_Page** (Requirements 3, 4, 7): every Phase and Future_Roadmap_Item shown must be produced by parsing `docs/ROADMAP.md` (the Roadmap_Content_Source) at build time — never hand-copied. This is enforced both structurally (pages only ever render parser output, never literal phase prose) and mechanically (a build-time script that fails the build if phase prose is ever found hardcoded anywhere in the site's source).

Both pages are rendered as static Server Components — there is no per-request data fetching. `docs/ROADMAP.md` is read and parsed once, at build time, which is what allows a malformed or missing source file to fail the build immediately (Requirements 3.5, 3.6) rather than surfacing as a runtime error to a site visitor. Static rendering also means the fully-formed HTML is what ships to the browser, which is what makes Requirement 5.4 (page renders correctly with no client-side JavaScript) true by construction rather than by extra effort.

Styling uses Tailwind CSS utility classes scoped to this app only. This site is a standalone content consumer, not part of the `packages/` token-generation pipeline, so using Tailwind here does not conflict with the framework-agnostic-CSS principle that governs generated design-token output — it only affects this one app's own markup.

## Architecture

```mermaid
flowchart LR
    ROADMAP[docs/ROADMAP.md] -->|fs.readFileSync| PARSER[Roadmap_Parser\nparseRoadmap(markdown)]
    PARSER --> DATA[RoadmapData\nphases + futureRoadmapItems]
    CONFIG[phase-status.config.ts] --> LOOKUP[getPhaseStatus(name)]
    DATA --> RPAGE[app/roadmap/page.tsx]
    LOOKUP --> RPAGE
    RPAGE --> RHTML[Static HTML: Roadmap_Page]
    CONTENT[content/homepage-content.ts] --> HPAGE[app/page.tsx]
    HPAGE --> HHTML[Static HTML: Homepage]
    CHECK[scripts/check-hardcoded-roadmap-content.ts] -.reads.-> ROADMAP
    CHECK -.scans.-> SRC[src/app, src/components, src/content]
    CHECK -->|exit 1 on match| FAIL[yarn prebuild fails build]
    CHECK -->|exit 0| BUILD[next build proceeds]
```

**Module boundaries** (kept deliberately narrow so the parser stays unit/property testable without touching the filesystem):

- `src/lib/roadmap-parser.ts` — **pure function**: `(markdown: string) => RoadmapData`. No file I/O, no Next.js APIs. This is what property-based tests exercise directly.
- `src/lib/roadmap-data.ts` — thin I/O wrapper: resolves the absolute path to `docs/ROADMAP.md`, reads it with `fs.readFileSync`, and calls `parseRoadmap`. Exceptions from either the file read or the parser propagate unchanged.
- `src/content/phase-status.config.ts` — static config object, no logic.
- `src/app/**/page.tsx` — Server Components that only ever call the above modules and render their return values. They never contain literal Phase prose.

**Why this fails the build, not just the request:** `app/roadmap/page.tsx` calls `getRoadmapData()` at module scope (not inside a request handler). Because both pages use default static rendering (no `dynamic`/`force-dynamic`, no runtime params), Next.js executes `page.tsx` during `next build`'s static generation pass. A thrown error during that pass aborts the entire `next build` process with a non-zero exit code — satisfying Requirement 3.5 ("fail the entire build") and 3.6, and doing so without any custom build-abort plumbing.

**Why no dependency on `packages/`:** the site's own `package.json` has no workspace reference to any `packages/*` package, and `roadmap-data.ts` reads `docs/ROADMAP.md` directly from disk — the same file any human reads, not a generated artifact of the token pipeline. This satisfies Requirement 1.3–1.4 directly and verifiably (an import-graph check, described in Testing Strategy, guards against future regressions).

## Components and Interfaces

### Project structure

```text
apps/roadmap-site/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── scripts/
│   └── check-hardcoded-roadmap-content.ts   # Requirement 7.4 enforcement (run as "prebuild")
└── src/
    ├── app/
    │   ├── layout.tsx            # root layout: <html>/<body>, renders <NavBar/>
    │   ├── globals.css           # Tailwind entrypoint only
    │   ├── page.tsx               # Homepage — Requirement 2
    │   └── roadmap/
    │       └── page.tsx           # Roadmap_Page — Requirement 4
    ├── components/
    │   ├── NavBar.tsx
    │   ├── PhaseCard.tsx
    │   ├── StatusBadge.tsx
    │   ├── FutureRoadmapSection.tsx
    │   └── SupportedPlatformsList.tsx
    ├── content/
    │   ├── homepage-content.ts       # Requirement 2 content (mirrors README.md)
    │   └── phase-status.config.ts    # Phase_Status config — keyed by Phase name
    ├── lib/
    │   ├── types.ts                  # Phase, RoadmapData, PhaseStatus, HomepageContent
    │   ├── roadmap-parser.ts         # pure: markdown string -> RoadmapData
    │   ├── roadmap-data.ts           # I/O: reads docs/ROADMAP.md, calls parser
    │   └── phase-status.ts           # getPhaseStatus(name) lookup helper
    └── lib/__tests__/
        ├── roadmap-parser.test.ts        # unit + property tests
        ├── phase-status.test.ts          # unit tests
        └── hardcoded-content-check.test.ts # property test for the detector
```

### Component responsibilities

| Component | Responsibility | Key props |
|---|---|---|
| `NavBar` | Renders `<nav aria-label="Primary">` with links to `/` and `/roadmap`, rendered inside root `layout.tsx` so it appears on every page (Requirement 5.1–5.2). Uses `next/link`'s `<Link>`, which renders a real `<a href>` — client-side transition when JS runs, standard full navigation when it doesn't (Requirement 5.3–5.4) with no extra code. | none |
| `PhaseCard` | Renders one Phase: `<article>` with `<h2>` name (+ optional `<StatusBadge>`), `<h3>Objective</h3><p>`, `<h3>Deliverables</h3><ul>`, `<h3>Success Criteria</h3><ul>`. Deliverables/Success Criteria lists use `lg:grid lg:grid-cols-2` for the desktop multi-column layout (Requirement 6.2). | `phase: Phase`, `status?: PhaseStatus` |
| `StatusBadge` | Renders a small label that always pairs an icon **and** text per status ("✅ Completed", "🔄 In Progress", "📋 Planned") — never color alone (Requirement 8.2). | `status: PhaseStatus` |
| `FutureRoadmapSection` | Renders Future_Roadmap_Items inside an `<aside aria-labelledby="future-roadmap-heading">`, visually and structurally distinct from the numbered `<PhaseCard>` list (Requirement 4.4). | `items: FutureRoadmapItem[]` |
| `SupportedPlatformsList` | Renders the Homepage's supported-platforms `<ul>` (Requirement 2.4). | `platforms: string[]` |

### Page responsibilities

- `app/page.tsx` (Homepage): Server Component. Imports `homepageContent` from `src/content/homepage-content.ts`. Renders platform name as `<h1>`, an Overview `<section>`, a Vision `<section>`, `<SupportedPlatformsList>`, and a `<Link href="/roadmap">` (Requirement 2.1–2.5).
- `app/roadmap/page.tsx` (Roadmap_Page): Server Component. Calls `getRoadmapData()` (module-scope, statically evaluated at build). Maps `phases` in array order to `<PhaseCard>` (Requirement 4.1–4.3), looks up each phase's status via `getPhaseStatus(phase.name)` and passes it through (Requirement 4.5–4.6), and renders `<FutureRoadmapSection items={futureRoadmapItems} />`.

## Data Models

```ts
// src/lib/types.ts

/** A single Phase parsed from docs/ROADMAP.md. */
export interface Phase {
  name: string;              // e.g. "Phase 1 — Foundation"
  objective: string;
  deliverables: string[];
  successCriteria: string[];
}

/** A single bullet under the "Future Roadmap" section. */
export interface FutureRoadmapItem {
  text: string;
}

/** Full output of the Roadmap_Parser for one Roadmap_Content_Source file. */
export interface RoadmapData {
  phases: Phase[];
  futureRoadmapItems: FutureRoadmapItem[];
}

/** Phase_Status configuration value. Roadmap_Content_Source has no status field —
 *  this type only exists in site config (phase-status.config.ts). */
export type PhaseStatus = "Completed" | "In Progress" | "Planned";

/** Config shape for src/content/phase-status.config.ts, keyed by exact Phase.name. */
export type PhaseStatusConfig = Record<string, PhaseStatus>;

/** Homepage's own content module shape (Requirement 2). */
export interface HomepageContent {
  platformName: string;
  overview: string;
  vision: string;
  supportedPlatforms: string[];
}
```

**Parser error contract** (both errors are plain `Error` instances with a message identifying the problem, thrown synchronously from `parseRoadmap` / `getRoadmapData`):

- Missing source file → thrown by `roadmap-data.ts`: `` Roadmap content source not found. Expected file at: <resolvedAbsolutePath> `` (Requirement 3.5).
- Incomplete Phase section → thrown by `roadmap-parser.ts`: `` Roadmap parse error: Phase "<phase name>" is missing a required "<Objective|Deliverables|Success Criteria>" section. `` (Requirement 3.6).

### Roadmap_Parser algorithm

`docs/ROADMAP.md` has a small, consistent shape: a sequence of `#` (h1) sections. Some h1 sections are Phases (`# Phase N — Name`, each containing `## Objective`, `## Deliverables`, `## Success Criteria` subsections), one h1 section is `# Future Roadmap` (a flat bullet list), and the rest (`# ROADMAP`, `# Vision`, `# Roadmap Governance`, `# Definition of Phase Completion`) are not roadmap data and are intentionally ignored.

Rather than hand-rolling a markdown tokenizer, `roadmap-parser.ts` uses `mdast-util-from-markdown` (a small, well-tested markdown-to-AST library) to parse the raw text into an AST, then walks the AST's top-level nodes:

1. Split the flat list of top-level AST nodes into segments, starting a new segment at every heading with `depth === 1`.
2. For each segment whose heading text matches `/^Phase\s+\d+\s*[—-]\s*.+/`, treat it as a Phase segment:
   - Within the segment, find `depth === 2` headings named "Objective", "Deliverables", "Success Criteria" (case-sensitive match against the source's own casing).
   - "Objective" must be followed by paragraph text before the next heading; "Deliverables" and "Success Criteria" must each be followed by a list before the next heading.
   - If any of the three is absent or has no content, throw the incomplete-Phase error named above, identifying the Phase by its heading text.
   - Otherwise, produce a `Phase` with the heading text as `name` (trimmed), the paragraph text as `objective`, and each list item's inline text as `deliverables` / `successCriteria` entries, in list order.
3. For the segment whose heading text is exactly "Future Roadmap", collect the following list's items (in order) into `FutureRoadmapItem[]`.
4. All other segments are skipped.
5. Phases are appended to the result array in the order their segments were encountered in the source (Requirement 3.4) — the algorithm never reorders or sorts.
6. Return `{ phases, futureRoadmapItems }`.

This is intentionally a thin AST walk, not a full markdown-to-HTML render — it only needs to recognize headings, paragraphs, and lists, which is exactly what `docs/ROADMAP.md`'s format uses.

### Phase_Status configuration

```ts
// src/content/phase-status.config.ts
import type { PhaseStatusConfig } from "@/lib/types";

/**
 * Keyed by the exact Phase.name string produced by the Roadmap_Parser
 * (e.g. "Phase 1 — Foundation"). docs/ROADMAP.md has no status field, so
 * this mapping is maintained by hand here, independent of the parsed prose.
 * A phase with no entry here renders with no status indicator (Requirement 4.6).
 */
export const phaseStatusConfig: PhaseStatusConfig = {
  "Phase 1 — Foundation": "Completed",
  "Phase 2 — CSS Core": "In Progress",
};
```

`getPhaseStatus(name, config = phaseStatusConfig)` in `src/lib/phase-status.ts` is a pure lookup (`config[name]`), kept as its own function so it can be unit-tested independently of the config's current contents.

**Note on Requirement 7.2 and this file:** Requirement 7.2 forbids hardcoding Phase *name, Objective, Deliverables, or Success_Criteria content*. `phase-status.config.ts` stores Phase **names** as lookup keys — this is the association mechanism the requirements themselves mandate (Phase_Status is defined as "configuration ... keyed by phase name"), not duplicated *display* prose. The build-time anti-hardcode check (below) is scoped accordingly: it allowlists exact Phase-name-only matches inside this one file, while still fully enforcing the check for Objective/Deliverables/Success_Criteria text everywhere, and for Phase names anywhere else in the codebase.

## Enforcing "No Hardcoded Roadmap Content" (Requirement 7)

Requirement 7.4 requires the build to fail if a hardcoded copy of Phase name/Objective/Deliverables/Success_Criteria text exists *alongside* the Roadmap_Content_Source file. This is enforced by a dedicated build-time script rather than relying on code review, because review is exactly what the requirement is guarding against forgetting.

`scripts/check-hardcoded-roadmap-content.ts`:

1. Reads `docs/ROADMAP.md` and runs it through the same `parseRoadmap` used at page-render time, producing the current `RoadmapData` (phases + their objective/deliverable/success-criteria strings).
2. Builds a set of "sensitive strings": every `Phase.name`, every `objective`, and every individual deliverable/success-criterion string, each trimmed and length-filtered (strings under 8 characters, e.g. a bare "CSS Reset" could coincidentally appear in unrelated prose — filtered to reduce false positives while still catching realistic copy-paste duplication) — excluding matches inside `src/content/phase-status.config.ts` (see note above; only bare Phase-name keys are permitted there).
3. Globs every `.ts`/`.tsx` file under `src/app/`, `src/components/`, and `src/content/` (excluding `phase-status.config.ts` and the `__tests__` directories), and searches each file's source text for occurrences of any sensitive string as a literal substring.
4. If any match is found, prints `Hardcoded roadmap content detected in <file>: "<matched text>" duplicates docs/ROADMAP.md content. Remove the hardcoded copy and source it from the Roadmap_Parser instead.` and exits with status `1`.
5. If no match is found, exits `0`.

This script is wired as the app's `prebuild` script in `package.json` (`"prebuild": "tsx scripts/check-hardcoded-roadmap-content.ts"`), which `yarn`/`npm` runs automatically and synchronously before `"build": "next build"` — a non-zero exit from `prebuild` aborts before `next build` ever starts, satisfying Requirement 7.4. Because the check re-parses the *current* `docs/ROADMAP.md` on every run (rather than a hardcoded string list of its own), Requirement 7.3 falls out for free: editing the source file changes both what pages render and what the checker looks for, with no Roadmap_Site code changes required.

This same script doubles as the mechanism that makes Requirement 7.1 enforceable rather than aspirational: since `PhaseCard`/`FutureRoadmapSection` only ever receive parsed data as props (never literal strings — see Components table above), the only way Phase prose could appear in `src/` source text at all is a future regression, which this check catches.

## Responsive Layout (Requirement 6)

Tailwind's default breakpoints are used directly, matching the Viewport_Breakpoint definitions exactly:

| Viewport_Breakpoint | Tailwind prefix | Range |
|---|---|---|
| Mobile | (unprefixed / base styles) | below 768px |
| Tablet | `md:` (768px) | 768px–1023px |
| Desktop | `lg:` (1024px) | 1024px and above |

- Base (mobile-first, unprefixed) styles lay out `PhaseCard`, `NavBar`, and Homepage sections as a single column (`flex flex-col` / block stacking) — Requirement 6.1 covers "below the Tablet breakpoint," which the mobile-first default already satisfies without a `sm:`/`md:` override needed for that particular rule.
- `PhaseCard`'s Deliverables and Success Criteria lists use `lg:grid lg:grid-cols-2 lg:gap-x-8` so the multi-column layout only activates at/above 1024px (Requirement 6.2); below that they render as a single stacked `<ul>`.
- All page containers use `max-w-screen-xl mx-auto px-4` (a bounded max width with fluid side padding, no fixed pixel widths and no unconstrained-width elements like un-wrapped `<pre>`/`<table>`), so content reflows rather than triggering horizontal scroll from 320px up through 2560px (Requirement 6.3). Long deliverable/success-criteria text wraps via default block-level text flow (no `whitespace-nowrap` anywhere in these components).

## Accessibility (Requirement 8)

- **Semantic HTML** (Requirement 8.1): `layout.tsx` renders `<nav aria-label="Primary">` (via `NavBar`) and `<main>` wrapping each page's `{children}`. Headings follow a strict hierarchy: page `<h1>` (platform name on Homepage; "Roadmap" on Roadmap_Page) → `PhaseCard`'s `<h2>` per phase name → `<h3>` for Objective/Deliverables/Success Criteria. `FutureRoadmapSection` is an `<aside>` with its own `<h2>`.
- **Status not conveyed by color alone** (Requirement 8.2): `StatusBadge` always renders an icon (emoji, marked `aria-hidden="true"` since it's decorative once text is present) *and* a visible text label ("Completed" / "In Progress" / "Planned") in the same element — color (`text-green-700`/`text-blue-700`/`text-gray-700`) is a supplementary cue only.
- **Alt text** (Requirement 8.3): the site has no non-decorative images in scope for Requirements 2 and 4 (Homepage/Roadmap content is text and lists). If a future logo or diagram image is added, this design requires an explicit `alt` prop with no default of `alt=""` permitted for non-decorative images; this is enforced by the shared `next/image` usage convention (ESLint's `jsx-a11y/alt-text` rule, enabled in the app's ESLint config) rather than a custom check, since it is a static, well-understood lint rule rather than a build-time content property.

Per the note in requirements.md, full WCAG conformance additionally requires manual testing with assistive technology; the above covers the automated, testable baseline only.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Most acceptance criteria in this feature describe either fixed, individually-authored content (Homepage copy, nav links) or browser-rendered visual layout (breakpoints, horizontal scroll, client-side navigation behavior), neither of which fits the "for all generated inputs" shape PBT requires — those are covered by unit/example tests and, where layout is concerned, visual/browser-based checks instead (see Testing Strategy). The clear PBT candidates are the pure functions whose correctness must hold across the full space of markdown documents and data shapes the site could ever encounter: the `Roadmap_Parser`, the Roadmap_Page's rendering of arbitrary `RoadmapData`, the `Phase_Status` lookup, and the hardcoded-content detector.

**Property reflection performed before writing the properties below:**
- AC 3.2 ("parser produces well-formed phases") and AC 3.4 ("parser preserves phase order") were combined into **Property 1**: testing that the full, ordered, well-formed `Phase` list is produced correctly already subsumes checking order in isolation — a separate order-only property would add no additional validation value.
- AC 4.1 ("renders every phase"), AC 4.2 ("renders each phase's full content"), and AC 4.3 ("renders phases in parser order") were combined into **Property 3**, for the same reason: a property asserting "the rendered output contains every phase's complete content, in the same order as the input list" makes each of the three narrower checks redundant on their own.
- AC 4.5 ("status shown when configured") and AC 4.6 ("no status shown when not configured") are the two branches of the same `getPhaseStatus` lookup function and were combined into **Property 4**, stated as a single property covering both outcomes rather than two separate properties that would only differ in which branch of the same function they exercise.
- AC 3.3 (Future_Roadmap_Item extraction) was kept as its own property (**Property 2**) rather than merged into Property 1, because it exercises a structurally distinct code path (a flat bullet list under one heading, not the four-subsection Phase structure) — merging would obscure rather than clarify what's being validated.
- AC 3.6 (malformed Phase detection) was kept separate (**Property 5**) from Property 1, since it is a negative/error-path property (asserting the parser *throws*) rather than a positive output-shape property, and combining error-path and happy-path assertions into one property would make failures harder to diagnose.
- AC 7.2 (no hardcoded roadmap content) was kept as its own property (**Property 6**) since it validates a different pure function (the detector) operating over a different input space (file source text + sensitive-string sets) than the parser or renderer properties.

### Property 1: Parsing produces a complete, ordered Phase list

For any well-formed Roadmap_Content_Source markdown document containing one or more Phase sections (each with a heading matching the Phase pattern, an Objective paragraph, a Deliverables list, and a Success Criteria list, appearing in any order and with any text/list-length content), `parseRoadmap` SHALL produce a `phases` array where each element's `name`, `objective`, `deliverables`, and `successCriteria` exactly match that Phase section's content, and the array's element order SHALL exactly match the order in which the corresponding Phase headings appear in the source document.

**Validates: Requirements 3.2, 3.4**

### Property 2: Future Roadmap items are extracted completely and in order

For any well-formed Roadmap_Content_Source markdown document containing a "Future Roadmap" heading followed by a bullet list of any length and content, `parseRoadmap` SHALL produce a `futureRoadmapItems` array whose elements exactly match the bullet list's items, in the same order as they appear in the source document.

**Validates: Requirements 3.3**

### Property 3: Roadmap_Page renders every phase's complete content in source order

For any `RoadmapData` value containing an arbitrary, non-empty list of `Phase` objects (each with arbitrary name, objective, and non-empty deliverables/successCriteria lists), rendering the Roadmap_Page's phase list SHALL produce output that contains, for every phase in the list, that phase's name, objective text, and every deliverables/success-criteria entry, and the rendered phases SHALL appear in the same order as the input `phases` array.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 4: Status indicator presence matches configuration exactly

For any Phase name and any `PhaseStatusConfig` mapping, rendering that Phase's card SHALL display a status indicator containing the configured status's text label if and only if the config contains an entry for that exact Phase name, and SHALL display no status indicator when the config contains no entry for that Phase name.

**Validates: Requirements 4.5, 4.6**

### Property 5: Malformed Phase sections are always rejected with an identifying error

For any markdown document containing at least one Phase-like heading where exactly one of its Objective, Deliverables, or Success Criteria subsections is missing or empty, `parseRoadmap` SHALL throw an error whose message contains that Phase's heading text, and SHALL NOT return a `phases` array.

**Validates: Requirements 3.6**

### Property 6: Hardcoded-content detection matches substring presence exactly

For any set of "sensitive strings" (of length 8 or greater) and any generated source file text, the hardcoded-content detector SHALL report that file as containing a violation if and only if at least one sensitive string appears as a literal substring of the file's text, and SHALL report no violation for that file otherwise — except when the file is the allowlisted `phase-status.config.ts` path, for which only bare Phase-name matches are permitted and Objective/Deliverables/Success_Criteria matches SHALL still be reported.

**Validates: Requirements 7.2**

## Error Handling

- **Missing Roadmap_Content_Source at build time** (Requirement 3.5): `roadmap-data.ts` checks file existence before reading; if absent, throws `` Roadmap content source not found. Expected file at: <resolvedAbsolutePath> ``. Because `app/roadmap/page.tsx` calls this at module scope during static generation, the thrown error propagates out of `next build`'s prerendering step and aborts the build with a non-zero exit code — no try/catch swallows it.
- **Incomplete Phase section** (Requirement 3.6): `roadmap-parser.ts` throws `` Roadmap parse error: Phase "<name>" is missing a required "<section>" section. `` synchronously during parsing, which — by the same module-scope call path — aborts the build.
- **Malformed markdown the parser cannot classify** (e.g. a `# Phase` heading with no recognizable name suffix, or list items with unexpected nested structure): treated as a segment that fails the Phase-pattern match in step 2 of the parser algorithm, and is silently skipped as "not a Phase section" rather than crashing — this avoids false-positive build failures on unrelated `#`-headings (e.g. `# Vision`) while still catching genuinely incomplete *recognized* Phase sections via the Property 5 error path.
- **Hardcoded content detected** (Requirement 7.4): `check-hardcoded-roadmap-content.ts` prints `` Hardcoded roadmap content detected in <file>: "<matched text>" duplicates docs/ROADMAP.md content. Remove the hardcoded copy and source it from the Roadmap_Parser instead. `` for every match found (not just the first) and exits `1`, which fails the `prebuild` step and prevents `next build` from starting.
- **Phase_Status config referencing a Phase name that no longer exists** (e.g. `docs/ROADMAP.md` renames or removes a phase): not an error — `getPhaseStatus` performs a simple key lookup; a stale config entry for a since-removed phase name is simply never looked up and has no effect. This is an intentional non-failure per Requirement 4.6's framing (absence of a matching entry, in either direction, just means no indicator).
- **Client-side navigation failure / JavaScript disabled**: not an application-level error case — `next/link` degrades to a standard `<a href>` automatically, and because both pages are statically rendered Server Components, the destination page's full markup is present in the server response regardless of JavaScript execution (Requirement 5.4).

## Testing Strategy

**Unit / example tests (Vitest):**
- Homepage: render `app/page.tsx`'s output (or the underlying content module) and assert the platform name, overview text, vision text, supported-platforms list, and a link to `/roadmap` are present (Requirements 2.1–2.5).
- Navigation: assert `NavBar`'s rendered output contains a link to `/` and a link to `/roadmap` on both pages (Requirements 5.1, 5.2).
- `roadmap-data.ts`: with the real `docs/ROADMAP.md`, assert `getRoadmapData()` reads and parses it successfully (Requirement 3.1); with a mocked missing-file path, assert it throws the exact "not found" message shape (Requirement 3.5).
- `FutureRoadmapSection`: assert its rendered items are inside an `<aside>` distinct from any `<PhaseCard>` container (Requirement 4.4).
- Semantic structure: assert both pages render exactly one `<h1>`, a `<nav>`, and a `<main>` (Requirement 8.1).
- `StatusBadge`: for each of the three `PhaseStatus` enum values, assert the rendered output contains the corresponding visible text label, not solely a color class (Requirement 8.2).
- `check-hardcoded-roadmap-content.ts`: an integration-style test that seeds a temporary fixture file containing a copy-pasted deliverable string, runs the script's core check function against it, and asserts it reports a violation and would exit non-zero (Requirement 7.4's build-failure behavior, building on Property 6 for the underlying detection logic).
- Import-graph guard: a unit test (or a small script run in CI) asserting no file under `apps/roadmap-site/` imports from `packages/` (Requirements 1.3, 1.4).

**Property tests (Vitest + `fast-check`, minimum 100 iterations each):**
- Each test implements exactly one property from the Correctness Properties section above, using `fast-check` arbitraries to generate: arbitrary well-formed Phase sections (varying phase count, deliverable/success-criteria counts, and text content) for Properties 1 and 3; arbitrary Future Roadmap bullet lists for Property 2; arbitrary `PhaseStatusConfig` maps and phase names for Property 4; documents with a randomly-omitted required subsection for Property 5; and arbitrary sensitive-string sets plus arbitrary source file text (including deliberately-constructed matches and non-matches) for Property 6.
- Tag format on each test: **Feature: roadmap-homepage-site, Property {number}: {property text}**, placed as a comment directly above the `fc.assert(fc.property(...))` block.
- Properties 1, 2, and 5 test `roadmap-parser.ts` directly as a pure function (markdown string in, `RoadmapData` out or throw) — no file I/O or Next.js rendering involved. Property 3 tests a pure rendering-to-text-content function (e.g. rendering `PhaseCard`/the phase list with `react-dom/server` and inspecting the resulting HTML string, or testing the presentational component in isolation) rather than a full page load, keeping iteration cost low. Property 4 tests `getPhaseStatus` directly. Property 6 tests the detector's core matching function directly.

**Out of scope for unit/property tests, covered elsewhere:**
- Client-side vs. full-page navigation behavior (Requirements 5.3, 5.4) and all viewport/layout behavior (Requirements 6.1–6.3) depend on real browser rendering and are not expressible as pure-function properties; these are covered by manual verification and, if introduced later, browser-based end-to-end or visual regression tooling — outside this design's automated unit/property test scope.
- Requirement 8.3 (alt text) has no applicable non-decorative images in this feature's current scope; it is guarded going forward by the `jsx-a11y/alt-text` ESLint rule rather than a test.

**CI wiring:** the app's `test` script runs both unit and property suites; `prebuild` (the hardcoded-content check) and `build` (`next build`, which itself fails on Requirements 3.5/3.6 per the Error Handling section) both run as part of the standard build pipeline, so a broken parser, a missing source file, or reintroduced hardcoded content all fail CI the same way a failed test would.
