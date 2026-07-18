import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { toCustomPropertyName, generateCSS } from '../lib/generators/css.js';
import type { TokenGraph, ResolvedToken, TokenType } from '../lib/types.js';

/** Builds a resolved token for tests where the reference/path fields are irrelevant. */
function mkToken(identifier: string, value: string | number, type: TokenType): ResolvedToken {
  return { identifier, value, type, originalValue: value, path: identifier.split('.') };
}

describe('toCustomPropertyName', () => {
  it('prefixes with --ds- and replaces dots with hyphens', () => {
    expect(toCustomPropertyName('color.primary.main')).toBe('--ds-color-primary-main');
  });

  it('converts camelCase segments to kebab-case', () => {
    expect(toCustomPropertyName('motion.easing.inOut')).toBe('--ds-motion-easing-in-out');
    expect(toCustomPropertyName('typography.body.fontSize')).toBe('--ds-typography-body-font-size');
  });

  it('handles single-segment identifiers', () => {
    expect(toCustomPropertyName('spacing')).toBe('--ds-spacing');
  });

  it('property: always starts with --ds- (fast-check)', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*){0,3}$/),
        (identifier) => {
          const result = toCustomPropertyName(identifier);
          expect(result.startsWith('--ds-')).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('property: never contains dots (fast-check)', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*){0,3}$/),
        (identifier) => {
          const result = toCustomPropertyName(identifier);
          // After --ds- prefix, no dots should remain
          expect(result.slice(5)).not.toContain('.');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('property: result is always lowercase (fast-check)', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*){0,3}$/),
        (identifier) => {
          const result = toCustomPropertyName(identifier);
          expect(result).toBe(result.toLowerCase());
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('generateCSS', () => {
  it('produces correct number of custom properties', () => {
    const graph: TokenGraph = new Map<string, ResolvedToken>([
      ['color.primary.main', mkToken('color.primary.main', '#1565C0', 'color')],
      ['spacing.4', mkToken('spacing.4', '1rem', 'dimension')],
      ['radius.md', mkToken('radius.md', '0.25rem', 'dimension')],
    ]);

    const css = generateCSS(graph);
    const declarations = css.match(/--ds-[^:]+:/g) || [];
    expect(declarations).toHaveLength(3);
  });

  it('wraps output in :root { ... }', () => {
    const graph: TokenGraph = new Map<string, ResolvedToken>([
      ['color.primary.main', mkToken('color.primary.main', '#1565C0', 'color')],
    ]);

    const css = generateCSS(graph);
    expect(css).toMatch(/^:root \{/);
    expect(css).toMatch(/\}\n$/);
  });

  it('sorts properties alphabetically', () => {
    const graph: TokenGraph = new Map<string, ResolvedToken>([
      ['spacing.4', mkToken('spacing.4', '1rem', 'dimension')],
      ['color.primary.main', mkToken('color.primary.main', '#1565C0', 'color')],
      ['radius.md', mkToken('radius.md', '0.25rem', 'dimension')],
    ]);

    const css = generateCSS(graph);
    const lines = css.split('\n').filter(l => l.includes('--ds-'));
    // color < radius < spacing alphabetically
    expect(lines[0]).toContain('--ds-color');
    expect(lines[1]).toContain('--ds-radius');
    expect(lines[2]).toContain('--ds-spacing');
  });

  it('property: output contains exactly N declarations for N tokens (fast-check)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (n) => {
          const graph: TokenGraph = new Map();
          for (let i = 0; i < n; i++) {
            const id = `test.token${i}`;
            graph.set(id, mkToken(id, `${i}px`, 'dimension'));
          }
          const css = generateCSS(graph);
          const declarations = css.match(/--ds-[^:]+:/g) || [];
          expect(declarations).toHaveLength(n);
        },
      ),
      { numRuns: 50 },
    );
  });
});
