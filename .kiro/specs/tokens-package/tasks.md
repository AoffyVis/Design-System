# Implementation Plan: packages/tokens

## Overview

Implement the Design Token pipeline package as a build-time TypeScript tool. The implementation follows the pipeline stages in order: types → parser → validator → resolver → generators → build orchestrator → integration. Each stage is independently testable and builds on the previous.

## Tasks

- [x] 1. Set up package structure and shared types
  - [x] 1.1 Create `packages/tokens/package.json` with build script, TypeScript config, and vitest config
    - Configure `name: "@company/tokens"`, `private: true`, `scripts: { build: "tsx lib/build.ts" }`
    - Add `typescript` and `tsx` as devDependencies
    - Create `tsconfig.json` extending a base config with strict mode
    - Create `vitest.config.ts`
    - _Requirements: 8.1, 8.2_
  - [x] 1.2 Create `packages/tokens/lib/types.ts` with all shared type definitions
    - Define `TokenType`, `RawToken`, `RawTokenTree`, `ResolvedToken`, `TokenGraph`, `ValidationError`, `ValidationRule`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 1.3 Create token source files under `packages/tokens/src/`
    - Create `color.json` with primary, secondary, error, warning, success, info semantic colors (+ surface, border)
    - Create `typography.json` with body, heading font definitions (family, size, weight, lineHeight, letterSpacing)
    - Create `spacing.json` with scale values (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16)
    - Create `radius.json` with none, sm, md, lg, xl, 2xl, full
    - Create `shadow.json` with none, sm, md, lg, xl, 2xl, inner
    - Create `breakpoint.json` with sm, md, lg, xl, 2xl
    - Create `zIndex.json` with hide, base, dropdown, sticky, fixed, overlay, modal, popover, tooltip
    - Create `motion.json` with duration (instant, fast, normal, slow, slower) + easing (linear, in, out, inOut)
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 2. Implement Token Parser
  - [x] 2.1 Implement `packages/tokens/lib/parser.ts`
    - Read all `.json` files from the source directory using `fs` APIs
    - Parse each file as JSON, catching syntax errors with file path context
    - Walk the parsed tree to identify leaf nodes (objects with `value` and `type`)
    - Derive token identifiers by joining nested key paths with dots
    - Merge all category trees into a unified `RawTokenTree`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [ ]* 2.2 Write property test for Token Parser (round-trip)
    - **Property 1: Parse round-trip**
    - Generate random valid token JSON structures with fast-check
    - Parse then serialize back, verify semantic equivalence
    - **Validates: Requirements 1.1, 1.4, 1.5, 9.1**
  - [x] 2.3 Write unit tests for Token Parser
    - Test empty directory handling
    - Test invalid JSON error reporting with file path
    - Test deeply nested token structures
    - Test multiple files merge correctly
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Implement Token Validator
  - [x] 3.1 Implement `packages/tokens/lib/validator.ts`
    - Validate naming convention with regex pattern for `{category}.{group}[.{variant}][.{property}]`
    - Check required `value` and `type` fields on every leaf
    - Check `type` is one of recognized `TokenType` values
    - Detect reference syntax in values and verify referenced tokens exist
    - Verify referenced tokens have matching types
    - Implement cycle detection using depth-first traversal
    - Collect all errors before returning (no early exit)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  - [ ]* 3.2 Write property test for structural validation
    - **Property 2: Structural validation correctness**
    - Generate tokens with valid/invalid structures using fast-check
    - Verify validator accepts valid tokens and rejects invalid ones with correct error types
    - **Validates: Requirements 2.1, 2.2, 2.3**
  - [ ]* 3.3 Write property test for reference integrity
    - **Property 3: Reference integrity validation**
    - Generate token graphs with valid/invalid references and cycles
    - Verify dangling references, type mismatches, and cycles are all detected
    - **Validates: Requirements 2.4, 2.5, 2.6**
  - [x] 3.4 Write unit tests for Token Validator
    - Test each validation rule with a minimal failing example
    - Test error message includes token identifier and rule name
    - Test multiple errors are collected in one pass
    - _Requirements: 2.1-2.8_

- [x] 4. Checkpoint - Parser and Validator
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Reference Resolver
  - [x] 5.1 Implement `packages/tokens/lib/resolver.ts`
    - Build dependency graph from reference syntax in token values
    - Perform topological sort of dependencies
    - Resolve references depth-first, replacing `{...}` with literal values
    - Handle multi-level reference chains (A→B→C)
    - Return a `TokenGraph` (Map of identifier → ResolvedToken)
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 5.2 Write property test for resolution completeness
    - **Property 4: Resolution completeness**
    - Generate valid token sets with references of varying depth
    - Verify no resolved value contains `{...}` reference syntax
    - **Validates: Requirements 3.1, 3.2, 3.3, 5.3**
  - [x] 5.3 Write unit tests for Reference Resolver
    - Test single direct reference
    - Test multi-level chain (3+ levels)
    - Test diamond dependency (A→B, A→C, B→D, C→D)
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Implement CSS Generator
  - [x] 6.1 Implement `packages/tokens/lib/generators/css.ts`
    - Transform token identifiers to CSS Custom Property names (dots→hyphens, camelCase→kebab-case, `--ds-` prefix)
    - Wrap all declarations in `:root { ... }`
    - Output values directly for all supported types
    - Sort properties alphabetically for deterministic output
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_
  - [x] 6.2 Write property test for CSS naming transform
    - **Property 6: CSS naming transform correctness**
    - Generate random token identifiers with camelCase segments
    - Verify transform produces correct `--ds-` prefixed kebab-case names
    - **Validates: Requirements 4.2, 4.3**
  - [x] 6.3 Write property test for CSS completeness
    - **Property 7: CSS output completeness**
    - Generate resolved graphs of random size N
    - Verify CSS output contains exactly N custom property declarations
    - **Validates: Requirements 4.1, 9.3**
  - [x] 6.4 Write unit tests for CSS Generator
    - Test `:root` wrapper structure
    - Test specific token type value formatting
    - Test alphabetical sorting of properties
    - _Requirements: 4.1-4.9_

- [x] 7. Implement JSON Generator
  - [x] 7.1 Implement `packages/tokens/lib/generators/json.ts`
    - Rebuild nested object hierarchy from flat TokenGraph
    - Replace all reference values with resolved literals
    - Retain `value` and `type` fields for each token leaf
    - Output pretty-printed JSON (2-space indent)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 7.2 Write property test for JSON preservation
    - **Property 8: JSON output preservation**
    - Generate valid token collections, run through pipeline
    - Verify JSON output contains every source token with resolved value and type
    - Verify nesting structure matches source
    - **Validates: Requirements 5.1, 5.2, 5.4, 9.2**
  - [ ]* 7.3 Write unit tests for JSON Generator
    - Test output is valid JSON
    - Test nested structure matches source hierarchy
    - Test references are replaced with literals
    - _Requirements: 5.1-5.4_

- [x] 8. Implement TypeScript Generator
  - [x] 8.1 Implement `packages/tokens/lib/generators/typescript.ts`
    - Generate `DesignTokens` interface with nested structure matching token hierarchy
    - Map token types to TypeScript types (color/dimension/fontFamily→string, fontWeight/number→number)
    - Generate `export declare const tokens: DesignTokens` declaration
    - Handle numeric keys in spacing (e.g., `"4"`) with string literal index
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  - [ ]* 8.2 Write property test for TypeScript type mapping
    - **Property 9: TypeScript type mapping correctness**
    - Generate tokens of various types
    - Verify type mapping produces correct TS types for each token type
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**
  - [ ]* 8.3 Write unit tests for TypeScript Generator
    - Test export declaration format
    - Test interface nesting structure
    - Test numeric key handling
    - _Requirements: 6.1-6.8_

- [x] 9. Checkpoint - All Generators
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Build Pipeline and Integration
  - [x] 10.1 Implement `packages/tokens/lib/build.ts` orchestrator
    - Wire together: parse → validate → resolve → generate (CSS + JSON + TS)
    - On validation failure: print all errors to stderr, exit with code 1
    - On success: write all output files to `dist/`, exit with code 0
    - On I/O error: print error to stderr, exit with code 2
    - _Requirements: 8.1, 8.3, 8.4, 8.5, 8.6_
  - [ ]* 10.2 Write property test for invalid input produces no output
    - **Property 5: Invalid input produces no output**
    - Generate invalid token sets (failing various validation rules)
    - Run build pipeline, verify zero files in output directory
    - **Validates: Requirements 2.9**
  - [x] 10.3 Update root `package.json` build script to include tokens package
    - Change root build script from placeholder to `pnpm -r --filter @company/tokens build`
    - Verify `pnpm build` from root triggers the token pipeline
    - _Requirements: 8.2_
  - [ ]* 10.4 Write integration tests for the full build pipeline
    - Test full pipeline with MVP token source files produces all 3 output files
    - Test build exits with code 0 on success
    - Test build exits with code 1 on validation failure and produces no output
    - Verify output file contents match expected format
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 9.2, 9.3_

- [x] 11. Final checkpoint - Full pipeline verification
  - Ensure all tests pass, ask the user if questions arise.
  - Run `pnpm build` from workspace root and verify tokens are generated in `packages/tokens/dist/`

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties (fast-check, 100+ iterations each)
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript with zero runtime dependencies
- All output is deterministic — same input always produces identical output
