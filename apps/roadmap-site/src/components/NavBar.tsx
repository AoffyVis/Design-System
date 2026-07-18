"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { LayersIcon } from "./icons";

/**
 * Primary site navigation, rendered inside the root layout so it appears on
 * every page (Requirements 5.1, 5.2).
 *
 * Uses `next/link`'s `<Link>`, which renders a real `<a href>`: a
 * client-side transition when JavaScript is available, and a standard full
 * page navigation when it isn't (Requirements 5.3, 5.4).
 */
export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const toggleMenu = useCallback((): void => {
    setIsMenuOpen((previous) => !previous);
  }, []);

  const closeMenu = useCallback((): void => {
    setIsMenuOpen(false);
  }, []);

  return (
    <nav
      aria-label="Primary"
      // z-20: must outrank any in-page content competing at z-10 (e.g. the
      // /demo hero's text layer, which needs z-10 to sit above its own
      // decorative background circles). Equal z-index falls back to DOM
      // order, and the hero's section comes after this nav in the page,
      // so a tie let it paint over the open mobile dropdown menu, silently
      // blocking clicks on every link in it.
      className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80"
    >
      <div className="relative mx-auto flex max-w-screen-xl flex-wrap items-center justify-between px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
            <LayersIcon aria-hidden="true" className="h-4.5 w-4.5" />
          </span>
          <span>Company Design System</span>
        </Link>

        <button
          type="button"
          className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-2
            text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
            md:hidden dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-expanded={isMenuOpen}
          aria-controls="site-primary-menu"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={toggleMenu}
        >
          {isMenuOpen ? "×" : "☰"}
        </button>

        <ul
          id="site-primary-menu"
          className={`${isMenuOpen ? "flex" : "hidden"} absolute left-0 top-full w-full flex-col gap-1 border-t border-zinc-200 bg-white p-4 text-sm font-medium shadow-lg md:static md:flex md:w-auto md:flex-row md:items-center md:border-t-0 md:bg-transparent md:p-0 md:shadow-none dark:border-zinc-800 dark:bg-zinc-950 md:dark:bg-transparent`}
        >
          <li className="w-full md:w-auto">
            <Link
              href="/"
              onClick={closeMenu}
              className="block rounded-full px-3.5 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Home
            </Link>
          </li>
          <li className="w-full md:w-auto">
            <Link
              href="/roadmap"
              onClick={closeMenu}
              className="block rounded-full px-3.5 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Roadmap
            </Link>
          </li>
          <li className="w-full md:w-auto">
            <Link
              href="/docs"
              onClick={closeMenu}
              className="block rounded-full px-3.5 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Docs
            </Link>
          </li>
          <li className="w-full md:w-auto">
            <Link
              href="/demo"
              onClick={closeMenu}
              className="block rounded-full px-3.5 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Demo
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
