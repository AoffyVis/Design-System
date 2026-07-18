import { TokenGraph } from '../types.js';

/**
 * Converts a camelCase string segment to kebab-case.
 * e.g., "fontSize" → "font-size"
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Transforms a token identifier into a CSS Custom Property name.
 *
 * Steps:
 * 1. Replace dots with hyphens
 * 2. Convert camelCase segments to kebab-case
 * 3. Prefix with `--ds-`
 */
export function toCustomPropertyName(identifier: string): string {
  const hyphenated = identifier.replace(/\./g, '-');
  const kebab = camelToKebab(hyphenated);
  return `--ds-${kebab}`;
}

/**
 * Generates CSS Custom Properties from a resolved TokenGraph.
 *
 * Output is wrapped in `:root { ... }` with properties sorted
 * alphabetically for deterministic output.
 */
export function generateCSS(graph: TokenGraph): string {
  const declarations: Array<{ name: string; value: string | number }> = [];

  for (const [identifier, token] of graph) {
    const name = toCustomPropertyName(identifier);
    declarations.push({ name, value: token.value });
  }

  declarations.sort((a, b) => a.name.localeCompare(b.name));

  const lines = declarations.map(({ name, value }) => `  ${name}: ${value};`);

  return `:root {\n${lines.join('\n')}\n}\n`;
}

/**
 * Generates a theme override block (e.g. `[data-theme="dark"] { ... }`) from
 * a resolved TokenGraph — same custom-property naming as `generateCSS`, but
 * under an arbitrary selector instead of `:root`, and without redeclaring
 * tokens the theme doesn't override (the graph passed in is expected to
 * already contain only the overridden subset).
 */
export function generateThemeCSS(graph: TokenGraph, selector: string): string {
  const declarations: Array<{ name: string; value: string | number }> = [];

  for (const [identifier, token] of graph) {
    const name = toCustomPropertyName(identifier);
    declarations.push({ name, value: token.value });
  }

  declarations.sort((a, b) => a.name.localeCompare(b.name));

  const lines = declarations.map(({ name, value }) => `  ${name}: ${value};`);

  return `${selector} {\n${lines.join('\n')}\n}\n`;
}
