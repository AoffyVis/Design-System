# Generator

Version: 1.0.0

Status: Draft

---

## Overview

The Design System Platform uses a code generator (`packages/generator`) to transform Design Token definitions and CSS specification source files into per-platform output artifacts. The generator reads structured token JSON files, validates them, resolves semantic references, and emits one output per target format in a single build step. This document describes the generator's inputs, its outputs for each Supported Platform, the CLI used to invoke it, how to add a new platform target, and the error reporting behavior when validation fails.

---

## Inputs

The generator consumes two categories of input:

### 1. Design Token Definitions

Structured JSON files authored under `packages/tokens/src/`, one file per token category. Each file follows the format defined in [docs/spec/design-tokens.md](spec/design-tokens.md):

```json
{
  "color": {
    "primary": {
      "main": { "value": "#1565C0", "type": "color" },
      "contrast": { "value": "#FFFFFF", "type": "color" }
    }
  }
}
```

Token identifiers follow the `{category}.{group}.{variant}.{property}` naming convention. Values may reference other tokens using `{}` syntax (e.g. `"{color.primary.main}"`), which the generator resolves during the Semantic Token Graph stage.

### 2. CSS Specification Source Files

The CSS layer definitions, utility class templates, and responsive/theme configuration maintained in `packages/css-core/`. These files define how resolved token values map to CSS Custom Properties, utility classes, and theme overrides.

Together, these inputs feed into the Token Parser & Validator — the generator's first processing stage — before any output is produced.

---

## Outputs per Platform

The generator walks the resolved Semantic Token Graph once and emits all output formats from the same graph in the same build step. This guarantees that artifacts never drift from one another. The outputs below are produced for consumption across all Supported Platforms.

### CSS Custom Properties

Generated into `packages/css-core/dist/`. These are framework-agnostic and consumed directly by every Supported Platform:

| Platform | Consumption Method |
|---|---|
| Plain HTML | `<link>` tag referencing the distributed CSS file |
| React / Next.js | Import via bundler (`import '@company/design-system/css/core.css'`) |
| Vue | Import in main entry or `App.vue` |
| Angular | Referenced in `angular.json` styles array |
| Svelte | Import in layout or Vite config |
| Blazor | Static asset reference in `wwwroot/index.html` |
| ASP.NET MVC / Razor | NuGet package static asset link |
| Laravel | Asset via Vite or Mix |

### JSON Tokens

Fully-resolved token values exported as JSON for tooling integrations, design tool plugins, and non-JavaScript platforms that cannot consume CSS Custom Properties directly.

### TypeScript Definitions

Type-safe token constants and interfaces for React, Next.js, Angular, Vue, and Svelte projects. These enable autocompletion and compile-time checks when referencing tokens in code.

### Theme Files

Per-theme CSS Custom Property override sets (e.g. `light.css`, `dark.css`, `banking.css`). Each theme file redeclares only the tokens it overrides — unchanged tokens inherit from the base layer.

### Distribution Packaging

All artifacts are passed to the Package Distribution Layer without further transformation:

| Distribution Channel | Package Contents |
|---|---|
| npm (GitLab Package Registry) | CSS, JSON Tokens, TypeScript Definitions, Theme Files |
| NuGet (GitLab Package Registry) | CSS, Theme Files (for Blazor / ASP.NET) |
| CDN | CSS, Theme Files (for static sites and direct inclusion) |
| GitLab Pages | Documentation |

---

## CLI

The generator is invoked through the `packages/cli` package, which provides a command-line interface wrapping the core generation logic. The CLI reads token source files, runs the full pipeline (parse → validate → resolve → transform), and writes output artifacts to the configured destination.

### Invocation

```bash
pnpm generate [options]
```

Run from the repository root — `--tokens`/`--output` paths (and their
defaults below) are resolved relative to the invoking working directory.
`pnpm --filter @company/cli generate [options]` (calling the package's
own `generate` script directly) looks equivalent but silently breaks any
relative path: pnpm changes the working directory to `packages/cli/`
before running that script, so a path like `packages/tokens/src` resolves
to the nonexistent `packages/cli/packages/tokens/src` instead of the repo
root. Use the root-level `pnpm generate` script above, or pass absolute
paths if invoking the CLI package directly.

### Options

| Option | Description | Default |
|---|---|---|
| `--tokens <path>` | Path to token source directory | `packages/tokens/src` |
| `--output <path>` | Output directory for generated artifacts | `dist/` |
| `--platforms <list>` | Comma-separated list of target platforms | all |
| `--theme <name>` | Generate output for a specific theme only | all themes |
| `--verbose` | Enable detailed logging during generation | `false` |

### Example Command

Generate all platform outputs from the default token source:

```bash
pnpm generate --tokens packages/tokens/src --output dist/ --verbose
```

Generate output for a single platform (`react` here is a hypothetical
platform added per "Adding a New Platform Target" below — the built-in
platforms are `css-tokens`, `css-utilities`, `json`, `typescript`, and
`themes`):

```bash
pnpm generate --platforms react --output dist/react/
```

---

## Adding a New Platform Target

The generator's Transform Engine is designed to be extensible. To add a new Supported Platform target:

### 1. Create a Transform Plugin

Add a new transform module under `packages/generator/src/transforms/`:

```text
packages/generator/src/transforms/
├── css.ts           ← CSS Custom Properties
├── json.ts          ← JSON Tokens
├── typescript.ts    ← TypeScript Definitions
├── themes.ts        ← Theme Files
└── <new-platform>.ts  ← New platform transform
```

Each transform module exports a function that receives the resolved Semantic Token Graph and returns the formatted output for that target.

### 2. Register the Transform

Register the new transform in the generator's transform registry (`packages/generator/src/registry.ts`). The registry maps platform identifiers to their corresponding transform functions.

### 3. Configure Distribution

Update the distribution configuration to include the new platform's output in the appropriate Distribution Channel (npm, NuGet, CDN, or a new channel if required).

### 4. Update CLI Platform List

Add the new platform identifier to the CLI's `--platforms` option validation so it can be selected independently.

### 5. Add an Example

Create a consumption example under `examples/<new-platform>/` demonstrating how the generated output is used in a real project scaffold.

### Key Constraints

- The new transform MUST consume the same Semantic Token Graph as all other transforms — no per-platform token source modifications are allowed.
- The new transform MUST be generated in the same build step as existing outputs so artifacts cannot drift.
- The new platform MUST follow the Design Tokens First principle: no visual values may be hardcoded in the transform output.

---

## Error Reporting

The generator enforces strict validation before producing any output. When a Design Token definition fails validation, the following behavior applies:

### Validation Failure

The Token Parser & Validator (stage 2 of the [token flow pipeline](diagrams/design-token-flow.md)) checks every token file against the naming convention and schema rules. If any token fails validation:

1. **Build halts immediately** — no partial or best-effort output is produced.
2. **Error message** — the generator reports the specific validation failure, including:
   - The file path containing the invalid token
   - The token identifier that failed
   - The validation rule that was violated (e.g. invalid type, malformed name, circular reference)
   - A human-readable description of the expected format
3. **Exit code** — the process exits with a non-zero status code, which fails the build stage in the CI/CD pipeline.

### Example Error Output

```text
ERROR  packages/tokens/src/color.json
       Token "color.primary.main" failed validation:
       Invalid type "colour" — expected one of: color, dimension, fontFamily,
       fontWeight, duration, cubicBezier, number, shadow.

Build halted. No output was generated.
Exit code: 1
```

### Reference Resolution Failure

During the Semantic Token Graph stage (stage 3), if a token reference cannot be resolved:

```text
ERROR  packages/tokens/src/color.json
       Token "color.accent.main" references "{color.brand.primary}" which
       does not exist in the token graph.

Build halted. No output was generated.
Exit code: 1
```

### Circular Reference Detection

```text
ERROR  packages/tokens/src/color.json
       Circular reference detected:
       color.primary.main → color.accent.base → color.primary.main

Build halted. No output was generated.
Exit code: 1
```

### Design Principle

No partial output is ever produced. This strict behavior follows the Security Principles defined in ARCHITECTURE.md — configuration is validated fully before any artifact is written, preventing downstream consumers from receiving inconsistent or incomplete styling assets.

---

## Supersedes / Deep Reference

This document condenses generator and pipeline information from:

- [docs/diagrams/design-token-flow.md](diagrams/design-token-flow.md) — the complete stage-by-stage flow from token source to distributed artifacts, including the Token Parser & Validator, Semantic Token Graph, and Transform Engine stages referenced throughout this document.
- [docs/spec/design-tokens.md](spec/design-tokens.md) — the authoritative specification for token file format, naming convention, and validation rules that the generator enforces.

Refer to those files for deeper technical detail on the token pipeline internals.
