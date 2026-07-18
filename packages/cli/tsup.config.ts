import { defineConfig } from 'tsup';

/**
 * Bundles the CLI entry point into a single, standalone executable JS
 * file — no external runtime dependencies to resolve, so `dist/ds-generate.js`
 * runs under plain `node` once published (bin/ds-generate.ts itself has
 * no shebang; this banner supplies the one the compiled bin needs).
 */
export default defineConfig({
  entry: { 'ds-generate': 'bin/ds-generate.ts' },
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  banner: { js: '#!/usr/bin/env node' },
});
