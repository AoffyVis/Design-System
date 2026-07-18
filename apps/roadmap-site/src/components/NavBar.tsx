import Link from "next/link";
import { LayersIcon } from "./icons";

/**
 * Primary site navigation, rendered inside the root layout so it appears on
 * every page (Requirements 5.1, 5.2).
 *
 * Uses `next/link`'s `<Link>`, which renders a real `<a href>`: a
 * client-side transition when JavaScript is available, and a standard full
 * page navigation when it isn't (Requirements 5.3, 5.4) — no extra code
 * needed.
 */
export default function NavBar() {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80"
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
            <LayersIcon aria-hidden="true" className="h-4.5 w-4.5" />
          </span>
          <span>Company Design System</span>
        </Link>

        <ul className="flex items-center gap-1 text-sm font-medium">
          <li>
            <Link
              href="/"
              className="rounded-full px-3.5 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/roadmap"
              className="rounded-full px-3.5 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Roadmap
            </Link>
          </li>
          <li>
            <Link
              href="/docs"
              className="rounded-full px-3.5 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Docs
            </Link>
          </li>
          <li>
            <Link
              href="/demo"
              className="rounded-full px-3.5 py-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              Demo
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
