import type { Metadata } from "next";
import FutureRoadmapSection from "@/components/FutureRoadmapSection";
import PhaseCard from "@/components/PhaseCard";
import { getPhaseStatus } from "@/lib/phase-status";
import { getRoadmapData } from "@/lib/roadmap-data";

export const metadata: Metadata = {
  title: "Roadmap · Company Design System",
  description:
    "Phase-by-phase roadmap for the Company Design System platform.",
};

/**
 * Roadmap_Page (Requirement 4). Server Component that calls `getRoadmapData()`
 * at module scope so it is statically evaluated during `next build`'s
 * prerendering pass — a missing or malformed `docs/ROADMAP.md` throws here
 * and aborts the build (Requirements 3.5, 3.6) instead of failing at request
 * time.
 */
const { phases, futureRoadmapItems } = getRoadmapData();

export default function RoadmapPage() {
  const completedCount = phases.filter(
    (phase) => getPhaseStatus(phase.name) === "Completed"
  ).length;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-14 sm:px-6">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          Where we&apos;re headed
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
          Roadmap
        </h1>
        <p className="mt-3 text-base leading-7 text-zinc-600 dark:text-zinc-400">
          {phases.length} phases from foundation to v1.0, plus a look at
          what&apos;s being considered next. {completedCount} of{" "}
          {phases.length} phases completed so far.
        </p>
      </header>

      <ol className="mt-12">
        {phases.map((phase, index) => (
          <PhaseCard
            key={phase.name}
            phase={phase}
            status={getPhaseStatus(phase.name)}
            index={index}
            isLast={index === phases.length - 1}
          />
        ))}
      </ol>

      <div className="mt-2">
        <FutureRoadmapSection items={futureRoadmapItems} />
      </div>
    </div>
  );
}
