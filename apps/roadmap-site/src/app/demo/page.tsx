"use client";

import { useState, useCallback, useEffect } from "react";

// --- Types ---

interface ColorToken {
  name: string;
  slug: string;
  variable: string;
}

interface SpacingToken {
  key: string;
  variable: string;
}

interface RadiusToken {
  key: string;
  variable: string;
}

interface ShadowToken {
  key: string;
  variable: string;
}

interface TypographyToken {
  key: string;
  label: string;
}

interface PlaygroundPreset {
  label: string;
  classes: string;
}

// --- Static Data ---
//
// Every value below is a *reference* into the real, currently-built output
// of `@company/tokens` / `@company/css-core` (loaded on this route via
// `src/app/demo/design-system.css/route.ts`) — never a hardcoded duplicate
// of a token's actual value. Elements that render using these references
// carry `data-ds-live`, which is the only selector the real utility CSS is
// scoped to (see the route handler for why).

const COLOR_TOKENS: ColorToken[] = [
  { name: "Primary", slug: "primary", variable: "--ds-color-primary-main" },
  { name: "Secondary", slug: "secondary", variable: "--ds-color-secondary-main" },
  { name: "Error", slug: "error", variable: "--ds-color-error-main" },
  { name: "Warning", slug: "warning", variable: "--ds-color-warning-main" },
  { name: "Success", slug: "success", variable: "--ds-color-success-main" },
  { name: "Info", slug: "info", variable: "--ds-color-info-main" },
];

const SPACING_TOKENS: SpacingToken[] = [
  { key: "1", variable: "--ds-spacing-1" },
  { key: "2", variable: "--ds-spacing-2" },
  { key: "3", variable: "--ds-spacing-3" },
  { key: "4", variable: "--ds-spacing-4" },
  { key: "5", variable: "--ds-spacing-5" },
  { key: "6", variable: "--ds-spacing-6" },
  { key: "8", variable: "--ds-spacing-8" },
  { key: "10", variable: "--ds-spacing-10" },
  { key: "12", variable: "--ds-spacing-12" },
  { key: "16", variable: "--ds-spacing-16" },
];

const RADIUS_TOKENS: RadiusToken[] = [
  { key: "none", variable: "--ds-radius-none" },
  { key: "sm", variable: "--ds-radius-sm" },
  { key: "md", variable: "--ds-radius-md" },
  { key: "lg", variable: "--ds-radius-lg" },
  { key: "xl", variable: "--ds-radius-xl" },
  { key: "2xl", variable: "--ds-radius-2xl" },
  { key: "full", variable: "--ds-radius-full" },
];

const SHADOW_TOKENS: ShadowToken[] = [
  { key: "none", variable: "--ds-shadow-none" },
  { key: "sm", variable: "--ds-shadow-sm" },
  { key: "md", variable: "--ds-shadow-md" },
  { key: "lg", variable: "--ds-shadow-lg" },
  { key: "xl", variable: "--ds-shadow-xl" },
  { key: "2xl", variable: "--ds-shadow-2xl" },
];

// Only the typography tokens that actually exist in packages/tokens/src/typography.json —
// this list previously included "heading-h3" and "body-lg", which don't
// exist, so those two rows silently rendered as plain, unstyled text.
const TYPOGRAPHY_TOKENS: TypographyToken[] = [
  { key: "heading-h1", label: "Heading / H1" },
  { key: "heading-h2", label: "Heading / H2" },
  { key: "body-md", label: "Body / Medium" },
  { key: "body-sm", label: "Body / Small" },
];

// Every class below is a real, generated utility class — verified against
// packages/css-core/dist/core.css.
const PLAYGROUND_PRESETS: PlaygroundPreset[] = [
  { label: "Card Style", classes: "p-8 rounded-xl shadow-2xl bg-secondary text-secondary-contrast" },
  { label: "Success Alert", classes: "p-4 rounded-md shadow-sm bg-success text-success-contrast" },
  { label: "Pill Button", classes: "p-3 px-6 rounded-full shadow-md bg-error text-error-contrast" },
  { label: "Box Warning", classes: "p-10 rounded-none shadow-inner bg-warning text-warning-contrast" },
];

// --- Component ---

export default function DemoPage() {
  const [playgroundInput, setPlaygroundInput] = useState(
    "p-6 rounded-lg shadow-lg bg-primary text-primary-contrast"
  );
  const [toast, setToast] = useState<string | null>(null);
  // Starts `false` (SSR-safe — `document` doesn't exist on the server) and
  // syncs to the real DOM state in the effect below, rather than reading
  // `document` directly in the initializer. The root layout's blocking
  // inline script already set the correct `.dark` class before this
  // component mounts, so the page never visually flashes the wrong theme —
  // only this local `darkMode` boolean (and therefore the toggle button's
  // label) is one tick behind on first render.
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Syncing from an external system (the DOM class set by the root
    // layout's pre-hydration script), not state that could be computed
    // during render — this is the documented exception to the lint rule.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  }, []);

  const copyToken = useCallback(
    (variable: string) => {
      const text = `var(${variable})`;
      navigator.clipboard.writeText(text).then(() => {
        showToast(`Copied: ${text}`);
      });
    },
    [showToast]
  );

  const copyClasses = useCallback(
    (classes: string) => {
      navigator.clipboard.writeText(classes).then(() => {
        showToast(`Copied: ${classes}`);
      });
    },
    [showToast]
  );

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      // `.dark` drives Tailwind's `dark:` utilities (this page's own
      // chrome); `data-theme="dark"` drives the design system's own
      // `--ds-color-*` overrides (see packages/tokens/dist/tokens.css and
      // the comment on SYNC_DARK_CLASS_SCRIPT in layout.tsx for why these
      // are two independent attributes, not a redundant pair).
      if (next) {
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700">
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-white/5"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-16 h-[350px] w-[350px] rounded-full bg-white/5"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            🎨 Company Design System
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90 sm:text-xl">
            87 Design Tokens · 8 Categories · ~1,500 Utility Classes · 5 Components · Dark Mode
          </p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-white/70">
            Everything below marked <span className="font-mono">live</span> renders with the
            actual generated CSS — nothing here is simulated.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={toggleDarkMode}
              className="rounded-full border-2 border-white/80 bg-transparent px-6 py-3
                font-semibold text-white transition-all hover:bg-white/10"
            >
              {darkMode ? "☀️ Light Mode" : "🌓 Dark Mode"}
            </button>
            <a
              href="#playground"
              className="rounded-full border-0 bg-white px-6 py-3 font-semibold
                text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              ⚡ Try Playground
            </a>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Getting Started */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            📦 How to Use This <LiveBadge />
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
              @company/tokens
            </code>{" "}
            and{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
              @company/css-core
            </code>{" "}
            aren&apos;t published to a registry or CDN yet — the publishing
            steps are specified in{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
              docs/09-publish.md
            </code>{" "}
            but haven&apos;t been run. This shows the integration shape once
            they are: framework-agnostic plain CSS, no build step required to
            consume it.
          </p>

          <div className="mt-6 space-y-8">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                1. Load the generated stylesheets
              </h3>
              <CodeBlock>
                {`<link rel="stylesheet" href="https://cdn.example.com/tokens.css">\n<link rel="stylesheet" href="https://cdn.example.com/core.css">`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                2. Use the utility classes in your markup — works in any
                framework, or plain HTML
              </h3>
              <CodeBlock>
                {`<button class="px-6 py-3 rounded-full shadow-md bg-primary text-primary-contrast">\n  Get Started\n</button>`}
              </CodeBlock>
              <div className="mt-3 flex items-center gap-3 rounded-lg border-2 border-dashed border-zinc-200 p-4 dark:border-zinc-700">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Renders as:
                </span>
                <button
                  data-ds-live
                  className="px-6 py-3 rounded-full shadow-md bg-primary text-primary-contrast"
                >
                  Get Started
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                3. Or reference the underlying tokens directly in your own CSS
              </h3>
              <CodeBlock>
                {`.my-card {\n  padding: var(--ds-spacing-6);\n  border-radius: var(--ds-radius-lg);\n  box-shadow: var(--ds-shadow-md);\n}`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Interactive Playground */}
        <section id="playground" className="mb-16 scroll-mt-8">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            ⚡ Interactive Playground <LiveBadge />
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Type any real utility class — the preview renders it with the actual
            generated CSS, live. Try something not in a preset below.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <label
                htmlFor="playground-input"
                className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Utility Classes:
              </label>
              <textarea
                id="playground-input"
                value={playgroundInput}
                onChange={(e) => setPlaygroundInput(e.target.value)}
                spellCheck={false}
                className="w-full resize-y rounded-lg border-2 border-zinc-200 bg-zinc-50
                  p-4 font-mono text-sm text-zinc-900 focus:border-indigo-500
                  focus:outline-none dark:border-zinc-700 dark:bg-zinc-800
                  dark:text-zinc-100"
                rows={4}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {PLAYGROUND_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setPlaygroundInput(preset.classes)}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5
                      text-xs font-medium text-zinc-700 transition-colors
                      hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700
                      dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300
                      dark:hover:border-indigo-500 dark:hover:bg-indigo-950
                      dark:hover:text-indigo-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Preview:
              </span>
              <div
                className="flex min-h-[200px] items-center justify-center rounded-lg
                  border-2 border-dashed border-zinc-200 p-4 dark:border-zinc-700"
              >
                {/* This is the only element on the page that receives exactly
                    the classes typed above — nothing else is mixed in, so
                    what you see is exactly what those classes produce. */}
                <div data-ds-live className={playgroundInput}>
                  Hello, Design System!
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Token Explorer */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            🎯 Token Explorer <LiveBadge />
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Click any token to copy its CSS variable
          </p>

          {/* Colors */}
          <h3 className="mb-3 mt-8 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Colors
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {COLOR_TOKENS.map((token) => (
              <button
                key={token.variable}
                onClick={() => copyToken(token.variable)}
                className="transition-transform hover:scale-105"
                aria-label={`Copy ${token.variable}`}
              >
                <div
                  data-ds-live
                  className={`flex min-h-[80px] flex-col items-center justify-center
                    rounded-xl p-4 text-center bg-${token.slug} text-${token.slug}-contrast`}
                >
                  <span className="text-sm font-semibold">{token.name}</span>
                  <code className="mt-1 text-[10px] opacity-80">{token.variable}</code>
                </div>
              </button>
            ))}
          </div>

          {/* Spacing */}
          <h3 className="mb-3 mt-8 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Spacing Scale
          </h3>
          <div className="flex flex-wrap items-end gap-2">
            {SPACING_TOKENS.map((token) => (
              <button
                key={token.variable}
                onClick={() => copyToken(token.variable)}
                className="group flex items-center justify-center rounded
                  bg-indigo-600 transition-transform hover:scale-110"
                style={{
                  width: `var(${token.variable})`,
                  height: `var(${token.variable})`,
                  minWidth: "24px",
                  minHeight: "24px",
                }}
                aria-label={`Copy ${token.variable}`}
              >
                <span className="text-[10px] font-bold text-white">{token.key}</span>
              </button>
            ))}
          </div>

          {/* Border Radius */}
          <h3 className="mb-3 mt-8 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Border Radius
          </h3>
          <div className="flex flex-wrap gap-4">
            {RADIUS_TOKENS.map((token) => (
              <button
                key={token.variable}
                onClick={() => copyToken(token.variable)}
                className="transition-transform hover:scale-110"
                aria-label={`Copy ${token.variable}`}
              >
                <div
                  data-ds-live
                  className={`flex h-16 w-16 items-center justify-center bg-sky-600
                    text-xs font-semibold text-white rounded-${token.key}`}
                >
                  {token.key}
                </div>
              </button>
            ))}
          </div>

          {/* Shadows */}
          <h3 className="mb-3 mt-8 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Shadows
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {SHADOW_TOKENS.map((token) => (
              <button
                key={token.variable}
                onClick={() => copyToken(token.variable)}
                className="transition-transform hover:-translate-y-0.5"
                aria-label={`Copy ${token.variable}`}
              >
                <div
                  data-ds-live
                  className={`rounded-lg bg-white p-5 text-center text-sm font-semibold
                    text-zinc-700 shadow-${token.key}`}
                >
                  {token.key}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Real-World Example */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            🔧 Real-World Example <LiveBadge />
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Composed UI patterns, not isolated swatches — every color,
            spacing, radius, shadow, and typography value below comes from a
            real utility class. Layout (flex/stacking) is plain CSS, since
            this project doesn&apos;t generate layout utilities yet.
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Notification list
              </h3>
              <div className="flex flex-col gap-3">
                {/* data-ds-live is required on every element carrying a real
                    class — the generated CSS matches `[data-ds-live].bg-success`
                    as one compound selector, so it has no effect on a child
                    that doesn't also carry the attribute. Nested text here
                    just inherits `color` from its parent, which is enough. */}
                <div
                  data-ds-live
                  className="p-4 rounded-md shadow-sm bg-success text-success-contrast"
                >
                  <strong>Deploy succeeded</strong>
                  <p className="mt-1 text-sm opacity-90">
                    packages/css-core built with 0 errors.
                  </p>
                </div>
                <div
                  data-ds-live
                  className="p-4 rounded-md shadow-sm bg-warning text-warning-contrast"
                >
                  <strong>2 optional tests skipped</strong>
                </div>
                <div
                  data-ds-live
                  className="p-4 rounded-md shadow-sm bg-error text-error-contrast"
                >
                  <strong>Token validation failed</strong>
                  <p className="mt-1 text-sm opacity-90">
                    color.primary.alias references a missing token.
                  </p>
                </div>
              </div>
              <CodeBlock>
                {`<div class="p-4 rounded-md shadow-sm bg-success text-success-contrast">\n  <strong>Deploy succeeded</strong>\n</div>`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Action bar
              </h3>
              <div
                data-ds-live
                className="flex flex-wrap gap-3 p-6 rounded-xl shadow-md bg-primary-light"
              >
                <button
                  data-ds-live
                  className="px-6 py-3 rounded-full shadow-sm bg-primary text-primary-contrast"
                >
                  Confirm
                </button>
                <button
                  data-ds-live
                  className="px-6 py-3 rounded-full shadow-sm bg-secondary text-secondary-contrast"
                >
                  Save Draft
                </button>
                <button
                  data-ds-live
                  className="px-6 py-3 rounded-full shadow-sm bg-error text-error-contrast"
                >
                  Delete
                </button>
              </div>
              <CodeBlock>
                {`<div class="flex flex-wrap gap-3 p-6 rounded-xl shadow-md bg-primary-light">\n  <button class="px-6 py-3 rounded-full shadow-sm bg-primary text-primary-contrast">Confirm</button>\n  <button class="px-6 py-3 rounded-full shadow-sm bg-secondary text-secondary-contrast">Save Draft</button>\n  <button class="px-6 py-3 rounded-full shadow-sm bg-error text-error-contrast">Delete</button>\n</div>`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            🧩 Components <LiveBadge />
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Pre-composed classes from the Component Layer (
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
              .btn
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
              .card
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
              .badge
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
              .input
            </code>
            ,{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
              .alert
            </code>
            ) — see{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
              docs/spec/components.md
            </code>
            . Each combines multiple tokens into one class, sitting between
            Utilities and Theme in the layer order.
          </p>

          {/* Buttons */}
          <h3 className="mb-3 mt-8 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Buttons
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <button data-ds-live className="btn btn-primary" onClick={() => showToast("Copied nothing — this is just a demo button")}>
              Primary
            </button>
            <button data-ds-live className="btn btn-secondary">
              Secondary
            </button>
            <button data-ds-live className="btn btn-error">
              Error
            </button>
            <button data-ds-live className="btn btn-outline">
              Outline
            </button>
            <button data-ds-live className="btn btn-ghost">
              Ghost
            </button>
            <button data-ds-live className="btn btn-primary btn-sm">
              Small
            </button>
            <button data-ds-live className="btn btn-primary btn-lg">
              Large
            </button>
            <button data-ds-live className="btn btn-primary" disabled>
              Disabled
            </button>
          </div>
          <CodeBlock>
            {`<button class="btn btn-primary">Primary</button>\n<button class="btn btn-outline">Outline</button>\n<button class="btn btn-primary btn-sm">Small</button>`}
          </CodeBlock>

          {/* Badges */}
          <h3 className="mb-3 mt-10 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Badges
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <span data-ds-live className="badge badge-primary">Primary</span>
            <span data-ds-live className="badge badge-secondary">Secondary</span>
            <span data-ds-live className="badge badge-error">Error</span>
            <span data-ds-live className="badge badge-warning">Warning</span>
            <span data-ds-live className="badge badge-success">Success</span>
            <span data-ds-live className="badge badge-info">Info</span>
          </div>
          <CodeBlock>{`<span class="badge badge-success">Success</span>`}</CodeBlock>

          {/* Alerts */}
          <h3 className="mb-3 mt-10 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Alerts
          </h3>
          <div className="flex flex-col gap-3">
            <div data-ds-live className="alert alert-success">
              <span>✅</span>
              <span>Deploy succeeded — build finished with 0 errors.</span>
            </div>
            <div data-ds-live className="alert alert-warning">
              <span>⚠️</span>
              <span>2 optional tests were skipped.</span>
            </div>
            <div data-ds-live className="alert alert-error">
              <span>⛔</span>
              <span>Token validation failed — see logs.</span>
            </div>
          </div>
          <CodeBlock>
            {`<div class="alert alert-success">Deploy succeeded</div>`}
          </CodeBlock>

          {/* Card + Input */}
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Card
              </h3>
              <div data-ds-live className="card">
                <div data-ds-live className="card-header">
                  Project Status
                </div>
                <div data-ds-live className="card-body">
                  <p>
                    This card, its header, body, and footer all come from
                    the <code className="text-xs">.card</code> component
                    class — background, text, border, radius, and shadow
                    are all token-driven.
                  </p>
                </div>
                <div data-ds-live className="card-footer">
                  <button data-ds-live className="btn btn-primary btn-sm">
                    View Details
                  </button>
                </div>
              </div>
              <CodeBlock>
                {`<div class="card">\n  <div class="card-header">Project Status</div>\n  <div class="card-body">...</div>\n  <div class="card-footer">\n    <button class="btn btn-primary btn-sm">View Details</button>\n  </div>\n</div>`}
              </CodeBlock>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                Input
              </h3>
              <div className="flex flex-col gap-3">
                <input
                  data-ds-live
                  className="input"
                  placeholder="you@company.com"
                  defaultValue=""
                />
                <input
                  data-ds-live
                  className="input input-error"
                  placeholder="Invalid input"
                  defaultValue="not-an-email"
                />
              </div>
              <CodeBlock>
                {`<input class="input" placeholder="you@company.com">\n<input class="input input-error" value="not-an-email">`}
              </CodeBlock>
            </div>
          </div>
        </section>

        {/* Concept Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            🧩 Concept Cards
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Illustrative cards about this project itself — styled with
            Tailwind for this documentation site&apos;s own chrome, not the
            design system (see the Real-World Example section above for
            that).
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature Card */}
            <div
              className="group rounded-xl border border-zinc-200 bg-white p-6
                shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl
                dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl
                  bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl"
              >
                🎯
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Token-Driven
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Every visual value comes from Design Tokens. Change one value, update everywhere.
              </p>
              <button
                className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
                  text-white transition-colors hover:bg-indigo-700"
              >
                Learn More →
              </button>
            </div>

            {/* Alert Card */}
            <div
              className="rounded-xl border border-zinc-200 border-l-4 border-l-green-600
                bg-white p-5 shadow-md dark:border-zinc-700 dark:border-l-green-500
                dark:bg-zinc-900"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">✅</span>
                <strong className="text-green-700 dark:text-green-400">
                  Build Successful
                </strong>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                84 tokens validated · 3 output files generated · 0 errors
              </p>
            </div>

            {/* Stats Card */}
            <div
              className="rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600
                p-6 text-white shadow-lg"
            >
              <p className="text-sm opacity-80">Total Utility Classes</p>
              <p className="mt-1 text-4xl font-extrabold">~1,566</p>
              <p className="mt-2 text-sm opacity-70">
                261 base × 5 responsive breakpoints + extras
              </p>
            </div>

            {/* Badge Collection */}
            <div
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-md
                dark:border-zinc-700 dark:bg-zinc-900"
            >
              <h3 className="mb-3 text-base font-bold text-zinc-900 dark:text-zinc-100">
                Status Badges
              </h3>
              <div className="flex flex-wrap gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: "#2E7D32" }}
                >
                  Completed
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: "#F9A825", color: "#1a1a1a" }}
                >
                  In Progress
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: "#0277BD" }}
                >
                  Planned
                </span>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: "#C62828" }}
                >
                  Blocked
                </span>
              </div>
            </div>

            {/* Build Pipeline Diagram */}
            <div
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-md
                md:col-span-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <h3 className="mb-4 text-base font-bold text-zinc-900 dark:text-zinc-100">
                Build Pipeline
              </h3>
              <div className="flex flex-wrap items-center gap-2 font-mono text-sm">
                <span className="rounded-md bg-indigo-600 px-3 py-1.5 text-white">
                  tokens/src/*.json
                </span>
                <span className="text-zinc-400">→</span>
                <span className="rounded-md bg-sky-600 px-3 py-1.5 text-white">
                  Parser
                </span>
                <span className="text-zinc-400">→</span>
                <span
                  className="rounded-md px-3 py-1.5"
                  style={{ backgroundColor: "#F9A825", color: "#1a1a1a" }}
                >
                  Validator
                </span>
                <span className="text-zinc-400">→</span>
                <span className="rounded-md bg-green-600 px-3 py-1.5 text-white">
                  Resolver
                </span>
                <span className="text-zinc-400">→</span>
                <span className="rounded-md bg-purple-600 px-3 py-1.5 text-white">
                  Generators
                </span>
                <span className="text-zinc-400">→</span>
                <span
                  className="rounded-md bg-gradient-to-r from-indigo-600 to-purple-600
                    px-3 py-1.5 text-white"
                >
                  dist/
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            📝 Typography <LiveBadge />
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Type scales rendered with their real <code>.text-*</code> utility class
          </p>

          <div
            className="mt-6 overflow-hidden rounded-xl border border-zinc-200
              bg-white dark:border-zinc-700 dark:bg-zinc-900"
          >
            {TYPOGRAPHY_TOKENS.map((token, index) => (
              <button
                key={token.key}
                onClick={() => copyClasses(`text-${token.key}`)}
                className={`block w-full px-6 py-5 text-left transition-colors
                  hover:bg-zinc-50 dark:hover:bg-zinc-800/60 ${
                    index < TYPOGRAPHY_TOKENS.length - 1
                      ? "border-b border-zinc-100 dark:border-zinc-800"
                      : ""
                  }`}
                aria-label={`Copy .text-${token.key}`}
              >
                <p data-ds-live className={`text-zinc-900 dark:text-zinc-100 text-${token.key}`}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <code className="mt-1 block text-xs text-zinc-400 dark:text-zinc-500">
                  .text-{token.key} — {token.label}
                </code>
              </button>
            ))}
          </div>
        </section>

        {/* Accessibility */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">
            ♿ Accessibility
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Tab through buttons to see focus-visible ring
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white
                transition-colors hover:bg-indigo-700 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-indigo-500
                focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              Primary Action
            </button>
            <button
              className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white
                transition-colors hover:bg-purple-700 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-purple-500
                focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              Secondary
            </button>
            <button
              className="rounded-lg border-2 border-indigo-600 bg-transparent px-6
                py-3 font-medium text-indigo-600 transition-colors
                hover:bg-indigo-50 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-indigo-500
                focus-visible:ring-offset-2 dark:border-indigo-400
                dark:text-indigo-400 dark:hover:bg-indigo-950
                dark:focus-visible:ring-offset-zinc-950"
            >
              Outlined
            </button>
            <button
              className="rounded-lg bg-red-700 px-6 py-3 font-medium text-white
                transition-colors hover:bg-red-800 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-red-500
                focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              Destructive
            </button>
          </div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            💡 Focus ring uses{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              var(--ds-color-primary-main)
            </code>{" "}
            — 2px solid with 2px offset
          </p>
        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Company Design System v0.1.0 — Built with Kiro + Claude Code · Fully
            token-driven · Zero hardcoded values
          </p>
        </footer>
      </main>

      {/* Toast Notification */}
      <div
        aria-live="polite"
        className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full
          bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-xl
          transition-all duration-300 dark:bg-zinc-100 dark:text-zinc-900
          ${toast ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
      >
        {toast}
      </div>
    </div>
  );
}

/** Renders a code sample. Styled with Tailwind — this is page chrome, not something being demoed. */
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100 dark:bg-black">
      <code>{children}</code>
    </pre>
  );
}

/** Small inline badge marking a section as rendering the real, live design-system CSS. */
function LiveBadge() {
  return (
    <span
      className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5
        align-middle text-xs font-semibold text-emerald-700 dark:bg-emerald-950
        dark:text-emerald-300"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      live
    </span>
  );
}
