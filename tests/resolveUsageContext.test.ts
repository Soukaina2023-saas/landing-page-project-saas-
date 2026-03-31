import { describe, it, expect, vi } from "vitest";

let mockDemoMode = true;
vi.mock("../src/config/runtime.js", () => ({
  get isDemoMode() {
    return mockDemoMode;
  },
}));

vi.mock("../lib/db/client.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ plan: "BASIC" }),
    },
  },
}));

import { resolveUsageContext } from "../usage/usage.service.js";

describe("resolveUsageContext", () => {
  it("returns demo plan and demo-user when isDemoMode is true", async () => {
    mockDemoMode = true;
    const ctx = await resolveUsageContext({});
    expect(ctx.plan).toBe("demo");
    expect(ctx.userId).toBe("demo-user");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });

  it("returns demo plan when no auth context provided (unauthenticated)", async () => {
    mockDemoMode = false;
    const ctx = await resolveUsageContext({});
    expect(ctx.plan).toBe("demo");
    expect(ctx.userId).toBe("demo-user");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });

  it("returns real plan from DB when authenticated", async () => {
    mockDemoMode = false;
    const ctx = await resolveUsageContext({}, {
      userId: "user-123",
      isAuthenticated: true,
      plan: "basic",
    });
    expect(ctx.plan).toBe("basic");
    expect(ctx.userId).toBe("user-123");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });
});
