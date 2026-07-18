import { TokenMap } from '../token-parser.js';

/**
 * Generate tab component CSS classes.
 *
 * Provides:
 * - .tabs — wrapper container
 * - .tab-list — the tab header row
 * - .tab-item — individual tab button
 * - .tab-active — active tab state
 * - .tab-panel — content area (hidden by default, shown when .tab-panel-active)
 * - .tabs-bordered — bordered variant
 * - .tabs-pills — pill-style variant
 */
export function generateTabs(tokens: TokenMap): string {
  const lines: string[] = [];

  // --- Tabs wrapper ---
  lines.push(`.tabs {
  display: flex;
  flex-direction: column;
}`);

  // --- Tab list (header row) ---
  lines.push(`.tab-list {
  display: flex;
  gap: var(--ds-spacing-1);
  border-bottom: 2px solid var(--ds-color-border-main);
  padding: 0 var(--ds-spacing-2);
}`);

  // --- Tab item (individual tab) ---
  lines.push(`.tab-item {
  display: inline-flex;
  align-items: center;
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
  font-size: var(--ds-typography-body-md-font-size);
  font-weight: 500;
  color: var(--ds-color-surface-contrast);
  cursor: pointer;
  border: none;
  background: transparent;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out),
              border-color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out);
}`);

  lines.push(`.tab-item:hover {
  color: var(--ds-color-primary-main);
  border-bottom-color: color-mix(in srgb, var(--ds-color-primary-main) 40%, transparent);
}`);

  // --- Active tab ---
  lines.push(`.tab-active {
  color: var(--ds-color-primary-main);
  border-bottom-color: var(--ds-color-primary-main);
  font-weight: 600;
}`);

  // --- Tab panel (content) ---
  lines.push(`.tab-panel {
  display: none;
  padding: var(--ds-spacing-4);
}`);

  lines.push(`.tab-panel-active {
  display: block;
}`);

  // --- Bordered variant ---
  lines.push(`.tabs-bordered .tab-list {
  border-bottom: 1px solid var(--ds-color-border-main);
}`);

  lines.push(`.tabs-bordered .tab-item {
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: var(--ds-radius-md) var(--ds-radius-md) 0 0;
  margin-bottom: -1px;
}`);

  lines.push(`.tabs-bordered .tab-active {
  border-color: var(--ds-color-border-main);
  background-color: var(--ds-color-surface-main);
}`);

  // --- Pills variant ---
  lines.push(`.tabs-pills .tab-list {
  border-bottom: none;
  gap: var(--ds-spacing-2);
  padding: 0;
}`);

  lines.push(`.tabs-pills .tab-item {
  border-bottom: none;
  border-radius: var(--ds-radius-full);
  margin-bottom: 0;
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
}`);

  lines.push(`.tabs-pills .tab-active {
  background-color: var(--ds-color-primary-main);
  color: var(--ds-color-primary-contrast);
  border-bottom-color: transparent;
}`);

  return lines.join('\n');
}
