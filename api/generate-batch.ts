import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FEATURE_FLAGS } from "../src/config/featureFlags.js";
import { generateBatchSchema } from "../lib/validation/generateBatch.schema.js";
import { checkRateLimit } from "../lib/utils/rateLimiter.js";
import { ApiError } from "../lib/utils/apiError.js";
import { logger } from "../lib/utils/logger.js";
import { requestWithRetry } from "../lib/utils/requestWithRetry.js";
import {
  checkOperationLimits,
  checkUserQuota,
  incrementUsage,
  resolveUsageContext,
} from "../usage/usage.service.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "unknown";

    logger.info("Incoming request", { endpoint: req.url, method: req.method });

    const rate = checkRateLimit(ip);

    if (!rate.allowed) {
      logger.warn("Rate limit exceeded", { ip });
      throw new ApiError(
        429,
        "RATE_LIMIT_EXCEEDED",
        "Too many requests. Please try again later."
      );
    }

    const parsed = generateBatchSchema.safeParse(req.body);

    if (!parsed.success) {
      logger.warn("Validation failed", { endpoint: req.url });
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Invalid request body"
      );
    }

    const { prompts } = parsed.data;
    const input = { batchSize: (req.body as { batchSize?: number })?.batchSize ?? prompts.length };
    // Usage layer first (never bypass): resolveContext → operation limits → user quota → then feature flags → then AI
    const usageContext = resolveUsageContext(req);
    checkOperationLimits({
      imagesRequested: input.batchSize ?? 1,
      batchSize: input.batchSize ?? 1,
    });
    checkUserQuota(usageContext, input.batchSize ?? 1);

    if (!FEATURE_FLAGS.ENABLE_AI_GENERATION) {
      throw new ApiError(
        503,
        "FEATURE_DISABLED",
        "AI generation is temporarily unavailable"
      );
    }

    await requestWithRetry(
      async () => {
        return "ok";
      },
      {
        retries: 2,
        timeoutMs: 3000
      }
    );

    // MOCK image generation
    const results = prompts.map((prompt: any, index: number) => ({
      image_role: prompt.image_role || `image_${index}`,
      image_url: `https://via.placeholder.com/512?text=Mock+Image+${index + 1}`,
      status: 'mock_generated',
    }));

    incrementUsage(usageContext, input.batchSize ?? 1);
    logger.info("Request successful", { endpoint: req.url });
    return res.json({
      success: true,
      results,
      source: 'mock',
      note: 'Image generation is in mock mode until Replicate API is configured.',
    });
  } catch (error: any) {
    if (error?.code === "FEATURE_DISABLED") {
      return res.status(503).json({
        success: false,
        error: { code: error.code, message: error.message ?? "AI generation is temporarily unavailable" },
      });
    }
    if (error?.code === "RETRY_FAILED") {
      logger.error("Retry failed", { code: error.code });
      return res.status(500).json({
        success: false,
        error: { code: "RETRY_FAILED", message: error.message },
      });
    }
    if (error?.statusCode === 400) {
      return res.status(400).json({
        success: false,
        error: {
          code: error.code ?? "VALIDATION_ERROR",
          message: error.message ?? "Invalid request body",
        },
      });
    }
    if (error?.statusCode === 429) {
      return res.status(429).json({
        success: false,
        error: {
          code: error.code ?? "RATE_LIMIT_EXCEEDED",
          message: error.message ?? "Too many requests. Please try again later.",
        },
      });
    }
    logger.error("Internal error", { error });
    return res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR" },
    });
  }
}
