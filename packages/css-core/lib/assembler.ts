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
import { generateTable } from './generators/table.js';
import { generateModal } from './generators/modal.js';
import { generateNav } from './generators/nav.js';
import { generateTabs } from './generators/tabs.js';
import { generateDarkMode } from './generators/dark-mode.js';
import { generateAccessibility } from './generators/accessibility.js';
import { generatePrint } from './generators/print.js';

/**
 * Assemble all generator outputs into the final layered CSS string.
 *
 * Layer order: reset, base, components, utilities, theme
 * `utilities` must come after `components` — CSS cascade layers resolve
 * ties by declaration order regardless of specificity, so utility classes
 * (e.g. `md:hidden`, `p-8`) need the later layer to actually override a
 * component's own styles (e.g. `.btn`'s `display`, `.card`'s padding).
 * Accessibility and print output live OUTSIDE layers (global scope).
 */
export function assembleCSS(tokens: TokenMap): string {
  // 1. Layer order declaration
  const layerDeclaration = '@layer reset, base, components, utilities, theme;';

  // 2. Reset layer
  const resetCSS = wrapLayer('reset', generateReset());

  // 3. Base layer
  const baseCSS = wrapLayer('base', generateBase(tokens));

  // 4. Components layer — before utilities, so utilities can override them
  const componentsContent = [
    generateComponents(tokens),
    generateTable(tokens),
    generateModal(tokens),
    generateNav(tokens),
    generateTabs(tokens),
  ].join('\n');
  const componentsCSS = wrapLayer('components', componentsContent);

  // 5. Utilities layer — combine all utility generators
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

  // 6. Generate responsive variants from base utilities
  const responsiveUtilities = generateResponsive(tokens, baseUtilities);

  // 7. Wrap combined utilities in layer
  const utilitiesContent = responsiveUtilities
    ? `${baseUtilities}\n${responsiveUtilities}`
    : baseUtilities;
  const utilitiesCSS = wrapLayer('utilities', utilitiesContent);

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
    componentsCSS,
    utilitiesCSS,
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
