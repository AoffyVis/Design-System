import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["scripts/**/*.test.{mjs,js,ts}", "packages/**/*.test.{mjs,js,ts}"],
    exclude: ["**/node_modules/**", "apps/**"],
    passWithNoTests: true,
  },
});
