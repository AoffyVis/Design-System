import type { RawToken, RawTokenTree, ResolvedToken, TokenGraph } from './types.js';

/**
 * Reference syntax pattern: a string value that is exactly `{someIdentifier}`.
 */
const REFERENCE_PATTERN = /^\{([^}]+)\}$/;

/**
 * Determines whether a value is a leaf token node (has both `value` and `type` fields).
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
 * Flattens a RawTokenTree into a Map of identifier → RawToken.
 * The identifier is the dot-joined path of nested keys.
 */
function flattenTree(tree: RawTokenTree, prefix: string = ''): Map<string, RawToken> {
  const result = new Map<string, RawToken>();

  for (const key of Object.keys(tree)) {
    const node = tree[key];
    const identifier = prefix ? `${prefix}.${key}` : key;

    if (isRawToken(node)) {
      result.set(identifier, node as RawToken);
    } else if (typeof node === 'object' && node !== null) {
      const nested = flattenTree(node as RawTokenTree, identifier);
      for (const [nestedId, nestedToken] of nested) {
        result.set(nestedId, nestedToken);
      }
    }
  }

  return result;
}

/**
 * Extracts the referenced token identifier from a value, or null if not a reference.
 */
function extractReference(value: string | number): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const match = REFERENCE_PATTERN.exec(value);
  return match ? match[1] : null;
}

/**
 * Performs a topological sort of token identifiers based on their dependency graph.
 * Tokens with no dependencies come first; tokens that depend on others come after
 * their dependencies.
 *
 * Uses Kahn's algorithm (BFS-based) for clarity and cycle detection.
 *
 * @throws Error if a circular dependency is detected (defense-in-depth).
 */
function topologicalSort(
  identifiers: string[],
  dependencies: Map<string, string>,
): string[] {
  // Build adjacency list and in-degree count.
  // An edge from A → B means "A depends on B" (B must be resolved before A).
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>(); // B → [A, ...] (tokens that depend on B)

  for (const id of identifiers) {
    inDegree.set(id, 0);
    dependents.set(id, []);
  }

  for (const [dependent, dependency] of dependencies) {
    // dependent depends on dependency → edge: dependency → dependent in resolution order
    const current = inDegree.get(dependent) ?? 0;
    inDegree.set(dependent, current + 1);

    const deps = dependents.get(dependency);
    if (deps) {
      deps.push(dependent);
    }
  }

  // Start with tokens that have no dependencies (in-degree 0).
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) {
      queue.push(id);
    }
  }

  // Sort the initial queue for deterministic output.
  queue.sort();

  const sorted: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    const deps = dependents.get(current) ?? [];
    for (const dependent of deps) {
      const degree = inDegree.get(dependent)! - 1;
      inDegree.set(dependent, degree);
      if (degree === 0) {
        queue.push(dependent);
        // Re-sort to maintain deterministic order when multiple nodes become available.
        queue.sort();
      }
    }
  }

  // If not all identifiers are in the sorted list, there's a cycle.
  if (sorted.length !== identifiers.length) {
    const cycleTokens = identifiers.filter((id) => !sorted.includes(id));
    throw new Error(
      `Circular dependency detected among tokens: ${cycleTokens.join(', ')}`,
    );
  }

  return sorted;
}

/**
 * Resolves all token references in a validated RawTokenTree, producing a fully-resolved TokenGraph.
 *
 * This function assumes the input tree has already passed validation (no circular refs,
 * all references exist, types match). As defense-in-depth, it throws if a circular
 * dependency is detected during topological sort.
 *
 * Steps:
 * 1. Flatten the tree into identifier → RawToken map
 * 2. Detect references and build a dependency map
 * 3. Topological sort to determine resolution order
 * 4. Resolve in order: replace `{ref}` with the resolved literal value
 * 5. Return a Map<string, ResolvedToken> with all values fully resolved
 *
 * @param tree - A validated RawTokenTree (post-validation).
 * @returns TokenGraph with all references resolved to literal values.
 * @throws Error if circular dependency is detected (defense-in-depth).
 */
export function resolveReferences(tree: RawTokenTree): TokenGraph {
  // Step 1: Flatten tree into identifier → RawToken map.
  const tokenMap = flattenTree(tree);
  const identifiers = [...tokenMap.keys()];

  // Step 2: Build dependency map (token → its dependency).
  const dependencies = new Map<string, string>();

  for (const [identifier, token] of tokenMap) {
    const ref = extractReference(token.value);
    if (ref !== null) {
      dependencies.set(identifier, ref);
    }
  }

  // Step 3: Topological sort to determine resolution order.
  const sorted = topologicalSort(identifiers, dependencies);

  // Step 4: Resolve in topological order.
  const resolved = new Map<string, ResolvedToken>();

  for (const identifier of sorted) {
    const token = tokenMap.get(identifier)!;
    const path = identifier.split('.');
    const ref = extractReference(token.value);

    let resolvedValue: string | number;

    if (ref !== null) {
      // This token references another — use the already-resolved value.
      const referencedToken = resolved.get(ref);
      if (!referencedToken) {
        // Should not happen after topological sort, but defense-in-depth.
        throw new Error(
          `Cannot resolve reference "{${ref}}" for token "${identifier}": referenced token not yet resolved.`,
        );
      }
      resolvedValue = referencedToken.value;
    } else {
      // Literal value — use as-is.
      resolvedValue = token.value;
    }

    resolved.set(identifier, {
      identifier,
      value: resolvedValue,
      type: token.type,
      originalValue: token.value,
      path,
    });
  }

  return resolved;
}
