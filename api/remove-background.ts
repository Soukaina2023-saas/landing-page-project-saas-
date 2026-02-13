import type { VercelRequest, VercelResponse } from '@vercel/node';
import { removeBackgroundSchema } from "../lib/validation/removeBackground.schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const parsed = removeBackgroundSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request body",
        details: parsed.error.flatten()
      });
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
    return res.status(500).json({ error: 'Internal server error' });
  }
}
