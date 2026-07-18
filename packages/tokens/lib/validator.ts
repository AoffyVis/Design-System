import type {
  RawToken,
  RawTokenTree,
  TokenType,
  ValidationError,
  ValidationResult,
  ValidationRule,
} from './types.js';

/**
 * All recognized token types.
 */
const VALID_TOKEN_TYPES: ReadonlySet<string> = new Set<TokenType>([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'shadow',
]);

/**
 * Naming convention pattern: {category}.{group}[.{variant}][.{property}]
 * Minimum 2 segments, maximum 4 segments.
 * Each segment is one or more word characters (letters, digits, underscore).
 */
const NAMING_PATTERN = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+){1,3}$/;

/**
 * Reference syntax pattern: a string value that is exactly `{someIdentifier}`.
 */
const REFERENCE_PATTERN = /^\{([^}]+)\}$/;

/**
 * Determines whether a value is a token leaf node — carrying a `value`
 * and/or `type` key — as opposed to a branch/grouping node. Uses OR rather
 * than AND so a malformed leaf missing one of the two fields is still
 * treated as a leaf (and validated as such) instead of being mistaken for
 * an empty branch and silently skipped. See `validateRequiredValue` /
 * `validateRequiredType` for the checks that actually flag the missing field.
 */
function isRawToken(node: unknown): node is RawToken {
  return (
    typeof node === 'object' &&
    node !== null &&
    ('value' in node || 'type' in node)
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
 * Extracts the referenced token identifier from a value, or null if the value is not a reference.
 */
function extractReference(value: string | number): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const match = REFERENCE_PATTERN.exec(value);
  return match ? match[1] : null;
}

/**
 * Validates naming convention for a token identifier.
 */
function validateNamingConvention(
  identifier: string,
  errors: ValidationError[],
): void {
  if (!NAMING_PATTERN.test(identifier)) {
    errors.push({
      tokenIdentifier: identifier,
      rule: 'naming-convention' as ValidationRule,
      message: `Token identifier "${identifier}" does not match the naming convention {category}.{group}[.{variant}][.{property}] (2-4 dot-separated segments required).`,
    });
  }
}

/**
 * Validates that a token has the required `value` field.
 */
function validateRequiredValue(
  identifier: string,
  token: RawToken,
  errors: ValidationError[],
): void {
  if (!('value' in token) || token.value === undefined || token.value === null) {
    errors.push({
      tokenIdentifier: identifier,
      rule: 'missing-value' as ValidationRule,
      message: `Token "${identifier}" is missing a required "value" field.`,
    });
  }
}

/**
 * Validates that a token has the required `type` field.
 */
function validateRequiredType(
  identifier: string,
  token: RawToken,
  errors: ValidationError[],
): void {
  if (!('type' in token) || token.type === undefined || token.type === null) {
    errors.push({
      tokenIdentifier: identifier,
      rule: 'missing-type' as ValidationRule,
      message: `Token "${identifier}" is missing a required "type" field.`,
    });
  }
}

/**
 * Validates that the token's type is a recognized TokenType value.
 */
function validateTokenType(
  identifier: string,
  token: RawToken,
  errors: ValidationError[],
): void {
  if ('type' in token && token.type !== undefined && token.type !== null) {
    if (!VALID_TOKEN_TYPES.has(token.type as string)) {
      errors.push({
        tokenIdentifier: identifier,
        rule: 'invalid-type' as ValidationRule,
        message: `Token "${identifier}" has invalid type "${token.type}". Must be one of: ${[...VALID_TOKEN_TYPES].join(', ')}.`,
      });
    }
  }
}

/**
 * Validates that references point to existing tokens.
 */
function validateReferenceExists(
  identifier: string,
  token: RawToken,
  tokenMap: Map<string, RawToken>,
  errors: ValidationError[],
): void {
  const ref = extractReference(token.value);
  if (ref !== null && !tokenMap.has(ref)) {
    errors.push({
      tokenIdentifier: identifier,
      rule: 'reference-not-found' as ValidationRule,
      message: `Token "${identifier}" references "${ref}" which does not exist.`,
    });
  }
}

/**
 * Validates that referenced tokens have matching types.
 */
function validateReferenceType(
  identifier: string,
  token: RawToken,
  tokenMap: Map<string, RawToken>,
  errors: ValidationError[],
): void {
  const ref = extractReference(token.value);
  if (ref === null) {
    return;
  }

  const referencedToken = tokenMap.get(ref);
  if (!referencedToken) {
    // Already caught by reference-not-found
    return;
  }

  if (token.type !== referencedToken.type) {
    errors.push({
      tokenIdentifier: identifier,
      rule: 'reference-type-mismatch' as ValidationRule,
      message: `Token "${identifier}" (type: "${token.type}") references "${ref}" (type: "${referencedToken.type}"). Types must match.`,
    });
  }
}

/**
 * Detects circular references using depth-first traversal with visited/in-stack tracking.
 * Reports all tokens involved in cycles.
 */
function validateCircularReferences(
  tokenMap: Map<string, RawToken>,
  errors: ValidationError[],
): void {
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const reportedCycles = new Set<string>();

  function dfs(identifier: string, path: string[]): void {
    if (inStack.has(identifier)) {
      // Found a cycle — report all tokens in the cycle path
      const cycleStart = path.indexOf(identifier);
      const cycle = path.slice(cycleStart);
      for (const tokenId of cycle) {
        if (!reportedCycles.has(tokenId)) {
          reportedCycles.add(tokenId);
          errors.push({
            tokenIdentifier: tokenId,
            rule: 'circular-reference' as ValidationRule,
            message: `Token "${tokenId}" is involved in a circular reference: ${cycle.join(' → ')} → ${identifier}.`,
          });
        }
      }
      return;
    }

    if (visited.has(identifier)) {
      return;
    }

    visited.add(identifier);
    inStack.add(identifier);

    const token = tokenMap.get(identifier);
    if (token) {
      const ref = extractReference(token.value);
      if (ref !== null && tokenMap.has(ref)) {
        dfs(ref, [...path, identifier]);
      }
    }

    inStack.delete(identifier);
  }

  for (const identifier of tokenMap.keys()) {
    if (!visited.has(identifier)) {
      dfs(identifier, []);
    }
  }
}

/**
 * Detects duplicate identifiers within the flattened token tree.
 * Since flattenTree uses a Map (which deduplicates by key), we walk the tree
 * manually to detect duplicates.
 */
function validateDuplicateIdentifiers(
  tree: RawTokenTree,
  errors: ValidationError[],
): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  function walk(node: RawTokenTree, prefix: string): void {
    for (const key of Object.keys(node)) {
      const child = node[key];
      const identifier = prefix ? `${prefix}.${key}` : key;

      if (isRawToken(child)) {
        if (seen.has(identifier)) {
          duplicates.add(identifier);
        } else {
          seen.add(identifier);
        }
      } else if (typeof child === 'object' && child !== null) {
        walk(child as RawTokenTree, identifier);
      }
    }
  }

  walk(tree, '');

  for (const identifier of duplicates) {
    errors.push({
      tokenIdentifier: identifier,
      rule: 'duplicate-identifier' as ValidationRule,
      message: `Token "${identifier}" is defined more than once.`,
    });
  }
}

/**
 * Validates a raw token tree against all validation rules.
 * Collects ALL errors before returning — does not stop at the first error.
 *
 * Validation rules applied:
 * 1. naming-convention — Token identifiers must match {category}.{group}[.{variant}][.{property}]
 * 2. missing-value — Every leaf node must have a `value` field
 * 3. missing-type — Every leaf node must have a `type` field
 * 4. invalid-type — `type` must be a recognized TokenType value
 * 5. reference-not-found — Referenced tokens must exist
 * 6. reference-type-mismatch — Referenced tokens must have matching types
 * 7. circular-reference — No circular token dependencies
 * 8. duplicate-identifier — No duplicate token identifiers
 */
export function validateTokens(tree: RawTokenTree): ValidationResult {
  const errors: ValidationError[] = [];

  // Step 1: Check for duplicate identifiers (before flattening, which deduplicates)
  validateDuplicateIdentifiers(tree, errors);

  // Step 2: Flatten the tree into a map of identifier → token
  const tokenMap = flattenTree(tree);

  // Step 3: Run per-token validation rules
  for (const [identifier, token] of tokenMap) {
    validateNamingConvention(identifier, errors);
    validateRequiredValue(identifier, token, errors);
    validateRequiredType(identifier, token, errors);
    validateTokenType(identifier, token, errors);
    validateReferenceExists(identifier, token, tokenMap, errors);
    validateReferenceType(identifier, token, tokenMap, errors);
  }

  // Step 4: Run graph-level validation (circular references)
  validateCircularReferences(tokenMap, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}
