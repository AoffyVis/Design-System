import { TokenMap } from '../token-parser.js';

/**
 * Generate border-width/side/style/color utility classes.
 *
 * Border radius is a separate concern handled by radius.ts (`.rounded-*`).
 * This module covers `border-width`/`border-style`/`border-color` — see
 * docs/spec/borders.md.
 */
export function generateBorder(tokens: TokenMap): string {
  const lines: string[] = [];

  // Border color used by the self-sufficient width/side utilities below —
  // only emitted if the token actually exists (mirrors the `tokens.spacing.has(n)`
  // guard pattern already used in layout.ts for positional offsets).
  const borderColorVar = tokens.colors.has('border')
    ? 'var(--ds-color-border-main)'
    : undefined;

  if (borderColorVar) {
    // --- Border Width (self-sufficient: width + style + color together) ---
    lines.push('.border-0 { border-width: 0; }');
    lines.push(`.border { border-width: 1px; border-style: solid; border-color: ${borderColorVar}; }`);
    lines.push(`.border-2 { border-width: 2px; border-style: solid; border-color: ${borderColorVar}; }`);
    lines.push(`.border-4 { border-width: 4px; border-style: solid; border-color: ${borderColorVar}; }`);
    lines.push(`.border-8 { border-width: 8px; border-style: solid; border-color: ${borderColorVar}; }`);

    // --- Border Side (single side, 1px solid border-main) ---
    lines.push(`.border-t { border-top-width: 1px; border-top-style: solid; border-top-color: ${borderColorVar}; }`);
    lines.push(`.border-r { border-right-width: 1px; border-right-style: solid; border-right-color: ${borderColorVar}; }`);
    lines.push(`.border-b { border-bottom-width: 1px; border-bottom-style: solid; border-bottom-color: ${borderColorVar}; }`);
    lines.push(`.border-l { border-left-width: 1px; border-left-style: solid; border-left-color: ${borderColorVar}; }`);
  }

  // --- Border Style (override the style set by a width/side utility) ---
  lines.push('.border-solid { border-style: solid; }');
  lines.push('.border-dashed { border-style: dashed; }');
  lines.push('.border-dotted { border-style: dotted; }');
  lines.push('.border-none { border-style: none; }');

  // --- Border Color (override the color set by a width/side utility) ---
  // Same six semantic colors components.ts uses for its color variants —
  // not `surface`/`border` themselves (`.border-border` would be a
  // confusing utility name for what it'd actually do).
  const semanticColors = ['primary', 'secondary', 'error', 'warning', 'success', 'info'];
  for (const color of semanticColors) {
    if (tokens.colors.has(color)) {
      lines.push(`.border-${color} { border-color: var(--ds-color-${color}-main); }`);
    }
  }

  return lines.join('\n');
}
