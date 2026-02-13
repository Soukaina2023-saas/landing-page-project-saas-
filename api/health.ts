import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleError } from "../lib/utils/errorHandler.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    res.status(200).json({
      status: "ok",
      runtime: "vercel-serverless",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleError(error, res);
  }
}
