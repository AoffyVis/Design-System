import { TokenMap } from '../token-parser.js';

/**
 * Generate navigation component CSS classes.
 *
 * Provides:
 * - .nav — base nav container
 * - .nav-horizontal / .nav-vertical — direction
 * - .nav-brand — logo/brand area
 * - .nav-item — individual item wrapper
 * - .nav-link — link styling
 * - .nav-link-active — active state
 * - .nav-divider — separator between items
 */
export function generateNav(tokens: TokenMap): string {
  const lines: string[] = [];

  // --- Base nav ---
  lines.push(`.nav {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-1);
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
  background-color: var(--ds-color-surface-main);
  border-bottom: 1px solid var(--ds-color-border-main);
}`);

  // --- Direction variants ---
  lines.push(`.nav-horizontal {
  flex-direction: row;
}`);

  lines.push(`.nav-vertical {
  flex-direction: column;
  align-items: stretch;
  border-bottom: none;
  border-right: 1px solid var(--ds-color-border-main);
}`);

  // --- Brand ---
  lines.push(`.nav-brand {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: var(--ds-typography-heading-h2-font-size);
  padding: var(--ds-spacing-2) var(--ds-spacing-3);
  margin-right: var(--ds-spacing-4);
  color: var(--ds-color-primary-main);
  text-decoration: none;
}`);

  // --- Nav item ---
  lines.push(`.nav-item {
  display: flex;
  align-items: center;
}`);

  // --- Nav link ---
  lines.push(`.nav-link {
  display: inline-flex;
  align-items: center;
  padding: var(--ds-spacing-2) var(--ds-spacing-3);
  font-size: var(--ds-typography-body-md-font-size);
  color: var(--ds-color-surface-contrast);
  text-decoration: none;
  border-radius: var(--ds-radius-md);
  transition: background-color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out),
              color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out);
}`);

  lines.push(`.nav-link:hover {
  background-color: color-mix(in srgb, var(--ds-color-primary-main) 8%, transparent);
  color: var(--ds-color-primary-main);
}`);

  lines.push(`.nav-link-active {
  background-color: color-mix(in srgb, var(--ds-color-primary-main) 12%, transparent);
  color: var(--ds-color-primary-main);
  font-weight: 600;
}`);

  // --- Divider ---
  lines.push(`.nav-divider {
  width: 1px;
  height: 1.5rem;
  background-color: var(--ds-color-border-main);
  margin: 0 var(--ds-spacing-2);
}`);

  // Vertical divider is horizontal
  lines.push(`.nav-vertical .nav-divider {
  width: 100%;
  height: 1px;
  margin: var(--ds-spacing-2) 0;
}`);

  return lines.join('\n');
}
