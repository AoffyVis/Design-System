import { TokenMap } from '../token-parser.js';

export function generateTypography(tokens: TokenMap): string {
  const lines: string[] = [];

  for (const [key] of tokens.typography) {
    const prefix = `--ds-typography-${key}`;

    lines.push(`.text-${key} {`);
    lines.push(`  font-family: var(${prefix}-font-family);`);
    lines.push(`  font-size: var(${prefix}-font-size);`);
    lines.push(`  font-weight: var(${prefix}-font-weight);`);
    lines.push(`  line-height: var(${prefix}-line-height);`);
    lines.push(`  letter-spacing: var(${prefix}-letter-spacing);`);
    lines.push(`}`);
  }

  return lines.join('\n');
}
