import { generateJSON } from '@company/tokens';
import type { TokenGraph } from '@company/tokens';
import type { TransformOutput, GenerateConfig } from '../types.js';

/**
 * Transform: JSON Tokens
 * Produces a resolved JSON token file preserving the nested hierarchy.
 */
export function jsonTransform(graph: TokenGraph, _config: GenerateConfig): TransformOutput[] {
  const content = generateJSON(graph);
  return [{ filename: 'tokens.json', content }];
}
