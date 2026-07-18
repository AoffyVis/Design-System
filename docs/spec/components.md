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

### Table (`.table`)

A semantic table foundation with optional striped rows, hover feedback,
compact density, borders, responsive overflow, and visual states for
sorting, filtering, and pagination.

```html
<div class="table-filter">
  <label for="user-filter">Filter users</label>
  <input id="user-filter" class="table-filter-input" type="search" placeholder="Search...">
</div>

<div class="table-responsive">
  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th class="th-sortable th-sort-asc" aria-sort="ascending">Name</th>
        <th class="th-sortable">Email</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Ada Lovelace</td>
        <td>ada@example.com</td>
        <td><span class="badge badge-success">Active</span></td>
      </tr>
    </tbody>
  </table>
</div>

<nav class="table-pagination" aria-label="Table pages">
  <button class="page-btn" type="button">Previous</button>
  <button class="page-btn page-btn-active" type="button" aria-current="page">1</button>
  <button class="page-btn" type="button">Next</button>
</nav>
```

#### Table Classes

| Class | Description |
|-------|-------------|
| `.table` | Base full-width table with collapsed borders and token typography |
| `.table-striped` | Alternating background on even body rows |
| `.table-hover` | Hover highlight for body rows |
| `.table-bordered` | Border around every header and body cell |
| `.table-compact` | Smaller cell padding and body typography |
| `.table-responsive` | Horizontal overflow wrapper for narrow viewports |
| `.th-sortable` | Clickable-looking header with a neutral sort indicator |
| `.th-sort-asc` / `.th-sort-desc` | Ascending/descending visual sort indicator |
| `.table-filter` | Layout container for filter controls |
| `.table-filter-input` | Token-styled filter input |
| `.table-pagination` | Pagination control layout |
| `.page-btn` / `.page-btn-active` | Pagination button and current-page state |

The CSS supplies presentation only. It does not sort rows, filter data, or
change pages. Consumer JavaScript must implement those behaviors and update
the DOM, `aria-sort`, `aria-current`, and the `th-sort-*`/`page-btn-active`
classes as state changes.

---

### Modal (`.modal`)

A viewport-level dialog pattern. The consumer controls visibility by adding
or removing `.modal-open`; the CSS does not provide focus trapping, escape-key
handling, or `aria-hidden` management.

```html
<div class="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <div class="modal-overlay" data-modal-close></div>
  <section class="modal-content">
    <header class="modal-header">
      <h2 id="dialog-title">Confirm action</h2>
      <button class="modal-close" type="button" aria-label="Close dialog">×</button>
    </header>
    <div class="modal-body">
      <p class="text-body-md">Are you sure you want to continue?</p>
    </div>
    <footer class="modal-footer">
      <button class="btn btn-outline">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </footer>
  </section>
</div>
```

| Class | Description |
|-------|-------------|
| `.modal` | Fixed, centered dialog wrapper; hidden by default |
| `.modal-open` | Displays the modal wrapper with flex alignment |
| `.modal-overlay` | Full-viewport backdrop |
| `.modal-content` | Scrollable dialog surface |
| `.modal-header` / `.modal-body` / `.modal-footer` | Dialog sections |
| `.modal-close` | Close-button styling |
| `.modal-sm` / `.modal-lg` / `.modal-xl` | Dialog width variants |
| `.modal-fullscreen` | Full-viewport dialog content variant |

### Navigation (`.nav`)

Navigation container and link styles for horizontal or vertical menus.
Use semantic `<nav>` and links in markup; `.nav-link-active` represents the
current route and must be synchronized by the application. Component CSS owns
presentation only. The consumer owns the mobile menu state, including the
button's `aria-expanded` value and keyboard behavior.

```html
<nav class="nav nav-horizontal flex-wrap" aria-label="Primary navigation">
  <a class="nav-brand" href="/">Acme</a>
  <button type="button" class="md:hidden"
          aria-expanded="false" aria-controls="primary-menu">
    Menu
  </button>
  <div id="primary-menu"
       class="hidden w-full flex-col md:flex md:w-auto md:flex-row md:items-center">
    <div class="nav-item">
      <a class="nav-link nav-link-active" href="/" aria-current="page">Home</a>
    </div>
    <div class="nav-item">
      <a class="nav-link" href="/settings">Settings</a>
    </div>
    <span class="nav-divider hidden md:block" aria-hidden="true"></span>
    <div class="nav-item">
      <a class="nav-link" href="/help">Help</a>
    </div>
  </div>
</nav>
```

On small screens, the consumer changes the menu container from `hidden` to
`flex` when the toggle is activated, closes it on `Escape`, and closes it
after a link is selected. At `md` and above, `md:flex` keeps the menu visible
as a horizontal row regardless of the mobile state.

| Class | Description |
|-------|-------------|
| `.nav` | Base surface, spacing, and border for navigation |
| `.nav-horizontal` / `.nav-vertical` | Row or column orientation |
| `.nav-brand` | Brand or logo link area |
| `.nav-item` | Individual item wrapper |
| `.nav-link` | Link styling with hover state |
| `.nav-link-active` | Current-link visual state |
| `.nav-divider` | Orientation-aware separator |

### Tabs (`.tabs`)

A tab presentation pattern with underline, bordered, and pill variants.
JavaScript or the host framework must switch `.tab-active` and
`.tab-panel-active` and keep `aria-selected`/`aria-controls` synchronized.

```html
<div class="tabs">
  <div class="tab-list" role="tablist" aria-label="Account sections">
    <button class="tab-item tab-active" type="button" role="tab"
            aria-selected="true" aria-controls="profile-panel">Profile</button>
    <button class="tab-item" type="button" role="tab"
            aria-selected="false" aria-controls="security-panel">Security</button>
  </div>
  <section id="profile-panel" class="tab-panel tab-panel-active" role="tabpanel">
    Profile content
  </section>
  <section id="security-panel" class="tab-panel" role="tabpanel" hidden>
    Security content
  </section>
</div>
```

| Class | Description |
|-------|-------------|
| `.tabs` | Vertical tabs wrapper |
| `.tab-list` | Tab control row |
| `.tab-item` | Individual tab control |
| `.tab-active` | Active tab visual state |
| `.tab-panel` | Hidden tab content panel |
| `.tab-panel-active` | Visible tab content panel |
| `.tabs-bordered` | Bordered tab variant |
| `.tabs-pills` | Pill-shaped tab variant |

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

The same composition keeps notification lists stacked on narrow screens and
lets them use horizontal space on larger screens. Action bars use full-width
controls on mobile before returning to intrinsic-width buttons from `md` up:

```html
<!-- Notification list: stack on mobile, distribute items from md up -->
<div class="flex w-full flex-col gap-3 md:flex-row">
  <div class="w-full p-4 rounded-md shadow-sm bg-success text-success-contrast md:flex-1">
    Deploy succeeded
  </div>
  <div class="w-full p-4 rounded-md shadow-sm bg-warning text-warning-contrast md:flex-1">
    Review required
  </div>
</div>

<!-- Action bar: full-width buttons on mobile, intrinsic widths from md up -->
<div class="flex w-full flex-col gap-3 md:flex-row md:items-center">
  <button class="w-full btn btn-primary md:w-auto">Confirm</button>
  <button class="w-full btn btn-outline md:w-auto">Cancel</button>
</div>
```

Use consumer JavaScript for interaction state such as opening a mobile
navigation menu. The CSS utilities provide the responsive layout and the
component classes provide presentation; neither layer owns application state.

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
