# Build

This document describes how to build each package in the monorepo, the required build order, output locations, and how to run the `examples/` directory locally for verification.

> **Note:** The `packages/` directory does not exist yet — this document describes the intended build commands and conventions for when each package is implemented. The root `pnpm build` script currently runs a no-op placeholder (`echo "no packages to build yet"`). As packages are scaffolded, their build commands will be wired into the root orchestration script.

---

## Package Build Commands

Each package under `packages/` exposes a `build` script in its own `package.json`. The root `pnpm build` command orchestrates all package builds in dependency order via pnpm workspaces.

### tokens

Compiles raw Design Token JSON definitions into output formats (CSS Custom Properties, JSON, TypeScript types, theme files).

```bash
# From packages/tokens/
pnpm build
```

Expected implementation: reads `src/*.json` token definitions, validates them against the schema, and writes compiled outputs to `dist/`.

### css-core

Generates the shared CSS framework (reset, base, components, utilities, theme layers) from compiled token outputs.

```bash
# From packages/css-core/
pnpm build
```

Expected implementation: consumes compiled tokens from `packages/tokens/dist/`, applies the CSS architecture layers (Reset → Base → Utilities → Components → Theme), and produces distributable CSS files in `dist/`. The Components layer includes Button, Card, Badge, Input, Alert, Table, Modal, Nav, and Tabs; table sorting, filtering, and pagination remain consumer-side behaviors.

### generator

Builds the transform engine that converts Design Token definitions and CSS source into per-platform output artifacts.

```bash
# From packages/generator/
pnpm build
```

Expected implementation: compiles TypeScript source in `src/` to JavaScript in `dist/`, producing the generator library and its programmatic API.

### cli

Builds the command-line interface that wraps the generator for developer use.

```bash
# From packages/cli/
pnpm build
```

Expected implementation: compiles TypeScript source in `src/` to a standalone executable entry point in `dist/`, linking against the generator package.

### Building all packages from the root

```bash
# From the repository root — orchestrates all packages in dependency order
pnpm build
```

This root command uses pnpm workspaces to invoke each package's `build` script in the correct topological order based on inter-package dependencies.

---

## Build Order & Dependencies

The packages must be built in strict dependency order. Each package depends on the output of the packages before it in the chain:

```text
tokens → css-core → generator → cli
```

| Step | Package    | Depends On             | Reason                                                        |
| ---- | ---------- | ---------------------- | ------------------------------------------------------------- |
| 1    | `tokens`   | —                      | Produces compiled token outputs consumed by all other packages |
| 2    | `css-core` | `tokens`               | Consumes compiled tokens to generate CSS framework layers     |
| 3    | `generator`| `tokens`, `css-core`   | Transforms tokens and CSS source into per-platform artifacts  |
| 4    | `cli`      | `generator`            | Wraps the generator library as a command-line tool             |

pnpm workspaces handles this ordering automatically when `workspace:*` protocol dependencies are declared in each package's `package.json`. The root `pnpm build` command respects this topological sort.

If you need to rebuild a single package after modifying it, you must first ensure its upstream dependencies are up to date:

```bash
# Example: rebuild css-core after a token change
pnpm --filter @company/tokens build
pnpm --filter @company/css-core build
```

---

## Build Output Locations

Each package writes its build output to a `dist/` directory within the package root:

| Package     | Output Directory            | Contents                                                      |
| ----------- | --------------------------- | ------------------------------------------------------------- |
| `tokens`    | `packages/tokens/dist/`     | CSS Custom Properties, JSON tokens, TypeScript types, theme files |
| `css-core`  | `packages/css-core/dist/`   | Compiled CSS files (reset, base, components, utilities, theme) |
| `generator` | `packages/generator/dist/`  | Compiled JavaScript library and programmatic API              |
| `cli`       | `packages/cli/dist/`        | Compiled CLI executable entry point                           |

All `dist/` directories are git-ignored and regenerated on every build. Consumers reference these outputs via the `main`, `module`, or `exports` fields in each package's `package.json`.

---

## Building `examples/` Locally

The `examples/` directory contains reference applications that demonstrate Design System integration for various Supported Platforms. Each example consumes the built packages from `packages/` via workspace links.

### Prerequisites

Before running any example, ensure all packages are built:

```bash
pnpm install
pnpm build
```

### Running an example

Each example provides its own `dev` or `start` script:

```bash
# Run a specific example (e.g., a React example)
pnpm --filter @company/example-react dev
```

Or navigate to the example directory directly:

```bash
cd examples/react-app
pnpm dev
```

### How examples resolve packages

Because `examples/*` is included in the root `workspaces` field of `package.json`, pnpm automatically links example apps to the local `packages/` builds. No manual `npm link` or path aliases are needed — workspace resolution handles it transparently.

### Adding a new example

1. Create a directory under `examples/` (e.g., `examples/vue-app`).
2. Add a `package.json` declaring workspace dependencies on the Design System packages:
   ```json
   {
     "dependencies": {
       "@company/tokens": "workspace:*",
       "@company/css-core": "workspace:*"
     }
   }
   ```
3. Run `pnpm install` from the root to link the workspace dependency.
4. Add a `dev` or `start` script for local development.

---

## Related Documents

- [Contributing — Local Development Setup](./CONTRIBUTING.md) — full contributor setup steps
- [Contributing Guide](./12-contributing.md) — canonical contributor documentation
