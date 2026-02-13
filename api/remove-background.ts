import type { VercelRequest, VercelResponse } from '@vercel/node';
import { removeBackgroundSchema } from "../lib/validation/removeBackground.schema.js";
import { checkRateLimit } from "../lib/utils/rateLimiter.js";
import { ApiError, handleApiError } from "../lib/utils/apiError.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "unknown";

    const rate = checkRateLimit(ip);

    if (!rate.allowed) {
      throw new ApiError(
        429,
        "RATE_LIMIT_EXCEEDED",
        "Too many requests. Please try again later."
      );
    }

    const parsed = removeBackgroundSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "Invalid request body"
      );
    }

    const { image_url, image_base64 } = parsed.data;

    // Mock behavior: return the same image without modification
    const processedImageUrl = image_url ?? (image_base64 ? "[base64 image provided]" : "");
    return res.json({
      success: true,
      processedImageUrl,
      source: 'mock',
      note: 'Background removal is in mock mode until Replicate API is configured.',
    });
  } catch (error) {
    const handled = handleApiError(error);
    return res.status(handled.statusCode).json(handled.body);
  }
}
