import { TokenMap } from '../token-parser.js';

/**
 * The actual `[data-theme="dark"] { --ds-color-*: ...; }` override block
 * lives in `packages/tokens/dist/tokens.css`, generated from
 * `packages/tokens/src/themes/dark.json` (see that package's `build.ts`)
 * — css-core doesn't own color values, tokens does, so this generator has
 * nothing left to emit for the explicit `data-theme="dark"` case.
 *
 * What's left here is the optional automatic fallback: honor the OS-level
 * `prefers-color-scheme: dark` when no explicit `data-theme` has been set,
 * without needing this package to duplicate the dark color values. Since
 * cascade layers don't let a `@media` block "borrow" a selector's
 * declarations, the fallback re-points `:root:not([data-theme])` at the
 * same declarations by duplicating the `[data-theme="dark"]` selector into
 * the query — the *values* still come from that one block via normal CSS
 * inheritance would be nice, but custom properties don't work that way
 * across unrelated selectors, so genuinely automatic (no-JS) dark mode
 * requires the values to be present under both selectors. That's tokens'
 * responsibility if/when it's wanted; deliberately left as a documented
 * gap here rather than guessed at, since apps/roadmap-site's own toggle
 * already sets `data-theme` explicitly and doesn't rely on this fallback.
 */
export function generateDarkMode(tokens: TokenMap): string {
  return [
    '@media (prefers-color-scheme: dark) {',
    '  :root:not([data-theme]) {',
    '    /* No automatic (no-JS) dark mode yet — see comment in dark-mode.ts. */',
    '    /* Explicit [data-theme="dark"] (set via JS) is fully supported; */',
    '    /* see packages/tokens/dist/tokens.css for those values. */',
    '  }',
    '}',
  ].join('\n');
}
