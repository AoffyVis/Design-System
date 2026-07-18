import {
  parseTokenFiles,
  validateTokens,
  resolveReferences,
} from '@company/tokens';
import type { TokenGraph, ValidationError } from '@company/tokens';
import { getTransform, getAllTransformNames } from './registry.js';
import { writeOutputs } from './writer.js';
import type { GenerateConfig, TransformOutput, GenerateResult } from './types.js';

/**
 * Error thrown when token validation fails.
 * Contains all validation errors for reporting.
 */
export class ValidationFailureError extends Error {
  constructor(public readonly errors: ValidationError[]) {
    const summary = errors.map(e =>
      `  Token "${e.tokenIdentifier}" failed validation:\n  ${e.message}`
    ).join('\n\n');
    super(`Token validation failed:\n\n${summary}\n\nBuild halted. No output was generated.`);
    this.name = 'ValidationFailureError';
  }
}

/**
 * Orchestrates the full generation pipeline:
 * 1. Parse token source files
 * 2. Validate (halt on failure)
 * 3. Resolve references → TokenGraph
 * 4. Run requested transforms and write their outputs
 * 5. Return the collected result
 *
 * css-utilities depends on css-tokens' output existing on disk (css-core's
 * parseTokens reads tokens.css from a file path, not from memory), so
 * css-tokens is written immediately after it runs, before css-utilities
 * runs. Every other transform's output is written once, after all
 * transforms have completed.
 */
export function orchestrate(config: GenerateConfig): GenerateResult {
  const start = Date.now();

  if (config.verbose) {
    console.log(`[generator] Parsing tokens from: ${config.tokensDir}`);
  }

  // Step 1: Parse
  const { tokens } = parseTokenFiles(config.tokensDir);

  // Step 2: Validate
  const validationResult = validateTokens(tokens);
  if (!validationResult.valid) {
    throw new ValidationFailureError(validationResult.errors);
  }

  if (config.verbose) {
    console.log(`[generator] Validation passed`);
  }

  // Step 3: Resolve
  const graph: TokenGraph = resolveReferences(tokens);

  if (config.verbose) {
    console.log(`[generator] Resolved ${graph.size} tokens`);
  }

  // Step 4: Determine which transforms to run
  const platformNames = config.platforms.length > 0
    ? config.platforms
    : getAllTransformNames();

  const allOutputs: TransformOutput[] = [];
  let themeCount = 0;

  // Phase A: css-tokens, written immediately so css-utilities can read it
  if (platformNames.includes('css-tokens')) {
    const transform = getTransform('css-tokens')!;
    if (config.verbose) console.log(`[generator] Running transform: css-tokens`);
    const outputs = transform(graph, config);
    allOutputs.push(...outputs);
    writeOutputs(outputs, config.outputDir);
  }

  // Phase B: css-utilities (reads tokens.css from outputDir)
  if (platformNames.includes('css-utilities')) {
    const transform = getTransform('css-utilities')!;
    if (config.verbose) console.log(`[generator] Running transform: css-utilities`);
    const outputs = transform(graph, config);
    allOutputs.push(...outputs);
  }

  // Phase C: every other requested transform
  for (const name of platformNames) {
    if (name === 'css-tokens' || name === 'css-utilities') continue;

    const transform = getTransform(name);
    if (!transform) {
      throw new Error(`Unknown transform "${name}". Available: ${getAllTransformNames().join(', ')}`);
    }

    if (config.verbose) console.log(`[generator] Running transform: ${name}`);
    const outputs = transform(graph, config);
    allOutputs.push(...outputs);

    if (name === 'themes') {
      themeCount = outputs.length;
    }
  }

  // Step 5: Write everything from phases B/C (css-tokens was already written)
  writeOutputs(allOutputs.filter(o => o.filename !== 'tokens.css'), config.outputDir);

  const duration = Date.now() - start;

  if (config.verbose) {
    console.log(`[generator] Done in ${duration}ms — ${graph.size} tokens, ${allOutputs.length} files`);
  }

  return {
    outputs: allOutputs,
    tokenCount: graph.size,
    themeCount,
    duration,
  };
}
