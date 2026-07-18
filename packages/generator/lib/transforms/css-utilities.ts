import { parseTokens, assembleCSS } from '@company/css-core';
import type { TokenGraph } from '@company/tokens';
import type { TransformOutput, GenerateConfig } from '../types.js';
import { resolve } from 'node:path';

/**
 * Transform: CSS Utilities
 * Produces the layered utility CSS framework from tokens.css.
 * Note: css-core's parseTokens reads from a CSS file path, not from memory,
 * so this transform depends on tokens.css already being written to
 * outputDir. orchestrator.ts writes the css-tokens transform's output
 * immediately, before running this one, to satisfy that dependency.
 */
export function cssUtilitiesTransform(graph: TokenGraph, config: GenerateConfig): TransformOutput[] {
  const tokensCssPath = resolve(config.outputDir, 'tokens.css');
  const tokenMap = parseTokens(tokensCssPath);
  const content = assembleCSS(tokenMap);
  return [{ filename: 'core.css', content }];
}
