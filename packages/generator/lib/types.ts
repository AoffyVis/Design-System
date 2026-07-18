import type { TokenGraph } from '@company/tokens';

/**
 * Configuration for the generate() pipeline.
 */
export interface GenerateConfig {
  /** Path to token source directory */
  tokensDir: string;
  /** Output directory for generated artifacts */
  outputDir: string;
  /** Array of transform names to run (default: all registered) */
  platforms: string[];
  /** Array of theme names to generate (default: all found in tokensDir/themes/) */
  themes: string[];
  /** Enable detailed logging */
  verbose: boolean;
}

/**
 * A single output artifact produced by a transform.
 */
export interface TransformOutput {
  /** Relative path within outputDir (e.g. "tokens.css", "themes/dark.css") */
  filename: string;
  /** File content to write */
  content: string;
}

/**
 * A transform function receives the resolved token graph and config,
 * and returns one or more output artifacts.
 */
export type TransformFn = (graph: TokenGraph, config: GenerateConfig) => TransformOutput[];

/**
 * Result of a full generate() invocation.
 */
export interface GenerateResult {
  /** All output artifacts that were written */
  outputs: TransformOutput[];
  /** Number of base tokens in the graph */
  tokenCount: number;
  /** Number of theme override files generated */
  themeCount: number;
  /** Duration in milliseconds */
  duration: number;
}
