# Company Design System

An enterprise-grade Design System Platform that enables teams to build consistent, scalable user interfaces across multiple frontend technologies from a single source of truth — semantic Design Tokens.

---

## Goals

- **Shared CSS framework** — modular, framework-agnostic CSS generated from tokens
- **Design Tokens** — single source of truth for colors, typography, spacing, and all visual values
- **Component standards** — consistent patterns and APIs across supported platforms
- **npm / NuGet / CDN publishing** — distribute packages via GitLab Package Registry and CDN
- **Automated CI/CD** — lint, test, build, publish, and deploy documentation via GitLab pipelines

---

## Supported Platforms

| Platform | Category |
| --- | --- |
| React | JavaScript Framework |
| Next.js | JavaScript Framework |
| Vue | JavaScript Framework |
| Angular | JavaScript Framework |
| Svelte | JavaScript Framework |
| Blazor | .NET |
| ASP.NET MVC / Razor | .NET |
| Laravel | PHP |
| Plain HTML | Static |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd CSS-Framework

# 2. Enable pnpm via Corepack (bundled with Node.js 16.9+)
corepack enable

# 3. Install dependencies
pnpm install

# 4. Build all packages
pnpm build
```

Once built, generated assets (CSS, JSON, TypeScript definitions) are available under each package's `dist/` directory for consumption in your application.

---

## Documentation

Full documentation is available in the [Documentation Index](docs/00-index.md).

---

## Repository Structure

```text
packages/       # Core packages (tokens, css-core, generator, cli)
examples/       # Example integrations for each supported platform
docs/           # Project documentation, specifications, and guides
```

---

## License

Internal Company Use Only.
