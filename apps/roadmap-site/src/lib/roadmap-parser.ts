import { fromMarkdown } from "mdast-util-from-markdown";
import { toString as mdastToString } from "mdast-util-to-string";
import type { Heading, List, Paragraph, RootContent } from "mdast";

import type { FutureRoadmapItem, Phase, RoadmapData } from "./types";

/** Matches Phase headings, e.g. "Phase 1 — Foundation" or "Phase 2 - CSS Core". */
const PHASE_HEADING_PATTERN = /^Phase\s+\d+\s*[—-]\s*.+/;

const FUTURE_ROADMAP_HEADING_TEXT = "Future Roadmap";

type RequiredPhaseSection = "Objective" | "Deliverables" | "Success Criteria";

/** A heading node paired with the top-level nodes that follow it, up to the next heading of the same depth. */
interface Segment {
  heading: Heading;
  body: RootContent[];
}

/**
 * Splits a flat list of mdast nodes into segments, starting a new segment at
 * every heading whose `depth` matches `depth`. Nodes preceding the first
 * matching heading are dropped (Roadmap_Content_Source never has meaningful
 * content before its first heading).
 */
function splitByHeadingDepth(nodes: RootContent[], depth: 1 | 2): Segment[] {
  const segments: Segment[] = [];
  let current: Segment | null = null;

  for (const node of nodes) {
    if (node.type === "heading" && node.depth === depth) {
      current = { heading: node, body: [] };
      segments.push(current);
    } else if (current) {
      current.body.push(node);
    }
  }

  return segments;
}

/** Finds the first node of the given mdast `type` within `nodes`, if any. */
function findFirstOfType<T extends RootContent["type"]>(
  nodes: RootContent[],
  type: T
): Extract<RootContent, { type: T }> | undefined {
  return nodes.find((node): node is Extract<RootContent, { type: T }> => node.type === type);
}

function missingSectionError(phaseName: string, section: RequiredPhaseSection): Error {
  return new Error(
    `Roadmap parse error: Phase "${phaseName}" is missing a required "${section}" section.`
  );
}

/** Extracts the trimmed paragraph text from a subsection's body, if a paragraph is present. */
function extractParagraphText(body: RootContent[]): string | undefined {
  const paragraph = findFirstOfType(body, "paragraph") as Paragraph | undefined;
  if (!paragraph) {
    return undefined;
  }
  const text = mdastToString(paragraph).trim();
  return text.length > 0 ? text : undefined;
}

/** Extracts trimmed list-item text from a subsection's body, if a list is present. */
function extractListItemTexts(body: RootContent[]): string[] | undefined {
  const list = findFirstOfType(body, "list") as List | undefined;
  if (!list) {
    return undefined;
  }
  return list.children.map((item) => mdastToString(item).trim());
}

/** Builds a `Phase` from a recognized Phase segment, throwing if a required subsection is missing or empty. */
function extractPhase(segment: Segment): Phase {
  const phaseName = mdastToString(segment.heading).trim();
  const subsections = splitByHeadingDepth(segment.body, 2);

  const objectiveSection = subsections.find(
    (subsection) => mdastToString(subsection.heading).trim() === "Objective"
  );
  const deliverablesSection = subsections.find(
    (subsection) => mdastToString(subsection.heading).trim() === "Deliverables"
  );
  const successCriteriaSection = subsections.find(
    (subsection) => mdastToString(subsection.heading).trim() === "Success Criteria"
  );

  const objective = objectiveSection ? extractParagraphText(objectiveSection.body) : undefined;
  if (objective === undefined) {
    throw missingSectionError(phaseName, "Objective");
  }

  const deliverables = deliverablesSection
    ? extractListItemTexts(deliverablesSection.body)
    : undefined;
  if (deliverables === undefined || deliverables.length === 0) {
    throw missingSectionError(phaseName, "Deliverables");
  }

  const successCriteria = successCriteriaSection
    ? extractListItemTexts(successCriteriaSection.body)
    : undefined;
  if (successCriteria === undefined || successCriteria.length === 0) {
    throw missingSectionError(phaseName, "Success Criteria");
  }

  return { name: phaseName, objective, deliverables, successCriteria };
}

/** Extracts `FutureRoadmapItem`s from the "Future Roadmap" segment's bullet list, in order. */
function extractFutureRoadmapItems(segment: Segment): FutureRoadmapItem[] {
  const list = findFirstOfType(segment.body, "list") as List | undefined;
  if (!list) {
    return [];
  }
  return list.children.map((item) => ({ text: mdastToString(item).trim() }));
}

/**
 * Parses Roadmap_Content_Source markdown into structured `RoadmapData`.
 *
 * Pure function: no file I/O, no Next.js APIs. Splits the document's
 * top-level nodes into segments at depth-1 headings, recognizes Phase
 * segments via `PHASE_HEADING_PATTERN`, extracts their Objective/
 * Deliverables/Success Criteria subsections, and collects the "Future
 * Roadmap" section's bullet list. Non-matching segments are skipped.
 *
 * @throws Error if a recognized Phase segment is missing (or has an empty)
 *   Objective, Deliverables, or Success Criteria subsection.
 */
export function parseRoadmap(markdown: string): RoadmapData {
  const tree = fromMarkdown(markdown);
  const topLevelSegments = splitByHeadingDepth(tree.children as RootContent[], 1);

  const phases: Phase[] = [];
  let futureRoadmapItems: FutureRoadmapItem[] = [];

  for (const segment of topLevelSegments) {
    const headingText = mdastToString(segment.heading).trim();

    if (PHASE_HEADING_PATTERN.test(headingText)) {
      phases.push(extractPhase(segment));
    } else if (headingText === FUTURE_ROADMAP_HEADING_TEXT) {
      futureRoadmapItems = extractFutureRoadmapItems(segment);
    }
  }

  return { phases, futureRoadmapItems };
}
