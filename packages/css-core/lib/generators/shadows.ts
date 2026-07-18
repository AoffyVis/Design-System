import { TokenMap } from '../token-parser.js';

export function generateShadows(tokens: TokenMap): string {
  const lines: string[] = [];

  for (const [size] of tokens.shadow) {
    lines.push(`.shadow-${size} { box-shadow: var(--ds-shadow-${size}); }`);
  }

  return lines.join('\n');
}
