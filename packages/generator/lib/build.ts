/**
 * Standalone build script for @company/generator.
 * Runs the full pipeline with default configuration.
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from './index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');
const repoRoot = resolve(packageRoot, '..', '..');

try {
  const result = generate({
    tokensDir: resolve(repoRoot, 'packages', 'tokens', 'src'),
    outputDir: resolve(repoRoot, 'dist'),
    platforms: [],    // all
    themes: [],       // all
    verbose: false,
  });

  console.log(
    `✓ Generated ${result.tokenCount} tokens → ${result.outputs.length} files in ${result.duration}ms`,
  );
  for (const output of result.outputs) {
    console.log(`  dist/${output.filename}`);
  }

  process.exit(0);
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[ERROR] ${message}\n`);
  process.exit(error instanceof Error && error.name === 'ValidationFailureError' ? 1 : 2);
}
