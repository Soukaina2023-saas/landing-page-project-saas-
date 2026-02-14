import { describe, it, expect } from "vitest";
import { resolveUsageContext } from "../usage/usage.service.js";

describe("resolveUsageContext", () => {
  it("returns demo plan, mock-user, and YYYY-MM periodKey", () => {
    const ctx = resolveUsageContext({});
    expect(ctx.plan).toBe("demo");
    expect(ctx.userId).toBe("mock-user");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });
});
