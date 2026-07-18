# Design Token Specification

This document defines the authored file format, naming convention, token categories, output format mapping, and validation rules for Design Tokens in the Design System Platform. It condenses the detailed specifications found in the source files into a single reference for developers implementing or consuming the token pipeline.

---

## File Format

Design Tokens are authored as JSON files under `packages/tokens/src/`, one file per category. Each file uses a nested object structure where every leaf node is a token:

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

Each token leaf node contains:

| Field   | Description                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------- |
| `value` | The raw value, or a reference to another token using `{}` syntax (e.g. `"{color.primary.main}"`)      |
| `type`  | One of: `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `shadow` |

Nested object keys map directly onto the `group.variant.property` segments of the token identifier. Token references are resolved during the Semantic Token Graph stage of the generator and must not contain circular references.

---

## Naming Convention

Token identifiers follow a dot-delimited, lowercase, semantic path:

```text
{category}.{group}.{variant}.{property}
```

| Segment    | Description                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------- |
| `category` | Top-level token category (`color`, `typography`, `spacing`, `radius`, `shadow`, `breakpoint`, `zIndex`, `motion`) |
| `group`    | Semantic grouping within the category (`primary`, `surface`, `body`, `modal`)                  |
| `variant`  | State or scale step (`main`, `hover`, `disabled`, `md`, `4`)                                  |
| `property` | The specific value being described; omitted when group and variant fully describe the value    |

This convention applies consistently across all eight token categories. No category may define its own naming pattern.

### Mapping to CSS Custom Properties

Every token is exposed as a CSS Custom Property using the `--ds-` namespace prefix, replacing dots with hyphens:

```text
--ds-{category}-{group}-{variant}-{property}
```

Examples:

| Token Identifier             | CSS Custom Property              |
| ---------------------------- | -------------------------------- |
| `color.primary.main`         | `--ds-color-primary-main`        |
| `spacing.4`                  | `--ds-spacing-4`                 |
| `radius.md`                  | `--ds-radius-md`                 |
| `shadow.elevation.2`         | `--ds-shadow-elevation-2`        |

### Design Rules

- Names are always lowercase; multi-word segments use camelCase in token paths and kebab-case in CSS variables.
- Never encode a raw value in a name (`blue500`, `16px`). Names describe intent, not appearance.
- A name must resolve unambiguously in the reverse direction: given a CSS variable, the source token is derivable without additional context.

---

## Token Categories

Each category below includes one example token definition.

### Colors

```json
{
  "color": {
    "primary": { "main": { "value": "#1565C0", "type": "color" } },
    "surface": { "main": { "value": "#FFFFFF", "type": "color" } }
  }
}
```

### Typography

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

### Spacing

```json
{
  "spacing": {
    "4": { "value": "1rem", "type": "dimension" }
  }
}
```

### Radius

```json
{
  "radius": {
    "md": { "value": "0.5rem", "type": "dimension" }
  }
}
```

### Shadows

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

### Breakpoints

```json
{
  "breakpoint": {
    "md": { "value": "768px", "type": "dimension" }
  }
}
```

### Z-index

```json
{
  "zIndex": {
    "modal": { "value": 1300, "type": "number" }
  }
}
```

### Animations

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

## Mapping to Output Formats

Each resolved token maps to every output format in the same build step via the Transform Engine:

| Token Field        | CSS Custom Property                              | JSON Tokens                  | TypeScript Types                                   |
| ------------------ | ------------------------------------------------ | ---------------------------- | -------------------------------------------------- |
| `value` (resolved) | Property value                                   | `value` field, unchanged     | Literal type or `string`/`number` per `type`       |
| Identifier path    | `--ds-{path}` (dots → hyphens, `ds` namespace)   | Nested object path, unchanged | Nested type path matching the JSON shape           |
| `type`             | n/a (CSS has no type system)                     | `type` field, unchanged      | Used to select the TypeScript primitive            |

### Theme Files

Theme Files are produced by generating the full CSS Custom Property set once per theme (`light`, `dark`, brand-specific), overriding only the tokens a theme redefines. A theme file never introduces new token identifiers — it only provides alternate values for existing ones.

---

## Validation Rules

A Design Token definition is well-formed only if **all** of the following hold:

1. The token identifier matches the naming convention `{category}.{group}[.{variant}][.{property}]`.
2. `type` is one of the supported types: `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `shadow`.
3. `value` is either a literal compatible with `type`, or a `{reference}` to another existing token of the same `type`.
4. Token references do not form a cycle.
5. No two tokens resolve to the same identifier path within a category file (duplicate keys).
6. Every token category file parses as syntactically valid JSON.

If any rule fails, the generator MUST report the failing token's identifier and the specific rule violated, and MUST NOT emit any output for the affected token set. Invalid input never produces partial or best-effort CSS.

---

## Supersedes / Deep Reference

This document condenses and supersedes the following detailed specification files for day-to-day developer reference:

- [`docs/spec/design-tokens.md`](./spec/design-tokens.md) — Full Design Token specification including file format, all category examples, output mapping, and validation rules.
- [`docs/spec/naming.md`](./spec/naming.md) — Complete naming convention specification covering token identifiers, CSS Custom Properties, utility class names, and modifiers.

When a conflict exists between this condensed document and the source specifications listed above, the source specifications take precedence. Consult them for implementation edge cases and future considerations not covered here.
