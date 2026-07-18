import { resolve, dirname } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseTokens } from './token-parser.js';
import { assembleCSS } from './assembler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageRoot = resolve(__dirname, '..');
const tokensPath = resolve(packageRoot, '../tokens/dist/tokens.css');
const outDir = resolve(packageRoot, 'dist');
const outPath = resolve(outDir, 'core.css');

try {
  const tokens = parseTokens(tokensPath);
  const css = assembleCSS(tokens);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, css, 'utf-8');
  console.log(`✓ Generated ${outPath}`);
  process.exit(0);
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`[ERROR] ${message}\n`);
  process.exit(1);
}
