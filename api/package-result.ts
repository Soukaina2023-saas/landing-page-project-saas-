import type { VercelRequest, VercelResponse } from '@vercel/node';
import { packageResultSchema } from "../lib/validation/packageResult.schema.js";
import { checkRateLimit } from "../lib/utils/rateLimiter.js";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";

  const rate = checkRateLimit(ip);

  if (!rate.allowed) {
    return res.status(429).json({
      success: false,
      error: "Too many requests. Please try again later."
    });
  }

  try {
    const parsed = packageResultSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
        details: parsed.error.flatten()
      });
    }

    const { html, css, assets } = parsed.data;
    const images = (req.body as Record<string, unknown>)?.images;
    const metadata = (req.body as Record<string, unknown>)?.metadata;

    const singleFile = generateSingleFileHTML(html, images);

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
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
