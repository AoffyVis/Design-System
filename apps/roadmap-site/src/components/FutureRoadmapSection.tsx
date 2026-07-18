import type { FutureRoadmapItem } from "@/lib/types";
import { SparklesIcon } from "./icons";

interface FutureRoadmapSectionProps {
  items: FutureRoadmapItem[];
}

/**
 * Renders Future_Roadmap_Items inside an `<aside>`, deliberately distinct
 * from the numbered `<PhaseCard>` `<article>` list (Requirement 4.4):
 * a dashed border and tinted background (rather than PhaseCard's solid
 * card treatment) signal "supplementary, not-yet-committed" content, and
 * the flat two-column chip grid (no per-item heading hierarchy) signals
 * "list of ideas" rather than "structured phase record".
 */
export default function FutureRoadmapSection({
  items,
}: FutureRoadmapSectionProps) {
  return (
    <aside
      aria-labelledby="future-roadmap-heading"
      className="rounded-2xl border border-dashed border-indigo-300/70 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 dark:border-indigo-800/60 dark:from-indigo-950/40 dark:to-violet-950/30 sm:p-7"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <SparklesIcon aria-hidden="true" className="h-4.5 w-4.5" />
        </span>
        <h2
          id="future-roadmap-heading"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Future Roadmap
        </h2>
      </div>
      <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
        Ideas under consideration, beyond the phases above.
      </p>

      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item.text}
            className="rounded-lg border border-white/80 bg-white/70 px-3.5 py-2.5 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300"
          >
            {item.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
