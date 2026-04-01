export const config = {
  runtime: 'nodejs',
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FEATURE_FLAGS } from "../src/config/featureFlags.js";
import { removeBackgroundSchema } from "../lib/validation/removeBackground.schema.js";
import { ApiError } from "../lib/utils/apiError.js";
import { logger } from "../lib/utils/logger.js";
import { createEndpoint, type OrchestratedRequest } from "../lib/middleware/orchestrator.js";
import {
  checkOperationLimits,
  incrementUsage,
} from "../usage/usage.service.js";

type RemoveBackgroundBody = {
  image_url?: string;
  image_base64?: string;
};

async function handler(req: OrchestratedRequest<RemoveBackgroundBody>, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  logger.info("Incoming request", { endpoint: req.url, method: req.method });

  const parsedBody = req.context?.validatedBody;
  if (!parsedBody) {
    logger.warn("Validation failed", { endpoint: req.url });
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body");
  }
  const { image_url, image_base64 } = parsedBody;

  checkOperationLimits({ imagesRequested: 1, batchSize: 1 });

  if (!FEATURE_FLAGS.ENABLE_BACKGROUND_REMOVAL) {
    throw new ApiError(
      503,
      "FEATURE_DISABLED",
      "Background removal is temporarily unavailable"
    );
  }

  // Mock behavior: return the same image without modification
  const processedImageUrl = image_url ?? (image_base64 ? "[base64 image provided]" : "");
  const usageContext = req.context?.usage;
  if (!usageContext) {
    throw new ApiError(500, "INTERNAL_ERROR", "Missing usage context");
  }
  await incrementUsage(usageContext, 1);
  logger.info("Request successful", { endpoint: req.url });
  return res.json({
    success: true,
    processedImageUrl,
    source: 'mock',
    note: 'Background removal is in mock mode until Replicate API is configured.',
  });
}

export default createEndpoint<RemoveBackgroundBody>({
  auth: true,
  usage: true,
  validation: removeBackgroundSchema,
  rateLimit: true,
  retry: false,
  handler,
});
