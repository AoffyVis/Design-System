# Naming Convention Specification

Version: 1.0.0

Status: Draft

---

# Purpose

This document defines the single naming convention used across Design
Tokens, generated CSS Custom Properties, and utility class names.

A consistent naming convention allows a developer who knows one layer
(tokens, CSS variables, or utility classes) to predict the name used at
every other layer without consulting a lookup table.

---

# Naming Convention

## 1. Design Token Names

Tokens are named using dot-delimited, lowercase, semantic paths:

```text
{category}.{group}.{variant}.{property}
```

* `category` — top-level token category (`color`, `typography`, `spacing`,
  `radius`, `shadow`, `breakpoint`, `zIndex`, `motion`, `opacity`,
  `elevation`).
* `group` — semantic grouping within the category (`primary`, `surface`,
  `body`, `modal`).
* `variant` — state or scale step (`main`, `hover`, `disabled`, `md`, `4`).
* `property` — the specific value being described, omitted when the group
  and variant already fully describe the value.

Tokens describe **meaning**, never appearance. See
[docs/DESIGN-PHILOSOPHY.md](../DESIGN-PHILOSOPHY.md#semantic-design).

## 2. CSS Custom Property Names

Every Design Token is exposed as a CSS Custom Property using the `--ds-`
namespace prefix, replacing dots with hyphens:

```text
--ds-{category}-{group}-{variant}-{property}
```

```css
--ds-color-primary-main
--ds-spacing-4
--ds-radius-md
--ds-shadow-elevation-2
```

## 3. Utility Class Names

Utility classes follow a short, predictable `{property}-{value}` pattern,
inspired by utility-first CSS workflows (naming only — the implementation
is independent, per [docs/DESIGN-PHILOSOPHY.md](../DESIGN-PHILOSOPHY.md)):

```text
{property}[-{side}]-{value}
```

```text
p-4        /* padding: var(--ds-spacing-4) */
pt-4       /* padding-top: var(--ds-spacing-4) */
text-primary   /* color: var(--ds-color-primary-main) */
bg-surface     /* background-color: var(--ds-color-surface-main) */
rounded-md     /* border-radius: var(--ds-radius-md) */
shadow-2       /* box-shadow: var(--ds-shadow-elevation-2) */
```

## 4. Modifiers

Modifiers are applied as colon-delimited prefixes, evaluated left to right:

```text
{breakpoint}:{state}:{property}-{value}
```

```text
md:p-4          /* padding-4 from the md breakpoint upward */
hover:bg-primary
dark:bg-surface
focus-visible:ring-2
```

Supported state modifiers: `hover`, `focus`, `focus-visible`, `active`,
`disabled`. Supported theme modifier: `dark`. Breakpoint modifiers are
defined in `responsive.md` (planned).

---

# Supported Utilities

This document defines naming rules only. The concrete list of generated
utility classes is defined per topic in sibling specification files
(`spacing.md`, `typography.md`, `colors.md`, `layout.md`, `flex.md`,
`grid.md`, `borders.md`, `shadows.md`, `sizing.md`) as they move from
`Planned` to implemented status.

---

# Syntax

```text
token:        {category}.{group}[.{variant}][.{property}]
css-variable: --ds-{category}-{group}[-{variant}][-{property}]
class:        [{breakpoint}:][{state}:]{property}[-{side}]-{value}
```

---

# Examples

| Design Token | CSS Custom Property | Utility Class |
|---|---|---|
| `color.primary.main` | `--ds-color-primary-main` | `text-primary`, `bg-primary` |
| `color.error.main` | `--ds-color-error-main` | `text-error`, `bg-error` |
| `spacing.4` | `--ds-spacing-4` | `p-4`, `m-4`, `gap-4` |
| `radius.md` | `--ds-radius-md` | `rounded-md` |
| `shadow.elevation.2` | `--ds-shadow-elevation-2` | `shadow-2` |
| `typography.body.md.fontSize` | `--ds-typography-body-md-font-size` | `text-body-md` |

---

# Design Rules

* Names are always lowercase; multi-word segments use camelCase in token
  paths and kebab-case in CSS variables and class names.
* Never encode a raw value in a name (`blue500`, `16px`). Names describe
  intent, not appearance, per the Design Tokens First principle in
  [AGENTS.md](../../AGENTS.md).
* A name must resolve unambiguously in the reverse direction: given a class
  name, the source token and CSS variable must be derivable without
  additional context.
* Do not abbreviate category names (`background`, not `bg`, at the token
  layer). Utility classes may use short forms for ergonomics (`bg-`) since
  they are a distinct, documented layer.
* Modifier order is fixed (`breakpoint:state:utility`) so generated output
  is deterministic and diff-friendly.

---

# Implementation Notes

* The Token Parser & Validator described in
  [docs/diagrams/design-token-flow.md](../diagrams/design-token-flow.md)
  rejects any Design Token name that does not match the pattern in
  Section 1.
* CSS Custom Property generation is a pure, mechanical transform of the
  token name (Section 1 → Section 2) with no manual overrides permitted.
* Utility class generation MAY omit classes for token paths that have no
  corresponding CSS property mapping (e.g. purely semantic tokens used only
  for theming).

---

# Future Considerations

* RTL-aware logical property naming (`ps-4` / `pe-4` for `padding-inline-start`
  / `padding-inline-end`) once `layout.md` is implemented.
* Container query modifiers, once browser support is a non-issue for
  Supported Platforms.
