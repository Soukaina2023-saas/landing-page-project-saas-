import { describe, it, expect, beforeEach } from "vitest";
import { incrementUsage } from "../usage/usage.service.js";
import { getUsageRecord } from "../usage/usage.store.js";
import { resetUsageStore } from "../usage/usage.store.js";
import type { UsageContext } from "../usage/usage.types.js";

function context(overrides: Partial<UsageContext> = {}): UsageContext {
  return {
    userId: "user-1",
    plan: "demo",
    periodKey: "2025-02",
    ...overrides,
  };
}

describe("incrementUsage", () => {
  beforeEach(() => {
    resetUsageStore();
  });

  it("increment increases counters correctly", () => {
    incrementUsage(context(), 3);
    const r1 = getUsageRecord("user-1:2025-02");
    expect(r1).toBeDefined();
    expect(r1!.requestCount).toBe(1);
    expect(r1!.imageCount).toBe(3);
    expect(r1!.lastUpdated).toBeGreaterThan(0);

    incrementUsage(context(), 2);
    const r2 = getUsageRecord("user-1:2025-02");
    expect(r2).toBeDefined();
    expect(r2!.requestCount).toBe(2);
    expect(r2!.imageCount).toBe(5);
    expect(r2!.lastUpdated).toBeGreaterThanOrEqual(r1!.lastUpdated);
  });

  it("period isolation works (different periodKey)", () => {
    incrementUsage(context({ periodKey: "2025-01" }), 10);
    incrementUsage(context({ periodKey: "2025-02" }), 5);

    const jan = getUsageRecord("user-1:2025-01");
    const feb = getUsageRecord("user-1:2025-02");
    expect(jan).toBeDefined();
    expect(jan!.requestCount).toBe(1);
    expect(jan!.imageCount).toBe(10);
    expect(feb).toBeDefined();
    expect(feb!.requestCount).toBe(1);
    expect(feb!.imageCount).toBe(5);
  });
});
