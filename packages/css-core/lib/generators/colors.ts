import { TokenMap } from '../token-parser.js';

export function generateColors(tokens: TokenMap): string {
  const lines: string[] = [];

  for (const [color, colorToken] of tokens.colors) {
    // Main variant (always present)
    lines.push(`.text-${color} { color: var(--ds-color-${color}-main); }`);
    lines.push(`.bg-${color} { background-color: var(--ds-color-${color}-main); }`);

    // Optional variants
    if (colorToken.light) {
      lines.push(`.text-${color}-light { color: var(--ds-color-${color}-light); }`);
      lines.push(`.bg-${color}-light { background-color: var(--ds-color-${color}-light); }`);
    }

    if (colorToken.dark) {
      lines.push(`.text-${color}-dark { color: var(--ds-color-${color}-dark); }`);
      lines.push(`.bg-${color}-dark { background-color: var(--ds-color-${color}-dark); }`);
    }

    if (colorToken.contrast) {
      lines.push(`.text-${color}-contrast { color: var(--ds-color-${color}-contrast); }`);
      lines.push(`.bg-${color}-contrast { background-color: var(--ds-color-${color}-contrast); }`);
    }
  }

  return lines.join('\n');
}
