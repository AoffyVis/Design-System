import { TokenMap } from '../token-parser.js';

export function generateLayout(tokens: TokenMap): string {
  const lines: string[] = [];

  // Display
  lines.push('.block { display: block; }');
  lines.push('.inline-block { display: inline-block; }');
  lines.push('.inline { display: inline; }');
  lines.push('.flex { display: flex; }');
  lines.push('.inline-flex { display: inline-flex; }');
  lines.push('.grid { display: grid; }');
  lines.push('.inline-grid { display: inline-grid; }');
  lines.push('.hidden { display: none; }');

  // Flex Direction
  lines.push('.flex-row { flex-direction: row; }');
  lines.push('.flex-row-reverse { flex-direction: row-reverse; }');
  lines.push('.flex-col { flex-direction: column; }');
  lines.push('.flex-col-reverse { flex-direction: column-reverse; }');

  // Flex Wrap
  lines.push('.flex-wrap { flex-wrap: wrap; }');
  lines.push('.flex-nowrap { flex-wrap: nowrap; }');
  lines.push('.flex-wrap-reverse { flex-wrap: wrap-reverse; }');

  // Flex Grow/Shrink
  lines.push('.flex-1 { flex: 1 1 0%; }');
  lines.push('.flex-auto { flex: 1 1 auto; }');
  lines.push('.flex-initial { flex: 0 1 auto; }');
  lines.push('.flex-none { flex: 0 0 auto; }');
  lines.push('.grow { flex-grow: 1; }');
  lines.push('.grow-0 { flex-grow: 0; }');
  lines.push('.shrink { flex-shrink: 1; }');
  lines.push('.shrink-0 { flex-shrink: 0; }');

  // Align Items
  lines.push('.items-start { align-items: flex-start; }');
  lines.push('.items-end { align-items: flex-end; }');
  lines.push('.items-center { align-items: center; }');
  lines.push('.items-baseline { align-items: baseline; }');
  lines.push('.items-stretch { align-items: stretch; }');

  // Justify Content
  lines.push('.justify-start { justify-content: flex-start; }');
  lines.push('.justify-end { justify-content: flex-end; }');
  lines.push('.justify-center { justify-content: center; }');
  lines.push('.justify-between { justify-content: space-between; }');
  lines.push('.justify-around { justify-content: space-around; }');
  lines.push('.justify-evenly { justify-content: space-evenly; }');

  // Align Self
  lines.push('.self-auto { align-self: auto; }');
  lines.push('.self-start { align-self: flex-start; }');
  lines.push('.self-end { align-self: flex-end; }');
  lines.push('.self-center { align-self: center; }');
  lines.push('.self-stretch { align-self: stretch; }');

  // Grid Template Columns
  const gridColCounts = [1, 2, 3, 4, 6, 12];
  for (const n of gridColCounts) {
    lines.push(`.grid-cols-${n} { grid-template-columns: repeat(${n}, minmax(0, 1fr)); }`);
  }

  // Grid Column Span
  const colSpanCounts = [1, 2, 3, 4, 6];
  for (const n of colSpanCounts) {
    lines.push(`.col-span-${n} { grid-column: span ${n} / span ${n}; }`);
  }
  lines.push('.col-span-full { grid-column: 1 / -1; }');

  // Width
  lines.push('.w-full { width: 100%; }');
  lines.push('.w-screen { width: 100vw; }');
  lines.push('.w-auto { width: auto; }');
  lines.push('.w-min { width: min-content; }');
  lines.push('.w-max { width: max-content; }');
  lines.push('.w-fit { width: fit-content; }');

  // Height
  lines.push('.h-full { height: 100%; }');
  lines.push('.h-screen { height: 100vh; }');
  lines.push('.h-auto { height: auto; }');
  lines.push('.h-min { height: min-content; }');
  lines.push('.h-max { height: max-content; }');
  lines.push('.h-fit { height: fit-content; }');

  // Min/Max Width/Height
  lines.push('.min-w-0 { min-width: 0px; }');
  lines.push('.min-w-full { min-width: 100%; }');
  lines.push('.max-w-none { max-width: none; }');
  lines.push('.max-w-full { max-width: 100%; }');
  lines.push('.max-w-screen { max-width: 100vw; }');
  lines.push('.min-h-0 { min-height: 0px; }');
  lines.push('.min-h-full { min-height: 100%; }');
  lines.push('.min-h-screen { min-height: 100vh; }');

  // Margin Auto — margin by property, but layout by role (centering /
  // flex-grid push). Lives here rather than spacing.ts because the value
  // is the CSS keyword `auto`, not a spacing token, and spacing.ts is
  // exclusively token-driven.
  lines.push('.m-auto { margin: auto; }');
  lines.push('.mx-auto { margin-left: auto; margin-right: auto; }');
  lines.push('.my-auto { margin-top: auto; margin-bottom: auto; }');
  lines.push('.mt-auto { margin-top: auto; }');
  lines.push('.mr-auto { margin-right: auto; }');
  lines.push('.mb-auto { margin-bottom: auto; }');
  lines.push('.ml-auto { margin-left: auto; }');

  // Overflow
  lines.push('.overflow-auto { overflow: auto; }');
  lines.push('.overflow-hidden { overflow: hidden; }');
  lines.push('.overflow-visible { overflow: visible; }');
  lines.push('.overflow-scroll { overflow: scroll; }');
  lines.push('.overflow-x-auto { overflow-x: auto; }');
  lines.push('.overflow-x-hidden { overflow-x: hidden; }');
  lines.push('.overflow-y-auto { overflow-y: auto; }');
  lines.push('.overflow-y-hidden { overflow-y: hidden; }');

  // Position
  lines.push('.static { position: static; }');
  lines.push('.fixed { position: fixed; }');
  lines.push('.absolute { position: absolute; }');
  lines.push('.relative { position: relative; }');
  lines.push('.sticky { position: sticky; }');

  // Top/Right/Bottom/Left — fixed zero values
  lines.push('.inset-0 { inset: 0; }');
  lines.push('.top-0 { top: 0; }');
  lines.push('.right-0 { right: 0; }');
  lines.push('.bottom-0 { bottom: 0; }');
  lines.push('.left-0 { left: 0; }');

  // Top/Right/Bottom/Left — spacing token-based values
  const spacingKeys = ['1', '2', '3', '4', '5', '6', '8', '10', '12', '16'];
  for (const n of spacingKeys) {
    if (tokens.spacing.has(n)) {
      const varRef = `var(--ds-spacing-${n})`;
      lines.push(`.top-${n} { top: ${varRef}; }`);
      lines.push(`.right-${n} { right: ${varRef}; }`);
      lines.push(`.bottom-${n} { bottom: ${varRef}; }`);
      lines.push(`.left-${n} { left: ${varRef}; }`);
      lines.push(`.inset-${n} { inset: ${varRef}; }`);
    }
  }

  return lines.join('\n');
}
