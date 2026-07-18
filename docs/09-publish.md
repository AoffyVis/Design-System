# 09 — Publishing

This document describes how to publish the Design System Platform's artifacts to each configured Distribution Channel and the policies governing versioned releases.

> **Prerequisites:** All quality gates (lint, unit tests, build, bundle size check) must pass before any publish step executes. See [docs/10-ci-cd.md](./10-ci-cd.md) for the full pipeline stage order.

---

## Publishing to npm (GitLab Package Registry)

The npm packages (`@company/tokens`, `@company/css-core`, `@company/generator`, `@company/cli`) are published to the GitLab Package Registry scoped to the project.

### Steps

1. Ensure the working tree is clean and all tests pass.
2. Bump the version in each package's `package.json` following the Semantic Versioning Policy below.
3. Run the build pipeline to produce fresh artifacts:
   ```bash
   pnpm build
   ```
4. Authenticate with the GitLab Package Registry:
   ```bash
   npm config set @company:registry https://gitlab.example.com/api/v4/projects/<PROJECT_ID>/packages/npm/
   npm config set -- '//gitlab.example.com/api/v4/projects/<PROJECT_ID>/packages/npm/:_authToken' "${CI_JOB_TOKEN}"
   ```
5. Publish each package:
   ```bash
   pnpm --filter ./packages/* publish --no-git-checks
   ```
6. Verify the published package appears in the GitLab project's **Packages** registry page.

### Artifacts Published

| Package            | Contents                                      |
| ------------------ | --------------------------------------------- |
| `@company/tokens`  | Design Tokens (JSON), TypeScript Definitions  |
| `@company/css-core`| Generated CSS, CSS Custom Properties          |
| `@company/generator` | Token Generator Engine source              |
| `@company/cli`     | CLI binary for local generation               |

---

## Publishing to NuGet (GitLab Package Registry)

The NuGet package provides .NET consumers (Blazor, ASP.NET MVC, Razor) access to design tokens and generated CSS assets.

### Steps

1. Ensure the working tree is clean and all tests pass.
2. Bump the `<Version>` element in the `.csproj` or `.nuspec` manifest following the Semantic Versioning Policy below.
3. Pack the NuGet package:
   ```bash
   dotnet pack --configuration Release
   ```
4. Push to the GitLab NuGet registry:
   ```bash
   dotnet nuget push "*.nupkg" \
     --source "https://gitlab.example.com/api/v4/projects/<PROJECT_ID>/packages/nuget/index.json" \
     --api-key "${CI_JOB_TOKEN}"
   ```
5. Verify the package appears in the GitLab project's **Packages** registry under the NuGet tab.

### Artifacts Published

| Package                       | Contents                              |
| ----------------------------- | ------------------------------------- |
| `Company.DesignSystem.Tokens` | Design Tokens, CSS assets for .NET    |

---

## Publishing to CDN

Static CSS and token assets are deployed to an enterprise CDN (Azure CDN or CloudFront) for consumption by applications that cannot use a package manager.

### Steps

1. Ensure the build step has completed and all bundle size checks pass.
2. Prepare versioned asset paths:
   ```
   /design-system/<version>/css/core.min.css
   /design-system/<version>/css/utilities.min.css
   /design-system/<version>/css/themes/<theme-name>.css
   /design-system/<version>/tokens/tokens.json
   ```
3. Upload assets to the CDN origin storage (Azure Blob Storage or S3):
   ```bash
   az storage blob upload-batch \
     --destination '$web/design-system/<version>' \
     --source ./dist/cdn/
   ```
4. Purge the CDN edge cache for the updated paths:
   ```bash
   az cdn endpoint purge \
     --resource-group <RG> \
     --profile-name <PROFILE> \
     --name <ENDPOINT> \
     --content-paths '/design-system/<version>/*'
   ```
5. Verify asset availability at the public CDN URL.

### Versioned URL Pattern

```
https://cdn.example.com/design-system/1.2.0/css/core.min.css
```

Previous versions remain available at their original URLs — assets are never overwritten in place.

---

## Publishing Documentation (GitLab Pages)

The documentation site is published to GitLab Pages automatically on every merge to the default branch.

### Steps

1. The CI/CD pipeline's **deploy-docs** stage builds a static site from the `docs/` directory.
2. The output is placed in the `public/` artifact directory expected by GitLab Pages.
3. GitLab deploys the artifact to the project's Pages URL:
   ```
   https://<group>.gitlab.io/<project>/
   ```
4. Verify the documentation site is accessible and the navigation reflects the current Documentation Set.

### Content Scope

The published documentation includes all thirteen numbered files from the Documentation Set (`docs/00-index.md` through `docs/12-contributing.md`) plus the changelog.

---

## Semantic Versioning Policy

The Design System Platform follows [Semantic Versioning 2.0.0](https://semver.org/):

| Change Type | Version Bump | Examples                                                    |
| ----------- | ------------ | ----------------------------------------------------------- |
| **Major**   | `X.0.0`      | Design Token identifier renamed or removed; CSS utility class removed or renamed |
| **Minor**   | `x.Y.0`      | New Design Token category added; new utility class group introduced |
| **Patch**   | `x.y.Z`      | Bug fixes that do not change any public API                 |

### Public API Definition

The following are considered public API and must remain stable across Minor and Patch releases:

- CSS utility class names
- Design Token identifiers (JSON keys)
- CSS Custom Property names
- CLI command names and flags
- Package export paths

### Version Synchronization

All packages within the monorepo share a single version number. When any package changes, all packages are versioned together to maintain a consistent release identity across Distribution Channels.

---

## Backward Compatibility Policy

### Guarantees

- **Minor releases** add new tokens, utility classes, or features without removing or renaming existing public API.
- **Patch releases** fix bugs without changing any public API surface.
- **No silent breaking changes.** Any change that removes, renames, or alters the behavior of a public API entry requires a Major version bump.

### Deprecation Process

1. The token or class is marked as deprecated in the documentation and via a console warning (where applicable) in a Minor release.
2. The deprecation notice remains for at least one Minor release cycle.
3. Removal occurs only in the next Major release.

### Migration Support

Each Major release is accompanied by:

- A migration guide listing every breaking change.
- Codemods or find-and-replace patterns where feasible.
- A changelog entry in [docs/CHANGELOG.md](./CHANGELOG.md) describing the rationale.

---

## Related Documents

- [docs/CHANGELOG.md](./CHANGELOG.md) — Versioning policy and release history
- [docs/10-ci-cd.md](./10-ci-cd.md) — Pipeline stages that automate publishing
