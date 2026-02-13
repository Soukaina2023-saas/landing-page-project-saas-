import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateBatchSchema } from "../lib/validation/generateBatch.schema.js";
import { checkRateLimit } from "../lib/utils/rateLimiter.js";
import { ApiError, handleApiError } from "../lib/utils/apiError.js";
import { logger } from "../lib/utils/logger.js";
import { requestWithRetry } from "../lib/utils/requestWithRetry.js";

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

    await requestWithRetry(
      async () => {
        // Simulate unstable external API
        if (Math.random() < 0.5) {
          throw new Error("Simulated API failure");
        }
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

    logger.info("Request successful", { endpoint: req.url });
    return res.json({
      success: true,
      results,
      source: 'mock',
      note: 'Image generation is in mock mode until Replicate API is configured.',
    });
  } catch (error) {
    logger.error("Unhandled error", { error });
    const handled = handleApiError(error);
    return res.status(handled.statusCode).json(handled.body);
  }
}
