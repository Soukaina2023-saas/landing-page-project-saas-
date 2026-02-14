import { describe, it, expect, beforeEach } from "vitest";
import { checkUserQuota } from "../usage/usage.service.js";
import { ApiError } from "../lib/utils/apiError.js";
import { resetUsageStore } from "../usage/usage.store.js";
import { setUsageRecord } from "../usage/usage.store.js";
import { DEMO_LIMITS } from "../usage/limits.config.js";
import type { UsageContext } from "../usage/usage.types.js";

function context(overrides: Partial<UsageContext> = {}): UsageContext {
  return {
    userId: "user-1",
    plan: "demo",
    periodKey: "2025-02",
    ...overrides,
  };
}

describe("checkUserQuota", () => {
  beforeEach(() => {
    resetUsageStore();
  });

  it("first request → passes", () => {
    expect(() => {
      checkUserQuota(context(), 1);
    }).not.toThrow();
  });

  it("within quota → passes", () => {
    setUsageRecord("user-1:2025-02", {
      requestCount: 5,
      imageCount: 20,
      lastUpdated: Date.now(),
    });
    expect(() => {
      checkUserQuota(context(), 10);
    }).not.toThrow();
  });

  it("exceeding DEMO_LIMITS maxRequests → throws 429 USAGE_LIMIT_EXCEEDED", () => {
    setUsageRecord("user-1:2025-02", {
      requestCount: DEMO_LIMITS.maxRequests,
      imageCount: 0,
      lastUpdated: Date.now(),
    });
    try {
      checkUserQuota(context(), 1);
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).statusCode).toBe(429);
      expect((err as ApiError).code).toBe("USAGE_LIMIT_EXCEEDED");
      expect((err as ApiError).code).not.toBe("RATE_LIMIT_EXCEEDED");
    }
  });

  it("exceeding DEMO_LIMITS maxImages → throws 429 USAGE_LIMIT_EXCEEDED", () => {
    setUsageRecord("user-1:2025-02", {
      requestCount: 1,
      imageCount: DEMO_LIMITS.maxImages - 2,
      lastUpdated: Date.now(),
    });
    try {
      checkUserQuota(context(), 5);
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).statusCode).toBe(429);
      expect((err as ApiError).code).toBe("USAGE_LIMIT_EXCEEDED");
      expect((err as ApiError).code).not.toBe("RATE_LIMIT_EXCEEDED");
    }
  });

  it("usage limit 429 does not trigger rate limit logic", () => {
    setUsageRecord("user-1:2025-02", {
      requestCount: DEMO_LIMITS.maxRequests,
      imageCount: 0,
      lastUpdated: Date.now(),
    });
    try {
      checkUserQuota(context(), 1);
      expect.fail("should have thrown");
    } catch (err) {
      expect((err as ApiError).code).toBe("USAGE_LIMIT_EXCEEDED");
    }
  });

  it("period isolation works (different periodKey)", () => {
    setUsageRecord("user-1:2025-01", {
      requestCount: DEMO_LIMITS.maxRequests,
      imageCount: DEMO_LIMITS.maxImages,
      lastUpdated: Date.now(),
    });
    expect(() => {
      checkUserQuota(context({ periodKey: "2025-02" }), 1);
    }).not.toThrow();
  });
});
