import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseTokens } from '../lib/token-parser.js';
import { assembleCSS } from '../lib/assembler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = resolve(__dirname, '../../tokens/dist/tokens.css');

describe('css-core integration', () => {
  let css: string;

  beforeAll(() => {
    const tokens = parseTokens(TOKENS_PATH);
    css = assembleCSS(tokens);
  });

  it('produces non-empty output', () => {
    expect(css.length).toBeGreaterThan(0);
  });

  it('starts with @layer declaration', () => {
    expect(css).toMatch(/^@layer reset, base, components, utilities, theme;/);
  });

  it('contains expected utility selectors', () => {
    expect(css).toContain('.p-4');
    expect(css).toContain('.text-primary');
    expect(css).toContain('.bg-primary');
    expect(css).toContain('.rounded-md');
    expect(css).toContain('.shadow-lg');
    expect(css).toContain('.text-body-md');
    expect(css).toContain('.sr-only');
    expect(css).toContain('.no-print');
  });

  it('contains z-index utilities referencing the zIndex token category', () => {
    expect(css).toContain('.z-modal { z-index: var(--ds-z-index-modal); }');
    expect(css).toContain('.z-dropdown { z-index: var(--ds-z-index-dropdown); }');
  });

  it('contains motion (duration/easing) utilities referencing the motion token category', () => {
    expect(css).toContain(
      '.duration-fast { transition-duration: var(--ds-motion-duration-fast); }'
    );
    expect(css).toContain(
      '.ease-linear { transition-timing-function: var(--ds-motion-easing-linear); }'
    );
  });

  it('contains border utilities referencing --ds-color-border-main, not a hardcoded value', () => {
    expect(css).toContain(
      '.border { border-width: 1px; border-style: solid; border-color: var(--ds-color-border-main); }'
    );
    expect(css).toContain('.border-t { border-top-width: 1px;');
    expect(css).toContain('.border-primary { border-color: var(--ds-color-primary-main); }');
  });

  it('contains responsive variants', () => {
    expect(css).toContain('sm\\:p-4');
    expect(css).toContain('md\\:p-4');
    expect(css).toContain('@media (min-width: 640px)');
    expect(css).toContain('@media (min-width: 768px)');
  });

  it('correctly escapes the digit-leading "2xl" breakpoint prefix', () => {
    // The leading digit in "2xl" must be CSS-escaped as a single backslash
    // hex escape (\32), not double-escaped — a double backslash (\\32) is
    // itself an escaped literal backslash character in CSS, which produces
    // a selector that can never match a real `2xl:*` class name in HTML.
    expect(css).toContain('.\\32xl\\:p-4');
    expect(css).not.toContain('.\\\\32xl');
  });

  it('contains dark mode selectors', () => {
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('prefers-color-scheme: dark');
  });

  it('uses only var(--ds-*) for visual values in utilities', () => {
    // Extract utility layer content
    const utilityMatch = css.match(/@layer utilities \{([\s\S]*?)\n\}/);
    expect(utilityMatch).not.toBeNull();

    // Check that spacing utilities reference var(--ds-*)
    const spacingRule = css.match(/\.p-4\s*\{([^}]+)\}/);
    if (spacingRule) {
      expect(spacingRule[1]).toContain('var(--ds-spacing-4)');
    }
  });

  it('references only custom properties that tokens.css actually defines', () => {
    // Definition-of-done Rule 2, mechanized: a var(--ds-*) whose property
    // isn't defined in dist/tokens.css silently falls back to the CSS
    // initial value (e.g. transition-timing-function → `ease`) with no
    // build error. Real instance: the easing token keys were renamed
    // (--ds-motion-easing-ease-in-out → --ds-motion-easing-in-out) and
    // components.ts kept the old name for two sessions.
    const tokensCss = readFileSync(TOKENS_PATH, 'utf-8');
    const defined = new Set(
      [...tokensCss.matchAll(/(--ds-[\w-]+)\s*:/g)].map((m) => m[1])
    );
    const referenced = [...css.matchAll(/var\((--ds-[\w-]+)/g)].map((m) => m[1]);
    const missing = [...new Set(referenced.filter((name) => !defined.has(name)))];
    expect(missing).toEqual([]);
  });

  it('does not use !important outside print and reduced-motion', () => {
    // Split CSS at @media print and prefers-reduced-motion
    const printIndex = css.indexOf('@media print');
    const reducedMotionIndex = css.indexOf('prefers-reduced-motion');
    const boundary = Math.min(
      printIndex > -1 ? printIndex : css.length,
      reducedMotionIndex > -1 ? reducedMotionIndex : css.length
    );
    const prePrint = css.substring(0, boundary);
    expect(prePrint).not.toContain('!important');
  });
});
