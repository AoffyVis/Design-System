import { describe, expect, it } from 'vitest';
import { validateTokens } from '../lib/validator.js';
import type { RawTokenTree } from '../lib/types.js';

describe('validateTokens', () => {
  it('reports valid: true with no errors for a well-formed tree', () => {
    const tree: RawTokenTree = {
      color: {
        primary: {
          main: { value: '#1565C0', type: 'color' },
        },
      },
    };

    const result = validateTokens(tree);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('collects errors from multiple independent bad tokens rather than stopping at the first', () => {
    const tree: RawTokenTree = {
      // Single-segment identifier: violates naming-convention.
      bad: { value: '#111', type: 'not-a-real-type' } as never,
    };

    const result = validateTokens(tree);

    expect(result.valid).toBe(false);
    // naming-convention (1 segment "bad") + invalid-type, both reported.
    const rules = result.errors.map((e) => e.rule).sort();
    expect(rules).toEqual(['invalid-type', 'naming-convention']);
  });

  describe('naming-convention', () => {
    it('rejects a single-segment identifier', () => {
      const tree: RawTokenTree = { color: { value: '#111', type: 'color' } };

      const result = validateTokens(tree);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual([
        expect.objectContaining({ tokenIdentifier: 'color', rule: 'naming-convention' }),
      ]);
    });

    it('rejects an identifier with more than 4 segments', () => {
      const tree: RawTokenTree = {
        a: { b: { c: { d: { e: { value: '#111', type: 'color' } } } } },
      };

      const result = validateTokens(tree);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ tokenIdentifier: 'a.b.c.d.e', rule: 'naming-convention' }),
      );
    });

    it('accepts identifiers with 2 to 4 segments', () => {
      const tree: RawTokenTree = {
        two: { segments: { value: '1rem', type: 'dimension' } },
        three: { seg: { ments: { value: '1rem', type: 'dimension' } } },
        four: { seg: { men: { ts: { value: '1rem', type: 'dimension' } } } },
      };

      const result = validateTokens(tree);

      expect(result.valid).toBe(true);
    });
  });

  describe('missing-value / missing-type', () => {
    it('reports missing-value when the value field is absent', () => {
      const tree: RawTokenTree = {
        color: { primary: JSON.parse('{"type":"color"}') },
      };

      const result = validateTokens(tree);

      expect(result.errors).toContainEqual(
        expect.objectContaining({ tokenIdentifier: 'color.primary', rule: 'missing-value' }),
      );
    });

    it('reports missing-type when the type field is absent', () => {
      const tree: RawTokenTree = {
        color: { primary: JSON.parse('{"value":"#111"}') },
      };

      const result = validateTokens(tree);

      expect(result.errors).toContainEqual(
        expect.objectContaining({ tokenIdentifier: 'color.primary', rule: 'missing-type' }),
      );
    });
  });

  it('reports invalid-type when type is not a recognized TokenType', () => {
    const tree: RawTokenTree = {
      color: { primary: { value: '#111', type: 'bogus' } as never },
    };

    const result = validateTokens(tree);

    expect(result.errors).toContainEqual(
      expect.objectContaining({ tokenIdentifier: 'color.primary', rule: 'invalid-type' }),
    );
  });

  describe('reference validation', () => {
    it('reports reference-not-found when a {reference} points at a nonexistent token', () => {
      const tree: RawTokenTree = {
        color: {
          primary: {
            alias: { value: '{color.primary.doesNotExist}', type: 'color' },
          },
        },
      };

      const result = validateTokens(tree);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          tokenIdentifier: 'color.primary.alias',
          rule: 'reference-not-found',
        }),
      );
    });

    it('reports reference-type-mismatch when the referenced token has a different type', () => {
      const tree: RawTokenTree = {
        color: {
          primary: {
            main: { value: '#1565C0', type: 'color' },
            alias: { value: '{color.primary.main}', type: 'dimension' },
          },
        },
      };

      const result = validateTokens(tree);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          tokenIdentifier: 'color.primary.alias',
          rule: 'reference-type-mismatch',
        }),
      );
    });

    it('does not report reference-not-found or reference-type-mismatch for a valid same-type reference', () => {
      const tree: RawTokenTree = {
        color: {
          primary: {
            main: { value: '#1565C0', type: 'color' },
            alias: { value: '{color.primary.main}', type: 'color' },
          },
        },
      };

      const result = validateTokens(tree);

      expect(result.valid).toBe(true);
    });

    it('reports circular-reference for a two-token cycle', () => {
      const cyclicTree: RawTokenTree = {
        a: {
          one: { value: '{a.two}', type: 'color' },
          two: { value: '{a.one}', type: 'color' },
        },
      };

      const result = validateTokens(cyclicTree);

      expect(result.valid).toBe(false);
      const cycleErrors = result.errors.filter((e) => e.rule === 'circular-reference');
      expect(cycleErrors.map((e) => e.tokenIdentifier).sort()).toEqual(['a.one', 'a.two']);
    });

    it('reports circular-reference for a three-token cycle', () => {
      const tree: RawTokenTree = {
        a: {
          one: { value: '{a.two}', type: 'color' },
          two: { value: '{a.three}', type: 'color' },
          three: { value: '{a.one}', type: 'color' },
        },
      };

      const result = validateTokens(tree);

      expect(result.valid).toBe(false);
      const cycleErrors = result.errors.filter((e) => e.rule === 'circular-reference');
      expect(cycleErrors).toHaveLength(3);
    });
  });

  // NOTE: `duplicate-identifier` is intentionally not exercised here. The
  // validator's tree-walk can only ever see duplicate keys if the JS object
  // it receives already has them — but both plain object literals and
  // `JSON.parse` silently collapse duplicate keys to the last-written value
  // before `validateTokens` ever runs. There is no way to construct a
  // `RawTokenTree` through the real parser pipeline (or through normal JS)
  // that still contains a duplicate key, so this rule cannot currently fire
  // in practice. Flagged for the team rather than worked around here, since
  // fixing it means detecting duplicates during JSON parsing itself (before
  // it collapses into a plain object), not in the validator.
});
