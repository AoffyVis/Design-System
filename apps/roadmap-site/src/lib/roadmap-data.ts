import { existsSync, readFileSync } from "fs";
import { join } from "path";

import { parseRoadmap } from "./roadmap-parser";
import type { RoadmapData } from "./types";

/**
 * Absolute path to the Roadmap_Content_Source file, resolved relative to the
 * repository root.
 *
 * Resolved from `process.cwd()` (which Next.js sets to the app directory —
 * `apps/roadmap-site/` — for `next dev`/`build`/`start`) rather than
 * `__dirname`: bundlers relocate compiled server modules under `.next/`, so
 * `__dirname` at runtime points at the bundle's output location, not this
 * source file's location, making a `__dirname`-relative traversal to the
 * repository root unreliable.
 */
const ROADMAP_SOURCE_PATH = join(process.cwd(), "..", "..", "docs", "ROADMAP.md");

/**
 * Reads and parses the Roadmap_Content_Source (`docs/ROADMAP.md`) into
 * structured `RoadmapData`.
 *
 * Thin I/O wrapper around `parseRoadmap`: no parsing logic of its own. If the
 * source file does not exist, throws before attempting to read it. Any error
 * thrown by `parseRoadmap` propagates unchanged.
 *
 * @throws Error if the source file does not exist at the resolved path.
 */
export function getRoadmapData(): RoadmapData {
  if (!existsSync(ROADMAP_SOURCE_PATH)) {
    throw new Error(
      `Roadmap content source not found. Expected file at: ${ROADMAP_SOURCE_PATH}`
    );
  }

  const markdown = readFileSync(ROADMAP_SOURCE_PATH, "utf-8");
  return parseRoadmap(markdown);
}
