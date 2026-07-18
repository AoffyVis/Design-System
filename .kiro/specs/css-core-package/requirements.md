# Requirements Document

## Introduction

The `packages/css-core` package is the CSS framework layer of the Company Design System. It consumes Design Token output from `packages/tokens/dist/tokens.css` (CSS Custom Properties) and generates utility classes, reset/base styles, responsive variants, dark mode support, and accessibility helpers. The output is a single compiled CSS file (`dist/core.css`) organized using CSS `@layer` at-rules, ready for consumption by all 9 Supported Platforms. This iteration covers the MVP scope: reset/base, spacing, color, typography, border radius, shadow, responsive variants, dark mode, accessibility, and print utilities.

## Glossary

- **CSS_Core_Generator**: The TypeScript build script that reads Design Token values and produces the generated CSS output file.
- **Token_CSS**: The CSS Custom Properties file (`packages/tokens/dist/tokens.css`) produced by the `@company/tokens` package, serving as input to the CSS_Core_Generator.
- **Utility_Class**: A single-purpose CSS class that maps directly to one CSS Custom Property derived from a Design Token.
- **Responsive_Variant**: A breakpoint-prefixed version of a utility class that activates at a specified minimum viewport width.
- **Dark_Mode**: A theme variant activated by `[data-theme="dark"]` attribute or `prefers-color-scheme: dark` media query.
- **CSS_Layer**: A CSS `@layer` at-rule used to enforce specificity ordering without relying on source-order hacks or `!important`.
- **Design_Token**: A named value (color, spacing, radius, shadow, typography, breakpoint) defined in the token source and exposed as a CSS Custom Property with `--ds-` prefix.
- **Core_CSS_Output**: The generated file at `packages/css-core/dist/core.css` containing all layers.

## Requirements

### Requirement 1: CSS Layer Architecture

**User Story:** As a platform consumer, I want CSS output organized in explicit layers, so that specificity is predictable and I can safely extend styles without fighting cascade conflicts.

#### Acceptance Criteria

1. THE CSS_Core_Generator SHALL produce output using CSS `@layer` at-rules in the order: reset, base, utilities, theme
2. WHEN a utility class and a base style target the same property on an element, THE CSS_Core_Generator SHALL ensure the utility class wins by virtue of layer ordering
3. THE CSS_Core_Generator SHALL NOT use `!important` in any layer except the print layer

### Requirement 2: Reset Layer

**User Story:** As a frontend developer, I want a browser-normalizing reset layer, so that all Supported Platforms start from a consistent rendering baseline.

#### Acceptance Criteria

1. THE CSS_Core_Generator SHALL generate a reset layer that sets `box-sizing: border-box` on all elements and pseudo-elements
2. THE CSS_Core_Generator SHALL generate a reset layer that removes default margin and padding on `body`, headings (`h1`–`h6`), `p`, `ul`, `ol`, `figure`, `blockquote`, and `pre` elements
3. THE CSS_Core_Generator SHALL generate a reset layer that sets images and media elements to `max-width: 100%` and `display: block`
4. THE CSS_Core_Generator SHALL generate a reset layer that resets button and input appearance to remove platform-specific styling

### Requirement 3: Base Layer

**User Story:** As a frontend developer, I want base typographic and color defaults derived from Design Tokens, so that unstyled content looks correct without adding utility classes.

#### Acceptance Criteria

1. THE CSS_Core_Generator SHALL generate a base layer that sets `:root` font-family to `var(--ds-typography-body-md-font-family)`
2. THE CSS_Core_Generator SHALL generate a base layer that sets `:root` font-size to `var(--ds-typography-body-md-font-size)`
3. THE CSS_Core_Generator SHALL generate a base layer that sets `:root` line-height to `var(--ds-typography-body-md-line-height)`
4. THE CSS_Core_Generator SHALL generate a base layer that references only `var(--ds-*)` custom properties for all visual values

### Requirement 4: Spacing Utilities

**User Story:** As a frontend developer, I want spacing utility classes for padding, margin, and gap, so that I can apply consistent spacing from the token scale without writing custom CSS.

#### Acceptance Criteria

1. WHEN the Token_CSS defines spacing scale values (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16), THE CSS_Core_Generator SHALL generate padding utilities `p-{n}`, `pt-{n}`, `pr-{n}`, `pb-{n}`, `pl-{n}`, `px-{n}`, `py-{n}` for each scale value
2. WHEN the Token_CSS defines spacing scale values, THE CSS_Core_Generator SHALL generate margin utilities `m-{n}`, `mt-{n}`, `mr-{n}`, `mb-{n}`, `ml-{n}`, `mx-{n}`, `my-{n}` for each scale value
3. WHEN the Token_CSS defines spacing scale values, THE CSS_Core_Generator SHALL generate gap utilities `gap-{n}` for each scale value
4. THE CSS_Core_Generator SHALL reference `var(--ds-spacing-{n})` in every generated spacing utility value

### Requirement 5: Color Utilities

**User Story:** As a frontend developer, I want text and background color utility classes for all semantic colors, so that I can apply brand-consistent colors using class names.

#### Acceptance Criteria

1. WHEN the Token_CSS defines semantic color tokens (primary, secondary, error, warning, success, info), THE CSS_Core_Generator SHALL generate `text-{color}` utilities mapping to `color: var(--ds-color-{color}-main)`
2. WHEN the Token_CSS defines semantic color tokens, THE CSS_Core_Generator SHALL generate `bg-{color}` utilities mapping to `background-color: var(--ds-color-{color}-main)`
3. THE CSS_Core_Generator SHALL generate color variant utilities `text-{color}-light`, `text-{color}-dark`, `text-{color}-contrast` for tokens that define those variants
4. THE CSS_Core_Generator SHALL generate color variant utilities `bg-{color}-light`, `bg-{color}-dark`, `bg-{color}-contrast` for tokens that define those variants

### Requirement 6: Typography Utilities

**User Story:** As a frontend developer, I want typography utility classes that apply complete type scales, so that I can set font-family, font-size, line-height, and letter-spacing in a single class.

#### Acceptance Criteria

1. WHEN the Token_CSS defines body typography tokens (body-md, body-sm), THE CSS_Core_Generator SHALL generate `text-body-{size}` utilities that set font-family, font-size, font-weight, line-height, and letter-spacing from the corresponding token values
2. WHEN the Token_CSS defines heading typography tokens (heading-h1, heading-h2), THE CSS_Core_Generator SHALL generate `text-heading-{size}` utilities that set font-family, font-size, font-weight, line-height, and letter-spacing from the corresponding token values
3. THE CSS_Core_Generator SHALL reference `var(--ds-typography-{group}-{size}-{property})` for each CSS property within typography utilities

### Requirement 7: Border Radius Utilities

**User Story:** As a frontend developer, I want border radius utility classes for all radius token values, so that I can apply consistent rounding to elements.

#### Acceptance Criteria

1. WHEN the Token_CSS defines radius tokens (none, sm, md, lg, xl, 2xl, full), THE CSS_Core_Generator SHALL generate `rounded-{size}` utilities mapping to `border-radius: var(--ds-radius-{size})`
2. THE CSS_Core_Generator SHALL NOT hardcode any radius pixel or rem values in the generated output

### Requirement 8: Shadow Utilities

**User Story:** As a frontend developer, I want shadow utility classes for all shadow token values, so that I can apply consistent elevation effects.

#### Acceptance Criteria

1. WHEN the Token_CSS defines shadow tokens (none, sm, md, lg, xl, 2xl, inner), THE CSS_Core_Generator SHALL generate `shadow-{size}` utilities mapping to `box-shadow: var(--ds-shadow-{size})`
2. THE CSS_Core_Generator SHALL NOT hardcode any shadow values in the generated output

### Requirement 9: Responsive Variants

**User Story:** As a frontend developer, I want responsive-prefixed utility classes, so that I can apply different styles at different viewport widths using mobile-first breakpoints.

#### Acceptance Criteria

1. WHEN the Token_CSS defines breakpoint tokens (sm=640px, md=768px, lg=1024px, xl=1280px, 2xl=1536px), THE CSS_Core_Generator SHALL generate responsive variants for all utility classes using `{breakpoint}:{utility}` naming
2. THE CSS_Core_Generator SHALL implement responsive variants using `@media (min-width: ...)` queries with the breakpoint token value
3. THE CSS_Core_Generator SHALL escape the colon character in responsive class selectors (e.g., `.md\:p-4`)
4. THE CSS_Core_Generator SHALL group responsive utilities by breakpoint within media query blocks to minimize CSS output size

### Requirement 10: Dark Mode Support

**User Story:** As a frontend developer, I want dark mode support that works via both a data attribute and OS preference detection, so that applications can offer manual and automatic dark mode switching.

#### Acceptance Criteria

1. THE CSS_Core_Generator SHALL generate dark mode styles scoped under the `[data-theme="dark"]` selector
2. THE CSS_Core_Generator SHALL generate a `prefers-color-scheme: dark` media query fallback that applies when no explicit `data-theme` attribute is set (`:root:not([data-theme])`)
3. WHEN an explicit `data-theme` attribute is present on an ancestor element, THE CSS_Core_Generator SHALL ensure the explicit attribute takes precedence over the media query fallback

### Requirement 11: Accessibility Utilities

**User Story:** As a frontend developer, I want accessibility helper classes and sensible focus defaults, so that I can build WCAG 2.2 compliant interfaces without extra effort.

#### Acceptance Criteria

1. THE CSS_Core_Generator SHALL generate a default `focus-visible` outline style using `var(--ds-color-primary-main)` with 2px solid outline and 2px offset
2. THE CSS_Core_Generator SHALL generate an `sr-only` utility class that visually hides content while keeping it accessible to screen readers
3. THE CSS_Core_Generator SHALL generate a `prefers-reduced-motion: reduce` media query that disables animations and transitions globally
4. THE CSS_Core_Generator SHALL NOT remove focus indicators from any interactive element without providing a visible alternative

### Requirement 12: Print Utilities

**User Story:** As a frontend developer, I want print-specific utility classes, so that I can control which elements appear in printed output and preserve backgrounds when needed.

#### Acceptance Criteria

1. THE CSS_Core_Generator SHALL generate a `.no-print` class within a `@media print` block that sets `display: none !important`
2. THE CSS_Core_Generator SHALL generate a `.print-bg` class within a `@media print` block that preserves background colors using `print-color-adjust: exact`
3. THE CSS_Core_Generator SHALL use `!important` only within the print media query layer

### Requirement 13: No Hardcoded Values

**User Story:** As an architect, I want all visual values to reference Design Token custom properties, so that theme switching works correctly and no values are disconnected from the token source of truth.

#### Acceptance Criteria

1. THE CSS_Core_Generator SHALL reference `var(--ds-*)` custom properties for every visual value in the generated CSS output
2. THE CSS_Core_Generator SHALL NOT contain any hardcoded color hex codes, pixel spacing values, or font-size literals in generated utility classes
3. IF the Token_CSS input file is missing or empty, THEN THE CSS_Core_Generator SHALL exit with a non-zero error code and a descriptive error message

### Requirement 14: Build Integration

**User Story:** As a developer, I want the css-core package to build as part of the monorepo pipeline with correct dependency ordering, so that the token output is always available before CSS generation runs.

#### Acceptance Criteria

1. THE CSS_Core_Generator SHALL read token values from `packages/tokens/dist/tokens.css` as its input source
2. WHEN the build command is executed, THE CSS_Core_Generator SHALL produce output at `packages/css-core/dist/core.css`
3. THE CSS_Core_Generator SHALL have zero runtime dependencies — the output is static CSS with no JavaScript runtime required
4. WHEN the `@company/tokens` package has not been built (dist/tokens.css does not exist), THE CSS_Core_Generator SHALL fail with a clear error indicating the dependency must be built first
