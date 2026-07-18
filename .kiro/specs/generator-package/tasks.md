# Implementation Plan: packages/generator + packages/cli

## Overview

Implement the Generator and CLI packages as Milestone 5. The generator unifies the existing token + CSS pipelines into a single orchestrator with an extensible transform registry. The CLI provides the command-line interface. Both reuse existing code from packages/tokens and packages/css-core.

## Tasks

- [x] 1. Set up packages/generator scaffold
  - Create `packages/generator/package.json` (name: `@company/generator`, workspace deps on `@company/tokens` + `@company/css-core`)
  - Create `packages/generator/tsconfig.json`
  - Create directory structure: `lib/`, `lib/transforms/`
  - Export packages/tokens and packages/css-core functions needed by generator (ensure they're importable as library)
  - _Requirements: 1, 9_

- [x] 2. Export library functions from packages/tokens
  - Ensure `packages/tokens/package.json` has `"exports"` or `"main"` pointing to lib entry
  - Create `packages/tokens/lib/index.ts` exporting: `parseTokenFiles`, `parseTokenFile`, `validateTokens`, `resolveReferences`, `TokenGraph`, `ResolvedToken`, `ValidationResult`
  - Also export generators: `generateCSS`, `generateThemeCSS`, `generateJSON`, `generateTypeScript`, `toCustomPropertyName`
  - _Requirements: 1, 6_

- [x] 3. Export library functions from packages/css-core
  - Ensure `packages/css-core/package.json` has `"exports"` or `"main"` pointing to lib entry
  - Create `packages/css-core/lib/index.ts` exporting: `parseTokens`, `assembleCSS`, `TokenMap`
  - _Requirements: 1, 6_

- [x] 4. Implement transform registry and types
  - Create `packages/generator/lib/types.ts` with `GenerateConfig`, `TransformFn`, `TransformOutput`, `GenerateResult`
  - Create `packages/generator/lib/registry.ts` — Map-based registry with `register()` and `getTransform()` + default registrations
  - _Requirements: 2, 6_

- [x] 5. Implement built-in transforms
  - Create `packages/generator/lib/transforms/css-tokens.ts` — wraps generateCSS
  - Create `packages/generator/lib/transforms/css-utilities.ts` — wraps parseTokens + assembleCSS
  - Create `packages/generator/lib/transforms/json.ts` — wraps generateJSON
  - Create `packages/generator/lib/transforms/typescript.ts` — wraps generateTypeScript
  - Create `packages/generator/lib/transforms/themes.ts` — reads theme files, wraps generateThemeCSS
  - _Requirements: 2, 8_

- [x] 6. Implement orchestrator
  - Create `packages/generator/lib/orchestrator.ts`
  - Pipeline: parse → validate (halt on failure) → resolve → run transforms → collect outputs
  - Theme generation: scan themes dir, parse/validate/resolve each, generate CSS
  - Return `GenerateResult` (no I/O — pure logic)
  - _Requirements: 1, 3, 5_

- [x] 7. Implement file writer and public API
  - Create `packages/generator/lib/writer.ts` — writes TransformOutput[] to outputDir, creates dirs
  - Create `packages/generator/lib/index.ts` — exports `generate(config)` that calls orchestrator + writer
  - Error formatting matching docs/07-generator.md
  - _Requirements: 1, 5, 8_

- [x] 8. Checkpoint — verify generator works standalone
  - Run generator programmatically against real packages/tokens/src
  - Verify output matches existing dist/ artifacts
  - _Requirements: 1, 8_

- [x] 9. Set up packages/cli scaffold
  - Create `packages/cli/package.json` (name: `@company/cli`, workspace dep on `@company/generator`, bin entry)
  - Create `packages/cli/tsconfig.json`
  - Create directory structure: `bin/`, `lib/`
  - _Requirements: 4, 9_

- [x] 10. Implement CLI argument parser
  - Create `packages/cli/lib/parse-args.ts` — hand-rolled parser (no external deps)
  - Support: `--tokens`, `--output`, `--platforms`, `--theme`, `--verbose`, `--help`
  - Return `GenerateConfig` or print help and exit
  - _Requirements: 4, 9_

- [x] 11. Implement CLI entry point
  - Create `packages/cli/bin/ds-generate.ts` — imports parse-args + generator, runs pipeline, handles exit codes
  - Exit 0 on success, 1 on validation failure, 2 on I/O error
  - Print human-readable success summary (token count, output files, duration)
  - _Requirements: 4, 5_

- [x] 12. Update root build script
  - Update root `package.json` build script to use the CLI/generator as the unified entry
  - Ensure `pnpm build` still works and produces identical output
  - Keep packages/tokens and packages/css-core independently buildable
  - _Requirements: 7_

- [x] 13. Write integration test
  - Test full CLI invocation against real token source
  - Verify all expected output files are produced
  - Verify output content matches independently-built artifacts
  - _Requirements: 1, 7, 8_

- [x] 14. Update docs/11-roadmap.md
  - Mark Milestone 5 (Generator) as Done
  - _Requirements: 7_

- [x] 15. Final checkpoint
  - `pnpm build && pnpm test && pnpm run lint` all pass
  - Existing packages/tokens and packages/css-core still build independently
  - CLI `--help` prints usage info

## Notes

- The key principle is REUSE: generator wraps existing proven code, not rewrite it
- packages/tokens and packages/css-core remain independently buildable for backwards compatibility
- No external runtime dependencies — only workspace packages + Node.js built-ins
- The CLI bin name is `ds-generate` to avoid collisions
