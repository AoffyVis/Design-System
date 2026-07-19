import { TokenMap } from '../token-parser.js';

/**
 * Generate :root base declarations referencing typography tokens.
 * All values MUST be var(--ds-*) references — no hardcoded values.
 */
export function generateBase(tokens: TokenMap): string {
  // Use body-md as the base typography scale for :root defaults
  const bodyMd = tokens.typography.get('body-md');

  // Even if body-md doesn't exist in the token map, we still reference
  // the expected custom properties — the design contract specifies these exist.
  const fontFamily = bodyMd?.fontFamily ?? 'var(--ds-typography-body-md-font-family)';
  const fontSize = bodyMd?.fontSize ?? 'var(--ds-typography-body-md-font-size)';
  const lineHeight = bodyMd?.lineHeight ?? 'var(--ds-typography-body-md-line-height)';

  return `:root {
  font-family: ${fontFamily};
  font-size: ${fontSize};
  line-height: ${lineHeight};
  color: var(--ds-color-surface-contrast);
}`;
}
