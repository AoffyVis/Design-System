import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { resolveReferences } from '../lib/resolver.js';
import type { RawTokenTree } from '../lib/types.js';

describe('resolveReferences', () => {
  it('passes literal values through unchanged', () => {
    const tree: RawTokenTree = {
      color: { primary: { main: { value: '#1565C0', type: 'color' } } },
    };

    const graph = resolveReferences(tree);

    expect(graph.get('color.primary.main')).toEqual({
      identifier: 'color.primary.main',
      value: '#1565C0',
      type: 'color',
      originalValue: '#1565C0',
      path: ['color', 'primary', 'main'],
    });
  });

  it('resolves a single {reference} to the referenced literal value', () => {
    const tree: RawTokenTree = {
      color: {
        primary: {
          main: { value: '#1565C0', type: 'color' },
          alias: { value: '{color.primary.main}', type: 'color' },
        },
      },
    };

    const graph = resolveReferences(tree);

    const alias = graph.get('color.primary.alias')!;
    expect(alias.value).toBe('#1565C0');
    expect(alias.originalValue).toBe('{color.primary.main}');
  });

  it('resolves a multi-level reference chain to the terminal literal', () => {
    const tree: RawTokenTree = {
      chain: {
        a: { value: '{chain.b}', type: 'number' },
        b: { value: '{chain.c}', type: 'number' },
        c: { value: 42, type: 'number' },
      },
    };

    const graph = resolveReferences(tree);

    expect(graph.get('chain.a')!.value).toBe(42);
    expect(graph.get('chain.b')!.value).toBe(42);
    expect(graph.get('chain.c')!.value).toBe(42);
  });

  it('leaves each token unaffected by sibling resolution (no cross-contamination)', () => {
    const tree: RawTokenTree = {
      spacing: {
        sm: { value: '0.5rem', type: 'dimension' },
        md: { value: '1rem', type: 'dimension' },
      },
    };

    const graph = resolveReferences(tree);

    expect(graph.get('spacing.sm')!.value).toBe('0.5rem');
    expect(graph.get('spacing.md')!.value).toBe('1rem');
  });

  it('resolves a diamond dependency (a→b, a→c, b→d, c→d) to a single consistent value', () => {
    // Two independent paths ("aViaB" and "aViaC") both ultimately depend on
    // "d" through different intermediates ("b" and "c") — both arms of the
    // diamond must converge on the same resolved value.
    const diamond: RawTokenTree = {
      d: { value: '#1565C0', type: 'color' },
      b: { value: '{d}', type: 'color' },
      c: { value: '{d}', type: 'color' },
      aViaB: { value: '{b}', type: 'color' },
      aViaC: { value: '{c}', type: 'color' },
    };

    const graph = resolveReferences(diamond);

    expect(graph.get('d')!.value).toBe('#1565C0');
    expect(graph.get('b')!.value).toBe('#1565C0');
    expect(graph.get('c')!.value).toBe('#1565C0');
    expect(graph.get('aViaB')!.value).toBe('#1565C0');
    expect(graph.get('aViaC')!.value).toBe('#1565C0');
  });

  it('throws on a circular reference (defense-in-depth; validator is expected to catch this first)', () => {
    const cyclicTree: RawTokenTree = {
      a: {
        one: { value: '{a.two}', type: 'color' },
        two: { value: '{a.one}', type: 'color' },
      },
    };

    expect(() => resolveReferences(cyclicTree)).toThrow(/[Cc]ircular/);
  });

  it('property: any acyclic reference chain resolves fully, leaving no {reference} syntax behind', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 8 }),
        fc.integer({ min: -10_000, max: 10_000 }),
        (chainLength, terminalValue) => {
          const links: RawTokenTree = {};
          for (let i = 0; i < chainLength; i++) {
            links[String(i)] =
              i === chainLength - 1
                ? { value: terminalValue, type: 'number' }
                : { value: `{chain.${i + 1}}`, type: 'number' };
          }
          const tree: RawTokenTree = { chain: links };

          const graph = resolveReferences(tree);

          for (let i = 0; i < chainLength; i++) {
            const resolved = graph.get(`chain.${i}`);
            expect(resolved).toBeDefined();
            expect(resolved!.value).toBe(terminalValue);
            expect(typeof resolved!.value === 'string' && /^\{.*\}$/.test(resolved!.value)).toBe(
              false,
            );
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
