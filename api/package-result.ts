export const config = {
  runtime: 'nodejs',
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { packageResultSchema } from "../lib/validation/packageResult.schema.js";
import { ApiError } from "../lib/utils/apiError.js";
import { logger } from "../lib/utils/logger.js";
import { createEndpoint, type OrchestratedRequest } from "../lib/middleware/orchestrator.js";

function generateSingleFileHTML(html: string, images: unknown): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600&display=swap" rel="stylesheet">
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Cairo',sans-serif;font-weight:600}</style>
</head>
<body>
${html}
</body>
</html>`;
}

type PackageResultBody = {
  html: string;
  css?: string;
  assets?: unknown;
  images?: unknown;
  metadata?: unknown;
};

async function handler(req: OrchestratedRequest<PackageResultBody>, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  logger.info("Incoming request", { endpoint: req.url, method: req.method });
  const parsedBody = req.context?.validatedBody;
  if (!parsedBody) {
    logger.warn("Validation failed", { endpoint: req.url });
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body");
  }

  const { html, css, assets } = parsedBody;
  const images = parsedBody.images;
  const metadata = parsedBody.metadata;

  const singleFile = generateSingleFileHTML(html, images);

  logger.info("Request successful", { endpoint: req.url });
  return res.json({
    success: true,
    package: {
      html,
      images,
      metadata,
      export: {
        singleFile,
        structured: { html, images, metadata },
      },
      timestamp: new Date().toISOString(),
    },
  });
}

export default createEndpoint<PackageResultBody>({
  auth: true,
  validation: packageResultSchema,
  rateLimit: true,
  retry: false,
  handler,
});
