import { resolve, dirname } from 'node:path';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseTokenFiles, parseTokenFile } from './parser.js';
import { validateTokens } from './validator.js';
import { resolveReferences } from './resolver.js';
import { generateCSS, generateThemeCSS } from './generators/css.js';
import { generateJSON } from './generators/json.js';
import { generateTypeScript } from './generators/typescript.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Package root is one level up from lib/
const packageRoot = resolve(__dirname, '..');
const srcDir = resolve(packageRoot, 'src');
const outDir = resolve(packageRoot, 'dist');

try {
  // Step 1: Parse all source files
  const { tokens } = parseTokenFiles(srcDir);

  // Step 2: Validate the token tree
  const result = validateTokens(tokens);

  if (!result.valid) {
    // Print all errors to stderr and exit with code 1
    for (const error of result.errors) {
      process.stderr.write(
        `[ERROR] ${error.rule} — ${error.message}\n  Token: ${error.tokenIdentifier}\n`,
      );
    }
    process.exit(1);
  }

  // Step 3: Resolve references
  const graph = resolveReferences(tokens);

  // Step 4: Generate outputs
  let css = generateCSS(graph);
  const json = generateJSON(graph);
  const ts = generateTypeScript(graph);

  // Step 4b: Theme overrides. `src/themes/*.json` sits outside `srcDir`'s
  // scan (parseTokenFiles doesn't recurse), so it's never merged into the
  // base tree above — each is parsed and resolved as its own independent
  // graph and appended as a separate override block, per docs/06-theme.md's
  // Light/Dark Structure.
  const themesDir = resolve(srcDir, 'themes');
  if (existsSync(themesDir)) {
    const { readdirSync } = await import('node:fs');
    const themeFiles = readdirSync(themesDir).filter(f => f.endsWith('.json')).sort();
    for (const themeFile of themeFiles) {
      const themePath = resolve(themesDir, themeFile);
      const themeTokens = parseTokenFile(themePath);
      const themeResult = validateTokens(themeTokens);
      if (!themeResult.valid) {
        for (const error of themeResult.errors) {
          process.stderr.write(
            `[ERROR] ${error.rule} — ${error.message}\n  Token: ${error.tokenIdentifier}\n`,
          );
        }
        process.exit(1);
      }
      const themeGraph = resolveReferences(themeTokens);
      // Extract theme name from $theme field or filename
      const themeName = themeFile.replace('.json', '');
      css += '\n' + generateThemeCSS(themeGraph, `[data-theme="${themeName}"]`);
    }
  }

  // Step 5: Create output directory if it doesn't exist
  mkdirSync(outDir, { recursive: true });

  // Step 6: Write output files
  writeFileSync(resolve(outDir, 'tokens.css'), css, 'utf-8');
  writeFileSync(resolve(outDir, 'tokens.json'), json, 'utf-8');
  writeFileSync(resolve(outDir, 'tokens.d.ts'), ts, 'utf-8');

  // Step 7: Print success message
  const tokenCount = graph.size;
  console.log(
    `✓ Generated ${tokenCount} tokens → dist/tokens.css, dist/tokens.json, dist/tokens.d.ts`,
  );

  process.exit(0);
} catch (error: unknown) {
  // I/O or unexpected error
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[ERROR] ${message}\n`);
  process.exit(2);
}
