# Component Layer Specification

Version: 1.0.0

Status: Draft

---

## Purpose

The Component Layer provides pre-composed CSS classes for common UI
patterns. Each component class combines multiple Design Token references
into a single, reusable class name — reducing the number of utility
classes required in markup while remaining fully token-driven.

Components sit in the CSS layer order between Utilities and Theme:

```text
Reset → Base → Utilities → Components → Theme
```

This means component styles can be overridden by theme variables (for
theming) but not by lower-specificity utility classes — use the `!`
modifier or explicit style overrides when intentional utility-level
customization is needed on a component.

---

## Design Principles

1. **Token-driven** — Every visual value references a `var(--ds-*)`
   custom property. No hardcoded colors, spacing, or typography.
2. **Composable** — Components can be combined with utility classes for
   one-off adjustments (e.g., `.btn .mt-4`).
3. **Variant-based** — Color variants use the semantic color system
   (primary, secondary, error, warning, success, info).
4. **Size-aware** — Components support size modifiers (sm, md, lg) mapped
   to the spacing and typography token scales.
5. **Accessible** — All interactive components include focus-visible
   states and meet WCAG 2.2 AA contrast requirements.

---

## Naming Convention

Component classes follow the pattern:

```text
.{component}[-{variant}][-{modifier}]
```

- `component` — the base component name (e.g., `btn`, `card`, `badge`)
- `variant` — color or style variant (e.g., `primary`, `outline`)
- `modifier` — size or state modifier (e.g., `sm`, `lg`, `disabled`)

Examples: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm`,
`.card`, `.card-header`, `.badge-success`

---

## Components

### Button (`.btn`)

Base button with padding, border-radius, font-weight, and transition.
Color variants apply background and text colors from semantic tokens.

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
  font-weight: 600;
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
  border-radius: var(--ds-radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition-property: background-color, border-color, color, box-shadow;
  transition-duration: var(--ds-motion-duration-fast);
  transition-timing-function: var(--ds-motion-easing-in-out);
}

.btn:focus-visible {
  outline: 2px solid var(--ds-color-primary-main);
  outline-offset: 2px;
}

.btn:disabled, .btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

#### Color Variants

| Class | Background | Text | Border |
|-------|-----------|------|--------|
| `.btn-primary` | `--ds-color-primary-main` | `--ds-color-primary-contrast` | transparent |
| `.btn-secondary` | `--ds-color-secondary-main` | `--ds-color-secondary-contrast` | transparent |
| `.btn-error` | `--ds-color-error-main` | `--ds-color-error-contrast` | transparent |
| `.btn-warning` | `--ds-color-warning-main` | `--ds-color-warning-contrast` | transparent |
| `.btn-success` | `--ds-color-success-main` | `--ds-color-success-contrast` | transparent |
| `.btn-info` | `--ds-color-info-main` | `--ds-color-info-contrast` | transparent |

#### Style Variants

| Class | Description |
|-------|-------------|
| `.btn-outline` | Transparent background, colored border and text |
| `.btn-ghost` | Transparent background, no border, colored text only |

#### Size Modifiers

| Class | Padding | Font Size |
|-------|---------|-----------|
| `.btn-sm` | `spacing-1` × `spacing-3` | `body-sm` |
| `.btn-lg` | `spacing-3` × `spacing-6` | `body-md` (larger padding only) |

---

### Card (`.card`)

Container component with surface background, border-radius, shadow, and
optional header/body/footer sections.

```css
.card {
  background-color: var(--ds-color-surface-main);
  color: var(--ds-color-surface-contrast);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-md);
  overflow: hidden;
}

.card-header {
  padding: var(--ds-spacing-4) var(--ds-spacing-6);
  border-bottom: 1px solid var(--ds-color-border-main);
  font-weight: 600;
}

.card-body {
  padding: var(--ds-spacing-6);
}

.card-footer {
  padding: var(--ds-spacing-4) var(--ds-spacing-6);
  border-top: 1px solid var(--ds-color-border-main);
}
```

---

### Badge (`.badge`)

Inline status indicator with semantic color variants.

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--ds-spacing-1) var(--ds-spacing-3);
  font-size: var(--ds-typography-body-sm-font-size);
  font-weight: 600;
  line-height: 1;
  border-radius: var(--ds-radius-full);
  white-space: nowrap;
}
```

#### Color Variants

| Class | Background | Text |
|-------|-----------|------|
| `.badge-primary` | `--ds-color-primary-main` | `--ds-color-primary-contrast` |
| `.badge-secondary` | `--ds-color-secondary-main` | `--ds-color-secondary-contrast` |
| `.badge-error` | `--ds-color-error-main` | `--ds-color-error-contrast` |
| `.badge-warning` | `--ds-color-warning-main` | `--ds-color-warning-contrast` |
| `.badge-success` | `--ds-color-success-main` | `--ds-color-success-contrast` |
| `.badge-info` | `--ds-color-info-main` | `--ds-color-info-contrast` |

---

### Input (`.input`)

Form input with token-driven sizing, border, and focus state.

```css
.input {
  display: block;
  width: 100%;
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
  border: 2px solid var(--ds-color-border-main);
  border-radius: var(--ds-radius-md);
  background-color: transparent;
  transition: border-color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out);
}

.input:focus {
  border-color: var(--ds-color-primary-main);
  outline: none;
}

.input-error {
  border-color: var(--ds-color-error-main);
}

.input-error:focus {
  border-color: var(--ds-color-error-main);
  box-shadow: 0 0 0 1px var(--ds-color-error-main);
}
```

---

### Alert (`.alert`)

Full-width notification banner with semantic color variants and optional
dismiss action.

```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-3);
  padding: var(--ds-spacing-4) var(--ds-spacing-5);
  border-radius: var(--ds-radius-md);
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
}
```

#### Color Variants

| Class | Background | Text | Border-left |
|-------|-----------|------|-------------|
| `.alert-primary` | `primary-main` @ 10% opacity | `--ds-color-primary-main` | `--ds-color-primary-main` |
| `.alert-error` | `error-main` @ 10% opacity | `--ds-color-error-main` | `--ds-color-error-main` |
| `.alert-warning` | `warning-main` @ 10% opacity | `--ds-color-warning-main` | `--ds-color-warning-main` |
| `.alert-success` | `success-main` @ 10% opacity | `--ds-color-success-main` | `--ds-color-success-main` |
| `.alert-info` | `info-main` @ 10% opacity | `--ds-color-info-main` | `--ds-color-info-main` |

---

## Responsive Behavior

Component classes DO NOT generate responsive variants by default (unlike
utility classes). Components are designed to be responsive by composition:

```html
<!-- Stack buttons vertically on mobile, horizontal from md up -->
<div class="flex flex-col md:flex-row gap-3">
  <button class="btn btn-primary">Confirm</button>
  <button class="btn btn-outline">Cancel</button>
</div>
```

Size modifiers (`btn-sm`, `btn-lg`) can be used with responsive utility
overrides when needed.

---

## Dark Mode

Component colors automatically respond to dark mode because they
reference `var(--ds-*)` custom properties that are redefined by the
theme layer. No additional `dark:` variants are needed on component
classes — the token values themselves change.

---

## Extending Components

New components follow the same pattern:

1. Define the base class with token-referenced values
2. Add color variants using the 6 semantic colors
3. Add size modifiers using the spacing/typography scales
4. Include `:focus-visible` state for interactive components
5. Document in this specification before implementing

---

## Related Documents

- [docs/05-css-spec.md](../05-css-spec.md) — CSS layer architecture and utility class naming
- [docs/spec/naming.md](naming.md) — Naming convention specification
- [docs/04-design-token.md](../04-design-token.md) — Token categories and values
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — CSS Architecture (Reset → Base → Utilities → Components → Theme)
