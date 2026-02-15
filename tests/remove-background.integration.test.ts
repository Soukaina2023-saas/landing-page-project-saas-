import { describe, it, expect, beforeEach, vi } from "vitest";
import handler from "../api/remove-background.js";
import { getUsageRecord } from "../usage/usage.store.js";
import { resetUsageStore } from "../usage/usage.store.js";
import { resolveUsageContext } from "../usage/usage.service.js";

vi.mock("../lib/utils/rateLimiter.js", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock("../src/config/runtime.js", () => ({ isDemoMode: true }));

vi.mock("../usage/limits.config.js", () => ({
  MAX_IMAGES_PER_REQUEST: 4,
  MAX_BATCH_SIZE: 6,
  DEMO_LIMITS: { maxRequests: 1, maxImages: 40 },
  BASIC_LIMITS: { maxRequests: 200, maxImages: 400 },
  PRO_LIMITS: { maxRequests: 1000, maxImages: 3000 },
}));

const validBody = { image_url: "https://example.com/image.png" };

function createMockReq(body: object) {
  return {
    method: "POST",
    body,
    headers: {},
    url: "/api/remove-background",
    socket: { remoteAddress: "127.0.0.1" },
  };
}

function createMockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

function getUsageKey(): string {
  const ctx = resolveUsageContext({});
  return `${ctx.userId}:${ctx.periodKey}`;
}

describe("POST /api/remove-background (integration)", () => {
  beforeEach(() => {
    resetUsageStore();
  });

  it("valid request → 200 and usage incremented by 1", async () => {
    const req = createMockReq(validBody);
    const res = createMockRes();
    await handler(req as any, res as any);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        processedImageUrl: validBody.image_url,
      })
    );

    const record = getUsageRecord(getUsageKey());
    expect(record).toBeDefined();
    expect(record!.requestCount).toBe(1);
    expect(record!.imageCount).toBe(1);
  });

  it("maxRequests 1: first call 200, second call 429, usage not incremented on failure", async () => {
    const req1 = createMockReq(validBody);
    const res1 = createMockRes();
    await handler(req1 as any, res1 as any);

    expect(res1.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );

    const req2 = createMockReq(validBody);
    const res2 = createMockRes();
    await handler(req2 as any, res2 as any);

    expect(res2.status).toHaveBeenCalledWith(429);
    expect(res2.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ code: "USAGE_LIMIT_EXCEEDED" }),
      })
    );

    const record = getUsageRecord(getUsageKey());
    expect(record).toBeDefined();
    expect(record!.requestCount).toBe(1);
    expect(record!.imageCount).toBe(1);
  });
});
