# Design Document: css-core-package

## Overview

The `packages/css-core` package is a TypeScript-based CSS generation tool that reads Design Token values from `packages/tokens/dist/tokens.css` and produces a single layered CSS output file at `packages/css-core/dist/core.css`. The generator creates utility classes, reset/base styles, responsive variants, dark mode support, and accessibility helpers — all referencing CSS Custom Properties from the token pipeline.

The architecture follows a pipeline pattern: **Parse tokens → Generate layer modules → Assemble layers → Write output**. Each generation step is a pure function that takes token data and returns CSS strings, making the system easy to test and extend.

## Architecture

```mermaid
graph TD
    A[packages/tokens/dist/tokens.css] -->|Parse| B[Token Parser]
    B -->|TokenMap| C[Layer Generators]
    C -->|Reset| D[reset.ts]
    C -->|Base| E[base.ts]
    C -->|Utilities| F[utilities.ts]
    C -->|Theme/Dark| G[dark-mode.ts]
    C -->|A11y| H[accessibility.ts]
    C -->|Print| I[print.ts]
    D --> J[Layer Assembler]
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    J -->|@layer ordering| K[packages/css-core/dist/core.css]
```

### Layer Order

The output CSS uses `@layer` declarations to enforce specificity:

```css
@layer reset, base, utilities, theme;
```

Each generator module produces CSS wrapped in its corresponding `@layer` block. The assembler concatenates them in the declared order.

### Build Flow

```mermaid
graph LR
    A[pnpm build] -->|1| B[@company/tokens build]
    B -->|2| C[@company/css-core build]
    C -->|tsx lib/build.ts| D[dist/core.css]
```

The root `pnpm build` script is extended to build css-core after tokens, ensuring `tokens.css` exists before generation runs.

## Components and Interfaces

### Token Parser (`lib/token-parser.ts`)

Reads `packages/tokens/dist/tokens.css` and extracts Custom Properties into a structured map.

```typescript
interface TokenMap {
  spacing: Map<string, string>;      // key: "0"|"1"|...|"16", value: CSS var reference
  colors: Map<string, ColorToken>;   // key: "primary"|"secondary"|..., value: variants
  typography: Map<string, TypographyToken>; // key: "body-md"|"heading-h1"|...
  radius: Map<string, string>;       // key: "none"|"sm"|...|"full"
  shadow: Map<string, string>;       // key: "none"|"sm"|...|"inner"
  breakpoints: Map<string, string>;  // key: "sm"|"md"|...|"2xl", value: px value
}

interface ColorToken {
  main: string;
  light?: string;
  dark?: string;
  contrast?: string;
}

interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
}
```

**Responsibilities:**
- Read the tokens.css file from disk
- Parse CSS Custom Properties using regex matching on `--ds-{category}-*` patterns
- Return a structured `TokenMap` object
- Throw an error if the file is missing or contains no tokens

### Layer Generators (`lib/generators/`)

Each generator is a pure function: `(tokens: TokenMap) => string`

| Module | Output |
|--------|--------|
| `reset.ts` | Reset/normalize CSS (static, no token dependency beyond base font) |
| `base.ts` | `:root` defaults referencing typography and color tokens |
| `spacing.ts` | `p-*`, `m-*`, `gap-*` utility classes |
| `colors.ts` | `text-*`, `bg-*` utility classes |
| `typography.ts` | `text-body-*`, `text-heading-*` utility classes |
| `radius.ts` | `rounded-*` utility classes |
| `shadows.ts` | `shadow-*` utility classes |
| `responsive.ts` | Wraps all utility generators in `@media` queries per breakpoint |
| `dark-mode.ts` | `[data-theme="dark"]` and `prefers-color-scheme` rules |
| `accessibility.ts` | `focus-visible`, `sr-only`, `prefers-reduced-motion` |
| `print.ts` | `@media print` rules with `.no-print`, `.print-bg` |

### Layer Assembler (`lib/assembler.ts`)

Combines all generator outputs into the final CSS string with `@layer` declarations.

```typescript
function assembleCSS(tokens: TokenMap): string {
  const layers = [
    `@layer reset, base, utilities, theme;`,
    wrapLayer('reset', generateReset()),
    wrapLayer('base', generateBase(tokens)),
    wrapLayer('utilities', [
      generateSpacing(tokens),
      generateColors(tokens),
      generateTypography(tokens),
      generateRadius(tokens),
      generateShadows(tokens),
      generateResponsive(tokens),
    ].join('\n')),
    wrapLayer('theme', generateDarkMode(tokens)),
    generateAccessibility(tokens),  // outside layers (global)
    generatePrint(),                 // outside layers (@media print)
  ];
  return layers.join('\n\n');
}

function wrapLayer(name: string, css: string): string {
  return `@layer ${name} {\n${css}\n}`;
}
```

### Build Entry Point (`lib/build.ts`)

```typescript
import { parseTokens } from './token-parser';
import { assembleCSS } from './assembler';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const TOKENS_PATH = resolve(__dirname, '../../tokens/dist/tokens.css');
const OUTPUT_PATH = resolve(__dirname, '../dist/core.css');

function build(): void {
  const tokens = parseTokens(TOKENS_PATH);
  const css = assembleCSS(tokens);
  mkdirSync(resolve(__dirname, '../dist'), { recursive: true });
  writeFileSync(OUTPUT_PATH, css, 'utf-8');
  console.log(`✓ Generated ${OUTPUT_PATH}`);
}

build();
```

## Data Models

### Token Categories Consumed

Based on the actual `packages/tokens/dist/tokens.css` output:

| Category | Token Pattern | Utility Pattern | Example |
|----------|--------------|-----------------|---------|
| Spacing | `--ds-spacing-{n}` | `p-{n}`, `m-{n}`, `gap-{n}` | `.p-4 { padding: var(--ds-spacing-4); }` |
| Color | `--ds-color-{name}-{variant}` | `text-{name}`, `bg-{name}` | `.text-primary { color: var(--ds-color-primary-main); }` |
| Typography | `--ds-typography-{group}-{size}-{prop}` | `text-{group}-{size}` | `.text-body-md { font-size: var(--ds-typography-body-md-font-size); }` |
| Radius | `--ds-radius-{size}` | `rounded-{size}` | `.rounded-md { border-radius: var(--ds-radius-md); }` |
| Shadow | `--ds-shadow-{size}` | `shadow-{size}` | `.shadow-lg { box-shadow: var(--ds-shadow-lg); }` |
| Breakpoint | `--ds-breakpoint-{name}` | `{name}:` prefix | `.md\:p-4 { padding: var(--ds-spacing-4); }` |

### Generated Utility Count Estimate

| Category | Base Classes | × Breakpoints (5) | Total |
|----------|-------------|-------------------|-------|
| Spacing (p/m/gap) | 13 values × 15 variants = 195 | 975 | 1,170 |
| Color (text/bg) | 6 colors × ~4 variants × 2 = ~48 | 240 | ~288 |
| Typography | 4 type scales | 20 | 24 |
| Radius | 7 sizes | 35 | 42 |
| Shadow | 7 sizes | 35 | 42 |
| **Total** | **~261** | **~1,305** | **~1,566** |

### Responsive Variant Implementation

```css
/* Base (mobile-first, no media query) */
.p-4 { padding: var(--ds-spacing-4); }

/* Breakpoint variants */
@media (min-width: 640px) {
  .sm\:p-4 { padding: var(--ds-spacing-4); }
}
@media (min-width: 768px) {
  .md\:p-4 { padding: var(--ds-spacing-4); }
}
@media (min-width: 1024px) {
  .lg\:p-4 { padding: var(--ds-spacing-4); }
}
@media (min-width: 1280px) {
  .xl\:p-4 { padding: var(--ds-spacing-4); }
}
@media (min-width: 1536px) {
  .\\32xl\:p-4 { padding: var(--ds-spacing-4); }
}
```

### Dark Mode Implementation

```css
/* Theme layer — explicit attribute */
[data-theme="dark"] {
  /* Dark overrides handled by theme CSS, not css-core */
}

/* Auto-detection fallback */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    /* Dark fallback when no explicit theme is set */
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Layer ordering invariant

*For any* valid token input, the generated CSS output SHALL contain a `@layer` declaration listing layers in the order `reset, base, utilities, theme`, and each layer's content SHALL appear wrapped in the corresponding `@layer` block in that same order.

**Validates: Requirements 1.1, 1.2**

### Property 2: No !important except print layer

*For any* valid token input, the generated CSS output SHALL NOT contain `!important` in any rule outside of `@media print` blocks.

**Validates: Requirements 1.3, 12.3**

### Property 3: No hardcoded visual values in utilities

*For any* generated utility class (spacing, color, typography, radius, shadow), every CSS value for a visual property (color, background-color, padding, margin, gap, font-family, font-size, font-weight, line-height, letter-spacing, border-radius, box-shadow) SHALL be a `var(--ds-*)` reference. No hardcoded hex codes, pixel values, rem values, or font-size literals shall appear in utility declarations.

**Validates: Requirements 3.4, 4.4, 7.2, 8.2, 13.1, 13.2**

### Property 4: Spacing utility completeness

*For any* spacing token value `n` present in the token input, the generated CSS SHALL contain all 15 spacing utility classes: `p-{n}`, `pt-{n}`, `pr-{n}`, `pb-{n}`, `pl-{n}`, `px-{n}`, `py-{n}`, `m-{n}`, `mt-{n}`, `mr-{n}`, `mb-{n}`, `ml-{n}`, `mx-{n}`, `my-{n}`, and `gap-{n}` — each referencing `var(--ds-spacing-{n})`.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 5: Color utility completeness

*For any* semantic color token name present in the token input, the generated CSS SHALL contain both `text-{name}` (mapping to `color: var(--ds-color-{name}-main)`) and `bg-{name}` (mapping to `background-color: var(--ds-color-{name}-main)`). For any color variant (light, dark, contrast) that exists in the token input, corresponding `text-{name}-{variant}` and `bg-{name}-{variant}` utilities SHALL also be generated.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Typography utility completeness

*For any* typography token (body or heading) present in the token input, the generated utility class SHALL set all five CSS properties (font-family, font-size, font-weight, line-height, letter-spacing) and each property SHALL reference the corresponding `var(--ds-typography-{group}-{size}-{property})` custom property.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 7: Radius and shadow utility mapping

*For any* radius token `{size}` in the token input, a `rounded-{size}` class SHALL exist mapping to `border-radius: var(--ds-radius-{size})`. *For any* shadow token `{size}` in the token input, a `shadow-{size}` class SHALL exist mapping to `box-shadow: var(--ds-shadow-{size})`.

**Validates: Requirements 7.1, 8.1**

### Property 8: Responsive variant completeness

*For any* base utility class and *for any* breakpoint token, a responsive variant SHALL exist with the selector `.{bp}\:{utility}` inside a `@media (min-width: {breakpoint-value})` block. All responsive utilities for a given breakpoint SHALL be grouped in a single media query block.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `tokens.css` file missing | `parseTokens()` throws `Error("Token file not found: {path}. Run '@company/tokens build' first.")` — build exits with code 1 |
| `tokens.css` empty (no custom properties) | `parseTokens()` throws `Error("No tokens found in {path}. The token file appears to be empty or malformed.")` — build exits with code 1 |
| Unknown token category encountered | Silently ignored — the parser only extracts known categories |
| Output directory doesn't exist | `mkdirSync` with `{ recursive: true }` creates it |
| Write permission denied on output | Node.js fs error propagates — build exits with code 1 and stack trace |

## Testing Strategy

### Unit Tests (vitest)

Unit tests verify specific expected outputs and edge cases:

- Reset layer contains expected normalizations (box-sizing, margin removal, media defaults)
- Base layer `:root` declarations reference correct token variables
- Typography utilities set all 5 properties
- Dark mode selectors use correct structure
- Accessibility utilities (sr-only, focus-visible, reduced-motion) have correct CSS
- Print utilities use `!important` correctly
- Token parser throws on missing/empty files
- Token parser correctly extracts all categories from real tokens.css

### Property-Based Tests (vitest + fast-check)

Property-based tests verify universal correctness across generated inputs. The project uses `fast-check` (already a workspace devDependency).

Each property test runs a minimum of **100 iterations** with randomly generated token inputs.

| Property | Test Approach |
|----------|--------------|
| Property 1: Layer ordering | Generate random token maps, verify output always has correct @layer order |
| Property 2: No !important outside print | Generate random tokens, scan output for !important, verify only in @media print |
| Property 3: No hardcoded values | Generate random tokens, parse all utility declarations, verify all values are var() |
| Property 4: Spacing completeness | Generate random spacing scale subsets, verify all 15 variants per value |
| Property 5: Color completeness | Generate random color token sets, verify text/bg pairs exist |
| Property 6: Typography completeness | Generate random typography tokens, verify all 5 properties set |
| Property 7: Radius/shadow mapping | Generate random radius/shadow sets, verify classes map correctly |
| Property 8: Responsive completeness | Generate random utilities × breakpoints, verify media queries |

**Tag format:** `Feature: css-core-package, Property {N}: {title}`

### Integration Test

A single integration test runs the full build pipeline (`parseTokens` → `assembleCSS`) against the real `packages/tokens/dist/tokens.css` and verifies:
- Output file is valid CSS (parseable)
- Output references only existing token variables
- Output size is within the performance budget (<100KB uncompressed for core utilities)

