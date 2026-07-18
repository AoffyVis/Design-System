import { TokenMap } from '../token-parser.js';

export function generateResponsive(tokens: TokenMap, baseUtilities: string): string {
  // Parse all CSS rules from the base utilities string
  const ruleRegex = /\.([^\s{]+)\s*\{([^}]+)\}/g;
  const rules: Array<{ selector: string; declarations: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = ruleRegex.exec(baseUtilities)) !== null) {
    rules.push({
      selector: match[1],
      declarations: match[2].trim(),
    });
  }

  if (rules.length === 0) {
    return '';
  }

  const lines: string[] = [];

  for (const [bp, value] of tokens.breakpoints) {
    lines.push(`@media (min-width: ${value}) {`);

    for (const rule of rules) {
      // For `2xl`, CSS requires numeric escaping of the leading digit: \32xl
      const prefix = bp === '2xl' ? `\\32xl\\:` : `${bp}\\:`;
      lines.push(`  .${prefix}${rule.selector} { ${rule.declarations} }`);
    }

    lines.push(`}`);
  }

  return lines.join('\n');
}
