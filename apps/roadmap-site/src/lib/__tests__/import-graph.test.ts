import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";
import fg from "fast-glob";

/**
 * Requirement 1.3–1.4 guard: the Roadmap_Site must never import from
 * `packages/` (the design-token generation pipeline), either at build time
 * or at runtime. This is a regression guard, not a full module resolver —
 * it scans import/require specifiers textually rather than resolving them
 * through the module graph, which is sufficient to catch any accidental
 * dependency on `packages/` (relative traversal like
 * `../../../packages/foo` or a bare `packages/foo` specifier).
 */

/**
 * Matches the specifier string of:
 * - `import x from "y"` / `import { x } from "y"` / `import * as x from "y"`
 * - bare `import "y"`
 * - `export { x } from "y"` / `export * from "y"`
 * - `require("y")`
 * - dynamic `import("y")`
 */
const IMPORT_SPECIFIER_REGEX =
  /(?:import\s+(?:[\s\S]*?from\s+)?|export\s+(?:[\s\S]*?from\s+)?|require\(\s*|import\(\s*)["']([^"']+)["']/g;

/** True if an import specifier resolves into a `packages/` path segment. */
function referencesPackagesDir(specifier: string): boolean {
  return /(^|\/)packages(\/|$)/.test(specifier);
}

function extractImportSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  for (const match of source.matchAll(IMPORT_SPECIFIER_REGEX)) {
    specifiers.push(match[1]);
  }
  return specifiers;
}

describe("import-graph guard: no dependency on packages/", () => {
  const sourceFiles = fg.sync(["src/**/*.{ts,tsx}", "scripts/**/*.{ts,tsx}"], {
    cwd: process.cwd(),
    ignore: ["**/node_modules/**", "**/.next/**"],
    absolute: false,
  });

  it("finds at least one source file to scan", () => {
    // Sanity check that the glob itself isn't silently matching nothing.
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it("contains no import/require specifier that resolves into packages/", () => {
    const violations: { file: string; specifier: string }[] = [];

    for (const relativeFilePath of sourceFiles) {
      const fileText = readFileSync(relativeFilePath, "utf-8");
      const specifiers = extractImportSpecifiers(fileText);

      for (const specifier of specifiers) {
        if (referencesPackagesDir(specifier)) {
          violations.push({ file: relativeFilePath, specifier });
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
