import type { VercelRequest, VercelResponse } from '@vercel/node';
import { removeBackgroundSchema } from "../lib/validation/removeBackground.schema.js";
import { checkRateLimit } from "../lib/utils/rateLimiter.js";
import { ApiError, handleApiError } from "../lib/utils/apiError.js";
import { logger } from "../lib/utils/logger.js";

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

    const parsed = removeBackgroundSchema.safeParse(req.body);

    if (!parsed.success) {
      logger.warn("Validation failed", { endpoint: req.url });
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Invalid request body"
      );
    }

    const { image_url, image_base64 } = parsed.data;

    // Mock behavior: return the same image without modification
    const processedImageUrl = image_url ?? (image_base64 ? "[base64 image provided]" : "");
    logger.info("Request successful", { endpoint: req.url });
    return res.json({
      success: true,
      processedImageUrl,
      source: 'mock',
      note: 'Background removal is in mock mode until Replicate API is configured.',
    });
  } catch (error) {
    logger.error("Unhandled error", { error });
    const handled = handleApiError(error);
    return res.status(handled.statusCode).json(handled.body);
  }
}
