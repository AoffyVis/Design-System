import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from '../lib/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_SRC = resolve(__dirname, '../../tokens/src');
const CSS_CORE_DIST = resolve(__dirname, '../../css-core/dist/core.css');

describe('generator integration', () => {
  let outDir: string;
  let result: ReturnType<typeof generate>;

  beforeAll(() => {
    outDir = mkdtempSync(resolve(tmpdir(), 'ds-generator-test-'));
    result = generate({
      tokensDir: TOKENS_SRC,
      outputDir: outDir,
      platforms: [],
      themes: [],
      verbose: false,
    });
  });

  afterAll(() => {
    rmSync(outDir, { recursive: true, force: true });
  });

  it('resolves all 87 tokens', () => {
    expect(result.tokenCount).toBe(87);
  });

  it('writes one file per registered transform, plus one per theme', () => {
    const expected = [
      'tokens.css',
      'core.css',
      'tokens.json',
      'tokens.d.ts',
      'themes/banking.css',
      'themes/corporate.css',
      'themes/dark.css',
    ];
    for (const filename of expected) {
      expect(existsSync(resolve(outDir, filename)), `missing ${filename}`).toBe(true);
    }
    expect(result.themeCount).toBe(3);
  });

  it('css-utilities output is byte-identical to the independently-built packages/css-core/dist/core.css', () => {
    // The generator's css-utilities transform wraps the exact same
    // parseTokens + assembleCSS pipeline packages/css-core/lib/build.ts
    // uses, against the same token source — so the two builds must match.
    const generated = readFileSync(resolve(outDir, 'core.css'), 'utf-8');
    const independentlyBuilt = readFileSync(CSS_CORE_DIST, 'utf-8');
    expect(generated).toBe(independentlyBuilt);
  });

  it('base tokens.css defines the same custom properties packages/tokens/lib/build.ts does, without inline theme blocks', () => {
    // Unlike packages/tokens/lib/build.ts (which appends theme overrides
    // into the same tokens.css file), the generator emits themes as
    // separate dist/themes/*.css files per docs/06-theme.md's documented
    // architecture — so this file should contain the :root block only.
    const tokensCss = readFileSync(resolve(outDir, 'tokens.css'), 'utf-8');
    expect(tokensCss).toContain('--ds-color-primary-main');
    expect(tokensCss).toContain('--ds-motion-easing-in-out');
    expect(tokensCss).not.toContain('[data-theme=');
  });

  it('each theme file scopes its overrides under [data-theme="<name>"]', () => {
    const dark = readFileSync(resolve(outDir, 'themes/dark.css'), 'utf-8');
    expect(dark).toContain('[data-theme="dark"]');
    expect(dark).toContain('--ds-color-surface-main: #121212');

    const banking = readFileSync(resolve(outDir, 'themes/banking.css'), 'utf-8');
    expect(banking).toContain('[data-theme="banking"]');
    expect(banking).toContain('--ds-color-primary-main: #004D40');
  });

  it('--theme filters which theme files are generated', () => {
    const filteredDir = mkdtempSync(resolve(tmpdir(), 'ds-generator-test-filtered-'));
    try {
      const filtered = generate({
        tokensDir: TOKENS_SRC,
        outputDir: filteredDir,
        platforms: [],
        themes: ['dark'],
        verbose: false,
      });
      expect(filtered.themeCount).toBe(1);
      expect(existsSync(resolve(filteredDir, 'themes/dark.css'))).toBe(true);
      expect(existsSync(resolve(filteredDir, 'themes/banking.css'))).toBe(false);
    } finally {
      rmSync(filteredDir, { recursive: true, force: true });
    }
  });

  it('--platforms filters which transforms run', () => {
    const filteredDir = mkdtempSync(resolve(tmpdir(), 'ds-generator-test-platforms-'));
    try {
      const filtered = generate({
        tokensDir: TOKENS_SRC,
        outputDir: filteredDir,
        platforms: ['json'],
        themes: [],
        verbose: false,
      });
      expect(existsSync(resolve(filteredDir, 'tokens.json'))).toBe(true);
      expect(existsSync(resolve(filteredDir, 'core.css'))).toBe(false);
      expect(existsSync(resolve(filteredDir, 'tokens.css'))).toBe(false);
    } finally {
      rmSync(filteredDir, { recursive: true, force: true });
    }
  });
});
