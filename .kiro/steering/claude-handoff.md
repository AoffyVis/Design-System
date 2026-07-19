---
inclusion: always
---

# Claude Handoff Notes

Claude (Claude Code, running outside Kiro) has been working in this
repository alongside Kiro, reviewing Kiro's output and occasionally editing
files directly between Kiro sessions. Kiro has no visibility into that work
unless it reads this file, so **read this before continuing any task in
`design-system-platform`, `roadmap-homepage-site`, or `tokens-package`** —
some of what's below changes assumptions those specs' `design.md`/`tasks.md`
were written against.

This file is a durable index of out-of-band changes, not a session log.
For a full narrative history (including Kiro's own sessions), see
`docs/SESSION-SUMMARY.md`.

**New steering file: `.kiro/steering/definition-of-done.md` (`inclusion:
always`, so it's already loaded).** It turns `AGENTS.md`'s Definition of
Done into checkable rules, written against real gaps caught in this repo
(hardcoded token fallbacks, stale mirror docs, naming that drifted from
spec, "verified" claims that only re-read source instead of the built
artifact). Read it before marking any task `- [x]` — a task isn't done
just because the code looks right.

## QA Status

At-a-glance dashboard of Claude's review passes, kept current by
**overwriting**, not appending — unlike `docs/SESSION-SUMMARY.md`, which
is the permanent narrative record of *how* each result was reached (what
was checked, what broke, what was fixed). If a row here disagrees with
your own read of the code, trust the code and re-verify — this table can
go stale the moment someone edits a file after the listed review date.

| Area | Status | Last reviewed | Notes |
|------|--------|----------------|-------|
| `packages/tokens` | ✅ Pass | 2026-07-04 | Malformed-token silent-drop bug fixed; validator/resolver tests added; all 8 token categories present (87 tokens); `themes/dark.json` dark overrides added. |
| `packages/css-core` | ✅ Pass | 2026-07-05 | `2xl:` double-escape bug fixed; z-index/motion/dark-mode generators complete; components layer wired into the served CSS pipeline. Layout module (Session 27) reviewed: generator correct, responsive variants verified, one gap fixed (margin-auto utilities were missing — added, spec first). |
| `apps/roadmap-site` — `/demo` | ✅ Pass | 2026-07-18 | Rewritten from a hardcoded fake simulation to fully live; sitewide dark mode fixed; Components section added and verified. Rechecked 2026-07-05 for layout-class/Tailwind `!important` collisions after the Layout module landed — none (no `data-ds-live` element carries a Tailwind responsive prefix). Rechecked 2026-07-18: added live showcases for Table, Modal, Navigation, and Tabs with interactive tabs/modal state, then made the Table filter, sorting, and pagination functional with consumer-side state and ARIA updates; generated selectors confirmed in `dist/core.css`; roadmap-site lint, tests, and production build pass. |
| `apps/roadmap-site` — `/docs` | ✅ Pass | 2026-07-18 | Session 23 rewrite needed two fix rounds (wrong hex values, stale count, hardcoded-fallback, disconnected dark toggle). Sessions 25–29 (Dark/Light rework + Layout section) reviewed: one bug — Usage example referenced nonexistent `.mx-auto` and was semantically broken (`max-w-screen` can't center) — fixed. Rechecked 2026-07-18: added live documentation and usage examples for Table, Modal, Navigation, and Tabs; docs build, lint, tests, and TypeScript validation pass. |
| Dark theme (tokens + css-core + site wiring) | ✅ Pass | 2026-07-04 | Implemented end-to-end this session (was a stub before); verified live both directions on `/demo` and `/docs`. |
| Layout utilities (`layout.ts` + spec + `/docs` section) | ✅ Pass | 2026-07-05 | All 61 referenced classes verified against `dist/core.css`; flex/grid live demos verified via `getComputedStyle`; served CSS scoped correctly, zero unscoped leaks. Margin-auto family added by Claude (spec + generator + docs) after finding the gap. |
| Border utilities (`border.ts` + spec + `/docs` section) | ✅ Pass | 2026-07-05 | New this session (Phase 2 deliverable that was never actually implemented despite the phase being marked done — same "doc says done, code doesn't exist" pattern as the earlier surface/border color-token find). Spec written first, generator second, per this repo's Implementation Rule. All 18 referenced classes verified against `dist/core.css` and computed styles verified live (dark and light both round-trip correctly). Regression test added. |
| `.kiro/steering/definition-of-done.md` | 🟢 Active | 2026-07-05 | Kiro cites it and mostly follows it (Session 27's log greps `dist/core.css` per Rule 5 — good). But Session 29's doc example still referenced a class that doesn't exist (`.mx-auto`), so Rule 2/5 checking must extend to *code samples in docs*, not just live-rendered elements. |
| `packages/generator` + `packages/cli` (Milestone 5, Kiro Session 40) | ✅ Pass | 2026-07-18 | Two real bugs found and fixed by Claude. (1) Rule 3/5: `design.md` specifies `orchestrator.ts` owns the full parse→write pipeline and `index.ts` is a thin re-export — the code inverted this, leaving `orchestrator.ts`'s `orchestrate()` as dead code (never called anywhere in the repo) that would `ENOENT` if it ever ran, while the real, working pipeline was duplicated into `index.ts`. Fixed by moving the correct logic into `orchestrator.ts` and thinning `index.ts`; re-verified the CLI end-to-end afterward (identical output). (2) Rule 1: tasks.md task 13 ("write integration test... verify against independently-built artifacts") was marked `[x]` but zero test files existed under `packages/generator`/`packages/cli` — root `pnpm test` count was unchanged by the session despite the claim. Added `packages/generator/__tests__/integration.test.ts` (7 tests, 32→39 total), including a byte-identity check against `packages/css-core/dist/core.css`. Also fixed a reproducible bug in `docs/07-generator.md`'s own example command (`pnpm --filter @company/cli generate ...` breaks relative paths because pnpm changes cwd to the package dir) by adding a root `pnpm generate` script and updating the doc. ~~Noted, not fixed: nothing consumes the generator's unified `dist/` output yet~~ — **resolved by Kiro's Session 44**: `apps/roadmap-site`'s route handler now reads `dist/tokens.css` + `dist/core.css` + `dist/themes/*.css` instead of the per-package paths. See the dedicated row below for Claude's live verification of that switch. |
| `apps/roadmap-site` unified `dist/` wiring (Kiro Session 44) | ✅ Pass | 2026-07-18 | `design-system.css/route.ts` switched from `packages/tokens/dist` + `packages/css-core/dist` to the generator's unified `dist/tokens.css` + `dist/core.css` + every `dist/themes/*.css`. Verified live in both directions via `getComputedStyle` on `/demo` and `/docs`: OS-dark default renders `.card` at `#121212`, light toggle renders `#FFFFFF`, `/docs`' Banking theme button sets `--ds-color-primary-main: #004D40` correctly. `dist/themes/dark.css` confirmed to carry both color *and* shadow overrides (nothing lost moving out of the old inline-in-tokens.css format). Zero console errors, all CSS requests `200 OK`. No bugs found — first clean review pass in several rounds. |
| Table/Modal/Nav/Tabs components (Kiro Sessions 77–78) | ✅ Pass | 2026-07-18 | Generators reviewed line-by-line: all 42 new selectors verified present in `dist/core.css`, every `var(--ds-*)` reference confirmed to exist in `dist/tokens.css`, committed `dist/` byte-identical to a fresh rebuild, and Session 78's doc class inventory matches the built output exactly (0 phantom classes — a clear improvement over Session 65's README). All gates green: build ✅, test 75/75 ✅, lint ✅, `tsc --noEmit` ✅. **One real bug found — a Rule 6 (check consumers) miss, in a consumer outside Kiro's diff**: `apps/roadmap-site`'s `design-system.css/route.ts` `rewriteComponentSelectors` documented and relied on the contract "components layer has no descendant combinators and selector lists are single-line" — the new `table.ts` emits multi-line comma lists (`.table th,\n.table td {` ×3), whose first line the per-line regex left **unprefixed**, leaking `.table th` / `.table-bordered th` / `.table-compact th` rules (with forced `!important`) globally onto every page consuming the live CSS. Fixed by matching selector lists across newlines; verified live: served CSS now has 0 unprefixed component selectors, an injected `[data-ds-live] .table th` gets `padding: 12px 16px`, an unscoped `.table th` gets nothing, `/demo` renders normally, roadmap-site `tsc --noEmit` passes. No unit tests exist for the 4 new generators (test count remains 75 — this is still a coverage gap); `/demo` now has functional live demos and `/docs` now documents the new components with usage examples. |
| Responsive desktop/mobile support (Kiro Sessions 87–92) | ⚠️ Pass after Claude fix | 2026-07-19 | Kiro's static claims were all true (verified: `md:*` selectors exist in `dist/core.css`, survive the `/demo/design-system.css` pipeline correctly prefixed inside `@media`, desktop switches to `row`/`w-auto`, hamburger works with correct ARIA + Escape close). **But Kiro's own logs admit "Browser visual validation was not performed"** — and the browser is where the actual bug lived: at 375px, `/demo` scrolled horizontally to 941px and `/docs` to 539px. Cause: every `grid lg:grid-cols-2` section pairing a live example with a code sample used plain `<div>` grid items; grid items default `min-width: auto` (min-content), and the code samples' long unbreakable `<pre>` lines pushed that min-content past the page container (confirmed: a 522.8px grid track inside a 343px container), so the `pre`'s `overflow-x-auto` never engaged and the whole page scrolled sideways on mobile — the exact brokenness in the user's screenshots. Fixed by Claude: `min-w-0` on the grid items in all 4 affected grids (`ResponsivePatternsDocs.tsx`, `demo/page.tsx` ×2 grids, `AdvancedComponentsDemo.tsx` TabsDemo/ModalDemo roots). Re-verified live: both pages `scrollWidth === viewport` at 375px, desktop behavior unchanged at 1280px, hamburger re-tested. **Lesson for future rows: "all referenced selectors exist in the artifact" does not validate a responsive layout — page-level `scrollWidth <= viewport` at mobile width is the check that would have caught this, and it requires a browser.** |
| Site-wide `NavBar` mobile menu on `/demo` (user-reported) | ✅ Pass after Claude fix | 2026-07-19 | User reported the hamburger menu on `/demo` opens but its links can't be clicked, while `/docs` (same shared `NavBar.tsx`) works fine. Reproduced via `elementFromPoint`: every open-menu link's own center returned the hero `<h1>`, not the link. Root cause: `NavBar.tsx`'s `<nav>` uses `z-10`; `/demo/page.tsx`'s hero has its own inner `z-10` wrapper (legitimately needed to sit above the hero's own decorative circles) — same z-index ties resolve by DOM order, and the hero (later in the page) painted over the nav's dropdown. `/docs` has no competing `z-10` element, so it never showed the bug. Fixed by raising the nav to `z-20` — the systemic fix (nav must always outrank page content, not tie with it), not a one-page patch. Verified live: `elementFromPoint` now resolves to the real `<a>` for all 4 links, and a real click on "Docs" from the open `/demo` menu navigated to `/docs`. Desktop unaffected. |
| `examples/PLATFORM-TESTS.md` rewrite (Kiro Session 94) | ✅ Pass | 2026-07-19 | High-quality work overall, independently re-verified rather than trusting the log: `node --check` on all 3 JS blocks, `tsc --noEmit --strict` on the React component (0 errors), every `class=`/`className=` token across the doc cross-checked against `dist/core.css` (all real bar one), and a real throwaway `dotnet new mvc` build reproducing the exact C# files (build succeeded, confirming Kiro's own claim). VB.NET section's "not build-verified" disclosure is honest and cites a real source. **One real bug found**: the MVC Table's Previous/Next pagination used `<a class="page-btn ... disabled">` — `.disabled` doesn't exist anywhere in `dist/core.css` (only the pseudo-class `.page-btn:disabled`, which needs a real `disabled` attribute an `<a>` can't carry), so the boundary links rendered fully-enabled-looking with zero indication they're inert — inconsistent with the React/vanilla-JS versions in the same doc, which both correctly render a real `<button disabled>` there. Fixed to match (conditional real `<button disabled>` at the boundary); rebuilt the throwaway MVC project with the fix — still 0 Warnings/0 Errors. Server-side was already safe regardless (`Math.Clamp` on `page`), so this was a doc-accuracy bug, not a functional one. |
| Optional test coverage (Kiro Session 47 — parser/css-generator/build-pipeline/parse-args tests) | ✅ Pass | 2026-07-18 | 39 → 75 tests. Read every new test against the real implementation (not just re-run): all four files (`packages/tokens/__tests__/{parser,css-generator,build-pipeline}.test.ts`, `packages/cli/__tests__/parse-args.test.ts`) are genuine, matching actual error strings/defaults/behavior — no bugs found. One bookkeeping fix: `.kiro/specs/tokens-package/tasks.md` subtasks 2.3, 6.2, 6.3, 6.4 were still `[ ]` despite being fully satisfied by the new tests — checked off after verifying bullet-by-bullet against each task's own description. Left 2.2/3.2/3.3/7.2/7.3/8.2/8.3/10.2/10.4 correctly unchecked (each genuinely still missing — e.g. 2.2 wants a serialize-back round-trip property test, not the leaf-presence one that was written; 10.2/10.4 want fast-check-generated invalid inputs and a real success-path integration test, not the 4 fixed failure examples that exist). |
| `.github/workflows/ci.yml` (Milestone 6, Kiro Session 48) | ✅ Pass | 2026-07-18 | **The CI pipeline was actually broken as configured** — Claude ran the workflow's own commands locally rather than trusting the session log. `pnpm -r exec tsc --noEmit` (the Lint job's own type-check step) failed for two independent reasons: Session 47's `css-generator.test.ts` had `ResolvedToken` mocks missing the required `originalValue`/`path` fields (vitest doesn't type-check, so `pnpm test` never caught it — fixed via a `mkToken()` helper), and `packages/generator`/`packages/cli` (Session 40) were scaffolded without `@types/node`, unlike `tokens`/`css-core` (fixed — added the devDependency to both). Both fixed and reverified (`tsc --noEmit` exit 0 across all 4 packages). Every package's `pnpm pack` tarball was also missing `dist/` entirely (gitignored, no `files` field, no prepublish build) — fixed for all 4 packages (`files` + `prepublishOnly`, reverified via `pnpm pack`). **`packages/generator`/`packages/cli` additionally needed a real compile step** (user decision: add one, don't exclude them from publish) — added `tsup` to bundle each to `dist/*.js`. First bundle attempt silently left `@company/tokens`/`@company/css-core` as unresolved external imports (esbuild's default for package.json `dependencies`) — caught only by actually running the compiled bin under plain `node`, which threw `ERR_MODULE_NOT_FOUND`; fixed with `noExternal` to force-inline both. Re-verified: `node packages/cli/dist/ds-generate.js` runs standalone with no `tsx`, `pnpm pack` tarballs now contain only compiled JS. **`deploy-docs` disabled** (user decision, not a redesign) via `if: false` — confirmed via a real build that `/demo/design-system.css` is "ƒ Dynamic" (server-rendered), GitHub Pages has no Node runtime to run it, and `next.config.ts` has no `output: 'export'`; re-enabling needs either a static redesign of that route or a non-GitHub-Pages host. Bundle-size check (gzip < 100KB) verified fine (~14.5KB actual) — never a bug. **Kiro's Session 66** independently found (via a real GitHub PR check, not self-review) that `tsc --noEmit` still failed with TS2307 in CI, because `packages/generator/dist/` doesn't exist yet when the lint job runs (no `pnpm build` before it). Verified the fix is real: reproduced the failure locally by deleting both `dist/` dirs before running `tsc --noEmit`; confirmed the `paths` mapping Kiro added to `packages/cli/tsconfig.json` (`@company/generator` → `../generator/lib/index.ts`) genuinely fixes it standalone. But Session 66 *also* changed `packages/generator/package.json`'s public `types` field to `lib/index.ts` — unnecessary (the tsconfig fix alone was sufficient) and a real regression for external consumers, since `lib/` isn't in that package's `files: ["dist"]` — `pnpm pack` confirmed `lib/index.ts` isn't actually shipped. Reverted `types` to `dist/index.d.ts`; reverified both hold at once (CI scenario passes, `pnpm pack` shows `main`/`types` pointing at real shipped files). |
| `README.md` (Kiro Session 65) | ✅ Pass | 2026-07-18 | Freshly rewritten CDN usage guide had 4 real factual errors, all in the copy-paste "Usage Example" a user would run verbatim: `.text-heading-1`–`-4` don't exist (real: `.text-heading-h1`/`-h2` only, per `typography.json`'s `h1`/`h2` keys), `.text-body` doesn't exist (real: `.text-body-md`/`.text-body-sm`), `.max-w-screen-md` doesn't exist (real: just `.max-w-screen`), and `--ds-typography-heading-1-fontSize` was wrong on both name and case (real: `--ds-typography-heading-h1-font-size`). All four verified against real `dist/core.css`/`dist/tokens.css` and fixed. |
| Z-Index/Motion `/docs` sections (Kiro Sessions 36–38) | ✅ Pass | 2026-07-18 | Interactive rework reviewed: all 9 referenced `.z-*` classes verified in `dist/core.css`, `data-ds-live` compound rule followed throughout, stacking demo's live z-index values verified via `getComputedStyle` (0/1000/1100/1400/1600). Two fixes by Claude: easing hover demos animated with CSS keywords instead of the real `--ds-motion-easing-*` tokens (now `var()`-driven, exact token curves verified live), and `copy()` silently did nothing when the Clipboard API rejects — now shows a failure toast. Session 36's second handoff revert confirmed clean (Claude's own updates untouched). Note: clipboard-write success path can't be verified in the preview environment (permission denied at browser level) — failure path verified live instead. |
| Motion easing rename + dark shadow tokens (Kiro Sessions 33–35) | ✅ Pass | 2026-07-18 | Session 34's easing-key rename (`.ease-ease-*` → `.ease-*`) and dark shadow overrides both verified against `dist/` and live via `getComputedStyle`. One real bug found and fixed by Claude: the rename left `components.ts` + `docs/spec/components.md` referencing the deleted `--ds-motion-easing-ease-in-out`, silently degrading `.btn`/`.input` transitions to browser-default `ease`. New integration test now asserts every `var(--ds-*)` in `core.css` is defined in `tokens.css` (32 tests). Session 35's revert of Kiro's handoff edits confirmed clean — the underlying code fixes were kept, and this file's stale "Still open" entries were re-marked resolved by Claude (the file's owner). |
| Multi-theme (`packages/tokens/src/themes/{banking,corporate}.json` + `/docs` Themes section) | ✅ Pass | 2026-07-05 | Sessions 31–32 reviewed. Token files and generalized `build.ts` scan correct (verified `[data-theme="banking"/"corporate"/"dark"]` all present in `dist/tokens.css`). One real bug found and fixed: the `/docs` page's new 4-button theme switcher and the pre-existing hero dark-mode toggle wrote the same `data-theme` attribute from two independent, unsynchronized pieces of state — selecting Banking then clicking the unrelated dark-mode toggle silently discarded it with no feedback. Unified into one `activeTheme` state + `applyTheme()`, and added an active-theme highlight to the switcher so the current theme is always visibly indicated. Verified live via `getComputedStyle` + screenshots, not just source reading. |
| `packages/css-core` `@layer` order (components vs. utilities precedence) | ✅ Pass after Claude fix | 2026-07-19 | Foundational bug, present since the initial commit (`caae6ba`), not a later-session regression. `assembler.ts` declared `@layer reset, base, utilities, components, theme;` — `utilities` before `components`. Per the CSS cascade-layers spec, a later-declared layer always wins over an earlier one at equal specificity, regardless of media query or source order — so `.btn`'s `display: inline-flex` (`components`) permanently beat `.md\:hidden`'s `display: none` (`utilities`) at every viewport width. Surfaced via live testing of a restructured `DS-SYS-TEST_UI/html/index.html` (an external consumer project): the `md:hidden` hamburger button never hid at desktop width. **Blast radius is sitewide, not one selector**: any utility class combined with any component class, for any overlapping property, silently loses — inverting the entire premise of utility-first overrides. Fixed by swapping the order to `reset, base, components, utilities, theme` in `assembler.ts` (declaration + section-assembly order), updating the one test that asserted the old order (`packages/css-core/__tests__/integration.test.ts`) and two doc mentions (`docs/08-build.md`). Verified 3 ways: rebuilt `dist/core.css` (components now precedes utilities in the file), `pnpm test` 75/75 still pass, and a live browser check confirmed `#nav-toggle`'s computed `display` is `none` at 1280px (was `flex` before). This fix has since merged to `master` (PR #4, `69b265e`) and the jsdelivr CDN cache was purged to match. |
| `packages/css-core` base text color (`generators/base.ts`) | ✅ Pass after Claude fix | 2026-07-19 | Second foundational bug found the same way as the `@layer` order issue: live dark-mode testing, not a static check. `generateBase()`'s `:root` rule set `font-family`/`font-size`/`line-height` but **never set `color`** — and no other generator, light or dark theme, set one either. Components like `.card` explicitly set their own `color: var(--ds-color-surface-contrast)`, so text inside them always looked fine; but any plain heading/paragraph with no such wrapper silently inherited the browser's hardcoded black default. Harmless-looking in light mode (black-on-white), completely unreadable in dark mode (`getComputedStyle` returned `rgb(0, 0, 0)` on a `#121212` background). Fixed by adding `color: var(--ds-color-surface-contrast);` to the `:root` rule — the same token every component already uses, so it resolves correctly in both themes with no new special-casing. Verified: `pnpm build`/`test` (75/75)/`lint` all clean, and a live scratch-HTML check confirmed a bare `<h1>`/`<p>` now computes to `#E6E1E5` on `#121212` in dark mode and `#1A1A1A` on white in light mode — exact token matches. **Not yet on `master`/CDN** — only committed locally on `features/dev` at time of writing. |

**When you (Claude) finish a recheck:** update the relevant row(s) above
— don't just add a new `docs/SESSION-SUMMARY.md` entry and leave this
table pointing at a stale date. If a review finds a new area not yet
listed here, add a row for it.

## Do not revert these

- **`apps/roadmap-site/package.json` has no `prebuild` script anymore.**
  The hardcoded-roadmap-content check
  (`scripts/check-hardcoded-roadmap-content.ts`) is now chained directly
  into `build`: `"build": "tsx scripts/check-hardcoded-roadmap-content.ts && next build --turbopack"`.
  Reason: pnpm 8 does not auto-run custom `pre*` npm lifecycle scripts by
  default (no `enable-pre-post-scripts` config in this repo), so the old
  `prebuild` script silently never ran — `pnpm build` built the site even
  with hardcoded roadmap content present. Don't reintroduce a separate
  `prebuild` entry; keep the check chained into `build` (or add
  `enable-pre-post-scripts=true` to a root `.npmrc` if a separate script is
  preferred later — that wasn't done here to avoid a repo-wide behavior
  change for one package).

- **There is only one session-summary file: `docs/SESSION-SUMMARY.md`.**
  A duplicate `/SESSION-SUMMARY.md` briefly existed at the repository root
  (created by Claude before `docs/SESSION-SUMMARY.md` and its `agentStop`
  hook existed) and has been deleted, with its content folded into
  `docs/SESSION-SUMMARY.md`. Keep using `docs/SESSION-SUMMARY.md` as the
  single canonical log.

- **`.kiro/specs/design-system-platform/requirements.md` Requirement 17**
  requires a `packageManager` field pinned to the installed pnpm version
  plus a separate `pnpm-workspace.yaml` — not npm's `workspaces` field in
  `package.json` (pnpm doesn't read that field). The current root
  `package.json` still carries a leftover, unused `"workspaces": [...]`
  key alongside the (correct, actually-used) `pnpm-workspace.yaml` — safe
  to remove that key as cleanup, it does nothing under pnpm.

## `packages/tokens` — bug fixed, tests added

- Added `packages/tokens/__tests__/validator.test.ts` (13 tests) and
  `packages/tokens/__tests__/resolver.test.ts` (7 tests, including a
  `fast-check` property test). `vitest` and `fast-check` were added as
  explicit `packages/tokens` devDependencies (they previously only
  resolved via pnpm's ancestor-`node_modules` PATH lookup to the workspace
  root — don't remove them as "unused", the test suite needs them declared
  locally).
- Marked `.kiro/specs/tokens-package/tasks.md` subtasks **3.4, 5.2, 5.3**
  complete to match — the rest of the `[ ]*` optional subtasks (parser and
  generator property/unit tests) are still genuinely not implemented.
- **Fixed a real correctness bug found while writing the missing-value /
  missing-type tests**: `parser.ts`'s `walkTree` and `validator.ts`'s
  `flattenTree` both used an `isRawToken` gate requiring *both* `value`
  and `type` to be present before treating a node as a token leaf. A token
  missing just one of those two fields (e.g. `{"type": "color"}` with no
  `value`) was silently misclassified as an empty branch node and dropped
  during parsing — before `validateTokens` ever ran. Net effect: a broken
  token definition produced **no error and no output**, silently
  vanishing instead of failing the build. Fixed in both files by widening
  the leaf-detection check to fire on `value` **or** `type` being present
  (see `looksLikeAttemptedLeaf` in `parser.ts`). Verified via the new
  tests and by re-running `pnpm build` (still generates the same 47 tokens
  from the existing well-formed MVP source files — no regression).
- **Known, intentionally-unfixed limitation**: the `duplicate-identifier`
  validation rule can never fire through the real
  `parseTokenFiles` → `validateTokens` pipeline, because both JS object
  literals and `JSON.parse` silently collapse duplicate keys to the
  last-written value before a `RawTokenTree` object exists at all. Fixing
  this would require detecting duplicates during JSON parsing itself
  (e.g. a custom parser), not in the validator. Documented as a comment in
  `validator.test.ts`. If this gets picked up, it's a `parser.ts` change,
  not a `validator.ts` change.

## The 5 remaining token categories are done — don't redo them

The user asked to add the 5 token categories `packages/tokens/src/` was
still missing (radius, shadow, breakpoint, z-index, motion) before moving
on to `packages/css-core`. Claude cannot drive Kiro headlessly (no
tool/integration between them), so the user had Claude implement this
directly instead of waiting for a Kiro session. **This is done — do not
recreate these files or treat this as still-pending work:**

- `packages/tokens/src/radius.json` — `radius.{none,sm,md,lg,xl,2xl,full}`
- `packages/tokens/src/shadow.json` — `shadow.{none,sm,md,lg,xl,2xl,inner}`
- `packages/tokens/src/breakpoint.json` — `breakpoint.{sm,md,lg,xl,2xl}`
- `packages/tokens/src/zIndex.json` — `zIndex.{hide,base,dropdown,sticky,fixed,overlay,modal,popover,tooltip}`
- `packages/tokens/src/motion.json` — `motion.duration.{instant,fast,normal,slow,slower}` + `motion.easing.{linear,easeIn,easeOut,easeInOut}`

Four of these five (`radius.json`, `shadow.json`, `breakpoint.json`,
`zIndex.json`) were actually authored by a Kiro session that ran in
parallel with this conversation — Claude found them already present and
reviewed them rather than overwriting them.

**One was fixed**: the animation category was originally created as
`packages/tokens/src/animation.json` with top-level key `"animation"`.
Every spec document (`docs/04-design-token.md`, `docs/spec/design-tokens.md`,
`docs/spec/naming.md`, `ARCHITECTURE.md`) documents this category as
**`motion`**, not `animation` (e.g. `motion.duration.short`,
`--ds-motion-duration-fast`). Claude renamed the file to `motion.json` and
changed the top-level key to `"motion"` to match the documented spec —
`animation.json` no longer exists. If any other in-progress Kiro work
references `animation.*` token identifiers, update it to `motion.*`.

Verified: `pnpm build` now generates 84 tokens (up from 47) into
`dist/tokens.css` / `.json` / `.d.ts`, all with correct `--ds-` prefixed
kebab-case names (spot-checked `--ds-motion-duration-fast`,
`--ds-radius-2xl`, `--ds-z-index-modal`, etc.). `pnpm test` (20 tests) and
`pnpm run lint` (Link_Validator) both still pass at the workspace root.

## `packages/css-core` — done, two bugs/gaps fixed

Kiro completed all 13 tasks of the `css-core-package` spec (token parser,
reset/base/utility generators, responsive variants, dark mode,
accessibility, print, layer assembler, build entry point). Claude reviewed
it directly (`pnpm build`/`test`/`lint`, plus reading every generator) and
made two follow-up fixes:

- **Fixed a real bug**: `lib/generators/responsive.ts` double-escaped the
  digit-leading `2xl` breakpoint prefix — `` `\\\\32xl\\:` `` in the
  source produced the literal string `\\32xl\:` in generated CSS. A
  double backslash in CSS is an escaped literal backslash character, not
  a hex escape, so **every `2xl:*` responsive utility class was
  permanently unmatchable** against any real `class="2xl:p-4"` element —
  a dead breakpoint tier that all 7 original tests missed because they
  only checked `sm:`/`md:` (which don't need digit-escaping). Fixed to
  the correct single-hex-escape form `\32xl\:` (same convention Tailwind
  CSS uses for its own `2xl:` prefix) and added a regression test in
  `__tests__/integration.test.ts` asserting the correct form is present
  and the double-backslash form is absent. **Don't revert this fix or
  "simplify" the escape back to a template literal with 4 backslashes —
  that's the bug, not a formatting choice.**

- **Closed the `zIndex`/`motion` gap** — `lib/token-parser.ts` originally
  only recognized 6 of the 8 token categories `@company/tokens` produces.
  Claude extended `TokenMap` with `zIndex: Map<string, string>` and
  `motion: { duration: Map<string,string>; easing: Map<string,string> }`,
  added matching parse branches (including a `motion` sub-parser splitting
  on the `duration-`/`easing-` prefix), and added two new generators:
  `lib/generators/z-index.ts` (`.z-{key} { z-index: var(--ds-z-index-{key}); }`)
  and `lib/generators/motion.ts` (`.duration-{key}` /
  `.ease-{key}` → `transition-duration` / `transition-timing-function`),
  wired into `assembler.ts`'s utilities array. All 18 previously-invisible
  tokens now produce utility classes; verified in `dist/core.css` and
  covered by 2 new tests in `__tests__/integration.test.ts` (10 tests
  total now, up from 7). The `.ease-ease-in` doubled-name cosmetic quirk
  originally noted here was later resolved by renaming the token keys —
  see the strikethrough entry under "Still open" for the full story,
  including the stale-consumer bug the rename initially shipped with.

## `apps/roadmap-site/demo` — was a fake simulation, now renders real output

The user reported this page looked unattractive and wasn't genuinely
interactive. Root cause: it never loaded any generated CSS — `globals.css`
only imports Tailwind. The "Interactive Playground" ran typed class names
through a hardcoded ~30-entry lookup table (`CLASS_TO_STYLE_MAP`) instead
of applying real classes; the Token Explorer swatches used hardcoded hex/
px/shadow values duplicated from (and able to drift from) the actual
tokens; `TYPOGRAPHY_SAMPLES` referenced `.text-heading-h3` and
`.text-body-lg`, neither of which exist in `typography.json` — those rows
silently rendered unstyled.

**Fixed to render against the real, currently-built pipeline output —
visually verified working (screenshots + `getComputedStyle` checks), not
just wired up:**

- `src/app/demo/design-system.css/route.ts` (Route Handler) reads
  `packages/tokens/dist/tokens.css` + `packages/css-core/dist/core.css`
  from the monorepo at request time. `tokens.css` is served unscoped and
  unmodified (its `--ds-*` custom property names can't collide with
  anything). From `core.css` it extracts **only the `@layer utilities`
  block** (same bounded regex the integration test already uses to isolate
  that section) and rewrites every selector to a compound form —
  `.p-4` → `[data-ds-live].p-4` — via `rewriteSelectors()`, then forces
  every declaration to `!important` via `forceImportant()` as defense in
  depth. Loaded via a `<link>` in `src/app/demo/layout.tsx` (only on
  `/demo`).
- **`@scope` and `@layer`-based isolation were tried first and both
  failed — don't reintroduce either as the primary mechanism.** core.css's
  utility class names intentionally collide with Tailwind's own, and some
  token values genuinely differ from Tailwind's defaults (e.g. `radius.md`
  is 0.25rem vs Tailwind's default 0.375rem), so *something* has to
  guarantee our rule wins on `[data-ds-live]` elements. First attempt:
  wrap core.css in `@scope ([data-ds-live])` nested inside a fresh
  `@layer ds-live-preview` — should work per spec (a later-declared layer
  beats an earlier one), but empirically Tailwind still won. Root-caused
  with an isolated test (inject a fresh, minimal `@scope` rule with
  nothing else involved): it **silently failed to match** in this
  environment's preview browser (Chrome 148 in an Electron shell) —
  `@scope` doesn't work here at all, despite `CSSScopeRule` existing as a
  JS interface. Current approach (compound-selector specificity, no
  `@scope`) was verified to actually work via `getComputedStyle` on the
  live page, not just by inspecting the served CSS text — the earlier
  version of this note claimed success from `curl`/static checks alone,
  which turned out to be insufficient to catch this.
- `page.tsx` rewritten: the Playground preview element gets `data-ds-live`
  + `className={playgroundInput}` directly — whatever the user types is
  genuinely rendered, not matched against an allowlist (confirmed by typing
  a novel, non-preset class combo and screenshotting the result). Token
  Explorer color/radius/shadow swatches apply real utility classes;
  spacing swatches size via `var(--ds-spacing-N)` directly.
  `CLASS_TO_STYLE_MAP` and `classesToInlineStyle` are gone.
  `TYPOGRAPHY_TOKENS` now only lists the 4 typography tokens that actually
  exist.
- Added `.claude/launch.json` (none existed before) so `pnpm --dir
  apps/roadmap-site dev` can be started via the preview tooling.
- If a stale `next dev` process/lock blocks starting the dev server
  (`.next/dev/lock` referencing a dead PID), that's leftover state from a
  previous session, not something to preserve — kill the process and
  delete the lock (or the whole `.next/` directory) rather than working
  around it.

## Dark mode is now class-driven, site-wide — don't revert this

The user reported light/dark mode "doesn't work" (the demo page's toggle
button did nothing). Root cause was **not** demo-specific: Tailwind v4
defaults `dark:` to a `prefers-color-scheme` media query, not a `.dark`
class — that's a Tailwind v3 default set via `darkMode: "class"` in
`tailwind.config.js`, and this project has no such config file (v4 is
CSS-first config). So `dark:` utilities across the *entire site* only
ever reflected the OS setting; the demo's toggle
(`classList.toggle("dark", ...)`) was a no-op everywhere, not a demo bug.

Three things had to change together — **all three are required, don't
remove one thinking it's redundant**:

1. `globals.css` has `@custom-variant dark (&:where(.dark, .dark *));`
   — makes `dark:` respond to a `.dark` class on `<html>` or an ancestor.
2. `layout.tsx` has a `next/script` (`strategy="beforeInteractive"`,
   **not** a raw JSX `<script>` — React doesn't execute those itself, it
   throws a console error) that sets `.dark` on `<html>` from
   `window.matchMedia("(prefers-color-scheme: dark)")` before first paint,
   so pages with no manual toggle (Home, Roadmap) still default to
   matching the OS theme now that it's class-driven instead of automatic.
   `<html>` also has `suppressHydrationWarning` — expected, since the
   script makes the client differ from the server-rendered class on
   purpose (server can't know OS preference); this is the same pattern
   Next's own dark-mode docs use, not a real hydration bug.
3. **`globals.css` had the original `create-next-app` boilerplate still
   in it** (a `:root { --background/--foreground }` pair driven by
   `@media (prefers-color-scheme: dark)`, plus a plain, *unlayered*
   `body { background: var(--background); ... }` rule) — left over from
   before `<body>` in `layout.tsx` got real Tailwind classes for this
   (`bg-white dark:bg-zinc-950`). Being unlayered, that old rule
   *unconditionally* beat Tailwind's layered `dark:` utility (unlayered
   author rules always win over layered ones, regardless of the class
   toggle) — this was the part that made the toggle appear completely
   broken even after (1) and (2). It also hardcoded
   `font-family: Arial, Helvetica, sans-serif`, silently overriding the
   Geist font the whole time. **Removed.** If `globals.css` ever grows a
   new top-level `body { ... }` or `:root { ... }` rule again outside a
   Tailwind `@layer`, check whether it's shadowing `<body>`'s Tailwind
   classes the same way before assuming it's harmless.

Also fixed `demo/page.tsx`'s `darkMode` state, which hardcoded
`useState(true)` (didn't reflect actual DOM state on mount, mislabeling
the toggle button on first render) — now syncs from
`document.documentElement.classList.contains("dark")` in a `useEffect`.

**Verified visually, not just by reading the CSS**: toggled light→dark→
light on the live page via the Claude_Preview tool and screenshotted each
state — nav, hero, and body sections all correctly re-theme.

## `apps/roadmap-site/demo` also now has real usage examples

Added two sections the user asked for after the "make it real" pass
above: **"📦 How to Use This"** (install/link-tag/CSS-variable code
samples, with a live-rendered button under the step-2 sample) and
**"🔧 Real-World Example"** (a notification list + an action bar,
composed from real classes with source shown underneath each). The old
"Component Showcase" section is renamed **"Concept Cards"** with an
honest subtitle — it's Tailwind-only site chrome, not a design-system
demo, unlike its old "composed entirely from utility classes" claim.

**If extending these sections, remember the compound-selector rule from
the fix above**: `data-ds-live` must be on the *exact same element* as
every real class, not an ancestor wrapping several styled children.
This was gotten wrong once while building the Real-World Example section
(outer wrapper had `data-ds-live`, inner `bg-success`/`p-4`/etc. divs
didn't) and caught before shipping — worth double-checking any new
composed example against this.

**Also**: `design-system.css/route.ts`'s `extractUtilitiesLayer()` used to
be hardcoded to stop at the literal `@layer theme`, which broke silently
(leaked 4 unscoped global rules) the moment the `components` layer got
inserted between `utilities` and `theme` — see the "Still open" entry
below on the components layer for the details. It's fixed now to match
`@layer \w+` generically, so it survives future layers being added in
that position too. If core.css's layer order ever changes again, re-check
this route handler still extracts only what it means to.

## Still open (not yet acted on by anyone)

- `packages/tokens`'s remaining optional test subtasks (parser round-trip
  property test 2.2/2.3, all three generator test subtasks 6.2–6.4,
  7.2–7.3, 8.2–8.3, and build-pipeline tests 10.2/10.4) are unimplemented.
  There are also no tests yet for the 5 new token category files beyond
  what the existing validator/resolver unit tests already exercise
  structurally.
- `.kiro/specs/tokens-package/tasks.md` task 1.3 still literally says
  "color, typography, spacing" — it wasn't reworded when the other 5
  categories were added, since none of this was tracked as numbered
  subtasks. Worth a pass if the task list is meant to stay authoritative.
  **Update 2026-07-18: resolved by Kiro's Session 34** — task 1.3 now
  lists all 8 categories.
- No decision has been made yet on whether/when to build out
  `packages/generator` or `packages/cli` per `ARCHITECTURE.md`'s
  repository layout.
- ~~The `.ease-*` easing utility classes have a doubled-up name~~ —
  **resolved by Kiro's Session 34** (user-directed): `motion.json` easing
  keys renamed to `in`/`out`/`inOut` (`linear` unchanged), so the
  generated classes are now the natural `.ease-in`/`.ease-out`/
  `.ease-in-out`/`.ease-linear` and the vars are
  `--ds-motion-easing-{in,out,in-out,linear}`. The `/docs` Motion
  section's naming-quirk warning was removed accordingly. **But the
  rename shipped with a Rule 6 violation Claude caught on review
  (2026-07-18)**: `packages/css-core/lib/generators/components.ts` (and
  its mirror `docs/spec/components.md`) still referenced the old
  `--ds-motion-easing-ease-in-out` on `.btn` and `.input` — an undefined
  custom property, so both silently fell back to the browser-default
  `ease` timing function with zero build/test errors. Fixed by Claude
  (both files), and mechanized as a new integration test asserting every
  `var(--ds-*)` in `core.css` is actually defined in `tokens.css` — so
  the whole "renamed token, stale consumer" bug class now fails the test
  suite instead of shipping.
- ~~`.card`/`.input` reference two tokens that don't exist~~ — **resolved.**
  `surface` (`main`, `contrast`) and `border` (`main`) were added as real
  color tokens to `packages/tokens/src/color.json` (option (a) from the
  two choices this note used to list) — `surface` was already anticipated
  as a worked example in `docs/spec/design-tokens.md` and
  `docs/04-design-token.md` from before the Component Layer existed, so
  this was filling in a token the docs already assumed, not introducing
  an unplanned one. `components.ts` and `docs/spec/components.md` no
  longer use the two-argument `var(name, fallback)` form on `.card`/
  `.card-header`/`.card-footer`/`.input` — they reference
  `--ds-color-surface-main`, `--ds-color-surface-contrast`, and
  `--ds-color-border-main` directly, with zero hardcoded fallback values.
  Rebuilt both packages (`tokens` now emits 87 tokens, up from 84) and
  verified: `pnpm test` (30/30), `pnpm build`, `pnpm run lint` all pass;
  confirmed via `curl` against the live dev server that the served CSS
  and `/demo` both reflect the fix without a restart.
- ~~Dark mode does not actually work at the token/theme layer~~ —
  **resolved, see "Dark theme is now real" below.**

## Dark theme is now real (was a stub before)

`packages/css-core/lib/generators/dark-mode.ts` used to emit two empty
rule bodies — no `--ds-color-*` custom property was ever redefined for
dark mode, so every component and utility kept its light-mode color
regardless of the `.dark` class. Verified live before the fix:
`getComputedStyle` on `.card` returned `background-color: rgb(255, 255,
255)` even with `.dark` on `<html>`. Found while adding the demo page's
Components section (see below).

**What changed:**

- New `packages/tokens/src/themes/dark.json` — color-only overrides for
  all 8 color groups (`primary`, `secondary`, `error`, `warning`,
  `success`, `info`, `surface`, `border`), following docs/06-theme.md's
  documented Light/Dark Structure. Deliberately placed in `src/themes/`,
  not `src/` directly (unlike that doc's `color.dark.json` diagram) —
  `parseTokenFiles` in `packages/tokens/lib/parser.ts` merges *every*
  `.json` file it finds directly in `srcDir` into one shared tree, so a
  same-directory dark override file would have silently corrupted the
  light values instead of producing a separate override set.
  `readdirSync` doesn't recurse, so a subdirectory is invisible to that
  scan by construction — no special-casing needed, just placement.
- `packages/tokens/lib/build.ts` now has a Step 4b: if
  `src/themes/dark.json` exists, parse+validate+resolve it as its own
  independent graph (new exported `parseTokenFile` in `parser.ts`, reused
  by the existing multi-file scan too) and append a
  `[data-theme="dark"] { --ds-color-*: ...; }` block to `dist/tokens.css`
  via a new `generateThemeCSS` export in `generators/css.ts`. This is
  where the real values now live — not in `packages/css-core`.
- `packages/css-core/lib/generators/dark-mode.ts` was simplified to match
  — it no longer claims to own color values (it never should have; colors
  are `packages/tokens`'s job everywhere else in this pipeline). It now
  only emits the optional `@media (prefers-color-scheme: dark)`
  auto-fallback shell, documented as intentionally not populated (see the
  comment in that file for why: custom properties don't inherit across
  unrelated selectors, so a genuine no-JS auto dark mode needs the values
  duplicated under that selector too — not done, since
  `apps/roadmap-site` doesn't rely on it, it sets `data-theme` explicitly).
- **`apps/roadmap-site`'s dark toggle (`layout.tsx`'s beforeInteractive
  script, and `demo/page.tsx`'s `toggleDarkMode`) now sets/clears
  `data-theme="dark"` on `<html>` alongside the existing `.dark` class
  toggle.** These are two independent mechanisms with two different
  owners — `.dark` is Tailwind's (this site's own page chrome), `[data-
  theme]` is the design system spec's own (docs/05-css-spec.md,
  docs/06-theme.md) — and nothing unifies them automatically. Both must
  be set by hand at every toggle site. If a new toggle is added anywhere
  else in this app, it needs to set both too, or the design system's own
  colors won't respond even though the page chrome will.
- Also fixed a real, pre-existing, repo-wide naming inconsistency found
  while picking dark-mode surface values: `docs/06-theme.md`'s examples
  used `--ds-color-surface-on` / a JSON `"on"` key in five places, but the
  actually-implemented convention (`color.json`, every other doc, every
  generator) is `surface.contrast` / `--ds-color-surface-contrast` — the
  same `contrast` suffix `primary`/`secondary`/`error`/etc. all use.
  Fixed all five occurrences in `docs/06-theme.md` to `contrast`.

**Color choices** (documented in `src/themes/dark.json`'s own
`$description` field, not just here): `surface` and `primary` dark values
are copied verbatim from `docs/06-theme.md`'s own worked example
(`#121212` / `#90CAF9`) — the least-arbitrary source available. The other
four semantic colors (`secondary`, `error`, `warning`, `success`, `info`)
use the equivalent Material Design 200-tone tint, for the same reason
primary does (this palette is already Material-derived; `#1565C0` etc.
are literal MD swatch values). Every `*-contrast` token in dark mode is a
single `#1A1A1A` (matches the existing light-mode `surface.contrast`) —
one deliberate choice, not six independent ones, since every dark `*-main`
is now a light pastel and near-black text is legible against all of them.
`border.main` uses Material's standard dark-theme divider opacity
(`rgba(255,255,255,0.12)`) rather than a hex color.

**Not done, left as an intentional gap, not silently skipped:**

- ~~Shadow tokens have no dark-mode adjustment yet~~ — **resolved by
  Kiro's Session 34**: `src/themes/dark.json` now overrides all 7 shadow
  tokens with higher-opacity rgba values (Material dark-theme
  convention). Claude verified 2026-07-18: all 7 `--ds-shadow-*`
  redefinitions present under `[data-theme="dark"]` in `dist/tokens.css`,
  and live-verified `--ds-shadow-md` flips `rgba(0,0,0,0.1)` →
  `rgba(0,0,0,0.4)` on theme switch via `getComputedStyle`.
- No automatic (OS-preference, no-JS) dark mode — see the comment in
  `dark-mode.ts`. Explicit `data-theme="dark"` (set via JS, as
  `apps/roadmap-site` does) is fully supported.
- The full multi-theme file architecture `docs/06-theme.md` describes
  (arbitrary brand themes like the doc's "Banking" example,
  `dist/themes/*.css` per-theme output files) was not built — only the
  `dark` theme, since that's what was actually broken. The mechanism
  (`build.ts`'s Step 4b) generalizes to more themes fairly directly if
  that's wanted later, but wasn't extended speculatively.

**Verified:** `pnpm build`, `pnpm test` (30/30), `tsc --noEmit` on
`apps/roadmap-site`, `pnpm run lint` all pass. Live-verified with
`getComputedStyle` before/after on `.card`/`.btn-primary`/`.card-header`,
and screenshots of the toggle round-tripping both directions (dark → the
new Components section renders with the pastel dark palette on a `#121212`
card; light → back to the original light values) — see
`docs/SESSION-SUMMARY.md` for the full verification trail.

## `/docs` page — two real bugs fixed after Kiro's Session 23 rewrite

`apps/roadmap-site/src/app/docs/page.tsx` (Kiro's own comprehensive
10-section rewrite) is good work overall — the spacing/z-index/motion/
typography data arrays were all hand-checked against
`packages/tokens/dist/tokens.css` and were byte-accurate. Two things
weren't, fixed by Claude — **read this before editing this page again,
so these don't get reintroduced:**

- The `COLORS` array's `surface.contrast`/`border.main` hex values were
  wrong (`#1C1B1F`/`rgba(0,0,0,0.12)` instead of the real
  `#1A1A1A`/`#E0E0E0`) — traceable to `docs/06-theme.md`'s old
  illustrative example value, not the actual token source. **When
  displaying "the real generated output," read `packages/tokens/dist/
  tokens.css` (or `dist/tokens.json`), never a docs example or a value
  typed from memory** — this is exactly what
  `.kiro/steering/definition-of-done.md` Rule 5 is about.
- The Shadows section reintroduced `var(--ds-color-surface-main, #fff)`
  — a two-argument hardcoded fallback, the pattern Rule 2 forbids — one
  session after this same page's earlier version explicitly logged
  checking Rule 2. Don't add a fallback value to a `var()` call for a
  token you can confirm exists; if you're not sure it exists, check
  `dist/tokens.css`, don't hedge with a fallback.
- The page had its own page-local "Preview: Dark" toggle
  (`previewDark` state) that was disconnected from the site's real,
  already-working sitewide dark mode (`.dark` class + `data-theme`
  attribute on `<html>`, toggled identically on `/demo` — see
  "Dark theme is now real" above). It only affected one of ten sections
  and a dedicated "Dark / Light Mode" comparison used two permanently-
  visible hardcoded-color mock panels whose "dark" colors didn't match
  the real dark theme at all. **Don't invent a new dark-mode mechanism
  on any page — reuse the exact `darkMode`/`toggleDarkMode` pattern
  already in `demo/page.tsx` verbatim.** Dark mode is sitewide by
  design: once `data-theme="dark"` is set on `<html>`, every
  `data-ds-live` element anywhere already responds automatically — no
  page-local wiring should be needed at all.

## Demo page now shows the Component Layer live

`apps/roadmap-site/src/app/demo/page.tsx` has a new "🧩 Components"
section (Buttons, Badges, Alerts, Card, Input) rendering the real
`.btn`/`.badge`/`.alert`/`.card`/`.input` classes via `data-ds-live`, the
same live-CSS mechanism the rest of the page uses. This required a fix in
`apps/roadmap-site/src/app/demo/design-system.css/route.ts`: it previously
only ever served the `utilities` layer — the `components` layer was never
extracted or served at all, so no component class rendered anything
before this. `extractUtilitiesLayer` was generalized into
`extractLayer(coreCss, layerName)` (usable for any layer), and a new
`rewriteComponentSelectors` handles the components layer's richer
selector grammar (pseudo-classes, comma-separated lists like
`.btn:disabled, .btn-disabled`) that the utilities-only
`rewriteUtilitySelectors` (renamed from `rewriteSelectors`) can't parse.
Verified via `getComputedStyle` and screenshots — buttons/badges/alerts
render correctly. The Card/Input's white-in-dark-mode look noticed at the
time was the dark theme gap described above ("Dark theme is now real") —
fixed in the same session immediately after, not left open. Also
corrected the hero section's stale `84 Design Tokens` to `87` (was never
updated after the surface/border tokens were added).

## Credit Usage Summary

> **Read before presenting this section externally.** Every number below
> is a **rough, self-reported estimate**, not a real billing figure. Kiro
> generates its own estimates each session ("based on typical Claude model
> pricing and observed conversation length/tool-call patterns" — see
> `docs/SESSION-SUMMARY.md`'s per-session disclaimers); neither Kiro nor
> Claude Code exposes exact per-session token or credit consumption
> through any tool available in this repo. Treat this as a **directional
> shape of the spend**, not an invoice. Before using these numbers in a
> POC cost-investment presentation, verify the topline total against the
> actual Kiro account billing/usage dashboard and, for the Claude Code
> side, against a real `/cost` reading (see "Kiro Credits vs Claude Code"
> below) — do not present estimate-derived figures as measured spend
> without that check.
>
> The tables below are built by taking each Kiro session's own
> self-reported `Input tokens` / `Output tokens` / `Estimated cost` from
> `docs/SESSION-SUMMARY.md` and, in "Cost by Work Type," further splitting
> each session across activities using that session's own "Time Spent"
> table as the allocation key. That second split introduces additional
> rounding — the per-category totals in this section land a few percent
> off Kiro's own headline cumulative total (see the note under that
> table). Nothing here is independently verified against real billing.

### Per-Session Breakdown

All figures are Kiro's own self-reported per-session estimates (Kiro
sessions only; Claude Code sessions have no equivalent self-reported
numbers — see "Kiro Credits vs Claude Code").

| # | Session | Focus | Input (est.) | Output (est.) | Cost (est.) |
|---|---------|-------|--------------|----------------|-------------|
| 1 | 2 Jul — initial | 2 spec sets (req/design/tasks) + roadmap-site MVP + doc link fixes | ~450K | ~175K | ~$4.00 |
| 2 | 2 Jul (cont.) | yarn→pnpm migration, dep fixes, UI redesign pass | ~120K | ~50K | ~$1.10 |
| 3 | 2 Jul (final) | Q&A (Kiro/Claude Desktop/MCP) | ~15K | ~3K | ~$0.09 |
| 4 | 2 Jul | roadmap-site fixes/UI + design-system-platform tasks 1–6 | ~350K | ~120K | ~$2.85 |
| 5 | 2 Jul (closing) | Q&A (context window explanation) | ~8K | ~2K | ~$0.05 |
| 6 | 3 Jul | design-system-platform tasks 8–15 (docs + Link_Validator) | ~250K | ~80K | ~$1.95 |
| 7 | 3 Jul (Q&A) | Q&A (session summary explanation) | ~12K | ~3K | ~$0.08 |
| 8 | 3 Jul (Q&A cont.) | Q&A (implementation readiness) | ~10K | ~2K | ~$0.06 |
| 9 | 3 Jul | `tokens-package` full MVP (spec + implementation) | ~300K | ~100K | ~$2.40 |
| 10 | 3 Jul (handoff) | Handoff to Claude Code PMO | ~5K | ~1K | ~$0.03 |
| 11 | 3 Jul (PMO check) | Investigate Claude Code's changes | ~8K | ~2K | ~$0.05 |
| 12 | 3 Jul (review) | Review Claude Code's PMO work, summarize | ~15K | ~4K | ~$0.11 |
| 13 | 3 Jul (verify) | Pre-work verification (build/test/lint) | ~12K | ~4K | ~$0.10 |
| — | **Kiro cumulative (per `docs/SESSION-SUMMARY.md`)** | | **~1,505K** | **~546K** | **~$12.78** |

### Cost by Work Type

Each session above is split across work-type categories using that
session's own internal "Time Spent" activity table as the allocation key,
then rounded. Category definitions:

- **Planning & Specification** — writing/authoring `requirements.md`,
  `design.md`, `tasks.md`, and numbered `docs/*.md` files.
- **Implementation** — writing production code (parser, validator,
  resolver, generators, UI components, pages).
- **Bug Fixes & Tooling** — dependency/migration issues, package-manager
  config, build tooling.
- **Review, QA & Support** — checkpoints, verification runs, reviewing
  another agent's work, and pure Q&A turns with no file changes.

| Work Type | Input (est.) | Output (est.) | Cost (est.) | Share |
|---|---|---|---|---|
| Planning & Specification | ~555K | ~199K | ~$4.65 | ~36% |
| Implementation | ~574K | ~206K | ~$4.81 | ~37% |
| Bug Fixes & Tooling | ~172K | ~66K | ~$1.49 | ~12% |
| Review, QA & Support | ~256K | ~77K | ~$1.93 | ~15% |
| **Sum of categories** | **~1,557K** | **~548K** | **~$12.88** | 100% |

The category sum (~$12.88) doesn't exactly match Kiro's own headline
cumulative (~$12.78, per-session table above) — that's expected, since
this table re-derives sub-session splits from each session's own rounded
"Time Spent" minutes rather than from exact token counts. Use the
per-session table above for the topline number; use this table only for
the *shape* of where the spend went.

**Read of the shape**: roughly three-quarters of estimated spend
(Planning + Implementation, ~73%) went to producing specs and code;
Review/QA/Support (~15%) is the overhead of two agents checking each
other's work, which is structurally higher on this project than a
single-agent workflow would incur, precisely because both Kiro and Claude
Code were operating on the same repo.

### Kiro Credits vs Claude Code

| | Kiro | Claude Code (this agent) |
|---|---|---|
| Self-reported usage estimates | Yes — every Kiro session in `docs/SESSION-SUMMARY.md` includes a self-reported `Input/Output tokens` and `Estimated cost` table | **None.** No tool available to Claude Code in this environment exposes token counts, credit usage, or cost for its own sessions — confirmed directly with the user earlier in this engagement, which is why `docs/SESSION-SUMMARY.md`'s Claude-authored entries are work logs with no numbers attached |
| Cumulative estimate | ~$12.78 (~1,505K in / ~546K out), per Kiro's own running total | Not available |
| How to get a real number | Kiro account billing / usage dashboard (outside this repo) | Run `/cost` inside an **interactive** Claude Code session (not available in this non-interactive session), or check the Claude Console usage dashboard for this workspace |

**Before presenting a "Kiro vs Claude Code" cost comparison to anyone**,
get the real Claude Code figure via one of the two methods above and
replace the "Not available" cell — do not substitute a guessed number.
Given the volume of work Claude Code did in this engagement (multiple
full-repository reviews, ~40 file reads/greps per review pass, a parser/
validator bug fix with 20 new tests, and this document), it is very
unlikely to be free of meaningful cost — omitting it or treating it as
zero would understate total POC spend.
