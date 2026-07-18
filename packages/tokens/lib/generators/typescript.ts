import { TokenGraph, TokenType } from '../types.js';

/**
 * Maps token types to their TypeScript type representations.
 */
const TYPE_MAP: Record<TokenType, string> = {
  color: 'string',
  dimension: 'string',
  fontFamily: 'string',
  fontWeight: 'number',
  number: 'number',
  duration: 'string',
  cubicBezier: 'string',
  shadow: 'string',
};

/**
 * Returns true if a key needs to be quoted in a TypeScript interface
 * (e.g., numeric keys like "0", "4").
 */
function needsQuotes(key: string): boolean {
  return /^\d/.test(key);
}

interface TreeNode {
  [key: string]: TreeNode | string;
}

/**
 * Generates TypeScript type definitions from a resolved TokenGraph.
 *
 * Produces an exported `DesignTokens` interface with nested structure
 * matching the token hierarchy, plus a `declare const tokens` declaration.
 */
export function generateTypeScript(graph: TokenGraph): string {
  // Build a nested tree where leaves are TS type strings
  const root: TreeNode = {};

  for (const [, token] of graph) {
    const { path, type } = token;
    const tsType = TYPE_MAP[type];
    let current: TreeNode = root;

    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i];
      if (!(segment in current) || typeof current[segment] === 'string') {
        current[segment] = {};
      }
      current = current[segment] as TreeNode;
    }

    const leafKey = path[path.length - 1];
    current[leafKey] = tsType;
  }

  const lines: string[] = [];
  lines.push('export interface DesignTokens {');
  renderNode(root, lines, 1);
  lines.push('}');
  lines.push('');
  lines.push('export declare const tokens: DesignTokens;');
  lines.push('');

  return lines.join('\n');
}

/**
 * Recursively renders a tree node into TypeScript interface lines.
 */
function renderNode(node: TreeNode, lines: string[], depth: number): void {
  const indent = '  '.repeat(depth);
  const keys = Object.keys(node).sort();

  for (const key of keys) {
    const value = node[key];
    const formattedKey = needsQuotes(key) ? `"${key}"` : key;

    if (typeof value === 'string') {
      // Leaf: output type annotation
      lines.push(`${indent}${formattedKey}: ${value};`);
    } else {
      // Branch: open nested object
      lines.push(`${indent}${formattedKey}: {`);
      renderNode(value, lines, depth + 1);
      lines.push(`${indent}};`);
    }
  }
}
