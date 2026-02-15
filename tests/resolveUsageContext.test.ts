import { describe, it, expect, vi } from "vitest";

let mockDemoMode = true;
vi.mock("../src/config/runtime.js", () => ({
  get isDemoMode() {
    return mockDemoMode;
  },
}));

import { resolveUsageContext } from "../usage/usage.service.js";

describe("resolveUsageContext", () => {
  it("returns demo plan, mock-user, and YYYY-MM periodKey when isDemoMode is true", () => {
    mockDemoMode = true;
    const ctx = resolveUsageContext({});
    expect(ctx.plan).toBe("demo");
    expect(ctx.userId).toBe("mock-user");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });

  it("returns production plan (basic), not demo, when isDemoMode is false", () => {
    mockDemoMode = false;
    const ctx = resolveUsageContext({});
    expect(ctx.plan).toBe("basic");
    expect(ctx.userId).toBe("mock-user");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });
});
