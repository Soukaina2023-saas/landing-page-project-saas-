import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    // Mock behavior: return the same image without modification
    return res.json({
      success: true,
      processedImageUrl: imageUrl,
      source: 'mock',
      note: 'Background removal is in mock mode until Replicate API is configured.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
