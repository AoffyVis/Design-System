import { generateTypeScript } from '@company/tokens';
import type { TokenGraph } from '@company/tokens';
import type { TransformOutput, GenerateConfig } from '../types.js';

/**
 * Transform: TypeScript Definitions
 * Produces type-safe token constants and interfaces.
 */
export function typescriptTransform(graph: TokenGraph, _config: GenerateConfig): TransformOutput[] {
  const content = generateTypeScript(graph);
  return [{ filename: 'tokens.d.ts', content }];
}
