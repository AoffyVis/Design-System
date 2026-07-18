# CLAUDE.md

All conventions defined in [AGENTS.md](./AGENTS.md) apply to Claude-based agents. Read that file first — this file only documents differences specific to Claude Code.

---

## Claude-Specific Notes

- **Running scripts:** Use the shell tool to run pnpm scripts. The key commands are:
  - `pnpm install` — install all workspace dependencies
  - `pnpm run lint` — runs `node scripts/validate-links.mjs` (validates internal doc links)
  - `pnpm run test` — runs the test suite via vitest
  - `pnpm run build` — builds all packages (currently a no-op placeholder)
- **File editing:** Always read a file before editing it. Do not assume file contents from memory or prior context.
- **Source of Truth order:** Follow the priority defined in `AGENTS.md` — Architecture > Requirements > README > Source Code. When in doubt, re-read the authoritative file.
- **Link validation:** After modifying or adding any markdown file in `docs/` or the root, run `node scripts/validate-links.mjs` to confirm no internal links are broken.
- **Commit hygiene:** Stage only the files you intentionally changed. Do not run `git add .` without reviewing the diff.

---

## Keeping This File Current

Any newly discovered Claude-specific tooling or invocation difference must be added to this file immediately — not deferred to a later review or scheduled update. If you encounter a behavior unique to Claude Code that is not covered above, append it to the "Claude-Specific Notes" section before completing the current task.
