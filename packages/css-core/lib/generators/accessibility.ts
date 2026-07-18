import { TokenMap } from '../token-parser.js';

export function generateAccessibility(tokens: TokenMap): string {
  const lines: string[] = [];

  lines.push(`:focus-visible {`);
  lines.push(`  outline: 2px solid var(--ds-color-primary-main);`);
  lines.push(`  outline-offset: 2px;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`.sr-only {`);
  lines.push(`  position: absolute;`);
  lines.push(`  width: 1px;`);
  lines.push(`  height: 1px;`);
  lines.push(`  padding: 0;`);
  lines.push(`  margin: -1px;`);
  lines.push(`  overflow: hidden;`);
  lines.push(`  clip: rect(0, 0, 0, 0);`);
  lines.push(`  white-space: nowrap;`);
  lines.push(`  border-width: 0;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`@media (prefers-reduced-motion: reduce) {`);
  lines.push(`  *, *::before, *::after {`);
  lines.push(`    animation-duration: 0.01ms !important;`);
  lines.push(`    animation-iteration-count: 1 !important;`);
  lines.push(`    transition-duration: 0.01ms !important;`);
  lines.push(`  }`);
  lines.push(`}`);

  return lines.join('\n');
}
