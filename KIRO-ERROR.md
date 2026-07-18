# Kiro Error Log — Defects Found During Claude's Review Passes

This document compiles every defect Claude found in Kiro's work while acting
as reviewing lead across this POC, sourced from `.kiro/steering/claude-handoff.md`
(the QA index) and `docs/SESSION-SUMMARY.md` (the full narrative log). It exists
to support a POC retrospective — it is **not** a judgment of Kiro as a tool,
but a factual record of what shipped wrong, how it was caught, and what that
implies about the review process this POC required.

**Scope note:** every item below is something Kiro produced that was
factually incorrect, silently broken, or claimed-done-but-wasn't — verified
by Claude against the actual generated CSS artifact, running commands, or a
live browser, not by reading source and assuming it worked. Items Claude
flagged as open architectural decisions (not bugs) and had the user decide
are marked separately.

---

## Summary by category

| Category | Count | Examples |
|---|---|---|
| Silent data/behavior loss (no error, wrong output) | 6 | malformed-token drop, `2xl:` dead breakpoint, dark mode never worked, dark theme stub, clipboard failure silent |
| False "done" claims (doc/task says complete, code isn't) | 5 | border utilities, generator integration tests, generator/CLI compile step, CI lint gate, task 1.3 wording |
| Stale references after a rename/change (Rule 6 misses) | 3 | motion easing rename, table.ts multi-line selector vs. route.ts regex, generator `types` field regression |
| Factual/copy-paste errors in user-facing docs | 4 | README class names ×4, `/docs` wrong hex values, theme-doc naming (`surface.on` vs `surface.contrast`), generator doc's own example command doesn't run |
| Validation gap — claims not checked against a live browser | 2 (spanning 6 sessions) | `/demo` hardcoded fake simulation; responsive mobile overflow across Sessions 87–92 |
| Packaging / CI correctness | 3 | missing `dist/` in published tarball, `@types/node` missing breaking `tsc`, unresolved externals in compiled CLI bin |
| Reverted/self-corrected before shipping | 1 | Rule 2 fallback reintroduced then caught same review pass |
| Missed by Kiro, only caught by the user actually using the site | 1 | `/demo` mobile hamburger menu unclickable (z-index tie) |
| Inconsistent behavior across platform examples in the same doc | 1 | ASP.NET MVC pagination used a fabricated `.disabled` class instead of a real `disabled` attribute, unlike the React/JS versions in the same file |
| Foundational architecture bug, present since initial commit, sitewide blast radius | 1 | `@layer` order put `utilities` before `components` — every utility-vs-component CSS conflict silently lost, everywhere, since day one |

**Total distinct defects: ~29**, across roughly 94 Kiro session log entries.

---

## Detailed log (chronological)

### 1. Malformed-token silent drop (`packages/tokens`)
- **What happened:** `parser.ts`'s `walkTree` and `validator.ts`'s `flattenTree` required *both* `value` and `type` present before treating a node as a token leaf. A token missing just one field (e.g. `{"type": "color"}` with no `value`) was silently misclassified as an empty branch and dropped — before validation ever ran.
- **Impact:** a broken token definition produced **no error and no output** — it just vanished from the build.
- **Fixed by:** Claude, widened the leaf-detection check to fire on `value` **or** `type` (`looksLikeAttemptedLeaf`), added tests.

### 2. `2xl:` responsive breakpoint permanently dead (`packages/css-core`)
- **What happened:** `lib/generators/responsive.ts` emitted a double-escaped selector (`\\32xl\:` in source → literal `\\32xl\:` in generated CSS). A double backslash in CSS is an escaped literal backslash, not the intended hex escape.
- **Impact:** every `2xl:*` utility class was unmatchable against any real `class="2xl:p-4"` element — a dead breakpoint tier. All 7 existing tests missed it because none tested `2xl:` specifically.
- **Fixed by:** Claude, corrected to single-hex-escape form, added a regression test asserting the double-backslash form is absent.

### 3. `zIndex`/`motion` categories invisible in generated CSS (`packages/css-core`)
- **What happened:** `token-parser.ts` only recognized 6 of the 8 token categories `@company/tokens` produces.
- **Impact:** 18 valid tokens (z-index, motion duration/easing) produced zero utility classes — present in tokens, unusable in CSS.
- **Fixed by:** Claude, extended `TokenMap` and added `z-index.ts`/`motion.ts` generators.

### 4. `/demo` page was an entirely fake simulation
- **What happened:** the page never loaded any generated CSS. The "Interactive Playground" ran typed class names through a hardcoded ~30-entry lookup table instead of applying real classes; the Token Explorer swatches used hardcoded hex/px/shadow values that could silently drift from the real tokens; `TYPOGRAPHY_SAMPLES` referenced `.text-heading-h3` and `.text-body-lg` — **neither exists** — those rows rendered unstyled with no indication anything was wrong.
- **Impact:** the flagship demo of the whole design system was not actually demonstrating the design system.
- **Fixed by:** Claude, rewrote to serve and render real `dist/` output; verified with `getComputedStyle` and screenshots, not just source reading.

### 5. Dark mode did not work anywhere on the site (3 compounding root causes)
- **What happened:** (a) Tailwind v4 defaults `dark:` to an OS-preference media query, not a class — no config existed to switch it; (b) leftover `create-next-app` boilerplate CSS (`body { background: var(--background) }`, unlayered) unconditionally beat Tailwind's layered `dark:` utilities regardless of any class toggle, and also silently overrode the intended font with `Arial, Helvetica`; (c) the demo page's toggle button state was hardcoded `useState(true)`, not synced to actual DOM state on mount.
- **Impact:** the dark-mode toggle was a complete no-op site-wide, not a demo-specific bug — cosmetic on the surface but structurally broken underneath.
- **Fixed by:** Claude, all three parts together; verified by toggling and screenshotting both directions.

### 6. Dark **theme** (design-system color values) was a stub, separate bug from #5
- **What happened:** `packages/css-core/lib/generators/dark-mode.ts` emitted two empty rule bodies — no `--ds-color-*` was ever redefined for dark mode.
- **Impact:** even after #5 was fixed, every component kept its light-mode color under `.dark` — confirmed via `getComputedStyle` returning `rgb(255,255,255)` on `.card` while `.dark` was active.
- **Fixed by:** Claude, implemented `packages/tokens/src/themes/dark.json` and the real override pipeline end-to-end.

### 7. `docs/06-theme.md` itself had the wrong token name
- **What happened:** the spec doc used `--ds-color-surface-on` / a `"on"` JSON key in five places; the actual implemented convention everywhere else is `surface.contrast`.
- **Impact:** a spec document, not just code, was internally inconsistent with itself and could mislead any future implementer.
- **Fixed by:** Claude, corrected all five occurrences.

### 8. `/docs` rewrite (Session 23) — wrong color values shown as "real"
- **What happened:** the `COLORS` array's `surface.contrast`/`border.main` hex values were wrong (traceable to a doc's old illustrative example, not the real generated token file).
- **Impact:** the page claimed to show real generated output but showed values that didn't match `dist/tokens.css`.
- **Fixed by:** Claude, corrected against the actual built artifact.

### 9. `/docs` rewrite (Session 23) — Rule 2 violation reintroduced same page, one session after being fixed
- **What happened:** the Shadows section used `var(--ds-color-surface-main, #fff)` — a hardcoded two-argument fallback — which this exact page had already been corrected to avoid one session earlier.
- **Impact:** demonstrates the fix wasn't retained as a habit/rule, only as a one-off patch.
- **Fixed by:** Claude.

### 10. `/docs` rewrite (Session 23) — disconnected, duplicate dark-mode mechanism
- **What happened:** the page built its own page-local `previewDark` toggle, independent from the site's real dark-mode mechanism, affecting only 1 of 10 sections; a dedicated comparison panel used hardcoded mock colors that didn't match the real dark theme at all.
- **Fixed by:** Claude, removed the duplicate mechanism, reused the sitewide toggle.

### 11. Layout section (Session 29) — doc example referenced a nonexistent class and was semantically broken
- **What happened:** usage example used `.mx-auto` (didn't exist at the time) on an element that couldn't be centered that way regardless (`max-w-screen`).
- **Fixed by:** Claude — also added the missing margin-auto utility family since the gap was real, not just a doc typo.

### 12. Border utilities — "done" in docs, not implemented in code
- **What happened:** a Phase 2 deliverable was marked complete in project docs while the generator code for it didn't exist at all — same pattern as an earlier surface/border color-token gap.
- **Impact:** anyone trusting the phase-status doc would believe border utilities shipped when they hadn't.
- **Fixed by:** Claude, implemented spec-first per the repo's own Implementation Rule.

### 13. Multi-theme `/docs` — two unsynchronized state variables silently discarding each other
- **What happened:** the new 4-way theme switcher and the pre-existing dark-mode toggle both wrote `data-theme` from independent React state with no coordination — selecting Banking then clicking the unrelated dark toggle silently discarded the Banking selection with no user feedback.
- **Fixed by:** Claude, unified into one `activeTheme` state.

### 14. Motion easing rename shipped with a stale consumer (Rule 6 miss)
- **What happened:** `motion.json`'s easing keys were renamed, but `packages/css-core/lib/generators/components.ts` (and its doc mirror) still referenced the deleted `--ds-motion-easing-ease-in-out`.
- **Impact:** `.btn`/`.input` transitions **silently fell back to the browser-default `ease` timing** — zero build or test errors, a purely visual regression nobody would notice without checking computed styles.
- **Fixed by:** Claude, plus a new integration test asserting every `var(--ds-*)` in `core.css` is actually defined in `tokens.css` — turning this entire bug class into a hard test failure going forward.

### 15. Z-Index/Motion docs — cosmetic-looking bugs with real behavioral impact
- **What happened:** easing hover demos were animated with CSS keywords (`ease-in-out`) instead of the actual `--ds-motion-easing-*` token values (so the demo didn't represent the real curve); `copy()` did nothing when the Clipboard API rejected, with zero user feedback.
- **Fixed by:** Claude, made demos token-driven, added a failure toast.

### 16. Generator package (Milestone 5) — dead orchestrator, inverted architecture
- **What happened:** `design.md` specified `orchestrator.ts` owns the full parse→write pipeline with `index.ts` as a thin re-export. The shipped code inverted this: `orchestrator.ts`'s `orchestrate()` was **never called anywhere in the repo** and would throw `ENOENT` if it ever ran (didn't write `tokens.css` before a later step needed it); the real, working logic was duplicated directly into `index.ts` instead.
- **Fixed by:** Claude, moved the correct logic to `orchestrator.ts`, thinned `index.ts`, verified identical CLI output before/after.

### 17. Generator package — task marked done with zero corresponding tests
- **What happened:** `tasks.md` task 13 ("write integration test… verify against independently-built artifacts") was checked off `[x]`, but no test files existed under `packages/generator` or `packages/cli` — the root test count hadn't moved.
- **Fixed by:** Claude, wrote the actual 7-test integration suite the task claimed already existed.

### 18. Generator doc's own documented example command doesn't run
- **What happened:** `docs/07-generator.md`'s invocation example (`pnpm --filter @company/cli generate --tokens packages/tokens/src ...`) fails with `ENOENT` because pnpm changes cwd to the package directory before running, breaking the relative path — reproduced directly, not assumed.
- **Fixed by:** Claude, added a working root-level `pnpm generate` script and corrected the doc.

### 19. CI/CD pipeline (Milestone 6) — the lint gate was actually broken, not just untested
- **What happened:** the CI workflow's own `tsc --noEmit` step (never actually run by Kiro before claiming completion) failed for two independent reasons: (a) a test file's mocks were missing required fields — invisible to `pnpm test` because vitest doesn't type-check; (b) two packages were scaffolded without `@types/node`.
- **Impact:** the CI pipeline being reviewed as "done" would have failed on its very first real run.
- **Fixed by:** Claude, fixed both root causes, reverified `tsc --noEmit` exit 0 across all 4 packages.

### 20. Every package's publish tarball was missing `dist/` entirely
- **What happened:** no `files` field, no prepublish build step, and `dist/` was gitignored — `pnpm pack` proved the shipped tarball contained only raw source and test files.
- **Impact:** any consumer installing these packages from a real registry would get an unusable package.
- **Fixed by:** Claude, added `files` + `prepublishOnly` to all 4 packages, reverified via `pnpm pack`.

### 21. Generator/CLI had no compiled JavaScript at all
- **What happened:** flagged to the user as a real gap (not silently patched) — these packages had never had a build step producing `dist/*.js`, meaning a plain `node` consumer couldn't run them without `tsx`/`ts-node`.
- **First fix attempt also had a bug:** the initial `tsup` bundle left `@company/tokens`/`@company/css-core` as unresolved external imports (esbuild's default), causing `ERR_MODULE_NOT_FOUND` — caught only by actually executing the compiled bin under plain `node`, not by trusting the build succeeding.
- **Fixed by:** Claude, added `noExternal` to force-inline both dependencies; reverified standalone execution.

### 22. `deploy-docs` CI job targeted a host that cannot run it
- **What happened:** the job uploaded a Next.js server build straight to GitHub Pages, which only serves static files. `/demo/design-system.css` is a genuine dynamic server route (confirmed via `next build` output) and `next.config.ts` has no static-export config — this job could never have worked as configured.
- **Fixed by:** disabled (user decision) with a documented reason, not silently deleted.

### 23. Session 66's CI fix shipped its own regression
- **What happened:** while genuinely fixing a real `tsc --noEmit` CI failure (verified real via reproduction), the same change also pointed `packages/generator/package.json`'s public `types` field at raw source (`lib/index.ts`) — unnecessary (the tsconfig path mapping alone was sufficient) and broken for real external consumers, since `lib/` isn't included in that package's `files: ["dist"]`.
- **Fixed by:** Claude, reverted `types` to `dist/index.d.ts`, verified both the CI scenario and the packed-tarball correctness hold simultaneously.

### 24. README rewrite (Session 65) — 4 factual errors in the copy-paste usage example
- **What happened:** the example a user would copy verbatim referenced `.text-heading-1` through `-4` (real: only `.text-heading-h1`/`-h2` exist), `.text-body` (real: `.text-body-md`/`.text-body-sm`), `.max-w-screen-md` (real: just `.max-w-screen`), and a CSS variable name with the wrong name *and* wrong case.
- **Impact:** copy-pasting the README's own example would silently produce unstyled elements.
- **Fixed by:** Claude, all four verified against real `dist/core.css`/`dist/tokens.css` and corrected.

### 25. Table/Modal/Nav/Tabs components (Sessions 77–78) — new component broke an existing consumer outside the diff
- **What happened:** the new `table.ts` generator emitted multi-line comma-separated selectors (`.table th,` on one line, `.table td {` on the next). `apps/roadmap-site`'s live-CSS route handler's selector-rewriting regex assumed single-line selector lists (true for every component that existed before this), and silently left the first line of each multi-line selector **unprefixed and un-sandboxed**.
- **Impact:** `.table th`, `.table-bordered th`, `.table-compact th` rules — with `!important` forced by the same pipeline — leaked out of the intended `[data-ds-live]` sandbox onto **every page on the site** consuming the live CSS, not just pages using tables.
- **Fixed by:** Claude, matched selector lists across newlines; verified live in the browser that the leak was closed (0 unprefixed selectors served) without breaking the intended styling.

### 26. Responsive mobile support (Sessions 87–92) — three sessions of claims never checked in a real browser
- **What happened:** Kiro's own session logs for Sessions 90 and 92 state directly: *"Browser visual validation was not performed because no browser/live preview tool was available in this session."* Every validation performed instead was static: grepping selectors out of generated CSS, running builds/tests/lint/type-check.
- **Impact:** the actual defect — a real, user-visible page-breaking bug — could not be caught by any of those checks, because it only existed at render time. At a 375px mobile viewport, `/demo` scrolled horizontally to **941px** and `/docs` to 539px. Root cause: every `grid lg:grid-cols-2` section pairing a live example with a code sample used plain `<div>` grid items, which default to `min-width: auto`; the code samples' long unbreakable `<pre>` lines set that min-content width far past the page container, and the whole page scrolled sideways as a result — exactly the breakage the user reported and screenshotted.
- **How it surfaced:** not through any of Kiro's three rounds of "validation" — through the user manually opening the site and reporting it broken.
- **Fixed by:** Claude, added `min-w-0` to the affected grid items across 3 files/4 grids; verified live in a real browser at both 375px and 1280px (`scrollWidth === viewport` at mobile, correct responsive behavior retained at desktop).

### 27. `/demo` mobile hamburger menu unclickable — never caught by Kiro, only by the user actually using the site
- **What happened:** the site-wide `NavBar.tsx` uses `sticky top-0 z-10` for the nav. `/demo/page.tsx`'s hero section has its own inner wrapper needing `z-10` to sit above its own decorative background circles. Both ended up as top-level stacking contexts at the *same* z-index; CSS resolves ties by DOM order, and the hero section (later in the page) painted over the nav's open mobile dropdown menu — silently, with the menu still looking fully open and rendered. `/docs` has no competing `z-10` element, so the same shared component never showed the bug there.
- **Impact:** every link in the mobile navigation menu on `/demo` was unclickable — `document.elementFromPoint()` at each link's own center returned the hero `<h1>`, not the link. This is the kind of bug that is invisible to any static check (build, test, lint, type-check, even a screenshot) and only surfaces when a real click lands in the wrong place.
- **How it surfaced:** the user opened `/demo` on a phone-sized viewport and reported the menu didn't work — this was never flagged by Kiro across any of its responsive-focused sessions (including the very sessions specifically about mobile/desktop responsive support), and was not something Claude's own earlier review of those sessions had tested either (that review checked page-level horizontal overflow, not click-through inside an open dropdown).
- **Fixed by:** Claude, raised the nav's z-index to `z-20` — a systemic fix (the site-wide nav should always outrank in-page content, not tie with it) rather than a `/demo`-only patch. Verified live: a real `computer` click on "Docs" from the open `/demo` menu navigated to `/docs`; desktop unaffected.

### 28. `examples/PLATFORM-TESTS.md` (Session 94) — ASP.NET MVC pagination used a class that doesn't exist, inconsistent with the same doc's own other platforms
- **What happened:** the newly-written ASP.NET Core MVC section's Table pagination rendered Previous/Next as `<a class="page-btn @(Model.Page == 1 ? "disabled" : "")">`. `dist/core.css` only defines `.page-btn:disabled` — a pseudo-class matching a real `disabled` attribute on an actual form control — there is no `.disabled` class anywhere in the generated CSS, and an `<a>` element can't carry the `disabled` HTML attribute at all.
- **Impact:** the boundary Previous/Next links would render fully enabled-looking with zero visual indication they're inert — silently inconsistent with the React and vanilla-JS versions in the very same document, both of which correctly use a real `<button disabled>` for this exact state. Server-side was already safe regardless (`UsersController.Index` clamps `page` via `Math.Clamp`), so this was a documentation/consistency bug, not a functional one — but it would have shipped as an incorrect usage example for anyone copying the MVC section verbatim.
- **How it surfaced:** a class-by-class cross-check of every `class=`/`className=` token in the document against `dist/core.css`, done independently rather than trusting Kiro's own claimed verification (which included a real `dotnet build` of the C# code — confirmed genuine by reproducing it independently — but evidently didn't cross-check every class token against the CSS artifact for this specific spot).
- **Fixed by:** Claude, changed the boundary case to a real `<button class="page-btn" type="button" disabled aria-disabled="true">`, matching the other two platform implementations exactly; rebuilt the throwaway MVC project with the fix — still 0 Warnings/0 Errors.

### 29. `@layer` order (`packages/css-core/lib/assembler.ts`) — utilities couldn't override components, sitewide, since the initial commit
- **What happened:** the layer declaration was `@layer reset, base, utilities, components, theme;` — `utilities` declared *before* `components`. Per the CSS cascade-layers spec, when two rules tie on specificity, the layer declared **later** always wins, regardless of media query truth or source order within the file. `.btn { display: inline-flex; ... }` lives in `components` (later); any responsive/override utility class sharing a property with a component class — `.md\:hidden { display: none }`, or in principle any `.p-*`/`.bg-*`/etc. against `.card`/`.input`/`.nav`/etc. — silently lost, every time, at every viewport.
- **Impact:** this is the highest-severity item in this log by blast radius. It isn't one broken selector; it's a structural inversion of the entire utility-first premise the framework is built on (utilities exist specifically *to* override component defaults). It shipped in the very first commit (`caae6ba`) and survived every subsequent session and every prior Claude review pass — nothing in the existing test suite or any prior manual check happened to combine a component class with a same-property utility class on the same element in a way that would have surfaced it.
- **How it surfaced:** the user restructured an external test project (`DS-SYS-TEST_UI/html/index.html`) into a realistic dashboard layout and, during live verification at desktop width, the `<button class="btn ... md:hidden">` hamburger menu never disappeared. Traced via `getComputedStyle` (`display: flex` when it should have been `none`) directly to the layer declaration order — not something any of the static checks (build/test/lint/`tsc --noEmit`) in this project would ever catch, since none of them evaluate cascade-layer precedence.
- **Fixed by:** Claude, swapped the order to `reset, base, components, utilities, theme` in `assembler.ts` (declaration string + section-assembly order/comments), updated the one test asserting the old order and two doc mentions. Verified three ways: rebuilt `dist/core.css` (byte order now correct), full test suite 75/75 still green, and a live browser check confirming `#nav-toggle`'s computed `display` flips to `none` at 1280px post-fix. Not yet merged to `master`/CDN at time of writing — fixed locally on `features/dev` only.

---

## Recurring failure patterns (useful for the POC retrospective)

1. **"Doc/task says done, code doesn't exist."** Seen at least 3 times independently (border utilities, generator integration tests, generator/CLI compiled output) — a task checkbox or session log claim was not backed by grepping the actual artifact or running the actual test count.
2. **Stale references after a rename or new addition (Rule 6 — check consumers).** Seen at least 3 times (motion easing rename, generator `types` field, table.ts breaking the demo route) — changes were validated in isolation but not against everything that depended on the old shape.
3. **Validation claims backed by source-reading or static checks, not live behavior.** This is the single most expensive pattern in the log — it's directly responsible for the `/demo` fake-simulation issue, the dark-mode-never-worked issue, the entire Sessions 87–92 mobile-overflow saga (3 sessions' worth of "passed" claims that never opened a browser), and the `/demo` hamburger-menu click-through bug (#27) — a defect class (z-index stacking, click hit-testing) that no build/test/lint/type-check pass can ever catch, only an actual pointer interacting with an actual rendered page.
4. **Silent degradation with zero errors.** Malformed tokens, the `2xl:` breakpoint, the motion easing fallback, the clipboard failure, and the MVC pagination `.disabled` class (#28) all have one thing in common: nothing crashed, nothing logged, nothing failed a test — the output was just quietly wrong. These are the hardest class of bug to catch without deliberately checking computed output against expectations, not just "did it build."
5. **Self-correction happened, but not habit formation.** Item #9 (Rule 2 fallback) shows the same page reintroducing a violation one session after being corrected for the identical violation — a fix was applied to the symptom, not internalized as a rule going forward.
6. **Cross-consistency within a single deliverable isn't self-checked.** Item #28 shows Kiro building the *same* feature 3 different ways in one document (HTML/React/MVC) and getting 2 of the 3 right — the verification effort (real `dotnet build`, `node --check`, `tsc --strict`) was genuine but checked "does each platform's code run in isolation," not "do all platforms express the same UI state the same way." The bug only surfaced by diffing platforms against each other, not by checking any one of them alone.
7. **A foundational architectural choice was never stress-tested against its own stated purpose.** Item #29 — the `@layer` order — shipped in the initial commit and was never wrong in the sense of "doesn't build" or "doesn't match a spec doc"; it just quietly defeated the one thing utility classes are for (overriding components) on every page, for as long as the project existed. Every other item in this log involves a session doing something and getting it wrong; this one involves a decision nobody ever revisited once made, because none of the build/test/lint/type-check gates in this repo are capable of evaluating cascade-layer precedence — only a live browser combining a component class with a same-property utility class on one element would ever reveal it, and that specific combination apparently never got checked until this session.

---

## What this document does *not* cover

- Cost/credit figures — see `.kiro/steering/claude-handoff.md`'s "Credit Usage Summary" section, which already carries its own explicit caveat that all numbers are Kiro's **self-reported estimates**, not verified billing. Don't merge those figures into this defect log without carrying that caveat forward.
- Open architectural decisions Claude flagged and the user explicitly decided on (e.g. adding a generator/CLI build step, disabling `deploy-docs`) — those aren't defects, they were correctly surfaced as decisions rather than picked unilaterally, and are included above only where the *implementation* of the chosen decision itself had a bug (e.g. #21's `noExternal` miss).
- Anything from Kiro's session logs that Claude reviewed and found **no bugs in** (e.g. Sessions 42–45's unified `dist/` wiring, Session 47's optional test coverage, Session 44's `apps/roadmap-site` dist wiring) — those passes are recorded in `.kiro/steering/claude-handoff.md` for completeness but are not defects and are intentionally omitted here.
