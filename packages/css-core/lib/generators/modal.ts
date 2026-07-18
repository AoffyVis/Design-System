import { TokenMap } from '../token-parser.js';

/**
 * Generate modal component CSS classes.
 *
 * Provides:
 * - .modal — hidden by default, shows when .modal-open is added
 * - .modal-overlay — backdrop
 * - .modal-content — the dialog box
 * - .modal-header / .modal-body / .modal-footer — sections
 * - .modal-sm / .modal-lg / .modal-xl — size variants
 * - .modal-close — close button
 */
export function generateModal(tokens: TokenMap): string {
  const lines: string[] = [];

  // --- Modal wrapper (covers viewport, hidden by default) ---
  lines.push(`.modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: var(--ds-z-index-modal);
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-4);
}`);

  // Show when .modal-open is applied
  lines.push(`.modal-open {
  display: flex;
}`);

  // --- Overlay / backdrop ---
  lines.push(`.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: var(--ds-z-index-overlay);
}`);

  // --- Content / dialog box ---
  lines.push(`.modal-content {
  position: relative;
  z-index: var(--ds-z-index-modal);
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  overflow-y: auto;
  background-color: var(--ds-color-surface-main);
  color: var(--ds-color-surface-contrast);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow-xl);
}`);

  // --- Header ---
  lines.push(`.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--ds-spacing-4) var(--ds-spacing-6);
  border-bottom: 1px solid var(--ds-color-border-main);
  font-weight: 600;
  font-size: var(--ds-typography-heading-h2-font-size);
}`);

  // --- Body ---
  lines.push(`.modal-body {
  padding: var(--ds-spacing-6);
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
}`);

  // --- Footer ---
  lines.push(`.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ds-spacing-3);
  padding: var(--ds-spacing-4) var(--ds-spacing-6);
  border-top: 1px solid var(--ds-color-border-main);
}`);

  // --- Close button ---
  lines.push(`.modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  border-radius: var(--ds-radius-md);
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--ds-color-surface-contrast);
  transition: background-color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out);
}`);

  lines.push(`.modal-close:hover {
  background-color: color-mix(in srgb, var(--ds-color-surface-contrast) 10%, transparent);
}`);

  // --- Size variants ---
  lines.push(`.modal-sm .modal-content {
  max-width: 24rem;
}`);

  lines.push(`.modal-lg .modal-content {
  max-width: 48rem;
}`);

  lines.push(`.modal-xl .modal-content {
  max-width: 64rem;
}`);

  lines.push(`.modal-fullscreen .modal-content {
  max-width: 100%;
  max-height: 100%;
  height: 100%;
  border-radius: 0;
}`);

  return lines.join('\n');
}
