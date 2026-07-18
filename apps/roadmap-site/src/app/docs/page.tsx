"use client";

import { useState, useCallback, useEffect, type KeyboardEvent } from "react";

import AdvancedComponentsDocs from "@/components/AdvancedComponentsDocs";

/* ─── Data ────────────────────────────────────────────────────────────── */

const COLORS = [
  { name: "Primary", slug: "primary", variants: [
    { label: "main", hex: "#1565C0" }, { label: "light", hex: "#1E88E5" },
    { label: "dark", hex: "#0D47A1" }, { label: "contrast", hex: "#FFFFFF" },
  ]},
  { name: "Secondary", slug: "secondary", variants: [
    { label: "main", hex: "#7B1FA2" }, { label: "light", hex: "#9C27B0" },
    { label: "dark", hex: "#4A148C" }, { label: "contrast", hex: "#FFFFFF" },
  ]},
  { name: "Error", slug: "error", variants: [
    { label: "main", hex: "#D32F2F" }, { label: "contrast", hex: "#FFFFFF" },
  ]},
  { name: "Warning", slug: "warning", variants: [
    { label: "main", hex: "#ED6C02" }, { label: "contrast", hex: "#000000" },
  ]},
  { name: "Success", slug: "success", variants: [
    { label: "main", hex: "#2E7D32" }, { label: "contrast", hex: "#FFFFFF" },
  ]},
  { name: "Info", slug: "info", variants: [
    { label: "main", hex: "#0288D1" }, { label: "contrast", hex: "#FFFFFF" },
  ]},
  { name: "Surface", slug: "surface", variants: [
    { label: "main", hex: "#FFFFFF" }, { label: "contrast", hex: "#1A1A1A" },
  ]},
  { name: "Border", slug: "border", variants: [
    { label: "main", hex: "#E0E0E0" },
  ]},
];

const SPACING = [
  { key: "0", value: "0" }, { key: "1", value: "0.25rem" },
  { key: "2", value: "0.5rem" }, { key: "3", value: "0.75rem" },
  { key: "4", value: "1rem" }, { key: "5", value: "1.25rem" },
  { key: "6", value: "1.5rem" }, { key: "8", value: "2rem" },
  { key: "10", value: "2.5rem" }, { key: "12", value: "3rem" },
  { key: "16", value: "4rem" },
];

const RADIUS = ["none", "sm", "md", "lg", "xl", "2xl", "full"];
const SHADOWS = ["none", "sm", "md", "lg", "xl", "2xl"];

const ZINDEX = [
  { key: "hide", value: -1 }, { key: "base", value: 0 },
  { key: "dropdown", value: 1000 }, { key: "sticky", value: 1100 },
  { key: "fixed", value: 1200 }, { key: "overlay", value: 1300 },
  { key: "modal", value: 1400 }, { key: "popover", value: 1500 },
  { key: "tooltip", value: 1600 },
];

const MOTION_DURATION = [
  { key: "instant", value: "0ms" }, { key: "fast", value: "150ms" },
  { key: "normal", value: "300ms" }, { key: "slow", value: "500ms" },
  { key: "slower", value: "700ms" },
];

const MOTION_EASING = ["linear", "in", "out", "in-out"];

const SECTIONS = [
  { id: "colors", label: "Colors" },
  { id: "spacing", label: "Spacing" },
  { id: "typography", label: "Typography" },
  { id: "radius", label: "Radius" },
  { id: "shadows", label: "Shadows" },
  { id: "borders", label: "Borders" },
  { id: "layout", label: "Layout" },
  { id: "zindex", label: "Z-Index" },
  { id: "motion", label: "Motion" },
  { id: "components", label: "Components" },
  { id: "overrides", label: "CSS Overrides" },
  { id: "dark-light", label: "Themes" },
];


/* ─── Helpers ─────────────────────────────────────────────────────────── */

function Code({ children, onCopy }: { children: string; onCopy: (t: string) => void }) {
  return (
    <div className="group relative mt-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
      <button onClick={() => onCopy(children)} className="absolute right-2 top-2 rounded border border-zinc-300 bg-white px-2 py-0.5 text-[10px] font-medium text-zinc-500 opacity-0 transition group-hover:opacity-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" aria-label="Copy">Copy</button>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200"><code>{children}</code></pre>
    </div>
  );
}

function handleKeyboardActivation(
  event: KeyboardEvent<HTMLElement>,
  action: () => void,
): void {
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  action();
}

/* ─── Page ────────────────────────────────────────────────────────────── */

export default function DocsPage() {
  const [toast, setToast] = useState<string | null>(null);
  // Single source of truth for both the hero's dark-mode toggle and the
  // Themes section's 4-way switcher below — they used to be two
  // independent pieces of state writing the same `data-theme` attribute
  // (nav toggle vs. inline onClick handlers), so picking a brand theme
  // then clicking the nav toggle silently discarded it with no feedback.
  // `.dark` (Tailwind's own dark: utilities) and `data-theme` (the design
  // system's --ds-color-* tokens) are still two separate DOM mechanisms —
  // see layout.tsx's SYNC_DARK_CLASS_SCRIPT — but both are now driven from
  // this one variable via `applyTheme`.
  type ThemeValue = "" | "dark" | "banking" | "corporate";
  const [activeTheme, setActiveTheme] = useState<ThemeValue>("");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    const known: ThemeValue[] = ["dark", "banking", "corporate"];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTheme(known.includes(current as ThemeValue) ? (current as ThemeValue) : "");
  }, []);

  const applyTheme = useCallback((theme: ThemeValue) => {
    const html = document.documentElement;
    if (theme) {
      html.setAttribute("data-theme", theme);
    } else {
      html.removeAttribute("data-theme");
    }
    html.classList.toggle("dark", theme === "dark");
    setActiveTheme(theme);
  }, []);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => setToast(`Copied: ${text}`),
      // Clipboard can be unavailable (permission denied, insecure context,
      // unfocused document) — without this branch the click silently does
      // nothing, which reads as a broken button.
      () => setToast(`Copy failed — select and copy manually: ${text}`),
    );
    setTimeout(() => setToast(null), 2000);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Toast */}
      <div aria-live="polite" className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-xl transition-all duration-300 dark:bg-zinc-100 dark:text-zinc-900 ${toast ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>{toast}</div>

      {/* Hero */}
      <section className="border-b border-zinc-200 bg-gradient-to-br from-slate-50 to-zinc-100 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">Design System Documentation</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">87 tokens · 8 categories · 9 component classes · utility-first CSS framework. Everything below renders with the real generated output.</p>
          <button onClick={() => applyTheme(activeTheme === "dark" ? "" : "dark")} className="mt-4 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
            {activeTheme === "dark" ? "☀️ Light Mode" : "🌓 Dark Mode"}
          </button>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10 sm:px-6">
        {/* Sidebar */}
        <aside className="hidden w-44 shrink-0 lg:block">
          <nav className="sticky top-20 space-y-0.5" aria-label="Docs navigation">
            {SECTIONS.map(s => (
              <a key={s.id} href={`#${s.id}`} className="block rounded px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">{s.label}</a>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 space-y-20">

          {/* ═══ COLORS ═══ */}
          <section id="colors" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">🎨 Color Palette</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Click any swatch to copy the CSS variable</p>
            {COLORS.map(color => (
              <div key={color.slug} className="mt-6">
                <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 capitalize">{color.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {color.variants.map(v => (
                    <button key={v.label} onClick={() => copy(`var(--ds-color-${color.slug}-${v.label})`)} className="group flex flex-col items-center rounded-lg border border-zinc-200 p-2 transition hover:scale-105 hover:shadow-md dark:border-zinc-700" style={{ minWidth: 80 }}>
                      <div className="h-10 w-10 rounded-md shadow-inner" style={{ backgroundColor: v.hex, border: v.hex === "#FFFFFF" ? "1px solid #e5e7eb" : undefined }} />
                      <span className="mt-1.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">{v.label}</span>
                      <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">{v.hex}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <h3 className="mb-2 mt-8 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Usage</h3>
            <Code onCopy={copy}>{`<!-- Utility class (background + matching text color) -->
<div class="bg-primary text-primary-contrast">Primary surface</div>
<div class="bg-error text-error-contrast">Error surface</div>

<!-- Or the CSS variable directly, in your own stylesheet -->
<style>
  .my-banner {
    background-color: var(--ds-color-primary-main);
    color: var(--ds-color-primary-contrast);
  }
</style>`}</Code>
          </section>

          {/* ═══ SPACING ═══ */}
          <section id="spacing" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">📐 Spacing Scale</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">11 values from the spacing token scale. Click to copy.</p>
            <div className="mt-4 space-y-2">
              {SPACING.map(s => (
                <button key={s.key} onClick={() => copy(`var(--ds-spacing-${s.key})`)} className="flex w-full items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-left transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  <div className="h-6 rounded bg-indigo-500" style={{ width: s.value === "0" ? "2px" : s.value }} />
                  <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 w-8">{s.key}</span>
                  <span className="text-xs font-mono text-zinc-400">{s.value}</span>
                  <span className="ml-auto text-[10px] text-zinc-400 font-mono">--ds-spacing-{s.key}</span>
                </button>
              ))}
            </div>
            <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Usage</h3>
            <Code onCopy={copy}>{`<!-- p = padding, m = margin. Prefix with x/y/t/r/b/l to target one axis/side -->
<div class="p-4">All sides</div>
<div class="px-4 py-2">Horizontal + vertical</div>
<div class="mt-6 mb-4">Top + bottom margin</div>
<div class="gap-4">Flex/grid gap</div>`}</Code>
          </section>

          {/* ═══ TYPOGRAPHY ═══ */}
          <section id="typography" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">📝 Typography</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">4 type scales rendered with real utility classes</p>
            <div data-ds-live className="bg-surface text-surface-contrast mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
              {[
                { cls: "text-heading-h1", label: "Heading H1", meta: "2.125rem / 700 / 1.235" },
                { cls: "text-heading-h2", label: "Heading H2", meta: "1.5rem / 700 / 1.334" },
                { cls: "text-body-md", label: "Body MD", meta: "1rem / 400 / 1.5" },
                { cls: "text-body-sm", label: "Body SM", meta: "0.875rem / 400 / 1.43" },
              ].map((t, i) => (
                <button key={t.cls} onClick={() => copy(t.cls)} className={`block w-full px-6 py-5 text-left transition hover:bg-zinc-50/50 ${i < 3 ? "border-b border-zinc-100 dark:border-zinc-800" : ""}`}>
                  <p data-ds-live className={t.cls}>{t.label} — The quick brown fox</p>
                  <code className="mt-1 block text-[10px] text-zinc-400">.{t.cls} — {t.meta}</code>
                </button>
              ))}
            </div>
            <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Usage</h3>
            <Code onCopy={copy}>{`<h1 class="text-heading-h1">Page title</h1>
<h2 class="text-heading-h2">Section heading</h2>
<p class="text-body-md">Regular paragraph text.</p>
<p class="text-body-sm">Smaller supporting text.</p>`}</Code>
          </section>

          {/* ═══ RADIUS ═══ */}
          <section id="radius" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">⭕ Border Radius</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">7 radius values. Click to copy.</p>
            <div className="mt-4 flex flex-wrap gap-4">
              {RADIUS.map(r => (
                <button key={r} onClick={() => copy(`rounded-${r}`)} className="transition hover:scale-110">
                  <div data-ds-live className={`flex h-16 w-16 items-center justify-center bg-info text-info-contrast text-xs font-bold rounded-${r}`}>{r}</div>
                  <span className="mt-1 block text-center text-[10px] text-zinc-500">.rounded-{r}</span>
                </button>
              ))}
            </div>
            <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Usage</h3>
            <Code onCopy={copy}>{`<div class="rounded-md">Rounded corners</div>
<img class="rounded-full" src="avatar.jpg" alt="">
<button class="rounded-lg">Button</button>`}</Code>
          </section>

          {/* ═══ SHADOWS ═══ */}
          <section id="shadows" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">🌑 Shadows</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">6 elevation levels. Click to copy.</p>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              {SHADOWS.map(s => (
                <button key={s} onClick={() => copy(`shadow-${s}`)} className="transition hover:-translate-y-1">
                  <div data-ds-live className={`bg-surface text-surface-contrast rounded-lg p-5 text-center text-sm font-semibold shadow-${s}`}>{s}</div>
                </button>
              ))}
            </div>
            <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Usage</h3>
            <Code onCopy={copy}>{`<div class="shadow-sm">Subtle elevation</div>
<div class="shadow-lg">Card, popover</div>
<div class="shadow-2xl">Modal, dialog</div>`}</Code>
          </section>

          {/* ═══ BORDERS ═══ */}
          <section id="borders" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">▢ Borders</h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              Width, side, style, and color — separate from <code className="text-xs">.rounded-*</code>{" "}
              (that&apos;s border-radius, in the Radius section above). Width/side utilities are
              self-sufficient (width + style + color together); style/color utilities override
              one piece of that when combined.
            </p>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Width</h3>
            <div className="flex flex-wrap gap-3">
              {["border-0","border","border-2","border-4","border-8"].map(c => (
                <button key={c} onClick={() => copy(c)} className="transition hover:scale-105">
                  <div data-ds-live className={`flex h-14 w-14 items-center justify-center rounded-md bg-surface text-surface-contrast text-[10px] font-mono ${c}`}>.{c}</div>
                </button>
              ))}
            </div>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Side</h3>
            <div className="flex flex-wrap gap-3">
              {["border-t","border-r","border-b","border-l"].map(c => (
                <button key={c} onClick={() => copy(c)} className="transition hover:scale-105">
                  <div data-ds-live className={`flex h-14 w-14 items-center justify-center rounded-md bg-surface text-surface-contrast text-[10px] font-mono ${c}`}>.{c}</div>
                </button>
              ))}
            </div>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Style</h3>
            <div className="flex flex-wrap gap-3">
              {["border-solid","border-dashed","border-dotted"].map(c => (
                <button key={c} onClick={() => copy(c)} className="transition hover:scale-105">
                  <div data-ds-live className={`border-2 flex h-14 w-14 items-center justify-center rounded-md bg-surface text-surface-contrast text-[10px] font-mono ${c}`}>.{c}</div>
                </button>
              ))}
            </div>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Color</h3>
            <div className="flex flex-wrap gap-3">
              {["primary","secondary","error","warning","success","info"].map(c => (
                <button key={c} onClick={() => copy(`border-${c}`)} className="transition hover:scale-105">
                  <div data-ds-live className={`border-2 flex h-14 w-14 items-center justify-center rounded-md bg-surface text-surface-contrast text-[10px] font-mono border-${c}`}>.border-{c}</div>
                </button>
              ))}
            </div>

            <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Usage</h3>
            <Code onCopy={copy}>{`<div class="border">Default 1px border</div>
<div class="border-2 border-primary">Colored, thicker border</div>
<div class="border-t">Top border only (e.g. a divider)</div>
<div class="border-2 border-dashed border-error">Dashed error outline</div>`}</Code>
          </section>


          {/* ═══ LAYOUT ═══ */}
          <section id="layout" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">📐 Layout</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Display, Flexbox, Grid, Width/Height, Position, Overflow — all with responsive variants</p>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Display</h3>
            <div className="flex flex-wrap gap-2">
              {["block","inline-block","inline","flex","inline-flex","grid","inline-grid","hidden"].map(d => (
                <button key={d} onClick={() => copy(d)} className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-mono text-zinc-700 transition hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">.{d}</button>
              ))}
            </div>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Flexbox</h3>
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <div data-ds-live className="flex items-center justify-between gap-4 p-4 rounded-md bg-primary-light">
                <div data-ds-live className="p-3 rounded-md bg-primary text-primary-contrast">1</div>
                <div data-ds-live className="p-3 rounded-md bg-secondary text-secondary-contrast">2</div>
                <div data-ds-live className="p-3 rounded-md bg-success text-success-contrast">3</div>
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400"><code>.flex .items-center .justify-between .gap-4</code></p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["flex-row","flex-col","flex-wrap","flex-nowrap","flex-1","flex-none","grow","shrink-0","items-start","items-center","items-end","justify-start","justify-center","justify-between","justify-evenly"].map(c => (
                <button key={c} onClick={() => copy(c)} className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono text-zinc-600 transition hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">.{c}</button>
              ))}
            </div>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Grid</h3>
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <div data-ds-live className="grid grid-cols-3 gap-3">
                <div data-ds-live className="p-4 rounded-md bg-info text-info-contrast text-center">1</div>
                <div data-ds-live className="p-4 rounded-md bg-info text-info-contrast text-center">2</div>
                <div data-ds-live className="p-4 rounded-md bg-info text-info-contrast text-center">3</div>
                <div data-ds-live className="p-4 rounded-md bg-info text-info-contrast text-center col-span-2">col-span-2</div>
                <div data-ds-live className="p-4 rounded-md bg-info text-info-contrast text-center">5</div>
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400"><code>.grid .grid-cols-3 .gap-3</code> + <code>.col-span-2</code></p>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["grid-cols-1","grid-cols-2","grid-cols-3","grid-cols-4","grid-cols-6","grid-cols-12","col-span-1","col-span-2","col-span-3","col-span-4","col-span-6","col-span-full"].map(c => (
                <button key={c} onClick={() => copy(c)} className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono text-zinc-600 transition hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">.{c}</button>
              ))}
            </div>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Width / Height / Position</h3>
            <div className="flex flex-wrap gap-1.5">
              {["w-full","w-auto","w-screen","w-fit","h-full","h-screen","h-auto","min-h-screen","max-w-full","mx-auto","ml-auto","relative","absolute","fixed","sticky","top-0","right-0","bottom-0","left-0","inset-0","overflow-hidden","overflow-auto"].map(c => (
                <button key={c} onClick={() => copy(c)} className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-mono text-zinc-600 transition hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">.{c}</button>
              ))}
            </div>

            <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Usage</h3>
            <Code onCopy={copy}>{`<!-- Flex row with centered items -->
<div class="flex items-center justify-between gap-4">
  <div>Left</div>
  <div>Right</div>
</div>

<!-- Responsive grid: 1 col mobile → 3 cols desktop -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="col-span-2">Wide</div>
  <div>Narrow</div>
</div>

<!-- Sticky header -->
<nav class="sticky top-0 w-full">...</nav>

<!-- Centered fit-content box -->
<div class="w-fit mx-auto">...</div>

<!-- Push one flex item to the far edge -->
<div class="flex items-center gap-4">
  <span>Title</span>
  <button class="ml-auto btn btn-sm btn-primary">Action</button>
</div>`}</Code>
          </section>

          {/* ═══ Z-INDEX ═══ */}
          <section id="zindex" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">📚 Z-Index Scale</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">9 named layers for stacking context. Utilities set <code className="text-[10px]">z-index</code> to the token value.</p>

            {/* Visual stacking demo */}
            <h3 className="mt-6 mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Live Stacking Demo</h3>
            <div className="relative h-48 w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
              <button onClick={() => copy("z-base")} data-ds-live className="z-base absolute left-4 top-4 flex h-20 w-40 cursor-pointer items-center justify-center rounded-lg bg-zinc-300 text-xs font-bold text-zinc-700 shadow-sm transition hover:ring-2 hover:ring-indigo-400 dark:bg-zinc-700 dark:text-zinc-200">
                .z-base (0)
              </button>
              <button onClick={() => copy("z-dropdown")} data-ds-live className="z-dropdown absolute left-12 top-10 flex h-20 w-40 cursor-pointer items-center justify-center rounded-lg bg-blue-200 text-xs font-bold text-blue-800 shadow-md transition hover:ring-2 hover:ring-indigo-400 dark:bg-blue-900 dark:text-blue-200">
                .z-dropdown (1000)
              </button>
              <button onClick={() => copy("z-sticky")} data-ds-live className="z-sticky absolute left-20 top-16 flex h-20 w-40 cursor-pointer items-center justify-center rounded-lg bg-amber-200 text-xs font-bold text-amber-800 shadow-md transition hover:ring-2 hover:ring-indigo-400 dark:bg-amber-900 dark:text-amber-200">
                .z-sticky (1100)
              </button>
              <button onClick={() => copy("z-modal")} data-ds-live className="z-modal absolute right-8 top-6 flex h-20 w-40 cursor-pointer items-center justify-center rounded-lg bg-purple-200 text-xs font-bold text-purple-800 shadow-lg transition hover:ring-2 hover:ring-indigo-400 dark:bg-purple-900 dark:text-purple-200">
                .z-modal (1400)
              </button>
              <button onClick={() => copy("z-tooltip")} data-ds-live className="z-tooltip absolute right-4 top-2 flex h-16 w-32 cursor-pointer items-center justify-center rounded-lg bg-rose-200 text-xs font-bold text-rose-800 shadow-xl transition hover:ring-2 hover:ring-indigo-400 dark:bg-rose-900 dark:text-rose-200">
                .z-tooltip (1600)
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">↑ Click any element to copy its class. Higher z-index appears on top.</p>

            {/* Scale table */}
            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">All Tokens (click to copy)</h3>
            <div className="mt-4 space-y-1">
              {[...ZINDEX].reverse().map(z => (
                <button key={z.key} onClick={() => copy(`z-${z.key}`)} className="flex w-full items-center gap-3 rounded border border-zinc-200 px-4 py-2 text-left transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                  <span className="w-24 text-sm font-semibold text-zinc-700 dark:text-zinc-300">.z-{z.key}</span>
                  <span className="text-xs font-mono text-zinc-400">z-index: {z.value}</span>
                  <span className="ml-auto text-[10px] font-mono text-zinc-400">var(--ds-z-index-{z.key})</span>
                </button>
              ))}
            </div>

            {/* Usage examples */}
            <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Usage Examples</h3>
            <Code onCopy={copy}>{`<!-- Sticky header stays above page content -->
<header class="z-sticky">...</header>

<!-- Dropdown menu above sticky elements -->
<div class="z-dropdown">
  <ul>...</ul>
</div>

<!-- Modal overlay & dialog -->
<div class="z-overlay"><!-- dark backdrop --></div>
<div class="z-modal">
  <dialog>Are you sure?</dialog>
</div>

<!-- Tooltip on top of everything -->
<span class="z-tooltip">Helpful hint</span>

<!-- Or reference the token directly in CSS: -->
<style>
  .my-popover {
    z-index: var(--ds-z-index-popover);
  }
</style>`}</Code>
          </section>

          {/* ═══ MOTION ═══ */}
          <section id="motion" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">🎬 Motion</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Duration and easing tokens for transitions/animations. Utility classes set only <strong>one</strong> CSS property each.</p>

            {/* Duration */}
            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Duration</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              <code className="text-[10px]">.duration-*</code> sets <code className="text-[10px]">transition-duration</code>. Hover the boxes to see timing differences.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              {MOTION_DURATION.map(d => (
                <div key={d.key} className="group relative">
                  <div
                    className="flex h-20 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 transition-all hover:bg-indigo-500 hover:text-white hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-indigo-600"
                    style={{ transitionDuration: d.value === "0ms" ? "0ms" : d.value, transitionProperty: "background-color, color, box-shadow" }}
                  >
                    <span className="text-sm font-bold">{d.key}</span>
                    <span className="text-xs opacity-60">{d.value}</span>
                  </div>
                  <button onClick={() => copy(`duration-${d.key}`)} className="mt-1 w-full text-center text-[10px] font-mono text-zinc-400 hover:text-indigo-500">.duration-{d.key}</button>
                </div>
              ))}
            </div>

            {/* Easing */}
            <h3 className="mt-8 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Easing</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              <code className="text-[10px]">.ease-*</code> sets <code className="text-[10px]">transition-timing-function</code>. Hover to see how each curve feels.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              {MOTION_EASING.map(e => (
                <div key={e} className="group relative">
                  <div
                    className="flex h-20 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 transition-all hover:translate-x-2 hover:bg-emerald-500 hover:text-white hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-emerald-600"
                    style={{
                      transitionDuration: "600ms",
                      transitionProperty: "background-color, color, box-shadow, transform",
                      transitionTimingFunction: `var(--ds-motion-easing-${e})`,
                    }}
                  >
                    <span className="text-sm font-bold">{e}</span>
                    <span className="text-[10px] opacity-60">ease-{e}</span>
                  </div>
                  <button onClick={() => copy(`ease-${e}`)} className="mt-1 w-full text-center text-[10px] font-mono text-zinc-400 hover:text-emerald-500">.ease-{e}</button>
                </div>
              ))}
            </div>

            {/* Live combined example */}
            <h3 className="mt-8 mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Combined Example (Live)</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Both <code className="text-[10px]">.duration-*</code> and <code className="text-[10px]">.ease-*</code> only set their respective property — you must add <code className="text-[10px]">transition-property</code> yourself (via your own CSS or inline style). Hover these buttons:
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                data-ds-live
                className="duration-fast ease-in-out btn btn-primary"
                style={{ transitionProperty: "background-color, transform, box-shadow" }}
                onMouseEnter={(ev) => { (ev.target as HTMLElement).style.transform = "scale(1.05)"; }}
                onMouseLeave={(ev) => { (ev.target as HTMLElement).style.transform = "scale(1)"; }}
              >
                Fast + ease-in-out
              </button>
              <button
                data-ds-live
                className="duration-slow ease-out btn btn-secondary"
                style={{ transitionProperty: "background-color, transform, box-shadow" }}
                onMouseEnter={(ev) => { (ev.target as HTMLElement).style.transform = "scale(1.05)"; }}
                onMouseLeave={(ev) => { (ev.target as HTMLElement).style.transform = "scale(1)"; }}
              >
                Slow + ease-out
              </button>
              <button
                data-ds-live
                className="duration-normal ease-in btn btn-success"
                style={{ transitionProperty: "background-color, transform, box-shadow" }}
                onMouseEnter={(ev) => { (ev.target as HTMLElement).style.transform = "scale(1.05)"; }}
                onMouseLeave={(ev) => { (ev.target as HTMLElement).style.transform = "scale(1)"; }}
              >
                Normal + ease-in
              </button>
            </div>

            {/* Usage code */}
            <h3 className="mb-2 mt-6 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Usage Examples</h3>
            <Code onCopy={copy}>{`<!-- Quick button hover (combine duration + easing + your transition-property) -->
<button
  class="duration-fast ease-in-out"
  style="transition-property: background-color, transform;"
>
  Click me
</button>

<!-- Slow, smooth drawer reveal -->
<aside
  class="duration-slow ease-out"
  style="transition-property: transform, opacity;"
>
  Sidebar content
</aside>

<!-- Or reference tokens directly in CSS for full control: -->
<style>
  .my-card {
    transition-property: box-shadow, transform;
    transition-duration: var(--ds-motion-duration-normal);
    transition-timing-function: var(--ds-motion-easing-in-out);
  }
  .my-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--ds-shadow-lg);
  }
</style>

<!-- Animation keyframes with tokens: -->
<style>
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .my-modal {
    animation: fadeIn var(--ds-motion-duration-normal) var(--ds-motion-easing-out);
  }
</style>`}</Code>
          </section>

          {/* ═══ COMPONENTS ═══ */}
          <section id="components" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">🧩 Components</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Pre-composed classes. Click any example to copy its class string.</p>

            {/* Buttons */}
            <h3 className="mt-8 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Button</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Color variants</span>
                <div className="flex flex-wrap gap-2">
                  {["primary","secondary","error","warning","success","info"].map(c => (
                    <button key={c} data-ds-live className={`btn btn-${c}`} onClick={() => copy(`btn btn-${c}`)}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Style variants</span>
                <div className="flex flex-wrap gap-2">
                  <button data-ds-live className="btn btn-outline" onClick={() => copy("btn btn-outline")}>Outline</button>
                  <button data-ds-live className="btn btn-ghost" onClick={() => copy("btn btn-ghost")}>Ghost</button>
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Sizes</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button data-ds-live className="btn btn-primary btn-sm" onClick={() => copy("btn btn-primary btn-sm")}>Small</button>
                  <button data-ds-live className="btn btn-primary" onClick={() => copy("btn btn-primary")}>Default</button>
                  <button data-ds-live className="btn btn-primary btn-lg" onClick={() => copy("btn btn-primary btn-lg")}>Large</button>
                </div>
              </div>
              <div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Disabled</span>
                <button data-ds-live className="btn btn-primary btn-disabled" onClick={() => copy("btn btn-primary btn-disabled")}>Disabled</button>
              </div>
            </div>
            <Code onCopy={copy}>{`<button class="btn btn-primary">Primary</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary" disabled>Disabled</button>`}</Code>

            {/* Card */}
            <h3 className="mt-10 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Card</h3>
            <div className="max-w-sm">
              <div data-ds-live className="card">
                <div data-ds-live className="card-header">Card Header</div>
                <div data-ds-live className="card-body">Card body content goes here. Uses spacing-6 padding from tokens.</div>
                <div data-ds-live className="card-footer">
                  <button data-ds-live className="btn btn-primary btn-sm">Action</button>
                </div>
              </div>
            </div>
            <Code onCopy={copy}>{`<div class="card">
  <div class="card-header">Card Header</div>
  <div class="card-body">Card content goes here.</div>
  <div class="card-footer">
    <button class="btn btn-primary btn-sm">Action</button>
  </div>
</div>`}</Code>

            {/* Badge */}
            <h3 className="mt-10 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Badge</h3>
            <div className="flex flex-wrap gap-2">
              {["primary","secondary","error","warning","success","info"].map(c => (
                <span
                  key={c}
                  data-ds-live
                  className={`badge badge-${c}`}
                  onClick={() => copy(`badge badge-${c}`)}
                  onKeyDown={(event) =>
                    handleKeyboardActivation(event, () => copy(`badge badge-${c}`))
                  }
                  role="button"
                  tabIndex={0}
                >
                  {c}
                </span>
              ))}
            </div>
            <Code onCopy={copy}>{`<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Active</span>
<span class="badge badge-error">Failed</span>`}</Code>

            {/* Input */}
            <h3 className="mt-10 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Input</h3>
            <div className="max-w-sm space-y-3">
              <input data-ds-live className="input" placeholder="Default input" onClick={() => copy("input")} readOnly />
              <input data-ds-live className="input input-error" placeholder="Error state" defaultValue="invalid" onClick={() => copy("input input-error")} readOnly />
            </div>
            <Code onCopy={copy}>{`<input class="input" placeholder="you@company.com">
<input class="input input-error" value="invalid">`}</Code>

            {/* Alert */}
            <h3 className="mt-10 mb-3 text-lg font-semibold text-zinc-800 dark:text-zinc-200">Alert</h3>
            <div className="space-y-3">
              {[
                { c: "success", icon: "✅", msg: "Build completed successfully." },
                { c: "error", icon: "⛔", msg: "Token validation failed." },
                { c: "warning", icon: "⚠️", msg: "This action cannot be undone." },
                { c: "info", icon: "ℹ️", msg: "New version available." },
              ].map(a => (
                <div
                  key={a.c}
                  data-ds-live
                  className={`alert alert-${a.c}`}
                  onClick={() => copy(`alert alert-${a.c}`)}
                  onKeyDown={(event) =>
                    handleKeyboardActivation(event, () => copy(`alert alert-${a.c}`))
                  }
                  role="button"
                  tabIndex={0}
                >
                  <span>{a.icon}</span><span>{a.msg}</span>
                </div>
              ))}
            </div>
            <Code onCopy={copy}>{`<div class="alert alert-success">
  <span>✅</span>
  <span>Build completed successfully.</span>
</div>
<div class="alert alert-error">
  <span>⛔</span>
  <span>Token validation failed.</span>
</div>`}</Code>

            <AdvancedComponentsDocs onCopy={copy} />
          </section>


          {/* ═══ CSS OVERRIDES ═══ */}
          <section id="overrides" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">🎨 CSS Overrides</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Three ways to customize: token override, component override, instance override</p>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">1. Token Override (recommended)</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Change the underlying token value — all components using it update automatically</p>
            <Code onCopy={copy}>{`:root {
  --ds-color-primary-main: #6366f1;  /* Indigo instead of blue */
  --ds-color-primary-contrast: #ffffff;
  --ds-radius-md: 9999px;  /* Pill-shaped buttons */
  --ds-spacing-4: 0.875rem;  /* Tighter spacing */
}`}</Code>

            <h3 className="mt-8 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">2. Component Override (plain CSS)</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Override specific CSS properties directly — works like any CSS framework</p>
            <Code onCopy={copy}>{`/* Override button with plain CSS */
.btn-primary {
  background-color: hotpink;
  color: white;
  border-radius: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Override card shadow */
.card {
  box-shadow: 0 0 0 2px #6366f1;
  border-radius: 1rem;
}

/* Override input border */
.input {
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}

/* Override badge shape */
.badge {
  border-radius: 0.25rem;  /* Square badges */
  text-transform: uppercase;
  font-size: 0.625rem;
}`}</Code>

            <h3 className="mt-8 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">3. Instance Override (inline style)</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Override tokens on a single element via inline style attribute</p>
            <Code onCopy={copy}>{`<button class="btn btn-primary"
        style="--ds-color-primary-main: #dc2626;
               --ds-color-primary-contrast: #fff;
               --ds-radius-md: 0;">
  Custom Instance
</button>`}</Code>

            <h3 className="mt-8 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Override Priority</h3>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <ol className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold dark:bg-zinc-700">1</span> <code className="text-xs">:root</code> token override — lowest specificity, global</li>
                <li className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold dark:bg-zinc-700">2</span> <code className="text-xs">.component</code> CSS override — component-scoped</li>
                <li className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold dark:bg-zinc-700">3</span> <code className="text-xs">style=&quot;&quot;</code> inline — highest specificity, single instance</li>
              </ol>
            </div>
          </section>

          {/* ═══ DARK / LIGHT + MULTI-THEME ═══ */}
          <section id="dark-light" className="scroll-mt-8">
            <h2 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">🎨 Themes</h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              4 themes available — same HTML, different token values. Click any theme button to switch live.
            </p>

            {/* Theme switcher */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {([
                { name: "Default", value: "", color: "#1565C0" },
                { name: "Dark", value: "dark", color: "#90CAF9" },
                { name: "Banking", value: "banking", color: "#004D40" },
                { name: "Corporate", value: "corporate", color: "#1A237E" },
              ] as const).map(theme => (
                <button
                  key={theme.value}
                  onClick={() => applyTheme(theme.value)}
                  aria-pressed={activeTheme === theme.value}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:shadow-md ${
                    activeTheme === theme.value
                      ? "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
                      : "border-zinc-300 bg-white text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.color }} />
                  {theme.name}
                </button>
              ))}
            </div>

            {/* Live preview — responds to any theme */}
            <div className="mt-6 rounded-xl border border-zinc-200 p-6 transition-colors dark:border-zinc-700">
              <div data-ds-live className="card">
                <div data-ds-live className="card-header">
                  <span data-ds-live className="text-heading-h2">Theme Preview</span>
                </div>
                <div data-ds-live className="card-body">
                  <p data-ds-live className="text-body-md mb-4">All components below respond to the selected theme. Zero code changes — just one attribute on &lt;html&gt;.</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span data-ds-live className="badge badge-primary">Primary</span>
                    <span data-ds-live className="badge badge-secondary">Secondary</span>
                    <span data-ds-live className="badge badge-success">Success</span>
                    <span data-ds-live className="badge badge-error">Error</span>
                    <span data-ds-live className="badge badge-warning">Warning</span>
                    <span data-ds-live className="badge badge-info">Info</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button data-ds-live className="btn btn-primary">Primary</button>
                    <button data-ds-live className="btn btn-secondary">Secondary</button>
                    <button data-ds-live className="btn btn-outline">Outline</button>
                    <button data-ds-live className="btn btn-ghost">Ghost</button>
                  </div>
                  <input data-ds-live className="input" placeholder="Input field..." readOnly />
                </div>
              </div>
              <div data-ds-live className="alert alert-success mt-4">
                <span>✅</span><span>Theme applied — all via CSS custom properties.</span>
              </div>
              <div data-ds-live className="alert alert-info mt-2">
                <span>ℹ️</span><span>One JSON file per theme. Drop it in src/themes/ and rebuild.</span>
              </div>
            </div>

            {/* Code snippets */}
            <h3 className="mt-8 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Switch Theme (one line)</h3>
            <Code onCopy={copy}>{`<!-- Default (light) -->
<html>

<!-- Dark mode -->
<html data-theme="dark">

<!-- Banking brand -->
<html data-theme="banking">

<!-- Corporate brand -->
<html data-theme="corporate">

<!-- JavaScript toggle -->
document.documentElement.setAttribute("data-theme", "banking");`}</Code>

            <h3 className="mt-8 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Add a new theme (zero code changes)</h3>
            <Code onCopy={copy}>{`// 1. Create packages/tokens/src/themes/your-brand.json:
{
  "$theme": "your-brand",
  "color": {
    "primary": { "main": { "value": "#FF6B00", "type": "color" }, "contrast": { "value": "#FFF", "type": "color" } },
    "secondary": { "main": { "value": "#2196F3", "type": "color" }, "contrast": { "value": "#FFF", "type": "color" } },
    "surface": { "main": { "value": "#FFF8F0", "type": "color" }, "contrast": { "value": "#1A1A1A", "type": "color" } }
  }
}

// 2. Rebuild: pnpm build
// 3. Use: <html data-theme="your-brand">
// Done. Every component picks up the new colors automatically.`}</Code>

            <h3 className="mt-8 mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">How it works</h3>
            <Code onCopy={copy}>{`/* tokens.css generates one selector per theme file: */
:root { --ds-color-primary-main: #1565C0; }

[data-theme="dark"] { --ds-color-primary-main: #90CAF9; }
[data-theme="banking"] { --ds-color-primary-main: #004D40; }
[data-theme="corporate"] { --ds-color-primary-main: #1A237E; }

/* Components reference var(--ds-*) — theme-agnostic */
.btn-primary { background-color: var(--ds-color-primary-main); }`}</Code>
          </section>

        </main>
      </div>
    </div>
  );
}
