/**
 * Link Validator — Core Logic
 *
 * Dependency-free Node.js ESM module that validates internal links across the
 * documentation set. Exports pure, testable functions used by the CLI entry
 * point (main) and by unit/property tests.
 *
 * @module scripts/validate-links
 */

import { posix, resolve } from 'node:path';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * @typedef {Object} InternalLink
 * @property {string} sourceFile   - Repo-relative path of the file containing the link
 * @property {string} rawPath      - The literal markdown link target, e.g. "./docs/01-vision.md"
 * @property {string} resolvedPath - rawPath resolved relative to sourceFile's directory
 * @property {number} line         - 1-based line number where the link appears
 */

/**
 * Scans file contents for markdown link syntax `[text](path)` and extracts
 * internal (relative) links. Skips any construct that cannot be confidently
 * parsed, and filters out external links (those starting with `http`).
 *
 * @param {Map<string, string>} fileContents - Map of repo-relative file paths to their text content
 * @returns {InternalLink[]} Array of extracted internal links
 */
export function extractInternalLinks(fileContents) {
  /** @type {InternalLink[]} */
  const links = [];

  // Match standard markdown links: [text](path)
  // Excludes image links ![alt](path) by using a negative lookbehind
  const linkRegex = /(?<!!)\[([^\]]*)\]\(([^)]*)\)/g;

  for (const [sourceFile, content] of fileContents) {
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;

      // Reset regex lastIndex for each line
      linkRegex.lastIndex = 0;

      while ((match = linkRegex.exec(line)) !== null) {
        const rawPath = match[2].trim();

        // Skip empty paths
        if (!rawPath) continue;

        // Skip external links (http/https)
        if (/^https?:\/\//i.test(rawPath)) continue;

        // Skip fragment-only links (e.g. #section)
        if (rawPath.startsWith('#')) continue;

        // Skip mailto and other protocol links
        if (/^[a-z][a-z0-9+.-]*:/i.test(rawPath)) continue;

        // Resolve the path relative to the source file's directory
        const sourceDir = posix.dirname(sourceFile);
        const resolvedPath = posix.normalize(posix.join(sourceDir, rawPath));

        links.push({
          sourceFile,
          rawPath,
          resolvedPath,
          line: i + 1,
        });
      }
    }
  }

  return links;
}

/**
 * Returns the subset of links whose resolvedPath does not exist in the
 * provided set of known files.
 *
 * @param {InternalLink[]} links - Array of internal links to check
 * @param {Set<string>} existingFiles - Set of repo-relative file paths that exist
 * @returns {InternalLink[]} Array of broken links (those pointing to non-existent files)
 */
export function findBrokenLinks(links, existingFiles) {
  return links.filter((link) => !existingFiles.has(link.resolvedPath));
}

/**
 * Returns documentation files that are not linked from the index file.
 * A doc file is orphaned if no link originating from the specified index file
 * resolves to it.
 *
 * @param {string} indexFile - Repo-relative path of the index file (e.g. "docs/00-index.md")
 * @param {Set<string>} docFiles - Set of repo-relative paths of all documentation files
 * @param {InternalLink[]} links - Array of all extracted internal links
 * @returns {string[]} Array of repo-relative paths of orphaned documentation files
 */
export function findOrphanedDocs(indexFile, docFiles, links) {
  // Collect all resolvedPaths that originate from the index file
  const linkedFromIndex = new Set(
    links
      .filter((link) => link.sourceFile === indexFile)
      .map((link) => link.resolvedPath)
  );

  // A doc file is orphaned if it's not linked from the index
  // The index file itself is never considered orphaned
  return [...docFiles].filter(
    (docFile) => docFile !== indexFile && !linkedFromIndex.has(docFile)
  );
}

/**
 * Checks whether a list of index entries is in strictly ascending order by
 * numeric prefix. Reports which entries violate that ordering.
 *
 * An entry is "out of order" if its prefix is not strictly greater than the
 * prefix of the entry immediately before it.
 *
 * @param {{ prefix: number; rawPath: string }[]} indexLinks - Array of index entries with numeric prefixes
 * @returns {{ valid: boolean; outOfOrder: string[] }} Result with validity flag and list of out-of-order rawPaths
 */
export function checkIndexOrder(indexLinks) {
  /** @type {string[]} */
  const outOfOrder = [];

  for (let i = 1; i < indexLinks.length; i++) {
    if (indexLinks[i].prefix <= indexLinks[i - 1].prefix) {
      outOfOrder.push(indexLinks[i].rawPath);
    }
  }

  return {
    valid: outOfOrder.length === 0,
    outOfOrder,
  };
}

/**
 * Recursively collects all .md files under a directory, returning repo-relative paths.
 *
 * @param {string} dir - Absolute path to the directory to scan
 * @param {string} baseDir - Absolute path to the repository root (for computing relative paths)
 * @returns {string[]} Array of repo-relative paths to .md files
 */
function collectMdFiles(dir, baseDir) {
  /** @type {string[]} */
  const results = [];

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      results.push(...collectMdFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Convert absolute path to repo-relative using posix separators
      const relative = fullPath.slice(baseDir.length + 1).split('\\').join('/');
      results.push(relative);
    }
  }

  return results;
}

/**
 * CLI entry point. Reads the real filesystem, calls the pure validation functions,
 * prints violations, and returns the exit code.
 *
 * @returns {Promise<number>} Exit code: 0 if all checks pass, 1 if any violation found
 */
export async function main() {
  const cwd = process.cwd();

  // Check that we are at the repository root
  const readmePath = `${cwd}/README.md`;
  const docsDir = `${cwd}/docs`;

  if (!existsSync(readmePath) || !existsSync(docsDir) || !statSync(docsDir).isDirectory()) {
    console.error('Error: must be run from the repository root (README.md and docs/ not found)');
    return 1;
  }

  // Collect all markdown files: README.md + docs/**/*.md
  const docMdFiles = collectMdFiles(docsDir, cwd);
  const allMdFiles = ['README.md', ...docMdFiles];

  // Build Map<string, string> of repo-relative path → file contents
  /** @type {Map<string, string>} */
  const fileContents = new Map();
  for (const relPath of allMdFiles) {
    const absPath = `${cwd}/${relPath}`;
    fileContents.set(relPath, readFileSync(absPath, 'utf-8'));
  }

  // Build Set<string> of all existing files in the repo (md files + other referenced files)
  // We include all files that could be link targets
  /** @type {Set<string>} */
  const existingFiles = new Set(allMdFiles);

  // Also add other known files at the root that may be linked to
  const rootEntries = readdirSync(cwd, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (entry.isFile()) {
      existingFiles.add(entry.name);
    }
  }

  // Add files in docs/ subdirectories (spec/, diagrams/, etc.) that are not .md
  // but might still be link targets — actually they are already captured if .md
  // For completeness, add all files under docs/ (already done via collectMdFiles for .md)
  // Non-md files in docs/ subfolders could also be link targets
  const addAllFiles = (dir, baseDir) => {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        addAllFiles(fullPath, baseDir);
      } else if (entry.isFile()) {
        const relative = fullPath.slice(baseDir.length + 1).split('\\').join('/');
        existingFiles.add(relative);
      }
    }
  };
  addAllFiles(docsDir, cwd);

  let hasViolations = false;

  // 1. Extract internal links (strip fragments before resolving)
  // We need to strip fragment identifiers from rawPath before resolving
  // Since extractInternalLinks already resolves paths, we need to handle fragments
  // by creating a modified file contents approach — actually, we need to strip
  // fragments from the resolvedPath when checking against existing files.
  const links = extractInternalLinks(fileContents);

  // Strip fragment identifiers from resolvedPath for file existence checking
  const linksForBrokenCheck = links.map((link) => ({
    ...link,
    resolvedPath: link.resolvedPath.split('#')[0],
  }));

  // 2. Find broken links
  const brokenLinks = findBrokenLinks(linksForBrokenCheck, existingFiles);
  if (brokenLinks.length > 0) {
    hasViolations = true;
    for (const link of brokenLinks) {
      console.error(
        `${link.sourceFile}:${link.line} — broken link "${link.rawPath}" (resolved: ${link.resolvedPath})`
      );
    }
  }

  // 3. Find orphaned docs
  const indexFile = 'docs/00-index.md';
  // Numbered doc files: docs/XX-*.md (00 through 12)
  const numberedDocPattern = /^docs\/\d{2}-[^/]+\.md$/;
  /** @type {Set<string>} */
  const docFiles = new Set(
    allMdFiles.filter((f) => numberedDocPattern.test(f))
  );

  // Strip fragments from links for orphan detection too
  const linksForOrphanCheck = links.map((link) => ({
    ...link,
    resolvedPath: link.resolvedPath.split('#')[0],
  }));

  const orphanedDocs = findOrphanedDocs(indexFile, docFiles, linksForOrphanCheck);
  if (orphanedDocs.length > 0) {
    hasViolations = true;
    for (const doc of orphanedDocs) {
      console.error(`${doc} — not linked from docs/00-index.md`);
    }
  }

  // 4. Check index order
  const indexContent = fileContents.get(indexFile);
  if (indexContent) {
    // Extract links from the index file and parse numeric prefixes
    const indexLinkRegex = /(?<!!)\[([^\]]*)\]\(([^)]*)\)/g;
    /** @type {{ prefix: number; rawPath: string }[]} */
    const indexLinks = [];

    let match;
    while ((match = indexLinkRegex.exec(indexContent)) !== null) {
      const linkPath = match[2].trim();
      // Match numbered doc pattern: ./XX-something.md or XX-something.md
      const prefixMatch = linkPath.match(/(?:\.\/)?(\d{2})-[^/]+\.md/);
      if (prefixMatch) {
        indexLinks.push({
          prefix: parseInt(prefixMatch[1], 10),
          rawPath: linkPath,
        });
      }
    }

    const orderResult = checkIndexOrder(indexLinks);
    if (!orderResult.valid) {
      hasViolations = true;
      for (const entry of orderResult.outOfOrder) {
        console.error(`${entry} — out of order in docs/00-index.md`);
      }
    }
  }

  return hasViolations ? 1 : 0;
}

// Run main() when this module is executed directly
const currentFile = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] &&
  resolve(process.argv[1]) === currentFile;

if (isDirectRun) {
  main().then((code) => process.exit(code));
}
