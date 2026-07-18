import { describe, it, expect, afterAll } from 'vitest';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseTokenFiles } from '../lib/parser.js';
import { validateTokens } from '../lib/validator.js';

const TMP_DIR = join(import.meta.dirname, '__fixtures_build__');
const OUT_DIR = join(TMP_DIR, 'dist');

function cleanup() {
  rmSync(TMP_DIR, { recursive: true, force: true });
}

describe('build pipeline: invalid input produces no output', () => {
  afterAll(cleanup);

  it('validation fails on a token with invalid type — no output should be written', () => {
    cleanup();
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      join(TMP_DIR, 'bad.json'),
      JSON.stringify({
        color: {
          broken: { value: '#ff0000', type: 'invalidType' },
        },
      }),
      'utf-8',
    );

    const { tokens } = parseTokenFiles(TMP_DIR);
    const result = validateTokens(tokens);

    // Validation must fail
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].rule).toBe('invalid-type');

    // Output directory should not exist (we never call generators)
    expect(existsSync(OUT_DIR)).toBe(false);
  });

  it('validation fails on a token with missing value', () => {
    cleanup();
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      join(TMP_DIR, 'novalue.json'),
      JSON.stringify({
        spacing: {
          broken: { type: 'dimension' }, // no value field
        },
      }),
      'utf-8',
    );

    const { tokens } = parseTokenFiles(TMP_DIR);
    const result = validateTokens(tokens);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.rule === 'missing-value')).toBe(true);
  });

  it('validation fails on circular reference', () => {
    cleanup();
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      join(TMP_DIR, 'circular.json'),
      JSON.stringify({
        color: {
          a: { value: '{color.b}', type: 'color' },
          b: { value: '{color.a}', type: 'color' },
        },
      }),
      'utf-8',
    );

    const { tokens } = parseTokenFiles(TMP_DIR);
    const result = validateTokens(tokens);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.rule === 'circular-reference')).toBe(true);
  });

  it('validation fails on dangling reference', () => {
    cleanup();
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      join(TMP_DIR, 'dangling.json'),
      JSON.stringify({
        color: {
          a: { value: '{color.nonexistent}', type: 'color' },
        },
      }),
      'utf-8',
    );

    const { tokens } = parseTokenFiles(TMP_DIR);
    const result = validateTokens(tokens);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.rule === 'reference-not-found')).toBe(true);
  });
});
