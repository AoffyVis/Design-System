import { TokenMap } from '../token-parser.js';

export function generateSpacing(tokens: TokenMap): string {
  const lines: string[] = [];

  for (const [n] of tokens.spacing) {
    const varRef = `var(--ds-spacing-${n})`;

    // Padding utilities
    lines.push(`.p-${n} { padding: ${varRef}; }`);
    lines.push(`.pt-${n} { padding-top: ${varRef}; }`);
    lines.push(`.pr-${n} { padding-right: ${varRef}; }`);
    lines.push(`.pb-${n} { padding-bottom: ${varRef}; }`);
    lines.push(`.pl-${n} { padding-left: ${varRef}; }`);
    lines.push(`.px-${n} { padding-left: ${varRef}; padding-right: ${varRef}; }`);
    lines.push(`.py-${n} { padding-top: ${varRef}; padding-bottom: ${varRef}; }`);

    // Margin utilities
    lines.push(`.m-${n} { margin: ${varRef}; }`);
    lines.push(`.mt-${n} { margin-top: ${varRef}; }`);
    lines.push(`.mr-${n} { margin-right: ${varRef}; }`);
    lines.push(`.mb-${n} { margin-bottom: ${varRef}; }`);
    lines.push(`.ml-${n} { margin-left: ${varRef}; }`);
    lines.push(`.mx-${n} { margin-left: ${varRef}; margin-right: ${varRef}; }`);
    lines.push(`.my-${n} { margin-top: ${varRef}; margin-bottom: ${varRef}; }`);

    // Gap utility
    lines.push(`.gap-${n} { gap: ${varRef}; }`);
  }

  return lines.join('\n');
}
