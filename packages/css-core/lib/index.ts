/**
 * @company/css-core — public library exports
 *
 * Used by packages/generator to produce utility CSS
 * without reimplementing the assembler logic.
 */

export { parseTokens } from './token-parser.js';
export type { TokenMap } from './token-parser.js';
export { assembleCSS } from './assembler.js';
