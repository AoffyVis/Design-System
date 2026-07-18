import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ParseResult, RawToken, RawTokenTree } from './types.js';

/**
 * Determines whether a value is a well-formed leaf token node (has both a
 * correctly-typed `value` and `type` field).
 */
function isRawToken(node: unknown): node is RawToken {
  return (
    typeof node === 'object' &&
    node !== null &&
    'value' in node &&
    'type' in node &&
    (typeof (node as RawToken).value === 'string' || typeof (node as RawToken).value === 'number') &&
    typeof (node as RawToken).type === 'string'
  );
}

/**
 * True for any object carrying a `value` and/or `type` key, even if it does
 * not (yet) satisfy `isRawToken`. Used to stop `walkTree` from mistaking a
 * malformed leaf (e.g. missing `value`) for an empty branch node and
 * silently discarding it — malformed leaves must survive parsing so
 * `validateTokens` can report exactly which field is missing.
 */
function looksLikeAttemptedLeaf(node: unknown): boolean {
  return (
    typeof node === 'object' &&
    node !== null &&
    !Array.isArray(node) &&
    ('value' in node || 'type' in node)
  );
}

/**
 * Recursively walks a parsed JSON object and builds a RawTokenTree.
 * Well-formed leaf nodes (objects with a valid `value` and `type`) are
 * preserved as-is. Malformed attempted leaves (missing/invalid `value` or
 * `type`) are also preserved as-is, unvalidated, so the validator can
 * report the defect instead of the token silently vanishing. Only nodes
 * with neither key are treated as branches and recursed into.
 */
function walkTree(obj: Record<string, unknown>): RawTokenTree {
  const tree: RawTokenTree = {};

  for (const key of Object.keys(obj)) {
    const node = obj[key];

    if (isRawToken(node)) {
      tree[key] = { value: node.value, type: node.type };
    } else if (looksLikeAttemptedLeaf(node)) {
      tree[key] = node as RawToken;
    } else if (typeof node === 'object' && node !== null && !Array.isArray(node)) {
      tree[key] = walkTree(node as Record<string, unknown>);
    }
  }

  return tree;
}

/**
 * Merges a source tree into a target tree. Nested objects are merged recursively;
 * leaf tokens in the source overwrite those in the target.
 */
function mergeTrees(target: RawTokenTree, source: RawTokenTree): RawTokenTree {
  for (const key of Object.keys(source)) {
    const sourceNode = source[key];
    const targetNode = target[key];

    if (
      targetNode &&
      !isRawToken(targetNode) &&
      !isRawToken(sourceNode) &&
      typeof targetNode === 'object' &&
      typeof sourceNode === 'object'
    ) {
      target[key] = mergeTrees(
        targetNode as RawTokenTree,
        sourceNode as RawTokenTree,
      );
    } else {
      target[key] = sourceNode;
    }
  }

  return target;
}

/**
 * Parses a single token JSON file into a RawTokenTree. Top-level keys that
 * aren't token branches or leaves (e.g. a `$theme`/`$description` metadata
 * string) are silently ignored by `walkTree`, since they match none of its
 * three branches (not a raw token, not an attempted leaf, not a nested
 * object) — safe to include in a theme override file without special-casing.
 *
 * @param filePath - Absolute or relative path to a single token JSON file.
 * @throws Error with file path context on JSON syntax errors.
 */
export function parseTokenFile(filePath: string): RawTokenTree {
  const raw = readFileSync(filePath, 'utf-8');

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse ${filePath}: ${message}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Failed to parse ${filePath}: root value must be an object`);
  }

  return walkTree(parsed as Record<string, unknown>);
}

/**
 * Parses all `.json` token source files from the given directory and produces
 * a unified RawTokenTree with file path tracking. Does not recurse into
 * subdirectories — this is what lets `src/themes/dark.json` exist without
 * being folded into the base tree by this scan (see `build.ts`, which parses
 * it separately via `parseTokenFile`).
 *
 * @param srcDir - Absolute or relative path to the directory containing token JSON files.
 * @returns ParseResult containing the merged token tree and list of parsed file paths.
 * @throws Error with file path context on JSON syntax errors.
 */
export function parseTokenFiles(srcDir: string): ParseResult {
  const entries = readdirSync(srcDir).filter((f) => f.endsWith('.json')).sort();
  const filePaths: string[] = [];
  let tokens: RawTokenTree = {};

  for (const fileName of entries) {
    const filePath = join(srcDir, fileName);
    filePaths.push(filePath);
    const tree = parseTokenFile(filePath);
    tokens = mergeTrees(tokens, tree);
  }

  return { tokens, filePaths };
}
