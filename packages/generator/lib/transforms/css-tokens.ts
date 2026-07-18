import { generateCSS } from '@company/tokens';
import type { TokenGraph } from '@company/tokens';
import type { TransformOutput, GenerateConfig } from '../types.js';

/**
 * Transform: CSS Custom Properties
 * Produces a :root { --ds-*: ...; } file from the resolved token graph.
 */
export function cssTokensTransform(graph: TokenGraph, _config: GenerateConfig): TransformOutput[] {
  const content = generateCSS(graph);
  return [{ filename: 'tokens.css', content }];
}
