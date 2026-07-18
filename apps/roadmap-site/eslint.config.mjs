import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Requirement 8.3: all non-decorative images must have descriptive alt text.
    // The jsx-a11y plugin is already registered by eslint-config-next; this
    // just raises alt-text from "warn" to "error" for this app.
    rules: {
      "jsx-a11y/alt-text": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
