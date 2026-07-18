import { TokenMap } from '../token-parser.js';

export function generateZIndex(tokens: TokenMap): string {
  const lines: string[] = [];

  for (const [key] of tokens.zIndex) {
    lines.push(`.z-${key} { z-index: var(--ds-z-index-${key}); }`);
  }

  return lines.join('\n');
}
