import type { PhaseStatusConfig } from "@/lib/types";

/**
 * Keyed by the exact Phase.name string produced by the Roadmap_Parser
 * (e.g. "Phase 1 — Foundation"). docs/ROADMAP.md has no status field, so
 * this mapping is maintained by hand here, independent of the parsed prose.
 * A phase with no entry here renders with no status indicator (Requirement 4.6).
 *
 * Note on Requirement 7.2: this file stores Phase *names* as lookup keys only —
 * it does not duplicate any Objective/Deliverables/Success_Criteria prose, so it
 * does not violate the anti-hardcode rule (see design.md's "Phase_Status
 * configuration" section for the full rationale).
 *
 * Current values reflect the project's actual state: Foundation (tokens
 * pipeline, 87 tokens, all 8 categories) and CSS Core (utility framework,
 * ~86KB layered CSS with responsive variants) are both implemented and
 * operational. Remaining phases are planned but not yet started.
 */
export const phaseStatusConfig: PhaseStatusConfig = {
  "Phase 1 — Foundation": "Completed",
  "Phase 2 — CSS Core": "Completed",
  "Phase 3 — Developer Experience": "Planned",
  "Phase 4 — Platform Expansion": "Planned",
  "Phase 5 — Enterprise Features": "Planned",
  "Phase 6 — Ecosystem": "Planned",
};
