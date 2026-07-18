import { TokenMap } from '../token-parser.js';

export function generateMotion(tokens: TokenMap): string {
  const lines: string[] = [];

  for (const [key] of tokens.motion.duration) {
    lines.push(`.duration-${key} { transition-duration: var(--ds-motion-duration-${key}); }`);
  }

  for (const [key] of tokens.motion.easing) {
    lines.push(`.ease-${key} { transition-timing-function: var(--ds-motion-easing-${key}); }`);
  }

  return lines.join('\n');
}
