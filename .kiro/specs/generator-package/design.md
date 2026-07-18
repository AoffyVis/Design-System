# Design: packages/generator + packages/cli

## Architecture

```
packages/cli          → CLI argument parsing + invocation
    ↓ calls
packages/generator    → Pipeline orchestrator + transform registry
    ↓ imports
packages/tokens       → Token parse/validate/resolve (reused as library)
packages/css-core     → CSS utility generation (reused as library)
```

### Key Design Decisions

1. **Reuse, don't rewrite**: The generator imports `parseTokenFiles`, `validateTokens`, `resolveReferences` from `packages/tokens` and `assembleCSS`, `parseTokens` from `packages/css-core` directly. These become library functions, not standalone build scripts.

2. **Transform as pure function**: Each transform is `(graph: TokenGraph, config: Config) => { filename: string; content: string }[]`. No I/O inside transforms — the orchestrator handles all file writing.

3. **CLI is thin**: `packages/cli` only handles arg parsing (via a minimal hand-rolled parser — no dependencies like `commander`/`yargs`) and delegates everything to `packages/generator`.

4. **Themes are just token overrides**: Theme file generation reuses the existing `parseTokenFile` + `resolveReferences` + `generateThemeCSS` pipeline from `packages/tokens`. Each `.json` in `src/themes/` produces one output CSS file.

## Package Structure

```
packages/generator/
  package.json
  tsconfig.json
  lib/
    index.ts              → exports generate() + types
    orchestrator.ts       → full pipeline: parse → validate → resolve → transform → write
    registry.ts           → transform registry (Map<string, TransformFn>)
    transforms/
      css-tokens.ts       → wraps tokens/generators/css.ts
      css-utilities.ts    → wraps css-core assembler
      json.ts             → wraps tokens/generators/json.ts
      typescript.ts       → wraps tokens/generators/typescript.ts
      themes.ts           → per-theme CSS override generator

packages/cli/
  package.json
  tsconfig.json
  bin/
    ds-generate.ts        → entry point (#!/usr/bin/env tsx)
  lib/
    parse-args.ts         → arg parser
    index.ts              → wires args → generate()
```

## Data Flow

```
1. CLI parses args → GenerateConfig
2. Orchestrator calls parseTokenFiles(tokensDir)
3. Orchestrator calls validateTokens(tree) — on failure, halt + report
4. Orchestrator calls resolveReferences(tree) → TokenGraph
5. For each registered transform in config.platforms:
     transform(graph, config) → [{filename, content}]
6. For themes: parse each theme file → resolve → generateThemeCSS
7. Write all outputs to config.outputDir
8. Print summary + exit 0
```

## Types

```typescript
interface GenerateConfig {
  tokensDir: string;
  outputDir: string;
  platforms: string[];
  themes: string[];
  verbose: boolean;
}

type TransformFn = (graph: TokenGraph, config: GenerateConfig) => TransformOutput[];

interface TransformOutput {
  filename: string;
  content: string;
}

interface GenerateResult {
  outputs: TransformOutput[];
  tokenCount: number;
  themeCount: number;
  duration: number;
}
```

## Error Reporting Format

Matches `docs/07-generator.md`:
```
ERROR  <file-path>
       Token "<identifier>" failed validation:
       <rule description>

Build halted. No output was generated.
Exit code: 1
```

## Testing Strategy

- Unit tests for `parse-args.ts` (various CLI inputs)
- Integration test: run the full pipeline against real token sources, verify output files match existing `packages/tokens/dist/` + `packages/css-core/dist/`
- The test proves the generator produces *identical* output to the existing standalone builds — no drift

## Dependency Graph

```
@company/cli
  → @company/generator (workspace dependency)

@company/generator
  → @company/tokens (workspace dependency — for types + lib functions)
  → @company/css-core (workspace dependency — for assembler + token-parser)
```
