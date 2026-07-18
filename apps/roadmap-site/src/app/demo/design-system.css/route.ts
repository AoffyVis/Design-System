import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

/**
 * Serves the *real*, currently-built output from the unified `dist/`
 * directory (produced by `packages/generator`) so the /demo page can
 * render live against the actual design system pipeline.
 *
 * Previously read from per-package `packages/tokens/dist/` and
 * `packages/css-core/dist/` separately — now uses the single generator
 * output which matches the spec's distribution structure (base tokens
 * separate from per-theme override files).
 *
 * Resolved from `process.cwd()` rather than `__dirname` — see
 * `src/lib/roadmap-data.ts` for why (bundlers relocate compiled server
 * modules, making `__dirname`-relative traversal unreliable).
 */
const DIST_DIR = join(process.cwd(), "..", "..", "dist");
const TOKENS_CSS_PATH = join(DIST_DIR, "tokens.css");
const CORE_CSS_PATH = join(DIST_DIR, "core.css");
const THEMES_DIR = join(DIST_DIR, "themes");

/** Attribute every element that should render with the *real* utility classes carries. */
const LIVE_ATTR = "data-ds-live";

/**
 * Extracts a single named `@layer <name> { ... }` block's inner content
 * from core.css, bounded by whatever `@layer <name>` comes right after it —
 * **not** hardcoded to a fixed next-layer name. It used to be hardcoded to
 * `@layer theme` as the boundary for `utilities` specifically, which broke
 * silently the moment `assembler.ts` grew a `components` layer between
 * `utilities` and `theme`: the non-greedy match still succeeded (there's
 * only one literal `@layer theme` in the file), it just also swallowed the
 * entire components layer along with it. Matching the *next* layer
 * generically, whatever it's named, means this keeps working no matter how
 * many layers get inserted, and lets the same function extract any layer
 * (utilities, components, ...) rather than needing one hardcoded function
 * per layer.
 */
function extractLayer(coreCss: string, layerName: string): string {
  const pattern = new RegExp(`@layer ${layerName} \\{\\n([\\s\\S]*?)\\n\\}\\n\\n@layer \\w+`);
  const match = coreCss.match(pattern);
  return match ? match[1] : "";
}

/**
 * Prefixes every utility class selector with `[data-ds-live]` as a compound
 * selector (`.p-4` → `[data-ds-live].p-4`), rather than confining rules with
 * `@scope`.
 *
 * `@scope` was tried first and *should* work per spec, but an isolated
 * sanity check in this environment's preview browser proved it silently
 * does nothing (a fresh `@scope` rule never matched, with no console error)
 * — not safe to depend on without knowing why. A compound selector has none
 * of that risk: `[data-ds-live].p-4` has specificity (0,2,0), which beats
 * Tailwind's plain `.p-4` (0,1,0) through ordinary, universally-supported
 * CSS specificity rules — no cascade-layer or scoping feature involved.
 *
 * Only matches selector-position lines starting with `.` and followed
 * immediately by `{` (after optional leading whitespace) — every rule in
 * the utilities layer, including ones with escaped characters like
 * `.sm\:p-4` or `.\32xl\:p-4`. The components layer has pseudo-class and
 * comma-separated selectors (`.btn:focus-visible { ... }`,
 * `.btn:disabled, .btn-disabled { ... }`) that don't match this narrower
 * pattern — see `rewriteComponentSelectors` below for those.
 */
function rewriteUtilitySelectors(utilitiesCss: string): string {
  return utilitiesCss.replace(
    /^(\s*)\.((?:[\w-]|\\.)+)(\s*\{)/gm,
    (_match, indent, className, brace) => `${indent}[${LIVE_ATTR}].${className}${brace}`
  );
}

/**
 * Same idea as `rewriteUtilitySelectors`, but for the components layer's
 * richer selector grammar: pseudo-classes (`.btn:focus-visible`),
 * comma-separated selector lists (`.btn:disabled, .btn-disabled`),
 * descendant combinators (`.modal-sm .modal-content`,
 * `.table-striped tbody tr:nth-child(even)` from the table/modal/nav/tabs
 * generators), and selector lists that span multiple lines
 * (`.table th,\n.table td {`). Prefixing the *first* compound of each
 * comma-separated selector is correct for descendants too — the live
 * container carries the variant class, so `[data-ds-live].modal-sm
 * .modal-content` scopes exactly right.
 *
 * The match deliberately runs across newlines (no `m` flag, `[^{}]`
 * includes `\n`): a per-line rewrite would leave the earlier lines of a
 * multi-line selector list unprefixed, leaking rules like `.table th`
 * (with `!important` forced below) onto the whole page. The components
 * layer is flat — no nested braces or `@media` — so "everything between
 * braces-free text and a `{`" is always exactly one selector list.
 */
function rewriteComponentSelectors(componentsCss: string): string {
  return componentsCss.replace(/([^{}]+)\{/g, (_match, selectorList: string) => {
    const leading = selectorList.match(/^\s*/)![0];
    const rewritten = selectorList
      .split(",")
      .map((selector) => `[${LIVE_ATTR}]${selector.trim()}`)
      .join(", ");
    return `${leading}${rewritten} {`;
  });
}

/** Forces every declaration to `!important`, unless it already is — defense in depth alongside the specificity boost above. */
function forceImportant(css: string): string {
  return css.replace(/([\w-]+)\s*:\s*([^;{}]+);/g, (match, prop, value) => {
    if (value.includes("!important")) return match;
    return `${prop}: ${value.trim()} !important;`;
  });
}

export async function GET() {
  let tokensCss: string;
  let coreCss: string;
  let themesCss = "";

  try {
    tokensCss = readFileSync(TOKENS_CSS_PATH, "utf-8");
    coreCss = readFileSync(CORE_CSS_PATH, "utf-8");

    // Load all theme override files from dist/themes/
    try {
      const themeFiles = readdirSync(THEMES_DIR)
        .filter(f => f.endsWith(".css"))
        .sort();
      for (const file of themeFiles) {
        themesCss += readFileSync(join(THEMES_DIR, file), "utf-8") + "\n";
      }
    } catch {
      // No themes directory — that's fine, themes are optional
    }
  } catch {
    return new NextResponse(
      `/* Design system build output not found. Run 'pnpm build' at the repository root first. */`,
      { status: 503, headers: { "Content-Type": "text/css" } }
    );
  }

  // tokens.css only defines `--ds-*` custom properties on `:root` — no
  // selector collision is possible with the rest of the (Tailwind-styled)
  // site, so it's safe to include unscoped and globally, unmodified.
  // Theme overrides ([data-theme="*"]) are also unscoped custom properties.
  const utilities = extractLayer(coreCss, "utilities");
  const components = extractLayer(coreCss, "components");
  const liveUtilities = forceImportant(rewriteUtilitySelectors(utilities));
  const liveComponents = forceImportant(rewriteComponentSelectors(components));

  const body = [
    "/* @company/design-system — dist/tokens.css (unscoped: --ds-* custom properties) */",
    tokensCss,
    "/* @company/design-system — dist/themes/*.css (theme overrides: [data-theme] selectors) */",
    themesCss,
    `/* @company/design-system — dist/core.css utilities layer, each selector prefixed with [${LIVE_ATTR}] */`,
    liveUtilities,
    `/* @company/design-system — dist/core.css components layer, each selector prefixed with [${LIVE_ATTR}] */`,
    liveComponents,
  ].join("\n\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
