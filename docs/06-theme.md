# Theming

Version: 1.0.0

Status: Draft

---

## Overview

The Design System Platform supports multi-theme architecture through CSS Custom Properties. Themes override default Design Token values without modifying core CSS or requiring a rebuild. This document describes the override mechanism, the relationship between light and dark modes, a complete custom theme example, and how each Supported Platform activates a non-default theme.

---

## Override Mechanism

Themes are implemented as CSS Custom Property overrides. The build pipeline generates one CSS Custom Property per resolved Design Token (using the `--ds-{category}-{group}-{variant}-{property}` naming pattern defined in [docs/spec/naming.md](spec/naming.md)). A theme overrides default token values by redeclaring the same Custom Properties under a scoped selector.

### How It Works

1. **Base layer** — The generator emits all resolved tokens as Custom Properties on `:root`. These are the default (light) values.
2. **Theme layer** — A theme file redeclares only the Custom Properties it wishes to override. Unchanged tokens inherit from the base layer automatically.
3. **Cascade order** — The CSS layer order defined in [ARCHITECTURE.md](../ARCHITECTURE.md) places the Theme layer last (`Reset → Base → Utilities → Components → Theme`), so theme overrides always win without requiring `!important`.

```css
/* Base layer — generated from packages/tokens/src/ */
:root {
  --ds-color-primary-main: #1565C0;
  --ds-color-primary-contrast: #FFFFFF;
  --ds-color-surface-main: #FFFFFF;
  --ds-color-surface-contrast: #1C1B1F;
  --ds-shadow-elevation-2: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
  --ds-radius-md: 0.5rem;
  --ds-spacing-4: 1rem;
  --ds-motion-duration-short: 150ms;
}

/* Theme override — only redeclares tokens that differ */
[data-theme="corporate"] {
  --ds-color-primary-main: #003366;
  --ds-color-primary-contrast: #F0F4F8;
  --ds-color-surface-main: #F8FAFC;
}
```

Because CSS Custom Properties cascade naturally, any component referencing `var(--ds-color-primary-main)` will resolve to the theme-specific value whenever the `[data-theme]` attribute is present on an ancestor element.

### Rules

- A theme file MUST NOT introduce new Custom Property names that do not exist in the base layer.
- A theme file MUST only override properties that are originally generated from Design Token definitions.
- Token overrides MUST preserve the original token's `type` (e.g., a `color` token cannot be overridden with a `dimension` value).

---

## Light / Dark Structure

Light and Dark are the two foundational themes shipped with the platform. They are structured as peer theme files generated from the same token source, differing only in color-related token values.

### Structural Relationship

```text
packages/tokens/src/
├── color.json              ← base color definitions (used for Light)
├── color.dark.json         ← dark-mode overrides (only color tokens that differ)
├── typography.json         ← shared (no light/dark variation)
├── spacing.json            ← shared
├── radius.json             ← shared
├── shadow.json             ← may have dark variants
├── breakpoint.json         ← shared
├── zIndex.json             ← shared
└── motion.json             ← shared
```

### Generated Output

```css
/* Light theme — applied to :root by default */
:root,
[data-theme="light"] {
  --ds-color-primary-main: #1565C0;
  --ds-color-surface-main: #FFFFFF;
  --ds-color-surface-contrast: #1C1B1F;
  --ds-shadow-elevation-2: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
}

/* Dark theme — overrides color and shadow tokens */
[data-theme="dark"] {
  --ds-color-primary-main: #90CAF9;
  --ds-color-surface-main: #121212;
  --ds-color-surface-contrast: #E6E1E5;
  --ds-shadow-elevation-2: 0 1px 3px rgba(0,0,0,0.40), 0 1px 2px rgba(0,0,0,0.50);
}
```

### Key Points

- Light is the default; it applies when no `[data-theme]` attribute is present (the `:root` fallback).
- Dark overrides only color-sensitive tokens (palette, shadows, overlays). Non-color tokens (typography, spacing, radius, breakpoints, z-index, motion) remain shared.
- Both themes are generated from the same build step. Neither is a "patch" on the other — both are complete Custom Property sets for their respective tokens. Tokens not redefined in the dark file inherit from `:root`.
- The `prefers-color-scheme` media query can optionally be used as an automatic default (see Runtime Activation below).

---

## Example Custom Theme

Below is a complete "Banking" theme demonstrating how an organization overrides default token values to apply brand identity. This theme sits alongside `light` and `dark` as a peer theme file.

### Token Source: `packages/tokens/src/themes/banking.json`

```json
{
  "$theme": "banking",
  "$description": "Brand theme for the Banking business unit",
  "color": {
    "primary": {
      "main": { "value": "#004D40", "type": "color" },
      "contrast": { "value": "#E0F2F1", "type": "color" }
    },
    "secondary": {
      "main": { "value": "#00695C", "type": "color" },
      "contrast": { "value": "#FFFFFF", "type": "color" }
    },
    "surface": {
      "main": { "value": "#F1F8F6", "type": "color" },
      "contrast": { "value": "#1B2E2A", "type": "color" }
    },
    "error": {
      "main": { "value": "#B71C1C", "type": "color" },
      "contrast": { "value": "#FFFFFF", "type": "color" }
    },
    "success": {
      "main": { "value": "#1B5E20", "type": "color" },
      "contrast": { "value": "#FFFFFF", "type": "color" }
    }
  },
  "radius": {
    "sm": { "value": "0.25rem", "type": "dimension" },
    "md": { "value": "0.375rem", "type": "dimension" },
    "lg": { "value": "0.5rem", "type": "dimension" }
  },
  "shadow": {
    "elevation": {
      "1": { "value": "0 1px 2px rgba(0,77,64,0.08)", "type": "shadow" },
      "2": { "value": "0 2px 4px rgba(0,77,64,0.12), 0 1px 2px rgba(0,77,64,0.08)", "type": "shadow" },
      "3": { "value": "0 4px 8px rgba(0,77,64,0.16), 0 2px 4px rgba(0,77,64,0.10)", "type": "shadow" }
    }
  },
  "motion": {
    "duration": {
      "short": { "value": "120ms", "type": "duration" },
      "medium": { "value": "250ms", "type": "duration" }
    }
  }
}
```

### Generated CSS: `dist/themes/banking.css`

```css
/**
 * Banking Theme
 * Generated from packages/tokens/src/themes/banking.json
 * DO NOT EDIT — this file is auto-generated by the token pipeline.
 */
[data-theme="banking"] {
  /* Colors — Primary */
  --ds-color-primary-main: #004D40;
  --ds-color-primary-contrast: #E0F2F1;

  /* Colors — Secondary */
  --ds-color-secondary-main: #00695C;
  --ds-color-secondary-contrast: #FFFFFF;

  /* Colors — Surface */
  --ds-color-surface-main: #F1F8F6;
  --ds-color-surface-contrast: #1B2E2A;

  /* Colors — Feedback */
  --ds-color-error-main: #B71C1C;
  --ds-color-error-contrast: #FFFFFF;
  --ds-color-success-main: #1B5E20;
  --ds-color-success-contrast: #FFFFFF;

  /* Radius */
  --ds-radius-sm: 0.25rem;
  --ds-radius-md: 0.375rem;
  --ds-radius-lg: 0.5rem;

  /* Shadows */
  --ds-shadow-elevation-1: 0 1px 2px rgba(0,77,64,0.08);
  --ds-shadow-elevation-2: 0 2px 4px rgba(0,77,64,0.12), 0 1px 2px rgba(0,77,64,0.08);
  --ds-shadow-elevation-3: 0 4px 8px rgba(0,77,64,0.16), 0 2px 4px rgba(0,77,64,0.10);

  /* Motion */
  --ds-motion-duration-short: 120ms;
  --ds-motion-duration-medium: 250ms;
}
```

### Activating the Banking Theme

```html
<!DOCTYPE html>
<html lang="en" data-theme="banking">
<head>
  <link rel="stylesheet" href="/dist/css/core.css" />
  <link rel="stylesheet" href="/dist/themes/banking.css" />
</head>
<body>
  <button class="ds-btn ds-btn--primary">Open Account</button>
</body>
</html>
```

Any element referencing `var(--ds-color-primary-main)` now resolves to `#004D40` (Banking teal) instead of the default `#1565C0` (standard blue).

---

## Runtime / Build-Time Activation per Supported Platform

Each Supported Platform activates a non-default theme through the same underlying mechanism — setting the `data-theme` attribute on a root element — but the integration point differs by platform.

### HTML / Static Websites

**Runtime activation.** Set `data-theme` on the `<html>` element and include the theme CSS file:

```html
<html data-theme="banking">
  <head>
    <link rel="stylesheet" href="/dist/css/core.css" />
    <link rel="stylesheet" href="/dist/themes/banking.css" />
  </head>
</html>
```

Toggle dynamically with JavaScript:

```js
document.documentElement.setAttribute('data-theme', 'dark');
```

### React / Next.js

**Runtime activation.** Use a context provider or layout component:

```tsx
// app/layout.tsx (Next.js App Router example)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="banking">
      <head>
        <link rel="stylesheet" href="/dist/css/core.css" />
        <link rel="stylesheet" href="/dist/themes/banking.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Build-time activation.** Import the theme CSS directly into your build entry point:

```tsx
import '@company/design-system/css/core.css';
import '@company/design-system/themes/banking.css';
```

### Vue

**Runtime activation.** Bind the attribute in `App.vue`:

```vue
<template>
  <div :data-theme="currentTheme">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const currentTheme = ref('banking');
</script>
```

### Angular

**Runtime activation.** Set the attribute via a service or host binding:

```typescript
// app.component.ts
@Component({
  selector: 'app-root',
  host: { '[attr.data-theme]': 'theme' },
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {
  theme = 'banking';
}
```

**Build-time activation.** Import theme CSS in `angular.json` styles array:

```json
{
  "styles": [
    "node_modules/@company/design-system/css/core.css",
    "node_modules/@company/design-system/themes/banking.css"
  ]
}
```

### Svelte

**Runtime activation.** Set the attribute in the root `+layout.svelte`:

```svelte
<svelte:body data-theme={currentTheme} />

<script>
  let currentTheme = 'banking';
</script>
```

**Build-time activation.** Import CSS in your Vite/SvelteKit config or layout.

### Blazor

**Runtime activation.** Set the attribute on the root element in `App.razor` or `MainLayout.razor`:

```razor
<div data-theme="@CurrentTheme">
    @Body
</div>

@code {
    private string CurrentTheme { get; set; } = "banking";
}
```

**Build-time activation.** Reference the theme CSS in `wwwroot/index.html` or `_Host.cshtml`:

```html
<link rel="stylesheet" href="_content/CompanyDesignSystem/themes/banking.css" />
```

### ASP.NET MVC / Razor

**Runtime activation.** Set the attribute in `_Layout.cshtml`:

```html
<html data-theme="@ViewBag.Theme">
```

**Build-time activation.** Bundle the theme CSS via the NuGet package's static assets:

```html
<link rel="stylesheet" href="~/lib/company-design-system/themes/banking.css" />
```

### Laravel

**Runtime activation.** Set the attribute in the Blade layout:

```blade
<html data-theme="{{ session('theme', 'light') }}">
<head>
    <link rel="stylesheet" href="{{ asset('vendor/design-system/css/core.css') }}" />
    <link rel="stylesheet" href="{{ asset('vendor/design-system/themes/banking.css') }}" />
</head>
```

**Build-time activation.** Import via Laravel Mix or Vite:

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      // Theme CSS imported at build time
    }
  }
});
```

### Automatic Dark Mode via Media Query

For platforms that want the OS-level dark mode preference to apply automatically without JavaScript:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --ds-color-primary-main: #90CAF9;
    --ds-color-surface-main: #121212;
    --ds-color-surface-contrast: #E6E1E5;
    /* ... remaining dark overrides ... */
  }
}
```

This only activates when no explicit `data-theme` is set, giving user preference priority over the OS default.

---

## Supersedes / Deep Reference

This document condenses theming information from:

- [ARCHITECTURE.md — Theme Architecture](../ARCHITECTURE.md) — source of truth for the CSS Custom Property override mechanism and example theme names.
- [docs/spec/design-tokens.md — Mapping to Output Formats](spec/design-tokens.md) — describes how Theme Files are generated by overriding only the tokens a theme redefines.

Refer to those files for deeper architectural context and token generation details.
