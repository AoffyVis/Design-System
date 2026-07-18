import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import type { TransformOutput } from './types.js';

/**
 * Writes transform outputs to disk.
 * Creates subdirectories as needed.
 */
export function writeOutputs(outputs: TransformOutput[], outputDir: string): void {
  for (const output of outputs) {
    const fullPath = resolve(outputDir, output.filename);
    const dir = dirname(fullPath);
    mkdirSync(dir, { recursive: true });
    writeFileSync(fullPath, output.content, 'utf-8');
  }
}
