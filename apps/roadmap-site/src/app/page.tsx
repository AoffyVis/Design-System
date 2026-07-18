import Link from "next/link";
import SupportedPlatformsList from "@/components/SupportedPlatformsList";
import { homepageContent } from "@/content/homepage-content";
import { ArrowRightIcon, GridIcon, PackageIcon, TargetIcon } from "@/components/icons";

/**
 * Homepage (Requirement 2). Server Component that renders the platform
 * introduction from `homepageContent` — no client-side data fetching.
 */
export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,theme(colors.indigo.100),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,theme(colors.indigo.950/40),transparent_60%)]"
        />
        <div className="max-w-screen-xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
            Internal Platform
          </span>

          <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
            {homepageContent.platformName}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {homepageContent.overview}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-zinc-950"
            >
              View the Roadmap
              <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-screen-xl mx-auto px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <TargetIcon aria-hidden="true" className="h-4.5 w-4.5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Vision
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {homepageContent.vision}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <PackageIcon aria-hidden="true" className="h-4.5 w-4.5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Single Source of Truth
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Every visual value ships from one Design Token pipeline, so
              every application looks and feels the same by construction.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <GridIcon aria-hidden="true" className="h-4.5 w-4.5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-zinc-950 dark:text-zinc-50">
              Framework Agnostic
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Generated CSS, tokens, and types work the same way across
              every supported platform below.
            </p>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Supported Platforms
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Generated assets are designed to work consistently everywhere.
          </p>
          <div className="mt-4">
            <SupportedPlatformsList
              platforms={homepageContent.supportedPlatforms}
            />
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-indigo-50/60 p-8 text-center dark:border-zinc-800 dark:from-zinc-900 dark:to-indigo-950/30">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            See what&apos;s being built
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Track progress phase-by-phase, from foundation through v1.0 and
            beyond.
          </p>
          <Link
            href="/roadmap"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md dark:bg-white dark:text-zinc-950"
          >
            View the Roadmap
            <ArrowRightIcon aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
