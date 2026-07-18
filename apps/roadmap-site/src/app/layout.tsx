import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import NavBar from "@/components/NavBar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Company Design System",
  description:
    "The internal home for the Company Design System platform: what it is, why it exists, and the roadmap for what's next.",
};

/**
 * Sets the `.dark` class on `<html>` from the OS-level `prefers-color-scheme`
 * before first paint, so pages with no manual toggle (Home, Roadmap) still
 * default to matching the system theme now that `dark:` is class-driven
 * (see globals.css) instead of media-query-driven.
 *
 * Also mirrors the same decision into `data-theme="dark"`/removed — a
 * second, independent attribute, not a redundant one. `.dark` is what
 * Tailwind's `dark:` variant (this site's own page chrome) responds to;
 * `data-theme="dark"` is what `packages/tokens/dist/tokens.css`'s
 * `[data-theme="dark"] { --ds-color-*: ... }` block responds to (the
 * mechanism documented in docs/05-css-spec.md and docs/06-theme.md for the
 * design system's own tokens). They have to be kept in sync by hand
 * because they're genuinely two different selectors with two different
 * owners — Tailwind chose `.dark`, the design system spec chose
 * `[data-theme]`, and nothing unifies them automatically.
 *
 * Uses `next/script` with `strategy="beforeInteractive"`, not a raw
 * JSX `<script>` — React does not execute `<script>` elements it renders
 * itself (they're inert, same as any other DOM node React manages), so a
 * plain `<script dangerouslySetInnerHTML>` only works by accident on a
 * cold full-page load (the browser's native HTML parser runs it before
 * React ever touches the tree) and throws hydration/"script tag" console
 * errors on any client-side render. `beforeInteractive` is Next.js's
 * supported mechanism for exactly this "must run before paint, before
 * hydration" case.
 */
const SYNC_DARK_CLASS_SCRIPT = `
  (function () {
    var isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
    if (isDark) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      // The beforeInteractive script above adds/removes "dark" on this
      // element before React hydrates, based on OS preference — server-
      // rendered HTML can never know that ahead of time, so a className
      // mismatch here is expected, not a bug. This is the same
      // suppressHydrationWarning usage Next.js's own dark-mode docs
      // recommend for this exact pattern.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Script id="sync-dark-class" strategy="beforeInteractive">
          {SYNC_DARK_CLASS_SCRIPT}
        </Script>
        <NavBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
