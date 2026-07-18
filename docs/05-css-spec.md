# CSS Specification

Version: 1.0.0

Status: Draft

---

## Overview

This document defines the CSS framework's capabilities, class naming rules, and supported behaviors. It serves as the canonical reference for developers consuming the generated CSS output across all Supported Platforms.

The CSS framework is generated entirely from Design Tokens — no hardcoded values exist in the output. For the full naming convention and token-to-class mapping, see [docs/spec/naming.md](spec/naming.md).

---

## 1. Reset / Base Layer

The Reset/Base layer normalizes browser defaults and establishes a consistent rendering baseline across all Supported Platforms.

### Scope

The reset layer provides:

- Box-sizing normalization (`box-sizing: border-box` on all elements)
- Margin and padding removal on `body`, headings, lists, and form elements
- Consistent line-height and font-family defaults derived from Design Tokens
- Image and media element defaults (`max-width: 100%`, `display: block`)
- Table border-collapse normalization
- Button and input appearance resets (removes platform-specific styling)
- Removal of default list styles on `ul` and `ol` when used with `role="list"`

### Token Integration

Base values are sourced from Design Tokens rather than magic numbers:

```css
:root {
  font-family: var(--ds-typography-body-md-font-family);
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
  color: var(--ds-color-text-primary);
  background-color: var(--ds-color-surface-main);
}
```

### Layer Order

The CSS follows the layered architecture defined in [ARCHITECTURE.md](../ARCHITECTURE.md):

```text
Reset → Base → Utilities → Components (Optional) → Theme
```

Each layer builds on top of the previous one. Utility classes override base styles by virtue of source order and equal specificity — no `!important` is used.

---

## 2. Utility Class Naming

Utility classes follow the `{property}[-{side}]-{value}` convention defined in [docs/spec/naming.md](spec/naming.md). Each class maps directly to a single CSS Custom Property derived from a Design Token.

### Convention

```text
[{breakpoint}:][{state}:]{property}[-{side}]-{value}
```

- `property` — the CSS property shorthand (`p`, `m`, `text`, `bg`, `rounded`, `shadow`, `gap`)
- `side` — optional directional modifier (`t`, `r`, `b`, `l`, `x`, `y`)
- `value` — the token scale step or semantic name (`4`, `md`, `primary`, `surface`)

### Spacing Example

```css
/* p-4 → padding: var(--ds-spacing-4) */
.p-4 {
  padding: var(--ds-spacing-4);
}

/* pt-4 → padding-top: var(--ds-spacing-4) */
.pt-4 {
  padding-top: var(--ds-spacing-4);
}

/* mx-8 → margin-left + margin-right: var(--ds-spacing-8) */
.mx-8 {
  margin-left: var(--ds-spacing-8);
  margin-right: var(--ds-spacing-8);
}

/* gap-2 → gap: var(--ds-spacing-2) */
.gap-2 {
  gap: var(--ds-spacing-2);
}
```

### Typography Example

```css
/* text-body-md → applies the body medium type scale */
.text-body-md {
  font-family: var(--ds-typography-body-md-font-family);
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
  letter-spacing: var(--ds-typography-body-md-letter-spacing);
}

/* text-heading-lg → applies the heading large type scale */
.text-heading-lg {
  font-family: var(--ds-typography-heading-lg-font-family);
  font-size: var(--ds-typography-heading-lg-font-size);
  line-height: var(--ds-typography-heading-lg-line-height);
  letter-spacing: var(--ds-typography-heading-lg-letter-spacing);
}
```

### Color Example

```css
/* bg-primary → background-color: var(--ds-color-primary-main) */
.bg-primary {
  background-color: var(--ds-color-primary-main);
}

/* text-primary → color: var(--ds-color-primary-main) */
.text-primary {
  color: var(--ds-color-primary-main);
}

/* bg-surface → background-color: var(--ds-color-surface-main) */
.bg-surface {
  background-color: var(--ds-color-surface-main);
}

/* text-error → color: var(--ds-color-error-main) */
.text-error {
  color: var(--ds-color-error-main);
}
```

### Reverse Derivability

Every utility class name is reversible — given the class name, the corresponding Design Token and CSS Custom Property can be derived without additional context. See the full mapping table in [docs/spec/naming.md](spec/naming.md#examples).

---

## 3. Responsive Strategy

The framework uses a mobile-first breakpoint system. Utility classes apply at all viewport widths by default; breakpoint prefixes constrain a utility to activate only at that breakpoint and above.

### Breakpoints

| Prefix | Min-Width | Target |
|--------|-----------|--------|
| `sm`   | 640px     | Small tablets, large phones (landscape) |
| `md`   | 768px     | Tablets |
| `lg`   | 1024px    | Small desktops, laptops |
| `xl`   | 1280px    | Large desktops |
| `2xl`  | 1536px    | Extra-large screens |

Breakpoint values are sourced from the `breakpoint.*` Design Token category.

### Utility Variation

Every utility class can be prefixed with a breakpoint modifier:

```text
{breakpoint}:{property}-{value}
```

```html
<!-- padding is 2 by default, 4 from md upward, 8 from xl upward -->
<div class="p-2 md:p-4 xl:p-8">
  Responsive padding
</div>

<!-- text size shifts at breakpoints -->
<h1 class="text-heading-md lg:text-heading-lg xl:text-heading-xl">
  Responsive heading
</h1>

<!-- layout switches from stack to grid at md -->
<div class="flex flex-col md:grid md:grid-cols-3 gap-4">
  Responsive layout
</div>
```

### Implementation

Responsive utilities are generated using `@media (min-width: …)` queries, grouped by breakpoint to minimize CSS output size:

```css
@media (min-width: 768px) {
  .md\:p-4 { padding: var(--ds-spacing-4); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}
```

The colon in the class name is escaped (`\:`) in the generated selector.

---

## 4. Dark Mode

Dark mode is implemented using a combination of CSS Custom Properties and a theme-class toggle, allowing both automatic (system-preference) and manual switching.

### Toggle Mechanism

Dark mode is activated by adding a `data-theme="dark"` attribute on the root `<html>` element:

```html
<html data-theme="dark">
```

Alternatively, the framework supports automatic detection via `prefers-color-scheme`:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* dark token overrides applied automatically */
  }
}
```

The explicit `data-theme` attribute always takes precedence over the media query, allowing user preference to override system settings.

### Theme Interaction

Dark mode is a specialized theme — it overrides the same CSS Custom Properties that any theme does (see [docs/06-theme.md](06-theme.md)). The dark theme redefines surface, text, and accent color tokens while preserving spacing, typography, and motion tokens unchanged:

```css
[data-theme="dark"] {
  --ds-color-surface-main: #121212;
  --ds-color-text-primary: #e0e0e0;
  --ds-color-primary-main: #90caf9;
  --ds-color-error-main: #f48fb1;
}
```

### Utility Modifier

The `dark:` prefix allows per-utility dark-mode overrides in markup when finer control is needed beyond the global theme switch:

```html
<div class="bg-surface dark:bg-primary text-primary dark:text-surface">
  Adapts in dark mode
</div>
```

```css
[data-theme="dark"] .dark\:bg-primary {
  background-color: var(--ds-color-primary-main);
}
```

---

## 5. RTL Support

The framework supports right-to-left (RTL) layouts using CSS logical properties, ensuring correct rendering for RTL languages such as Arabic and Hebrew.

### Strategy

Physical directional utilities (`pl-4`, `mr-8`) are supplemented with logical property equivalents:

| Logical Utility | CSS Property | Effect in LTR | Effect in RTL |
|-----------------|-------------|---------------|---------------|
| `ps-4`          | `padding-inline-start` | padding-left | padding-right |
| `pe-4`          | `padding-inline-end`   | padding-right | padding-left |
| `ms-4`          | `margin-inline-start`  | margin-left | margin-right |
| `me-4`          | `margin-inline-end`    | margin-right | margin-left |

### Activation

RTL is activated by the standard HTML `dir` attribute:

```html
<html dir="rtl" lang="ar">
```

No additional CSS class or JavaScript is required — logical properties respond to the document direction automatically.

### Implementation

```css
.ps-4 {
  padding-inline-start: var(--ds-spacing-4);
}

.pe-4 {
  padding-inline-end: var(--ds-spacing-4);
}
```

Physical utilities (`pl-4`, `pr-4`) remain available for cases where direction-independent positioning is intentional (e.g., a fixed-position sidebar that should not flip).

---

## 6. Print Stylesheet

The framework includes a print layer that optimizes output for paper and PDF rendering.

### Strategy

Print styles are applied via `@media print` and perform the following adjustments:

- Remove background colors and images to save ink (unless marked with `.print-bg`)
- Set text color to pure black for maximum contrast
- Remove box-shadows and decorative borders
- Expand all collapsed/hidden content (accordions, tabs) so information is not lost
- Hide navigation, toolbars, and interactive-only elements marked with `.no-print`
- Adjust font sizes to print-optimized values from the typography token scale
- Force page-break avoidance inside card and table row elements

### Utility Classes

```css
/* .no-print — hides the element when printing */
@media print {
  .no-print { display: none !important; }
}

/* .print-bg — preserves background color/image when printing */
@media print {
  .print-bg { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
```

> **Note:** `!important` is used exclusively in the print layer to guarantee overrides regardless of specificity in the screen stylesheet. It is not used anywhere else in the framework.

---

## 7. Accessibility Conventions

The CSS framework enforces accessibility best practices to help meet WCAG 2.2 AA compliance.

### Focus States

All interactive elements receive a visible focus indicator when navigated via keyboard (`focus-visible`). The default focus ring uses a high-contrast outline derived from Design Tokens:

```css
:focus-visible {
  outline: 2px solid var(--ds-color-primary-main);
  outline-offset: 2px;
}
```

The `focus-visible:` modifier allows per-element customization:

```html
<button class="focus-visible:ring-2 focus-visible:ring-primary">
  Accessible button
</button>
```

```css
.focus-visible\:ring-2:focus-visible {
  box-shadow: 0 0 0 2px var(--ds-color-primary-main);
}
```

Focus indicators are never removed — if custom styling is needed, a visible alternative must replace the default.

### Color Contrast

- All generated text/background color pairs meet a minimum contrast ratio of **4.5:1** (AA normal text) or **3:1** (AA large text / UI components).
- The Design Token palette is validated at build time against WCAG contrast requirements using the token validation pipeline.
- Semantic color pairings (e.g., `text-primary` on `bg-surface`) are tested as part of the design token generation process, ensuring that every theme — including dark mode — maintains compliant contrast ratios.

### Reduced Motion

The framework respects the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Utilities

```css
/* .sr-only — visually hidden but available to assistive technology */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Additional Conventions

- Interactive elements (`button`, `a`, `input`) must never have `outline: none` without a visible replacement.
- Color is never the sole means of conveying information — icons, text labels, or patterns accompany color-coded states.
- Disabled elements use reduced opacity (`opacity: var(--ds-opacity-disabled)`) and remove pointer events, but remain discoverable by screen readers.

---

## References

- [docs/spec/naming.md](spec/naming.md) — Full naming convention specification
- [docs/spec/layout.md](spec/layout.md) — Layout utilities specification (Display, Flex, Grid, Position)
- [docs/spec/components.md](spec/components.md) — Component Layer specification (Button, Card, Badge, Input, Alert)
- [docs/spec/README.md](spec/README.md) — Specification structure and status
- [ARCHITECTURE.md](../ARCHITECTURE.md) — CSS Architecture layering

---

> **Supersedes / Deep Reference:** This document is the canonical CSS specification entry point within the Documentation Set. The detailed per-topic utility specifications (spacing, typography, colors, layout, etc.) live under `docs/spec/` as they move from Planned to Draft status — see [docs/spec/README.md](spec/README.md) for the current status of each topic specification.
