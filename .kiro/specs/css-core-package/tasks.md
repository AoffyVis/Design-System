# Implementation Plan: css-core-package

## Overview

Implement `packages/css-core` — a TypeScript-based CSS generation tool that reads Design Token CSS Custom Properties and produces a layered utility CSS file. The implementation follows the pipeline: Token Parser → Layer Generators → Assembler → Output. Each generator is a pure function, making the system testable and extensible. Uses `vitest` for unit tests and `fast-check` for property-based tests.

## Tasks

- [x] 1. Set up package structure and configuration
  - Create `packages/css-core/package.json` with name `@company/css-core`, workspace dependency on `@company/tokens`, devDependencies for tsx, typescript, vitest, fast-check
  - Create `packages/css-core/tsconfig.json` extending workspace TypeScript config
  - Create directory structure: `lib/`, `lib/generators/`, `__tests__/`
  - Update root `package.json` build script to include css-core after tokens: `"build": "pnpm -r --filter @company/tokens build && pnpm -r --filter @company/css-core build"`
  - _Requirements: 14.1, 14.2, 14.3_

- [x] 2. Implement token parser
  - [x] 2.1 Create `lib/token-parser.ts`
    - Read `packages/tokens/dist/tokens.css` from disk
    - Parse CSS Custom Properties using regex matching on `--ds-{category}-*` patterns
    - Extract spacing, color, typography, radius, shadow, and breakpoint tokens into a typed `TokenMap`
    - Throw descriptive error if file is missing or contains no tokens
    - Export `parseTokens(filePath: string): TokenMap` function
    - _Requirements: 14.1, 13.3, 14.4_

  - [ ]* 2.2 Write unit tests for token parser
    - Test parsing of the real `packages/tokens/dist/tokens.css` file
    - Test error thrown on missing file
    - Test error thrown on empty file
    - Test correct extraction of all token categories (spacing count = 13, colors = 6 semantic, etc.)
    - _Requirements: 13.3, 14.4_

- [x] 3. Implement reset and base layer generators
  - [x] 3.1 Create `lib/generators/reset.ts`
    - Generate box-sizing: border-box on *, *::before, *::after
    - Generate margin/padding removal on body, h1-h6, p, ul, ol, figure, blockquote, pre
    - Generate img/video/svg max-width: 100%, display: block
    - Generate button/input appearance reset
    - Export `generateReset(): string`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.2 Create `lib/generators/base.ts`
    - Generate :root with font-family, font-size, line-height from typography tokens
    - All values must reference var(--ds-*) custom properties
    - Export `generateBase(tokens: TokenMap): string`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.3 Write unit tests for reset and base generators
    - Verify reset output contains box-sizing rule
    - Verify reset output contains margin removal for specified elements
    - Verify base output references var(--ds-typography-body-md-*) properties
    - Verify base output contains no hardcoded values
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4_

- [x] 4. Implement spacing utility generator
  - [x] 4.1 Create `lib/generators/spacing.ts`
    - Generate p-{n}, pt-{n}, pr-{n}, pb-{n}, pl-{n}, px-{n}, py-{n} for all spacing tokens
    - Generate m-{n}, mt-{n}, mr-{n}, mb-{n}, ml-{n}, mx-{n}, my-{n} for all spacing tokens
    - Generate gap-{n} for all spacing tokens
    - All values reference var(--ds-spacing-{n})
    - Export `generateSpacing(tokens: TokenMap): string`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 4.2 Write property test for spacing completeness
    - **Property 4: Spacing utility completeness**
    - Generate random spacing scale subsets, verify all 15 variants are produced per token value
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 5. Implement color utility generator
  - [x] 5.1 Create `lib/generators/colors.ts`
    - Generate text-{color} utilities mapping to color: var(--ds-color-{color}-main)
    - Generate bg-{color} utilities mapping to background-color: var(--ds-color-{color}-main)
    - Generate text-{color}-{variant} and bg-{color}-{variant} for light/dark/contrast variants when they exist
    - Export `generateColors(tokens: TokenMap): string`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 5.2 Write property test for color completeness
    - **Property 5: Color utility completeness**
    - Generate random color token sets with varying variants, verify text/bg pairs exist for each
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 6. Implement typography utility generator
  - [x] 6.1 Create `lib/generators/typography.ts`
    - Generate text-body-{size} classes setting font-family, font-size, font-weight, line-height, letter-spacing
    - Generate text-heading-{size} classes setting all 5 properties
    - All properties reference var(--ds-typography-{group}-{size}-{property})
    - Export `generateTypography(tokens: TokenMap): string`
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 6.2 Write property test for typography completeness
    - **Property 6: Typography utility completeness**
    - Generate random typography tokens, verify each utility sets all 5 CSS properties with correct var() references
    - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 7. Checkpoint - Verify core generators
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement radius and shadow generators
  - [x] 8.1 Create `lib/generators/radius.ts`
    - Generate rounded-{size} utilities mapping to border-radius: var(--ds-radius-{size})
    - Export `generateRadius(tokens: TokenMap): string`
    - _Requirements: 7.1, 7.2_

  - [x] 8.2 Create `lib/generators/shadows.ts`
    - Generate shadow-{size} utilities mapping to box-shadow: var(--ds-shadow-{size})
    - Export `generateShadows(tokens: TokenMap): string`
    - _Requirements: 8.1, 8.2_

  - [ ]* 8.3 Write property test for radius/shadow mapping
    - **Property 7: Radius and shadow utility mapping**
    - Generate random radius/shadow token sets, verify correct class-to-var mapping
    - **Validates: Requirements 7.1, 8.1**

- [x] 9. Implement responsive variant generator
  - [x] 9.1 Create `lib/generators/responsive.ts`
    - Accept all base utility CSS and breakpoint tokens as input
    - For each breakpoint, wrap duplicated utilities in @media (min-width: {value}) block
    - Prefix class selectors with escaped breakpoint name (e.g., `.md\:p-4`)
    - Handle `2xl` breakpoint escaping correctly
    - Group all utilities for a breakpoint in a single media query
    - Export `generateResponsive(tokens: TokenMap, baseUtilities: string): string`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 9.2 Write property test for responsive completeness
    - **Property 8: Responsive variant completeness**
    - Generate random utility × breakpoint combinations, verify media queries and escaped selectors
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

- [x] 10. Implement dark mode, accessibility, and print generators
  - [x] 10.1 Create `lib/generators/dark-mode.ts`
    - Generate [data-theme="dark"] selector block (placeholder for theme overrides)
    - Generate @media (prefers-color-scheme: dark) with :root:not([data-theme]) fallback
    - Export `generateDarkMode(tokens: TokenMap): string`
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 10.2 Create `lib/generators/accessibility.ts`
    - Generate :focus-visible default outline (2px solid var(--ds-color-primary-main), offset 2px)
    - Generate .sr-only class with all required properties
    - Generate @media (prefers-reduced-motion: reduce) disabling animations/transitions
    - Export `generateAccessibility(tokens: TokenMap): string`
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 10.3 Create `lib/generators/print.ts`
    - Generate @media print with .no-print { display: none !important; }
    - Generate @media print with .print-bg { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    - Export `generatePrint(): string`
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ]* 10.4 Write unit tests for dark mode, accessibility, and print
    - Verify [data-theme="dark"] selector in output
    - Verify prefers-color-scheme media query with :root:not([data-theme])
    - Verify focus-visible outline references correct token
    - Verify sr-only has all required CSS properties
    - Verify reduced-motion media query exists
    - Verify .no-print uses !important
    - Verify .print-bg uses print-color-adjust
    - _Requirements: 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 12.1, 12.2_

- [x] 11. Implement layer assembler and build entry point
  - [x] 11.1 Create `lib/assembler.ts`
    - Declare @layer order: reset, base, utilities, theme
    - Wrap each generator output in its corresponding @layer block
    - Place accessibility and print output outside layers (global scope)
    - Export `assembleCSS(tokens: TokenMap): string`
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 11.2 Create `lib/build.ts`
    - Import parseTokens and assembleCSS
    - Resolve input path to ../../tokens/dist/tokens.css
    - Resolve output path to ../dist/core.css
    - Create dist/ directory if needed
    - Write output file
    - Log success message with output path
    - _Requirements: 14.1, 14.2_

  - [ ]* 11.3 Write property tests for layer ordering and no-hardcoded-values
    - **Property 1: Layer ordering invariant**
    - **Property 2: No !important except print layer**
    - **Property 3: No hardcoded visual values in utilities**
    - Generate random token maps, run full assembler, verify layer order, !important constraint, and var() references
    - **Validates: Requirements 1.1, 1.2, 1.3, 3.4, 13.1, 13.2**

- [x] 12. Integration test and final verification
  - [x] 12.1 Write integration test
    - Run full pipeline against real tokens.css
    - Verify output is valid CSS (no syntax errors)
    - Verify all expected selectors present (spot-check: .p-4, .text-primary, .rounded-md, .shadow-lg, .md\:p-4, .sr-only)
    - Verify output size within budget
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 12.2 Run full build and verify
    - Execute `pnpm build` from workspace root (builds tokens then css-core)
    - Verify `packages/css-core/dist/core.css` exists and contains expected content
    - Run `pnpm test` from workspace root to verify all tests pass
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

- [x] 13. Final checkpoint - All tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The token parser is the foundation — if it works correctly, all generators can be tested independently
- Property tests use `fast-check` (already in workspace devDependencies) with minimum 100 iterations
- The responsive generator is the most complex task — it generates the cross-product of all utilities × all breakpoints
- Build order dependency: tokens must build before css-core (enforced by root build script)
