import { describe, it, expect, vi, afterEach } from "vitest";

describe("usage mode resolution (runtime DEMO_MODE)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("resolves DEMO plan when process.env.DEMO_MODE is \"true\"", async () => {
    vi.stubEnv("DEMO_MODE", "true");
    vi.resetModules();
    const { resolveUsageContext } = await import("../usage/usage.service.js");
    const ctx = resolveUsageContext({});
    expect(ctx.plan).toBe("demo");
    expect(ctx.userId).toBe("mock-user");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });

  it("resolves production plan when process.env.DEMO_MODE is \"false\"", async () => {
    vi.stubEnv("DEMO_MODE", "false");
    vi.resetModules();
    const { resolveUsageContext } = await import("../usage/usage.service.js");
    const ctx = resolveUsageContext({});
    expect(ctx.plan).toBe("basic");
    expect(ctx.userId).toBe("mock-user");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });
});
