import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateBatchSchema } from "../lib/validation/generateBatch.schema.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parsed = generateBatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request body",
      details: parsed.error.flatten(),
      results: []
    });
  }

  const { prompts } = parsed.data;

  try {
    // MOCK image generation
    const results = prompts.map((prompt: any, index: number) => ({
      image_role: prompt.image_role || `image_${index}`,
      image_url: `https://via.placeholder.com/512?text=Mock+Image+${index + 1}`,
      status: 'mock_generated',
    }));

    return res.json({
      success: true,
      results,
      source: 'mock',
      note: 'Image generation is in mock mode until Replicate API is configured.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      results: [],
    });
  }
}
