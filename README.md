# Company Design System

An enterprise-grade Design System Platform that enables teams to build consistent, scalable user interfaces across multiple frontend technologies from a single source of truth — semantic Design Tokens.

---

## Quick Start — Use via CDN (No Build Required)

Add these two `<link>` tags to any HTML file and start using classes immediately:

```html
<!-- Design Tokens (CSS Variables) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/tokens.css">

<!-- Utilities + Components -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/core.css">
```

Optional themes:

```html
<!-- Dark Mode -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/dark.css">

<!-- Banking Brand -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/banking.css">

<!-- Corporate Brand -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/corporate.css">
```

---

## Usage Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/tokens.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/core.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/AoffyVis/Design-System@master/dist/themes/dark.css">
</head>
<body>

  <div class="p-6 max-w-screen mx-auto">
    <!-- Buttons -->
    <button class="btn btn-primary">Primary</button>
    <button class="btn btn-secondary">Secondary</button>

    <!-- Card -->
    <div class="card p-6 mt-4">
      <h2 class="text-heading-h2">Card Title</h2>
      <p class="text-body-md mt-2">Card content with design system typography.</p>
    </div>

    <!-- Input -->
    <input class="input mt-4" placeholder="Type here..." />

    <!-- Badges -->
    <span class="badge badge-success mt-4">Active</span>
    <span class="badge badge-error">Error</span>

    <!-- Alerts -->
    <div class="alert alert-info mt-4">This is an info alert.</div>
  </div>

  <!-- Switch theme via JavaScript -->
  <script>
    // Dark mode
    document.documentElement.setAttribute('data-theme', 'dark');

    // Or Banking theme
    // document.documentElement.setAttribute('data-theme', 'banking');

    // Remove to go back to default (light)
    // document.documentElement.removeAttribute('data-theme');
  </script>

</body>
</html>
```

---

## Available Classes

### Layout

| Class | Description |
|-------|-------------|
| `.flex` | `display: flex` |
| `.grid` | `display: grid` |
| `.hidden` | `display: none` |
| `.block` | `display: block` |
| `.inline-flex` | `display: inline-flex` |
| `.flex-row` / `.flex-col` | Flex direction |
| `.items-center` / `.items-start` / `.items-end` | Align items |
| `.justify-center` / `.justify-between` / `.justify-end` | Justify content |
| `.w-full` / `.w-fit` / `.max-w-screen` / `.max-w-full` / `.max-w-none` | Width utilities |
| `.mx-auto` / `.my-auto` | Auto margins |

### Spacing

| Pattern | Example | Description |
|---------|---------|-------------|
| `.p-{0-16}` | `.p-4` | Padding (all sides) |
| `.px-{0-16}` / `.py-{0-16}` | `.px-6` | Padding horizontal/vertical |
| `.pt-` / `.pr-` / `.pb-` / `.pl-` | `.mt-2` | Single side |
| `.m-{0-16}` | `.m-4` | Margin (all sides) |
| `.mx-` / `.my-` | `.mx-auto` | Margin horizontal/vertical |
| `.gap-{0-16}` | `.gap-4` | Gap |

### Typography

| Class | Description |
|-------|-------------|
| `.text-heading-h1` | H1 (2.125rem, bold) |
| `.text-heading-h2` | H2 (1.5rem, bold) |
| `.text-body-md` | Body text, medium (1rem) |
| `.text-body-sm` | Body text, small (0.875rem) |

### Components

| Class | Description |
|-------|-------------|
| `.btn` | Base button |
| `.btn-primary` / `.btn-secondary` / `.btn-error` | Button variants |
| `.card` | Card container |
| `.input` | Form input |
| `.badge` / `.badge-success` / `.badge-error` / `.badge-warning` / `.badge-info` | Badges |
| `.alert` / `.alert-success` / `.alert-error` / `.alert-warning` / `.alert-info` | Alerts |

### Borders

| Class | Description |
|-------|-------------|
| `.border` | 1px solid border |
| `.border-0` / `.border-2` / `.border-4` / `.border-8` | Border width |
| `.border-t` / `.border-r` / `.border-b` / `.border-l` | Single side |
| `.border-solid` / `.border-dashed` / `.border-dotted` / `.border-none` | Border style |
| `.border-primary` / `.border-error` / `.border-success` | Border color |

### Radius & Shadow

| Class | Description |
|-------|-------------|
| `.rounded-none` / `.rounded-sm` / `.rounded-md` / `.rounded-lg` / `.rounded-xl` / `.rounded-full` | Border radius |
| `.shadow-none` / `.shadow-sm` / `.shadow-md` / `.shadow-lg` / `.shadow-xl` / `.shadow-2xl` | Box shadow |

### Z-Index

| Class | Description |
|-------|-------------|
| `.z-base` | 0 |
| `.z-dropdown` | 1000 |
| `.z-sticky` | 1100 |
| `.z-fixed` | 1200 |
| `.z-overlay` | 1300 |
| `.z-modal` | 1400 |
| `.z-popover` | 1500 |
| `.z-tooltip` | 1600 |

### Motion / Transitions

| Class | Description |
|-------|-------------|
| `.duration-instant` / `.duration-fast` / `.duration-normal` / `.duration-slow` / `.duration-slower` | Transition duration |
| `.ease-linear` / `.ease-in` / `.ease-out` / `.ease-in-out` | Transition timing |

### Responsive Prefixes

All utility classes support responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

```html
<div class="flex flex-col md:flex-row lg:gap-8">
  <!-- Stacks vertically on mobile, row on tablet+ -->
</div>
```

| Prefix | Breakpoint |
|--------|-----------|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

### Themes

Switch themes by setting `data-theme` on `<html>`:

```javascript
// Dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// Banking theme (green/teal)
document.documentElement.setAttribute('data-theme', 'banking');

// Corporate theme (navy/slate)
document.documentElement.setAttribute('data-theme', 'corporate');

// Default (light)
document.documentElement.removeAttribute('data-theme');
```

---

## Design Tokens (CSS Variables)

All visual values are available as CSS variables with the `--ds-` prefix:

```css
/* Colors */
var(--ds-color-primary-main)       /* #1565C0 */
var(--ds-color-surface-main)       /* #FFFFFF */
var(--ds-color-border-main)        /* #E0E0E0 */

/* Spacing */
var(--ds-spacing-4)                /* 1rem */
var(--ds-spacing-8)                /* 2rem */

/* Typography */
var(--ds-typography-heading-h1-font-size)  /* 2.125rem */

/* Radius */
var(--ds-radius-md)                /* 0.25rem */

/* Shadow */
var(--ds-shadow-md)                /* box-shadow value */

/* Motion */
var(--ds-motion-duration-fast)     /* 150ms */
var(--ds-motion-easing-in-out)     /* cubic-bezier(0.4, 0, 0.2, 1) */
```

---

## Local Development

```bash
# Clone
git clone https://github.com/AoffyVis/Design-System.git
cd Design-System

# Install
corepack enable
pnpm install

# Build all packages
pnpm build

# Run tests (75 tests)
pnpm test

# Lint
pnpm run lint

# Start roadmap site (dev server)
pnpm --dir apps/roadmap-site dev
```

---

## Project Structure

```text
dist/                    # Built output (tokens + utilities + themes) — CDN-ready
packages/
  tokens/                # Design token source files + build pipeline
  css-core/              # CSS utility & component generators
  generator/             # Unified build orchestrator
  cli/                   # Command-line interface
apps/
  roadmap-site/          # Next.js documentation + demo site
docs/                    # Architecture docs, specs, guides
```

---

## Supported Platforms

Works with any technology that can load a CSS file:

| Platform | Category |
|----------|----------|
| HTML / Static Sites | Static |
| React / Next.js | JavaScript |
| Vue / Nuxt | JavaScript |
| Angular | JavaScript |
| Svelte / SvelteKit | JavaScript |
| Blazor / ASP.NET MVC | .NET |
| Laravel / Blade | PHP |
| Any framework | Just add `<link>` |

---

## Documentation

Full documentation: [docs/00-index.md](docs/00-index.md)

---

## License

Internal Company Use Only.
