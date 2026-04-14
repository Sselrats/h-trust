import { describe, it, expectTypeOf } from "vitest";
import type { Step4Result, FallbackReason } from "../types";

describe("Step4Result type", () => {
  it("accepts source: ai with no fallbackReason", () => {
    const r: Step4Result = { draft: "d", citation: "c", source: "ai" };
    expectTypeOf(r.source).toEqualTypeOf<"ai" | "fallback">();
  });

  it("accepts source: fallback with fallbackReason", () => {
    const r: Step4Result = {
      draft: "d",
      citation: "c",
      source: "fallback",
      fallbackReason: "api_error",
    };
    expectTypeOf(r.fallbackReason).toEqualTypeOf<FallbackReason | undefined>();
  });
});
