# Layout Utilities Specification

Version: 1.0.0

Status: Draft

---

## Purpose

Layout utilities control element display mode, flexbox/grid behavior,
sizing, positioning, and overflow. Unlike spacing/color/typography
utilities, most layout classes do not reference Design Token values —
they set static CSS properties. The exceptions are token-driven
positional utilities (top/right/bottom/left/inset) that reference the
spacing token scale.

---

## Naming Convention

Layout utilities follow the same `{property}[-{modifier}][-{value}]`
pattern defined in [docs/spec/naming.md](naming.md):

```text
.{property}[-{value}]
```

Examples: `.flex`, `.grid-cols-3`, `.items-center`, `.w-full`, `.top-4`

---

## Utility Categories

### Display

| Class | CSS |
|-------|-----|
| `.block` | `display: block` |
| `.inline-block` | `display: inline-block` |
| `.inline` | `display: inline` |
| `.flex` | `display: flex` |
| `.inline-flex` | `display: inline-flex` |
| `.grid` | `display: grid` |
| `.inline-grid` | `display: inline-grid` |
| `.hidden` | `display: none` |

### Flex Direction

| Class | CSS |
|-------|-----|
| `.flex-row` | `flex-direction: row` |
| `.flex-row-reverse` | `flex-direction: row-reverse` |
| `.flex-col` | `flex-direction: column` |
| `.flex-col-reverse` | `flex-direction: column-reverse` |

### Flex Wrap

| Class | CSS |
|-------|-----|
| `.flex-wrap` | `flex-wrap: wrap` |
| `.flex-nowrap` | `flex-wrap: nowrap` |
| `.flex-wrap-reverse` | `flex-wrap: wrap-reverse` |

### Flex Grow / Shrink

| Class | CSS |
|-------|-----|
| `.flex-1` | `flex: 1 1 0%` |
| `.flex-auto` | `flex: 1 1 auto` |
| `.flex-initial` | `flex: 0 1 auto` |
| `.flex-none` | `flex: 0 0 auto` |
| `.grow` | `flex-grow: 1` |
| `.grow-0` | `flex-grow: 0` |
| `.shrink` | `flex-shrink: 1` |
| `.shrink-0` | `flex-shrink: 0` |

### Align Items

| Class | CSS |
|-------|-----|
| `.items-start` | `align-items: flex-start` |
| `.items-end` | `align-items: flex-end` |
| `.items-center` | `align-items: center` |
| `.items-baseline` | `align-items: baseline` |
| `.items-stretch` | `align-items: stretch` |

### Justify Content

| Class | CSS |
|-------|-----|
| `.justify-start` | `justify-content: flex-start` |
| `.justify-end` | `justify-content: flex-end` |
| `.justify-center` | `justify-content: center` |
| `.justify-between` | `justify-content: space-between` |
| `.justify-around` | `justify-content: space-around` |
| `.justify-evenly` | `justify-content: space-evenly` |

### Align Self

| Class | CSS |
|-------|-----|
| `.self-auto` | `align-self: auto` |
| `.self-start` | `align-self: flex-start` |
| `.self-end` | `align-self: flex-end` |
| `.self-center` | `align-self: center` |
| `.self-stretch` | `align-self: stretch` |

### Grid Template Columns

| Class | CSS |
|-------|-----|
| `.grid-cols-1` | `grid-template-columns: repeat(1, minmax(0, 1fr))` |
| `.grid-cols-2` | `grid-template-columns: repeat(2, minmax(0, 1fr))` |
| `.grid-cols-3` | `grid-template-columns: repeat(3, minmax(0, 1fr))` |
| `.grid-cols-4` | `grid-template-columns: repeat(4, minmax(0, 1fr))` |
| `.grid-cols-6` | `grid-template-columns: repeat(6, minmax(0, 1fr))` |
| `.grid-cols-12` | `grid-template-columns: repeat(12, minmax(0, 1fr))` |

### Grid Column Span

| Class | CSS |
|-------|-----|
| `.col-span-1` | `grid-column: span 1 / span 1` |
| `.col-span-2` | `grid-column: span 2 / span 2` |
| `.col-span-3` | `grid-column: span 3 / span 3` |
| `.col-span-4` | `grid-column: span 4 / span 4` |
| `.col-span-6` | `grid-column: span 6 / span 6` |
| `.col-span-full` | `grid-column: 1 / -1` |

### Width

| Class | CSS |
|-------|-----|
| `.w-full` | `width: 100%` |
| `.w-screen` | `width: 100vw` |
| `.w-auto` | `width: auto` |
| `.w-min` | `width: min-content` |
| `.w-max` | `width: max-content` |
| `.w-fit` | `width: fit-content` |

### Height

| Class | CSS |
|-------|-----|
| `.h-full` | `height: 100%` |
| `.h-screen` | `height: 100vh` |
| `.h-auto` | `height: auto` |
| `.h-min` | `height: min-content` |
| `.h-max` | `height: max-content` |
| `.h-fit` | `height: fit-content` |

### Min / Max

| Class | CSS |
|-------|-----|
| `.min-w-0` | `min-width: 0px` |
| `.min-w-full` | `min-width: 100%` |
| `.max-w-none` | `max-width: none` |
| `.max-w-full` | `max-width: 100%` |
| `.max-w-screen` | `max-width: 100vw` |
| `.min-h-0` | `min-height: 0px` |
| `.min-h-full` | `min-height: 100%` |
| `.min-h-screen` | `min-height: 100vh` |

### Margin Auto

Centering and flex/grid "push" utilities. These are margin utilities by
property, but they live in the Layout module (not Spacing) because their
value is the CSS keyword `auto`, not a spacing token — the Spacing module
is exclusively token-driven.

| Class | CSS |
|-------|-----|
| `.m-auto` | `margin: auto` |
| `.mx-auto` | `margin-left: auto; margin-right: auto` |
| `.my-auto` | `margin-top: auto; margin-bottom: auto` |
| `.mt-auto` | `margin-top: auto` |
| `.mr-auto` | `margin-right: auto` |
| `.mb-auto` | `margin-bottom: auto` |
| `.ml-auto` | `margin-left: auto` |

### Overflow

| Class | CSS |
|-------|-----|
| `.overflow-auto` | `overflow: auto` |
| `.overflow-hidden` | `overflow: hidden` |
| `.overflow-visible` | `overflow: visible` |
| `.overflow-scroll` | `overflow: scroll` |
| `.overflow-x-auto` | `overflow-x: auto` |
| `.overflow-x-hidden` | `overflow-x: hidden` |
| `.overflow-y-auto` | `overflow-y: auto` |
| `.overflow-y-hidden` | `overflow-y: hidden` |

### Position

| Class | CSS |
|-------|-----|
| `.static` | `position: static` |
| `.fixed` | `position: fixed` |
| `.absolute` | `position: absolute` |
| `.relative` | `position: relative` |
| `.sticky` | `position: sticky` |

### Positional Offsets (Token-Driven)

For each spacing token value (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16):

| Pattern | CSS |
|---------|-----|
| `.top-{n}` | `top: var(--ds-spacing-{n})` |
| `.right-{n}` | `right: var(--ds-spacing-{n})` |
| `.bottom-{n}` | `bottom: var(--ds-spacing-{n})` |
| `.left-{n}` | `left: var(--ds-spacing-{n})` |
| `.inset-{n}` | `inset: var(--ds-spacing-{n})` |

Fixed zero values are also available: `.inset-0`, `.top-0`, `.right-0`,
`.bottom-0`, `.left-0` (set the property to literal `0`).

---

## Responsive Variants

All layout utilities generate responsive variants using breakpoint
prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`):

```html
<div class="flex flex-col md:flex-row md:items-center">
  <!-- Stack on mobile, row on tablet+ -->
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <!-- 1 column mobile, 3 columns desktop -->
</div>

<div class="hidden md:block">
  <!-- Hidden on mobile, visible on md+ -->
</div>
```

---

## Design Rules

- Layout utilities do NOT use `!important`
- Positional utilities reference spacing tokens via `var(--ds-spacing-*)`
  — ensuring consistency with the spacing scale
- Static layout utilities (display, flex, grid, etc.) do not reference
  tokens — they are fixed CSS values
- All layout utilities sit in the `@layer utilities` block and can be
  overridden by the components and theme layers

---

## Related Documents

- [docs/spec/naming.md](naming.md) — Naming convention
- [docs/05-css-spec.md](../05-css-spec.md) — CSS specification overview
