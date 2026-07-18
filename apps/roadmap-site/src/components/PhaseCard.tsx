import type { Phase, PhaseStatus } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import { CheckCircleIcon, TargetIcon } from "./icons";

interface PhaseCardProps {
  phase: Phase;
  status?: PhaseStatus;
  index: number;
  isLast: boolean;
}

/**
 * Renders one Phase as an `<article>`: name (+ optional status indicator),
 * Objective, Deliverables, and Success Criteria (Requirements 4.2, 8.1).
 *
 * The status indicator is only rendered when `status` is provided — a Phase
 * with no matching Phase_Status config entry renders with no indicator at
 * all rather than a default/empty one (Requirement 4.6).
 *
 * Deliverables and Success Criteria use a two-column grid at the `lg:`
 * breakpoint (1024px+) and stack as a single column below it (Requirements
 * 6.2, 8.1).
 *
 * `index`/`isLast` drive the purely decorative timeline rail (numbered dot +
 * connecting line) — they carry no semantic meaning of their own.
 */
export default function PhaseCard({
  phase,
  status,
  index,
  isLast,
}: PhaseCardProps) {
  const isCompleted = status === "Completed";

  return (
    <li className="relative flex gap-5 sm:gap-6">
      <div className="flex flex-col items-center">
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-white dark:ring-zinc-950 ${
            isCompleted
              ? "bg-emerald-600 text-white"
              : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          }`}
        >
          {isCompleted ? (
            <CheckCircleIcon className="h-5 w-5" />
          ) : (
            index + 1
          )}
        </span>
        {!isLast && (
          <span
            aria-hidden="true"
            className="mt-1 w-px flex-1 bg-zinc-200 dark:bg-zinc-800"
          />
        )}
      </div>

      <article className="mb-10 flex-1 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 sm:text-xl">
            {phase.name}
          </h2>
          {status !== undefined && <StatusBadge status={status} />}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-zinc-50 p-3.5 dark:bg-zinc-800/60">
          <TargetIcon
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400"
          />
          <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
            {phase.objective}
          </p>
        </div>

        <div className="mt-5 lg:grid lg:grid-cols-2 lg:gap-x-8">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Deliverables
            </h3>
            <ul className="mt-2 space-y-1.5">
              {phase.deliverables.map((deliverable) => (
                <li
                  key={deliverable}
                  className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"
                  />
                  <span>{deliverable}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 lg:mt-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Success Criteria
            </h3>
            <ul className="mt-2 space-y-1.5">
              {phase.successCriteria.map((criterion) => (
                <li
                  key={criterion}
                  className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                  />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </li>
  );
}
