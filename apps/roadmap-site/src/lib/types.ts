/** A single Phase parsed from docs/ROADMAP.md. */
export interface Phase {
  name: string; // e.g. "Phase 1 — Foundation"
  objective: string;
  deliverables: string[];
  successCriteria: string[];
}

/** A single bullet under the "Future Roadmap" section. */
export interface FutureRoadmapItem {
  text: string;
}

/** Full output of the Roadmap_Parser for one Roadmap_Content_Source file. */
export interface RoadmapData {
  phases: Phase[];
  futureRoadmapItems: FutureRoadmapItem[];
}

/**
 * Phase_Status configuration value. Roadmap_Content_Source has no status field —
 * this type only exists in site config (phase-status.config.ts).
 */
export type PhaseStatus = "Completed" | "In Progress" | "Planned";

/** Config shape for src/content/phase-status.config.ts, keyed by exact Phase.name. */
export type PhaseStatusConfig = Record<string, PhaseStatus>;

/** Homepage's own content module shape (Requirement 2). */
export interface HomepageContent {
  platformName: string;
  overview: string;
  vision: string;
  supportedPlatforms: string[];
}
