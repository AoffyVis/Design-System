import { TokenGraph } from '../types.js';

/**
 * Generates a nested JSON structure from a resolved TokenGraph.
 *
 * Rebuilds the hierarchy using each token's path segments.
 * Each leaf contains `value` (resolved) and `type` fields.
 * Output is pretty-printed with 2-space indentation.
 */
export function generateJSON(graph: TokenGraph): string {
  const root: Record<string, unknown> = {};

  for (const [, token] of graph) {
    const { path, value, type } = token;
    let current: Record<string, unknown> = root;

    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      if (!(segment in current) || typeof current[segment] !== 'object' || current[segment] === null) {
        current[segment] = {};
      }
      current = current[segment] as Record<string, unknown>;
    }

    const leafKey = path[path.length - 1];
    current[leafKey] = { value, type };
  }

  return JSON.stringify(root, null, 2) + '\n';
}
