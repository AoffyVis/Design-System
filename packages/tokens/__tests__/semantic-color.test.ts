import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const src = resolve(fileURLToPath(import.meta.url), '../../src');
const load = (p: string) => JSON.parse(readFileSync(resolve(src, p), 'utf-8'));

const flat = (node: Record<string, any>, prefix = ''): string[] =>
  Object.entries(node).flatMap(([k, v]) =>
    v && typeof v === 'object' && 'value' in v && 'type' in v
      ? [prefix + k]
      : v && typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [],
  );

describe('semantic color tokens (imported from Figma)', () => {
  const light = flat(load('semantic-color.json').color);
  const dark = new Set(flat(load('themes/dark.json').color));

  it('has a dark value for every light semantic color', () => {
    expect(light.length).toBeGreaterThan(0);
    expect(light.filter((k) => !dark.has(k))).toEqual([]);
  });
});
