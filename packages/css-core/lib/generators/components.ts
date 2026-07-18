import { TokenMap } from '../token-parser.js';

/**
 * Generate component CSS classes.
 *
 * All visual values reference `var(--ds-*)` custom properties — no hardcoded
 * colors, spacing, or typography values.
 */
export function generateComponents(tokens: TokenMap): string {
  const lines: string[] = [];

  // Semantic color names used for color variants
  const variantColors = ['primary', 'secondary', 'error', 'warning', 'success', 'info'];

  // --- Button (.btn) ---
  lines.push(`.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
  font-weight: 600;
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
  border-radius: var(--ds-radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition-property: background-color, border-color, color, box-shadow;
  transition-duration: var(--ds-motion-duration-fast);
  transition-timing-function: var(--ds-motion-easing-in-out);
}`);

  lines.push(`.btn:focus-visible {
  outline: 2px solid var(--ds-color-primary-main);
  outline-offset: 2px;
}`);

  lines.push(`.btn:disabled, .btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}`);

  // Button color variants
  for (const color of variantColors) {
    if (tokens.colors.has(color)) {
      lines.push(`.btn-${color} {
  background-color: var(--ds-color-${color}-main);
  color: var(--ds-color-${color}-contrast);
}`);
    }
  }

  // Button style variants (outline and ghost use primary only)
  lines.push(`.btn-outline {
  background-color: transparent;
  border-color: var(--ds-color-primary-main);
  color: var(--ds-color-primary-main);
}`);

  lines.push(`.btn-ghost {
  background-color: transparent;
  border-color: transparent;
  color: var(--ds-color-primary-main);
}`);

  // Button size modifiers
  lines.push(`.btn-sm {
  padding: var(--ds-spacing-1) var(--ds-spacing-3);
  font-size: var(--ds-typography-body-sm-font-size);
}`);

  lines.push(`.btn-lg {
  padding: var(--ds-spacing-3) var(--ds-spacing-6);
}`);

  // --- Card (.card) ---
  lines.push(`.card {
  background-color: var(--ds-color-surface-main);
  color: var(--ds-color-surface-contrast);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-md);
  overflow: hidden;
}`);

  lines.push(`.card-header {
  padding: var(--ds-spacing-4) var(--ds-spacing-6);
  border-bottom: 1px solid var(--ds-color-border-main);
  font-weight: 600;
}`);

  lines.push(`.card-body {
  padding: var(--ds-spacing-6);
}`);

  lines.push(`.card-footer {
  padding: var(--ds-spacing-4) var(--ds-spacing-6);
  border-top: 1px solid var(--ds-color-border-main);
}`);

  // --- Badge (.badge) ---
  lines.push(`.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--ds-spacing-1) var(--ds-spacing-3);
  font-size: var(--ds-typography-body-sm-font-size);
  font-weight: 600;
  line-height: 1;
  border-radius: var(--ds-radius-full);
  white-space: nowrap;
}`);

  // Badge color variants
  for (const color of variantColors) {
    if (tokens.colors.has(color)) {
      lines.push(`.badge-${color} {
  background-color: var(--ds-color-${color}-main);
  color: var(--ds-color-${color}-contrast);
}`);
    }
  }

  // --- Input (.input) ---
  lines.push(`.input {
  display: block;
  width: 100%;
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
  border: 2px solid var(--ds-color-border-main);
  border-radius: var(--ds-radius-md);
  background-color: transparent;
  transition: border-color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out);
}`);

  lines.push(`.input:focus {
  border-color: var(--ds-color-primary-main);
  outline: none;
}`);

  lines.push(`.input-error {
  border-color: var(--ds-color-error-main);
}`);

  lines.push(`.input-error:focus {
  border-color: var(--ds-color-error-main);
  box-shadow: 0 0 0 1px var(--ds-color-error-main);
}`);

  // --- Alert (.alert) ---
  lines.push(`.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-3);
  padding: var(--ds-spacing-4) var(--ds-spacing-5);
  border-radius: var(--ds-radius-md);
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
}`);

  // Alert color variants (border-left 4px solid, subtle bg)
  const alertColors = ['success', 'error', 'warning', 'info'];
  for (const color of alertColors) {
    if (tokens.colors.has(color)) {
      lines.push(`.alert-${color} {
  border-left: 4px solid var(--ds-color-${color}-main);
  background-color: color-mix(in srgb, var(--ds-color-${color}-main) 10%, transparent);
  color: var(--ds-color-${color}-main);
}`);
    }
  }

  return lines.join('\n');
}
