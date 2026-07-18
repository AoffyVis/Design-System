# Requirements: packages/generator + packages/cli

## Context

Milestone 5 (Generator) per `docs/11-roadmap.md`. The design system already has working `packages/tokens` (87 tokens → CSS/JSON/TS) and `packages/css-core` (utility CSS from tokens). The Generator package unifies these into a single orchestrator with an extensible transform registry, and the CLI package provides the command-line interface.

## Requirements

### 1. Unified Build Orchestrator
The generator package SHALL provide a single `generate()` function that orchestrates the full pipeline: parse tokens → validate → resolve → run transforms → write outputs. It SHALL import and reuse existing logic from `packages/tokens` and `packages/css-core` rather than reimplementing it.

### 2. Transform Registry
The generator SHALL maintain a registry of transform plugins. Each transform receives a resolved `TokenGraph` and configuration, and returns output artifact(s). Built-in transforms:
- `css-tokens` — CSS Custom Properties (reuses `packages/tokens` CSS generator)
- `css-utilities` — Utility CSS framework (reuses `packages/css-core` assembler)
- `json` — JSON token export (reuses `packages/tokens` JSON generator)
- `typescript` — TypeScript definitions (reuses `packages/tokens` TS generator)
- `themes` — Per-theme CSS override files

### 3. Configuration
The generator SHALL accept a configuration object specifying:
- `tokensDir` — path to token source files (default: `packages/tokens/src`)
- `outputDir` — output directory (default: `dist/`)
- `platforms` — array of transform names to run (default: all)
- `themes` — array of theme names to generate (default: all found in `tokensDir/themes/`)
- `verbose` — enable detailed logging (default: false)

### 4. CLI Interface
`packages/cli` SHALL provide a `generate` command that:
- Parses command-line options and passes them to the generator
- Supports options: `--tokens`, `--output`, `--platforms`, `--theme`, `--verbose`
- Reports success/failure with exit codes (0 = success, 1 = validation error, 2 = I/O error)
- Prints human-readable error messages matching the format in `docs/07-generator.md`

### 5. Error Handling
- On validation failure: print all errors, halt immediately, produce no output (same behavior as current `packages/tokens`)
- On I/O error: print error with file context, exit code 2
- Never produce partial output

### 6. Extensibility
Adding a new transform SHALL require only:
- Creating a transform module exporting `(graph: TokenGraph, config: TransformConfig) => TransformOutput`
- Registering it in the transform registry
- No modification to existing transforms or the orchestrator

### 7. Build Integration
- The root `package.json` build script SHALL be updated to include the generator
- `pnpm build` from the workspace root SHALL produce all outputs via the unified pipeline
- Existing `packages/tokens` and `packages/css-core` SHALL remain independently buildable

### 8. Output Structure
Generated outputs SHALL be written to:
```
dist/
  tokens.css        (CSS Custom Properties)
  tokens.json       (JSON token values)
  tokens.d.ts       (TypeScript definitions)
  core.css          (Utility CSS framework)
  themes/
    dark.css        (Dark theme overrides)
    banking.css     (Banking theme overrides)
    corporate.css   (Corporate theme overrides)
```

### 9. Zero Runtime Dependencies
Both `packages/generator` and `packages/cli` SHALL have zero runtime dependencies beyond Node.js built-ins and workspace packages. Dev dependencies (TypeScript, tsx, vitest) are acceptable.
