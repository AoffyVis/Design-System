import { describe, it, expect, vi } from 'vitest';
import { parseArgs } from '../lib/parse-args.js';

describe('parseArgs', () => {
  it('returns defaults when no arguments provided', () => {
    const { config, help } = parseArgs(['node', 'script']);
    expect(help).toBe(false);
    expect(config.tokensDir).toBe('packages/tokens/src');
    expect(config.outputDir).toBe('dist/');
    expect(config.platforms).toEqual([]);
    expect(config.themes).toEqual([]);
    expect(config.verbose).toBe(false);
  });

  it('parses --help flag', () => {
    const { help } = parseArgs(['node', 'script', '--help']);
    expect(help).toBe(true);
  });

  it('parses -h shorthand', () => {
    const { help } = parseArgs(['node', 'script', '-h']);
    expect(help).toBe(true);
  });

  it('parses --tokens option', () => {
    const { config } = parseArgs(['node', 'script', '--tokens', 'custom/path']);
    expect(config.tokensDir).toBe('custom/path');
  });

  it('parses --output option', () => {
    const { config } = parseArgs(['node', 'script', '--output', 'build/']);
    expect(config.outputDir).toBe('build/');
  });

  it('parses --platforms as comma-separated list', () => {
    const { config } = parseArgs(['node', 'script', '--platforms', 'css-tokens,json,themes']);
    expect(config.platforms).toEqual(['css-tokens', 'json', 'themes']);
  });

  it('trims whitespace from platform names', () => {
    const { config } = parseArgs(['node', 'script', '--platforms', ' css-tokens , json ']);
    expect(config.platforms).toEqual(['css-tokens', 'json']);
  });

  it('parses single --theme option', () => {
    const { config } = parseArgs(['node', 'script', '--theme', 'dark']);
    expect(config.themes).toEqual(['dark']);
  });

  it('parses multiple --theme options', () => {
    const { config } = parseArgs(['node', 'script', '--theme', 'dark', '--theme', 'banking']);
    expect(config.themes).toEqual(['dark', 'banking']);
  });

  it('parses --verbose flag', () => {
    const { config } = parseArgs(['node', 'script', '--verbose']);
    expect(config.verbose).toBe(true);
  });

  it('parses -v shorthand', () => {
    const { config } = parseArgs(['node', 'script', '-v']);
    expect(config.verbose).toBe(true);
  });

  it('ignores -- separator (used by pnpm)', () => {
    const { config } = parseArgs(['node', 'script', '--', '--verbose']);
    expect(config.verbose).toBe(true);
  });

  it('handles all options combined', () => {
    const { config, help } = parseArgs([
      'node', 'script',
      '--tokens', 'src/tokens',
      '--output', 'out/',
      '--platforms', 'css-tokens,typescript',
      '--theme', 'dark',
      '--theme', 'corporate',
      '--verbose',
    ]);
    expect(help).toBe(false);
    expect(config.tokensDir).toBe('src/tokens');
    expect(config.outputDir).toBe('out/');
    expect(config.platforms).toEqual(['css-tokens', 'typescript']);
    expect(config.themes).toEqual(['dark', 'corporate']);
    expect(config.verbose).toBe(true);
  });

  it('exits with code 2 on unknown option', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const mockStderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    expect(() => parseArgs(['node', 'script', '--unknown'])).toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(2);

    mockExit.mockRestore();
    mockStderr.mockRestore();
  });
});
