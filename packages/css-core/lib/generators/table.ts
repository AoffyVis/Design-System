import { TokenMap } from '../token-parser.js';

/**
 * Generate table component CSS classes.
 *
 * Provides:
 * - .table — base table styling
 * - .table-striped — alternating row backgrounds
 * - .table-hover — row hover highlight
 * - .table-bordered — all cell borders
 * - .table-compact — reduced padding
 * - .th-sortable / .th-sort-asc / .th-sort-desc — sorting indicators
 * - .table-filter — filter input styling
 * - .table-pagination — pagination container
 * - .page-btn / .page-btn-active — pagination buttons
 */
export function generateTable(tokens: TokenMap): string {
  const lines: string[] = [];

  // --- Base table ---
  lines.push(`.table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--ds-typography-body-md-font-size);
  line-height: var(--ds-typography-body-md-line-height);
}`);

  lines.push(`.table th,
.table td {
  padding: var(--ds-spacing-3) var(--ds-spacing-4);
  text-align: left;
  border-bottom: 1px solid var(--ds-color-border-main);
}`);

  lines.push(`.table th {
  font-weight: 600;
  background-color: color-mix(in srgb, var(--ds-color-surface-contrast) 5%, var(--ds-color-surface-main));
}`);

  lines.push(`.table thead th {
  border-bottom: 2px solid var(--ds-color-border-main);
}`);

  // --- Striped variant ---
  lines.push(`.table-striped tbody tr:nth-child(even) {
  background-color: color-mix(in srgb, var(--ds-color-surface-contrast) 3%, var(--ds-color-surface-main));
}`);

  // --- Hover variant ---
  lines.push(`.table-hover tbody tr:hover {
  background-color: color-mix(in srgb, var(--ds-color-primary-main) 8%, var(--ds-color-surface-main));
  transition: background-color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out);
}`);

  // --- Bordered variant ---
  lines.push(`.table-bordered th,
.table-bordered td {
  border: 1px solid var(--ds-color-border-main);
}`);

  // --- Compact variant ---
  lines.push(`.table-compact th,
.table-compact td {
  padding: var(--ds-spacing-1) var(--ds-spacing-2);
  font-size: var(--ds-typography-body-sm-font-size);
}`);

  // --- Sorting ---
  lines.push(`.th-sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: var(--ds-spacing-6);
}`);

  lines.push(`.th-sortable:hover {
  background-color: color-mix(in srgb, var(--ds-color-primary-main) 8%, var(--ds-color-surface-main));
}`);

  // Sort indicators via ::after pseudo-element
  lines.push(`.th-sortable::after {
  content: "⇅";
  position: absolute;
  right: var(--ds-spacing-2);
  opacity: 0.4;
  font-size: 0.75em;
}`);

  lines.push(`.th-sort-asc::after {
  content: "↑";
  opacity: 1;
  color: var(--ds-color-primary-main);
}`);

  lines.push(`.th-sort-desc::after {
  content: "↓";
  opacity: 1;
  color: var(--ds-color-primary-main);
}`);

  // --- Filter input ---
  lines.push(`.table-filter {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-3);
  margin-bottom: var(--ds-spacing-4);
}`);

  lines.push(`.table-filter-input {
  padding: var(--ds-spacing-2) var(--ds-spacing-4);
  border: 1px solid var(--ds-color-border-main);
  border-radius: var(--ds-radius-md);
  font-size: var(--ds-typography-body-sm-font-size);
  background-color: transparent;
  transition: border-color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out);
}`);

  lines.push(`.table-filter-input:focus {
  border-color: var(--ds-color-primary-main);
  outline: none;
}`);

  // --- Pagination ---
  lines.push(`.table-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-2);
  margin-top: var(--ds-spacing-4);
  padding: var(--ds-spacing-3) 0;
}`);

  lines.push(`.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: var(--ds-spacing-1) var(--ds-spacing-2);
  border: 1px solid var(--ds-color-border-main);
  border-radius: var(--ds-radius-md);
  font-size: var(--ds-typography-body-sm-font-size);
  cursor: pointer;
  background-color: transparent;
  transition: background-color var(--ds-motion-duration-fast) var(--ds-motion-easing-in-out);
}`);

  lines.push(`.page-btn:hover {
  background-color: color-mix(in srgb, var(--ds-color-primary-main) 10%, transparent);
}`);

  lines.push(`.page-btn-active {
  background-color: var(--ds-color-primary-main);
  color: var(--ds-color-primary-contrast);
  border-color: var(--ds-color-primary-main);
}`);

  lines.push(`.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}`);

  // --- Responsive wrapper ---
  lines.push(`.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}`);

  return lines.join('\n');
}
