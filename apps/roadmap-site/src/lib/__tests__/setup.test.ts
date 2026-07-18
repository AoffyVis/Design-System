import { describe, expect, it } from "vitest";
import fc from "fast-check";

describe("scaffolding sanity check", () => {
  it("runs a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });

  it("runs a trivial property with fast-check", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => a + b === b + a),
    );
  });
});
