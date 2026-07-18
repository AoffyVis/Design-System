# Border Utilities Specification

Version: 1.0.0

Status: Draft

---

## Purpose

Border utilities control border width, style, side, and color
independently of border radius (`docs/spec/design-tokens.md`'s
`radius` category, exposed as `.rounded-*` — a separate concern from
border width/style/color, which is what this document covers).

Border **color** is the only token-driven part of this module — it
reads `--ds-color-border-main` (or a semantic color, for the color
override utilities) exactly the way `docs/spec/components.md`'s
`.card-header`/`.card-footer`/`.input` already do. Border width and
style values are fixed CSS values, the same design already used for
Layout's static properties (`docs/spec/layout.md`) — there is no
"border width scale" token category in `packages/tokens`.

---

## Naming Convention

Follows the `{property}[-{side}]-{value}` pattern defined in
[docs/spec/naming.md](naming.md):

```text
.border               /* 1px solid border-main — the "just give me a border" case */
.border-{width}        /* 0, 2, 4, 8 */
.border-{side}         /* t, r, b, l — 1px solid border-main on one side only */
.border-{style}        /* solid, dashed, dotted, none */
.border-{color}        /* primary, secondary, error, warning, success, info */
```

---

## Utility Categories

### Border Width

`.border` is deliberately self-sufficient — it sets width, style, and
color together, so it works standalone without needing to be paired
with a separate style/color utility (the same reasoning
`docs/spec/shadows.md`-equivalent utilities and `.rounded-*` already
follow: one class, one complete visual result).

| Class | CSS |
|-------|-----|
| `.border-0` | `border-width: 0;` |
| `.border` | `border-width: 1px; border-style: solid; border-color: var(--ds-color-border-main);` |
| `.border-2` | `border-width: 2px; border-style: solid; border-color: var(--ds-color-border-main);` |
| `.border-4` | `border-width: 4px; border-style: solid; border-color: var(--ds-color-border-main);` |
| `.border-8` | `border-width: 8px; border-style: solid; border-color: var(--ds-color-border-main);` |

### Border Side

Single-side borders, also self-sufficient (1px solid border-main).
Deliberately does not cover the full side × width matrix
(`.border-t-2`, `.border-r-4`, ...) — combine a side utility with a
color/style override utility below instead, or write plain CSS for a
one-off case. This mirrors the same scope decision Layout made for
positional offsets (fixed `-0` values plus token-driven values, not
every possible combination).

| Class | CSS |
|-------|-----|
| `.border-t` | `border-top-width: 1px; border-top-style: solid; border-top-color: var(--ds-color-border-main);` |
| `.border-r` | `border-right-width: 1px; border-right-style: solid; border-right-color: var(--ds-color-border-main);` |
| `.border-b` | `border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: var(--ds-color-border-main);` |
| `.border-l` | `border-left-width: 1px; border-left-style: solid; border-left-color: var(--ds-color-border-main);` |

### Border Style

Override the style set by a width/side utility above (e.g.
`.border .border-dashed`).

| Class | CSS |
|-------|-----|
| `.border-solid` | `border-style: solid;` |
| `.border-dashed` | `border-style: dashed;` |
| `.border-dotted` | `border-style: dotted;` |
| `.border-none` | `border-style: none;` |

### Border Color

Override the color set by a width/side utility above (e.g.
`.border .border-primary`). Uses the same six semantic colors as
`docs/spec/components.md`'s color variants — not `surface`/`border`
themselves, since `.border-border` or `.border-surface` would be
confusing utility names for what they'd actually do.

| Class | CSS |
|-------|-----|
| `.border-primary` | `border-color: var(--ds-color-primary-main);` |
| `.border-secondary` | `border-color: var(--ds-color-secondary-main);` |
| `.border-error` | `border-color: var(--ds-color-error-main);` |
| `.border-warning` | `border-color: var(--ds-color-warning-main);` |
| `.border-success` | `border-color: var(--ds-color-success-main);` |
| `.border-info` | `border-color: var(--ds-color-info-main);` |

---

## Dark Mode

`border-color`'s default value (`var(--ds-color-border-main)`)
automatically responds to dark mode the same way `docs/spec/
components.md`'s Dark Mode section describes for `.card`/`.input` —
`--ds-color-border-main` already has a `[data-theme="dark"]` override
(see `packages/tokens/src/themes/dark.json`). The six semantic
`.border-{color}` overrides above use the same `--ds-color-*-main`
variables the rest of the framework does, so they inherit the same
behavior with no extra work.

---

## Responsive Variants

All border utilities generate responsive variants using breakpoint
prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`), the same mechanism every
other utility category uses:

```html
<div class="border-0 md:border md:border-primary">
  <!-- No border on mobile, bordered on md+ -->
</div>
```

---

## Design Rules

- Border color utilities (`.border-{color}`) only set `border-color` —
  they assume a width has already been set by `.border`/`.border-{n}`/
  `.border-{side}`, matching how `.card-header`'s spec-documented
  composition already works (multiple single-purpose declarations, not
  one class per combination).
- Border width/side/style utilities do NOT use `!important` (same rule
  Layout follows).
- `.border` and `.border-{n}` sit in `@layer utilities`, overridable by
  the components and theme layers per the standard cascade order.

---

## Related Documents

- [docs/spec/naming.md](naming.md) — Naming convention
- [docs/spec/layout.md](layout.md) — Layout utilities (the scope-control
  precedent this spec follows for side/width combinations)
- [docs/spec/components.md](components.md) — Where `--ds-color-border-main`
  is already consumed by `.card-header`/`.card-footer`/`.input`
- [docs/05-css-spec.md](../05-css-spec.md) — CSS specification overview
