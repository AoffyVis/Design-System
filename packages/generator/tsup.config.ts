import { defineConfig } from 'tsup';

/**
 * Bundles this package's public API for external publishing.
 *
 * Not `external`-ing @company/tokens or @company/css-core: they're
 * workspace-linked raw TypeScript with no compiled JS of their own, so a
 * consumer installing @company/generator outside this monorepo couldn't
 * resolve them at runtime otherwise. esbuild inlines both directly into
 * this bundle instead.
 */
export default defineConfig({
  entry: ['lib/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  outDir: 'dist',
  // esbuild externalizes package.json "dependencies" by default (assumes
  // they're separately resolvable in node_modules at runtime) — that
  // assumption is false here, since neither has a compiled entry point of
  // its own. Force them inlined instead.
  noExternal: ['@company/tokens', '@company/css-core'],
});
