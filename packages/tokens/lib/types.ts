export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'duration'
  | 'cubicBezier'
  | 'number'
  | 'shadow';

export interface RawToken {
  value: string | number;
  type: TokenType;
}

// A tree where leaves are RawToken and branches are nested objects
export type RawTokenTree = {
  [key: string]: RawToken | RawTokenTree;
};

export interface ResolvedToken {
  identifier: string;       // e.g., "color.primary.main"
  value: string | number;   // Fully resolved literal value
  type: TokenType;
  originalValue: string | number; // Original value (may be a reference)
  path: string[];           // e.g., ["color", "primary", "main"]
}

export type TokenGraph = Map<string, ResolvedToken>;

export interface ValidationError {
  tokenIdentifier: string;
  rule: ValidationRule;
  message: string;
  filePath?: string;
}

export type ValidationRule =
  | 'naming-convention'
  | 'missing-value'
  | 'missing-type'
  | 'invalid-type'
  | 'reference-not-found'
  | 'reference-type-mismatch'
  | 'circular-reference'
  | 'duplicate-identifier'
  | 'invalid-json';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ParseResult {
  tokens: RawTokenTree;
  filePaths: string[];
}

export interface BuildOptions {
  srcDir: string;
  outDir: string;
}
