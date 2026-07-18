import { phaseStatusConfig } from "@/content/phase-status.config";
import type { PhaseStatus, PhaseStatusConfig } from "@/lib/types";

/**
 * Pure lookup of a Phase's configured status by its exact name.
 * Returns `undefined` when no entry exists for that name, which callers
 * treat as "render no status indicator" (Requirement 4.6).
 */
export function getPhaseStatus(
  name: string,
  config: PhaseStatusConfig = phaseStatusConfig
): PhaseStatus | undefined {
  return config[name];
}
