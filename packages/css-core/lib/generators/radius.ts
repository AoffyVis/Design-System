import { TokenMap } from '../token-parser.js';

export function generateRadius(tokens: TokenMap): string {
  const lines: string[] = [];

  for (const [size] of tokens.radius) {
    lines.push(`.rounded-${size} { border-radius: var(--ds-radius-${size}); }`);
  }

  return lines.join('\n');
}
