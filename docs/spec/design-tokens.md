# Design Token Specification

Version: 1.0.0

Status: Draft

---

# Purpose

This document defines the authored file format for Design Tokens, the
naming convention applied to token identifiers, one example per token
category, how a token maps to generated output formats, and the validation
rules a token must satisfy before it can be built.

This is the specification referenced as the "Design Token Source" stage in
[docs/diagrams/design-token-flow.md](../diagrams/design-token-flow.md).

---

# Naming Convention

Token identifiers follow the convention defined in
[naming.md](naming.md#1-design-token-names):

```text
{category}.{group}.{variant}.{property}
```

This convention applies consistently across all eight token categories
below. No category may define its own naming pattern.

---

# File Format

Design Tokens are authored as JSON files under `packages/tokens/src/`, one
file per category, using a nested object structure where each leaf node is
a token:

```json
{
  "color": {
    "primary": {
      "main": { "value": "#1565C0", "type": "color" },
      "contrast": { "value": "#FFFFFF", "type": "color" }
    }
  }
}
```

* `value` — the raw value, or a reference to another token using `{}`
  syntax (e.g. `"value": "{color.primary.main}"`).
* `type` — one of `color`, `dimension`, `fontFamily`, `fontWeight`,
  `duration`, `cubicBezier`, `number`, `shadow`.
* Nested object keys map directly onto the `group.variant.property`
  segments of the token identifier.

Token references are resolved during the "Semantic Token Graph" stage of
the generator and must not contain circular references.

---

# Token Categories

Each category below includes one example token definition.

## Colors

```json
{
  "color": {
    "primary": { "main": { "value": "#1565C0", "type": "color" } },
    "surface": { "main": { "value": "#FFFFFF", "type": "color" } }
  }
}
```

## Typography

```json
{
  "typography": {
    "body": {
      "md": {
        "fontFamily": { "value": "Inter, sans-serif", "type": "fontFamily" },
        "fontSize": { "value": "1rem", "type": "dimension" },
        "fontWeight": { "value": 400, "type": "fontWeight" },
        "lineHeight": { "value": "1.5", "type": "number" }
      }
    }
  }
}
```

## Spacing

```json
{
  "spacing": {
    "4": { "value": "1rem", "type": "dimension" }
  }
}
```

## Radius

```json
{
  "radius": {
    "md": { "value": "0.5rem", "type": "dimension" }
  }
}
```

## Shadows

```json
{
  "shadow": {
    "elevation": {
      "2": {
        "value": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        "type": "shadow"
      }
    }
  }
}
```

## Breakpoints

```json
{
  "breakpoint": {
    "md": { "value": "768px", "type": "dimension" }
  }
}
```

## Z-index

```json
{
  "zIndex": {
    "modal": { "value": 1300, "type": "number" }
  }
}
```

## Animations

```json
{
  "motion": {
    "duration": {
      "short": { "value": "150ms", "type": "duration" }
    },
    "easing": {
      "standard": { "value": "cubic-bezier(0.4, 0, 0.2, 1)", "type": "cubicBezier" }
    }
  }
}
```

---

# Mapping to Output Formats

Per the Transform Engine stage in
[docs/diagrams/design-token-flow.md](../diagrams/design-token-flow.md), each
resolved token maps to every output format in the same build step:

| Token field | CSS Custom Property | JSON Tokens | TypeScript Types |
|---|---|---|---|
| `value` (resolved) | property value | `value` field, unchanged | literal type or `string`/`number` per `type` |
| identifier path | `--ds-{path}` (see [naming.md](naming.md#2-css-custom-property-names)) | nested object path, unchanged | nested type path matching the JSON shape |
| `type` | n/a (CSS has no type system) | `type` field, unchanged | used to select the TypeScript primitive |

Theme Files are produced by generating the full CSS Custom Property set once
per theme (`light`, `dark`, brand-specific), overriding only the tokens a
theme redefines.

---

# Validation Rules

A Design Token definition is well-formed only if all of the following hold:

1. The token identifier matches the naming convention in
   [naming.md](naming.md#1-design-token-names).
2. `type` is one of the supported types listed in the File Format section.
3. `value` is either a literal compatible with `type`, or a `{reference}`
   to another existing token of the same `type`.
4. Token references do not form a cycle.
5. No two tokens resolve to the same identifier path within a category
   file (duplicate keys).
6. Every token category file parses as syntactically valid JSON.

If any rule fails, the generator MUST report the failing token's identifier
and the specific rule violated, and MUST NOT emit any output for the
affected token set. See the Security Principles in
[ARCHITECTURE.md](../../ARCHITECTURE.md) — invalid input never produces
partial or best-effort CSS.

---

# Implementation Notes

* Token files are the only place a raw visual value may be written. No
  other package may declare a literal color, dimension, or duration value.
* Adding a new token to an existing category does not require a major
  version bump. Renaming or removing a token identifier is a breaking
  change and follows the Versioning Strategy in
  [ARCHITECTURE.md](../../ARCHITECTURE.md).

---

# Future Considerations

* Support for the W3C Design Tokens Community Group format as an
  interchange/import format, without changing the authored source format
  above.
* Per-brand token override files layered on top of the base category files.
