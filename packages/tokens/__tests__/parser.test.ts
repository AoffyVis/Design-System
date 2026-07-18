import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { parseTokenFiles, parseTokenFile } from '../lib/parser.js';
import fc from 'fast-check';

const TMP_DIR = join(import.meta.dirname, '__fixtures__');

function setup(files: Record<string, unknown>) {
  mkdirSync(TMP_DIR, { recursive: true });
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(TMP_DIR, name), JSON.stringify(content), 'utf-8');
  }
}

function cleanup() {
  rmSync(TMP_DIR, { recursive: true, force: true });
}

describe('parseTokenFiles', () => {
  afterAll(cleanup);

  it('returns an empty tree for a directory with no .json files', () => {
    cleanup();
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(join(TMP_DIR, 'readme.txt'), 'not a token');
    const { tokens } = parseTokenFiles(TMP_DIR);
    expect(Object.keys(tokens)).toHaveLength(0);
    cleanup();
  });

  it('throws on invalid JSON with the file path in the message', () => {
    cleanup();
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(join(TMP_DIR, 'bad.json'), '{ invalid json !!', 'utf-8');
    expect(() => parseTokenFiles(TMP_DIR)).toThrowError(/bad\.json/);
    cleanup();
  });

  it('parses deeply nested token structures', () => {
    cleanup();
    setup({
      'deep.json': {
        level1: {
          level2: {
            level3: {
              token: { value: '#000', type: 'color' },
            },
          },
        },
      },
    });
    const { tokens } = parseTokenFiles(TMP_DIR);
    // Should find nested structure
    const level1 = tokens['level1'] as Record<string, unknown>;
    const level2 = level1['level2'] as Record<string, unknown>;
    const level3 = level2['level3'] as Record<string, unknown>;
    expect(level3['token']).toEqual({ value: '#000', type: 'color' });
    cleanup();
  });

  it('merges multiple files into a unified tree', () => {
    cleanup();
    setup({
      'color.json': {
        color: {
          primary: { main: { value: '#1565C0', type: 'color' } },
        },
      },
      'spacing.json': {
        spacing: {
          '4': { value: '1rem', type: 'dimension' },
        },
      },
    });
    const { tokens } = parseTokenFiles(TMP_DIR);
    expect(tokens['color']).toBeDefined();
    expect(tokens['spacing']).toBeDefined();
    cleanup();
  });

  it('preserves malformed leaves for validator to catch', () => {
    cleanup();
    setup({
      'broken.json': {
        color: {
          noValue: { type: 'color' }, // missing value
          noType: { value: '#fff' },  // missing type
        },
      },
    });
    const { tokens } = parseTokenFiles(TMP_DIR);
    const color = tokens['color'] as Record<string, unknown>;
    // Both should be preserved, not silently dropped
    expect(color['noValue']).toBeDefined();
    expect(color['noType']).toBeDefined();
    cleanup();
  });
});

describe('parseTokenFile', () => {
  afterAll(cleanup);

  it('throws when file does not exist', () => {
    expect(() => parseTokenFile('/nonexistent/path/file.json')).toThrow();
  });

  it('throws when root value is not an object', () => {
    cleanup();
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(join(TMP_DIR, 'array.json'), '[]', 'utf-8');
    expect(() => parseTokenFile(join(TMP_DIR, 'array.json'))).toThrowError(/root value must be an object/);
    cleanup();
  });
});

describe('parser property test', () => {
  afterAll(cleanup);

  it('parse produces one leaf per token definition (fast-check)', () => {
    fc.assert(
      fc.property(
        // Generate 1-5 token identifiers with random keys
        fc.array(
          fc.tuple(
            fc.stringMatching(/^[a-z][a-zA-Z0-9]{2,8}$/),
            fc.stringMatching(/^[a-z][a-zA-Z0-9]{2,8}$/),
          ),
          { minLength: 1, maxLength: 5 },
        ),
        (tokenPairs) => {
          cleanup();
          // Build a JSON structure with unique keys
          const category: Record<string, unknown> = {};
          const uniqueKeys = new Set<string>();
          for (const [key] of tokenPairs) {
            if (uniqueKeys.has(key)) continue;
            uniqueKeys.add(key);
            category[key] = { value: '#000', type: 'color' };
          }
          const content = { testCategory: category };

          mkdirSync(TMP_DIR, { recursive: true });
          writeFileSync(
            join(TMP_DIR, 'gen.json'),
            JSON.stringify(content),
            'utf-8',
          );

          const { tokens } = parseTokenFiles(TMP_DIR);
          const parsed = tokens['testCategory'] as Record<string, unknown>;

          // Every unique key should appear in the parsed tree
          for (const key of uniqueKeys) {
            expect(parsed[key]).toBeDefined();
          }
          cleanup();
        },
      ),
      { numRuns: 50 },
    );
  });
});
