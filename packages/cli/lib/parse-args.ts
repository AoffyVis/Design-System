import type { GenerateConfig } from '@company/generator';

interface ParsedArgs {
  config: GenerateConfig;
  help: boolean;
}

const HELP_TEXT = `
Usage: ds-generate [options]

Options:
  --tokens <path>     Path to token source directory (default: packages/tokens/src)
  --output <path>     Output directory for generated artifacts (default: dist/)
  --platforms <list>  Comma-separated list of target platforms (default: all)
                      Available: css-tokens, css-utilities, json, typescript, themes
  --theme <name>      Generate only a specific theme (can repeat)
  --verbose           Enable detailed logging
  --help              Show this help message

Examples:
  ds-generate
  ds-generate --tokens packages/tokens/src --output dist/ --verbose
  ds-generate --platforms css-tokens,json --output dist/
  ds-generate --theme dark --theme banking
`.trim();

/**
 * Hand-rolled CLI argument parser.
 * Zero external dependencies.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const args = argv.slice(2); // skip node + script path

  let tokensDir = 'packages/tokens/src';
  let outputDir = 'dist/';
  let platforms: string[] = [];
  let themes: string[] = [];
  let verbose = false;
  let help = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        help = true;
        break;

      case '--tokens':
        tokensDir = args[++i] ?? tokensDir;
        break;

      case '--output':
        outputDir = args[++i] ?? outputDir;
        break;

      case '--platforms': {
        const val = args[++i];
        if (val) {
          platforms = val.split(',').map(s => s.trim()).filter(Boolean);
        }
        break;
      }

      case '--theme': {
        const val = args[++i];
        if (val) themes.push(val);
        break;
      }

      case '--verbose':
      case '-v':
        verbose = true;
        break;

      default:
        if (arg === '--') continue; // pnpm passes -- as separator
        if (arg.startsWith('-')) {
          process.stderr.write(`Unknown option: ${arg}\n\n`);
          process.stderr.write(HELP_TEXT + '\n');
          process.exit(2);
        }
    }
  }

  return {
    help,
    config: { tokensDir, outputDir, platforms, themes, verbose },
  };
}

export { HELP_TEXT };
