import { describe, it, expect, afterEach, vi } from "vitest";

const featureFlagOverrides: Record<string, boolean> = {};
vi.mock("../src/config/featureFlags.js", () => ({
  get FEATURE_FLAGS() {
    return {
      ENABLE_AI_GENERATION: featureFlagOverrides.ENABLE_AI_GENERATION ?? true,
      ENABLE_BACKGROUND_REMOVAL: featureFlagOverrides.ENABLE_BACKGROUND_REMOVAL ?? true,
      ENABLE_PROMPT_ANALYSIS: featureFlagOverrides.ENABLE_PROMPT_ANALYSIS ?? true,
    };
  },
}));

vi.mock("../lib/utils/rateLimiter.js", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock("../src/config/runtime.js", () => ({ isDemoMode: true }));

vi.mock("../usage/limits.config.js", () => ({
  MAX_IMAGES_PER_REQUEST: 4,
  MAX_BATCH_SIZE: 6,
  DEMO_LIMITS: { maxRequests: 10, maxImages: 40 },
  BASIC_LIMITS: { maxRequests: 200, maxImages: 400 },
  PRO_LIMITS: { maxRequests: 1000, maxImages: 3000 },
}));

import removeBackgroundHandler from "../api/remove-background.js";
import generateBatchHandler from "../api/generate-batch.js";
import generatePromptsHandler from "../api/generate-prompts.js";

function createMockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
}

describe("feature flags behavior (disabled)", () => {
  afterEach(() => {
    delete featureFlagOverrides.ENABLE_AI_GENERATION;
    delete featureFlagOverrides.ENABLE_BACKGROUND_REMOVAL;
    delete featureFlagOverrides.ENABLE_PROMPT_ANALYSIS;
  });

  describe("ENABLE_AI_GENERATION = false", () => {
    it("AI orchestration throws controlled error (503 FEATURE_DISABLED)", async () => {
      featureFlagOverrides.ENABLE_AI_GENERATION = false;
      featureFlagOverrides.ENABLE_BACKGROUND_REMOVAL = true;
      featureFlagOverrides.ENABLE_PROMPT_ANALYSIS = true;

      const req = {
        method: "POST",
        body: {
          prompts: [{ prompt_text: "Valid prompt text here", aspect_ratio: "1:1" }],
        },
        headers: {},
        url: "/api/generate-batch",
        socket: { remoteAddress: "127.0.0.1" },
      };
      const res = createMockRes();

      await generateBatchHandler(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "FEATURE_DISABLED",
            message: expect.any(String),
          }),
        })
      );
    });
  });

  describe("ENABLE_BACKGROUND_REMOVAL = false", () => {
    it("background removal throws controlled error (503 FEATURE_DISABLED)", async () => {
      featureFlagOverrides.ENABLE_AI_GENERATION = true;
      featureFlagOverrides.ENABLE_BACKGROUND_REMOVAL = false;
      featureFlagOverrides.ENABLE_PROMPT_ANALYSIS = true;

      const req = {
        method: "POST",
        body: { image_url: "https://example.com/image.png" },
        headers: {},
        url: "/api/remove-background",
        socket: { remoteAddress: "127.0.0.1" },
      };
      const res = createMockRes();

      await removeBackgroundHandler(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "FEATURE_DISABLED",
            message: expect.any(String),
          }),
        })
      );
    });
  });

  describe("ENABLE_PROMPT_ANALYSIS = false", () => {
    it("prompt analysis throws controlled error (503 FEATURE_DISABLED)", async () => {
      featureFlagOverrides.ENABLE_AI_GENERATION = true;
      featureFlagOverrides.ENABLE_BACKGROUND_REMOVAL = true;
      featureFlagOverrides.ENABLE_PROMPT_ANALYSIS = false;

      const req = {
        method: "POST",
        body: {
          productName: "Test Product",
          description: "A long enough description for validation.",
        },
        headers: {},
        url: "/api/generate-prompts",
        socket: { remoteAddress: "127.0.0.1" },
      };
      const res = createMockRes();

      await generatePromptsHandler(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "FEATURE_DISABLED",
            message: expect.any(String),
          }),
        })
      );
    });
  });
});
