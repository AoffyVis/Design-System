import type { PhaseStatus } from "@/lib/types";
import { CheckCircleIcon, ClipboardIcon, ClockIcon } from "./icons";

interface StatusBadgeProps {
  status: PhaseStatus;
}

/**
 * Config per Phase_Status value: icon + visible text label + supplementary
 * color classes. The icon is decorative (marked `aria-hidden="true"`) and is
 * always paired with the visible text label in the same element — color is
 * never the sole indicator of status (Requirement 8.2).
 */
const STATUS_CONFIG: Record<
  PhaseStatus,
  {
    Icon: typeof CheckCircleIcon;
    label: string;
    className: string;
  }
> = {
  Completed: {
    Icon: CheckCircleIcon,
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-400/20",
  },
  "In Progress": {
    Icon: ClockIcon,
    label: "In Progress",
    className:
      "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-950/60 dark:text-blue-300 dark:ring-blue-400/20",
  },
  Planned: {
    Icon: ClipboardIcon,
    label: "Planned",
    className:
      "bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-400/20",
  },
};

/**
 * Renders a Phase's status as an icon and visible text label together
 * (Requirement 8.2). The icon is `aria-hidden="true"` since the text label
 * conveys the same information; color is a supplementary cue only, never
 * the sole indicator.
 */
export default function StatusBadge({ status }: StatusBadgeProps) {
  const { Icon, label, className } = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{label}</span>
    </span>
  );
}
