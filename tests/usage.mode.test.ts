import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("../lib/db/client.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ plan: "BASIC" }),
    },
  },
}));

describe("usage mode resolution (runtime DEMO_MODE)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("resolves DEMO plan when process.env.DEMO_MODE is \"true\"", async () => {
    vi.stubEnv("DEMO_MODE", "true");
    vi.resetModules();
    const { resolveUsageContext } = await import("../usage/usage.service.js");
    const ctx = await resolveUsageContext({});
    expect(ctx.plan).toBe("demo");
    expect(ctx.userId).toBe("demo-user");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });

  it("resolves demo plan when no auth context (unauthenticated)", async () => {
    vi.stubEnv("DEMO_MODE", "false");
    vi.resetModules();
    const { resolveUsageContext } = await import("../usage/usage.service.js");
    const ctx = await resolveUsageContext({});
    expect(ctx.plan).toBe("demo");
    expect(ctx.userId).toBe("demo-user");
    expect(ctx.periodKey).toMatch(/^\d{4}-\d{2}$/);
  });
});
