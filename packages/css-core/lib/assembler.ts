import { TokenMap } from './token-parser.js';
import { generateReset } from './generators/reset.js';
import { generateBase } from './generators/base.js';
import { generateSpacing } from './generators/spacing.js';
import { generateColors } from './generators/colors.js';
import { generateTypography } from './generators/typography.js';
import { generateRadius } from './generators/radius.js';
import { generateShadows } from './generators/shadows.js';
import { generateBorder } from './generators/border.js';
import { generateZIndex } from './generators/z-index.js';
import { generateMotion } from './generators/motion.js';
import { generateLayout } from './generators/layout.js';
import { generateResponsive } from './generators/responsive.js';
import { generateComponents } from './generators/components.js';
import { generateDarkMode } from './generators/dark-mode.js';
import { generateAccessibility } from './generators/accessibility.js';
import { generatePrint } from './generators/print.js';

/**
 * Assemble all generator outputs into the final layered CSS string.
 *
 * Layer order: reset, base, utilities, components, theme
 * Accessibility and print output live OUTSIDE layers (global scope).
 */
export function assembleCSS(tokens: TokenMap): string {
  // 1. Layer order declaration
  const layerDeclaration = '@layer reset, base, utilities, components, theme;';

  // 2. Reset layer
  const resetCSS = wrapLayer('reset', generateReset());

  // 3. Base layer
  const baseCSS = wrapLayer('base', generateBase(tokens));

  // 4. Utilities layer — combine all utility generators
  const baseUtilities = [
    generateSpacing(tokens),
    generateColors(tokens),
    generateTypography(tokens),
    generateRadius(tokens),
    generateShadows(tokens),
    generateBorder(tokens),
    generateZIndex(tokens),
    generateMotion(tokens),
    generateLayout(tokens),
  ].join('\n');

  // 5. Generate responsive variants from base utilities
  const responsiveUtilities = generateResponsive(tokens, baseUtilities);

  // 6. Wrap combined utilities in layer
  const utilitiesContent = responsiveUtilities
    ? `${baseUtilities}\n${responsiveUtilities}`
    : baseUtilities;
  const utilitiesCSS = wrapLayer('utilities', utilitiesContent);

  // 7. Components layer — between utilities and theme
  const componentsCSS = wrapLayer('components', generateComponents(tokens));

  // 8. Theme layer (dark mode)
  const themeCSS = wrapLayer('theme', generateDarkMode(tokens));

  // 9. Accessibility output — OUTSIDE layers (global scope)
  const accessibilityCSS = generateAccessibility(tokens);

  // 10. Print output — OUTSIDE layers (has its own @media print wrapper)
  const printCSS = generatePrint();

  // 11. Join all sections with double newlines
  const sections = [
    layerDeclaration,
    resetCSS,
    baseCSS,
    utilitiesCSS,
    componentsCSS,
    themeCSS,
    accessibilityCSS,
    printCSS,
  ];

  // 12. End with a trailing newline
  return sections.join('\n\n') + '\n';
}

function wrapLayer(name: string, css: string): string {
  return `@layer ${name} {\n${css}\n}`;
}
