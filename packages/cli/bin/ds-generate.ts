#!/usr/bin/env tsx
/**
 * ds-generate — CLI entry point for the Design System Generator
 *
 * Parses arguments, invokes the generator pipeline, and reports results.
 * Exit codes: 0 = success, 1 = validation failure, 2 = I/O or usage error
 */
import { resolve } from 'node:path';
import { generate } from '@company/generator';
import { parseArgs, HELP_TEXT } from '../lib/parse-args.js';

const { config, help } = parseArgs(process.argv);

if (help) {
  console.log(HELP_TEXT);
  process.exit(0);
}

// Resolve paths relative to cwd
const resolvedConfig = {
  ...config,
  tokensDir: resolve(process.cwd(), config.tokensDir),
  outputDir: resolve(process.cwd(), config.outputDir),
};

try {
  const result = generate(resolvedConfig);

  // Success summary
  console.log(`\n✓ Design System generated successfully`);
  console.log(`  Tokens:  ${result.tokenCount}`);
  console.log(`  Themes:  ${result.themeCount}`);
  console.log(`  Files:   ${result.outputs.length}`);
  console.log(`  Time:    ${result.duration}ms\n`);
  console.log(`  Output directory: ${resolvedConfig.outputDir}`);

  for (const output of result.outputs) {
    console.log(`    ${output.filename}`);
  }

  console.log('');
  process.exit(0);
} catch (error: unknown) {
  if (error instanceof Error && error.name === 'ValidationFailureError') {
    process.stderr.write(`\nERROR  Token validation failed\n`);
    process.stderr.write(`${error.message}\n`);
    process.stderr.write(`\nExit code: 1\n`);
    process.exit(1);
  }

  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`\nERROR  ${message}\n`);
  process.stderr.write(`\nExit code: 2\n`);
  process.exit(2);
}
