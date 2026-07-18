/**
 * Requirement 7.4 enforcement: fails the build if a hardcoded copy of Phase
 * name/Objective/Deliverables/Success_Criteria text exists anywhere in the
 * site's own source, duplicating content that should only ever come from
 * `docs/ROADMAP.md` via the Roadmap_Parser.
 *
 * Wired as this app's `prebuild` script (see design.md's "Enforcing 'No
 * Hardcoded Roadmap Content'" section) — a non-zero exit here aborts before
 * `next build` starts.
 */
import { readFileSync } from "fs";
import { join, resolve } from "path";
import fg from "fast-glob";

import { parseRoadmap } from "../src/lib/roadmap-parser";

/** Absolute path to the Roadmap_Content_Source, resolved relative to the repo root. */
const ROADMAP_SOURCE_PATH = join(process.cwd(), "..", "..", "docs", "ROADMAP.md");

/** The one file where bare Phase-name-only matches are permitted (see design.md). */
const PHASE_STATUS_CONFIG_RELATIVE_PATH = "src/content/phase-status.config.ts";

/**
 * Homepage content is explicitly out of scope for Requirement 7's
 * anti-duplication rule (see design.md's "Homepage" content-strategy note:
 * the rule applies only to Phase name/Objective/Deliverables/Success_Criteria
 * content, not to Homepage copy). Fully excluded from scanning rather than
 * allowlisted per-string, since none of its content is expected to originate
 * from docs/ROADMAP.md in the first place; incidental word overlap (e.g.
 * "Design Tokens" appearing in both the Homepage overview and a Phase 1
 * deliverable) is not a violation of this requirement.
 */
const HOMEPAGE_CONTENT_RELATIVE_PATH = "src/content/homepage-content.ts";

/**
 * The demo page showcases the Design System's CSS utilities and tokens — its
 * content describes the system itself, not roadmap phases. Incidental overlap
 * with roadmap deliverable names (e.g. "Design Tokens", "Utility Classes",
 * "Playground") is not a Requirement 7 violation.
 */
const DEMO_PAGE_RELATIVE_PATH = "src/app/demo/page.tsx";

/**
 * The docs page documents design-system components with live examples and CSS
 * override patterns. Like the demo page, any overlap with roadmap phase
 * deliverable names is incidental — this content describes the system's
 * component API, not roadmap phases.
 */
const DOCS_PAGE_RELATIVE_PATH = "src/app/docs/page.tsx";

/** Sensitive strings shorter than this are excluded to reduce false positives. */
const MIN_SENSITIVE_STRING_LENGTH = 8;

/**
 * Builds the set of "sensitive strings" from the current Roadmap_Content_Source:
 * every Phase name, objective, and individual deliverable/success-criterion
 * string, trimmed and length-filtered to `MIN_SENSITIVE_STRING_LENGTH`+ characters.
 */
export function buildSensitiveStrings(roadmap: ReturnType<typeof parseRoadmap>): Set<string> {
  const sensitiveStrings = new Set<string>();

  for (const phase of roadmap.phases) {
    const candidates = [phase.name, phase.objective, ...phase.deliverables, ...phase.successCriteria];
    for (const candidate of candidates) {
      const trimmed = candidate.trim();
      if (trimmed.length >= MIN_SENSITIVE_STRING_LENGTH) {
        sensitiveStrings.add(trimmed);
      }
    }
  }

  return sensitiveStrings;
}

/**
 * Set of just the Phase-name sensitive strings, used to implement the
 * `phase-status.config.ts` allowlist (bare Phase-name matches are permitted
 * there; Objective/Deliverables/Success_Criteria matches are not).
 */
export function buildPhaseNameStrings(roadmap: ReturnType<typeof parseRoadmap>): Set<string> {
  const phaseNames = new Set<string>();
  for (const phase of roadmap.phases) {
    const trimmed = phase.name.trim();
    if (trimmed.length >= MIN_SENSITIVE_STRING_LENGTH) {
      phaseNames.add(trimmed);
    }
  }
  return phaseNames;
}

/**
 * Detects hardcoded roadmap content in a single file's text.
 *
 * Returns every sensitive string found as a literal substring of `fileText`.
 * When `filePath` is the allowlisted `phase-status.config.ts` path, matches
 * that are *only* a bare Phase name (i.e. present in `phaseNameStrings`) are
 * excluded from the result — but any other sensitive string (Objective,
 * Deliverables, Success Criteria text) found in that file is still reported.
 *
 * @param sensitiveStrings all sensitive strings (Phase names + Objective +
 *   Deliverables + Success Criteria), trimmed and length-filtered.
 * @param phaseNameStrings the subset of `sensitiveStrings` that are Phase
 *   names, used to implement the `phase-status.config.ts` allowlist.
 * @param filePath the file's path, relative to the app's `src/` root (or any
 *   string whose suffix can be checked against the allowlisted path), used
 *   only to decide whether the allowlist applies.
 * @param fileText the file's raw source text to scan.
 */
export function detectHardcodedContent(
  sensitiveStrings: Set<string>,
  phaseNameStrings: Set<string>,
  filePath: string,
  fileText: string
): string[] {
  const isAllowlistedFile = filePath.endsWith(PHASE_STATUS_CONFIG_RELATIVE_PATH);
  const matches: string[] = [];

  for (const sensitiveString of sensitiveStrings) {
    if (!fileText.includes(sensitiveString)) {
      continue;
    }
    if (isAllowlistedFile && phaseNameStrings.has(sensitiveString)) {
      continue;
    }
    matches.push(sensitiveString);
  }

  return matches;
}

/**
 * Globs every `.ts`/`.tsx` file under `src/app/`, `src/components/`, and
 * `src/content/` (excluding `phase-status.config.ts` — handled via the
 * allowlist in `detectHardcodedContent`, not exclusion — and `__tests__`
 * directories).
 */
function findSourceFiles(): string[] {
  return fg.sync(
    ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}", "src/content/**/*.{ts,tsx}"],
    {
      cwd: process.cwd(),
      ignore: ["**/__tests__/**", `**/${HOMEPAGE_CONTENT_RELATIVE_PATH}`, `**/${DEMO_PAGE_RELATIVE_PATH}`, `**/${DOCS_PAGE_RELATIVE_PATH}`],
      absolute: false,
    }
  );
}

function main(): void {
  const markdown = readFileSync(ROADMAP_SOURCE_PATH, "utf-8");
  const roadmap = parseRoadmap(markdown);

  const sensitiveStrings = buildSensitiveStrings(roadmap);
  const phaseNameStrings = buildPhaseNameStrings(roadmap);

  const sourceFiles = findSourceFiles();

  let foundViolation = false;

  for (const relativeFilePath of sourceFiles) {
    const absoluteFilePath = resolve(process.cwd(), relativeFilePath);
    const fileText = readFileSync(absoluteFilePath, "utf-8");

    const matches = detectHardcodedContent(
      sensitiveStrings,
      phaseNameStrings,
      relativeFilePath,
      fileText
    );

    for (const matchedText of matches) {
      foundViolation = true;
      console.log(
        `Hardcoded roadmap content detected in ${relativeFilePath}: "${matchedText}" duplicates docs/ROADMAP.md content. Remove the hardcoded copy and source it from the Roadmap_Parser instead.`
      );
    }
  }

  process.exit(foundViolation ? 1 : 0);
}

// Only run when executed directly (not when imported by tests).
if (require.main === module) {
  main();
}
