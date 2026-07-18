---
inclusion: always
---

# Definition of Done — Enforcement Rules

`AGENTS.md`'s "Definition of Done" section (requirements satisfied,
architecture respected, tests passing, docs updated, no unnecessary
complexity, no obvious debt, ready for production) is the right list but
too easy to satisfy on paper without satisfying in practice — a task can
look done in `tasks.md` while the generated output is still broken. This
file makes it mechanical. Every rule below maps to a real bug that shipped
under the old, vaguer definition (see `docs/SESSION-SUMMARY.md` for the
full history of each). Do not mark a task `- [x]` in any `tasks.md` unless
every rule that applies to that task passes.

## 1. "Tests passing" means you ran them, not that you wrote them

Writing a test file is not the same as running `pnpm build && pnpm test &&
pnpm run lint` and reading the actual exit status. Before marking a task
done, run the full command and confirm it exits clean. If you can't run it
in this environment, say so explicitly in the task note instead of marking
the task done — don't claim a result you didn't observe.

## 2. Never reference a token that doesn't exist

If generated CSS references `var(--ds-*)`, that custom property must be
defined by `packages/tokens`. A two-argument fallback —
`var(--ds-color-surface-main, #ffffff)` — is not a valid way to handle a
missing token. It is a silent admission that the token doesn't exist, and
it defeats the project's own "no hardcoded values" principle while looking
token-driven at a glance.

- If the token is missing, add it to the real source
  (`packages/tokens/src/*.json`) and regenerate — don't paper over the gap
  in the consumer.
- If you're not sure whether a token should exist, flag it as an open
  question rather than inventing a fallback. A fallback is a decision
  ("this value is fine to hardcode forever") disguised as a non-decision.
- Grep the generated output (`packages/css-core/dist/core.css`,
  `packages/tokens/dist/tokens.css`) for the exact property name you
  referenced. If it's not there, the task isn't done.

(Real example: `.card`/`.input` referenced `--ds-color-surface-main` and
`--ds-color-border` with hardcoded fallbacks for an unknown number of
sessions before it was caught — because nothing checked that the token
actually existed, only that the CSS "looked" token-driven.)

## 3. Naming must match the spec, not just be reasonable

Before introducing a new file, token category, or key name, check whether
`docs/spec/*.md` or `docs/0*-*.md` already names it. `motion` vs
`animation` is not a stylistic choice — one of them is the name a
consuming package's parser is written against. If a name in your PR
doesn't match the spec, either the spec is wrong (update it and say why)
or your code is wrong (fix your code). Don't ship a plausible-sounding
name that diverges from the documented one.

## 4. Doc updates must cover every doc describing the thing, not just one

This repo has more than one file describing the same architecture on
purpose (`ARCHITECTURE.md` is the canonical source; `docs/0*-*.md` mirror
specific slices of it for readability — see `AGENTS.md`'s Source of Truth
order). When you change something architectural (e.g. add a CSS layer,
add a token category), grep for every doc that enumerates the thing you
changed, not just the one you happened to open. A stale mirror doc is a
bug even if the canonical doc is correct.

(Real example: `docs/02-architecture.md` still didn't mention the
Components layer after the "documentation consistency" pass updated six
other files — nobody grepped for the layer list across all docs.)

## 5. "Works" means verified against generated output, not source code

Reading your own generator source and confirming it looks correct is not
verification — it's re-reading what you just wrote. Verify against the
actual build artifact: grep `dist/core.css` / `dist/tokens.css` for the
selector or property you expect, or load the built page and inspect it.
Source code that "should" produce correct output has, in this project,
repeatedly produced incorrect output (double-escaped selectors, silently
dropped tokens, leaked unscoped CSS) that only showed up when someone
checked the artifact instead of the source.

## 6. Don't claim "no breaking changes" without checking consumers

Before changing a shared package's output shape (new CSS layer order, new
token structure, renamed generator output), check what already consumes
it (`apps/roadmap-site`, other generators, other tests) and confirm they
still work — don't assume isolation just because you only edited one
package's files.

## What this doesn't replace

This file hardens `AGENTS.md`'s Definition of Done into checkable steps;
it doesn't replace the judgment calls in `AGENTS.md`'s "Decision Making"
and "Communication" sections (maintainability > simplicity > scalability
> performance > DX; explain rejections with reason + impact +
alternative). Mechanical checks catch silent gaps — they don't substitute
for explaining a real architectural tradeoff when one exists.
