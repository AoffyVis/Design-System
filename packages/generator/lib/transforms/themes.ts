import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  parseTokenFile,
  validateTokens,
  resolveReferences,
  generateThemeCSS,
} from '@company/tokens';
import type { TokenGraph } from '@company/tokens';
import type { TransformOutput, GenerateConfig } from '../types.js';

/**
 * Transform: Theme CSS Overrides
 * For each .json file in tokensDir/themes/, produces a CSS file
 * containing only the overridden custom properties under [data-theme="<name>"].
 */
export function themesTransform(_graph: TokenGraph, config: GenerateConfig): TransformOutput[] {
  const themesDir = resolve(config.tokensDir, 'themes');
  const outputs: TransformOutput[] = [];

  let themeFiles: string[];
  try {
    themeFiles = readdirSync(themesDir).filter(f => f.endsWith('.json')).sort();
  } catch {
    // No themes directory — that's fine, just produce no theme outputs
    return [];
  }

  // Filter to requested themes if specified
  const requestedThemes = config.themes.length > 0 ? config.themes : null;

  for (const themeFile of themeFiles) {
    const themeName = themeFile.replace('.json', '');

    // Skip if not in the requested list
    if (requestedThemes && !requestedThemes.includes(themeName)) {
      continue;
    }

    const themePath = resolve(themesDir, themeFile);
    const themeTokens = parseTokenFile(themePath);

    const result = validateTokens(themeTokens);
    if (!result.valid) {
      // Validation errors will be caught by the orchestrator's own
      // validation pass — this is a safety net
      const errorMessages = result.errors
        .map(e => `  ${e.tokenIdentifier}: ${e.message}`)
        .join('\n');
      throw new Error(
        `Theme "${themeName}" failed validation:\n${errorMessages}`,
      );
    }

    const themeGraph = resolveReferences(themeTokens);
    const content = generateThemeCSS(themeGraph, `[data-theme="${themeName}"]`);

    outputs.push({ filename: `themes/${themeName}.css`, content });
  }

  return outputs;
}
