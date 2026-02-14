import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkUserQuota, incrementUsage } from "../usage/usage.service.js";
import { ApiError } from "../lib/utils/apiError.js";
import { resetUsageStore } from "../usage/usage.store.js";
import type { UsageContext } from "../usage/usage.types.js";

vi.mock("../usage/limits.config.js", () => ({
  MAX_IMAGES_PER_REQUEST: 4,
  MAX_BATCH_SIZE: 6,
  DEMO_LIMITS: { maxRequests: 1, maxImages: 40 },
  BASIC_LIMITS: { maxRequests: 200, maxImages: 400 },
  PRO_LIMITS: { maxRequests: 1000, maxImages: 3000 },
}));

function context(overrides: Partial<UsageContext> = {}): UsageContext {
  return {
    userId: "user-1",
    plan: "demo",
    periodKey: "2025-02",
    ...overrides,
  };
}

describe("checkUserQuota (maxRequests = 1)", () => {
  beforeEach(() => {
    resetUsageStore();
  });

  it("first request passes, second request throws USAGE_LIMIT_EXCEEDED (429)", () => {
    expect(() => checkUserQuota(context(), 1)).not.toThrow();
    incrementUsage(context(), 1);
    try {
      checkUserQuota(context(), 1);
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).statusCode).toBe(429);
      expect((err as ApiError).code).toBe("USAGE_LIMIT_EXCEEDED");
    }
  });
});
