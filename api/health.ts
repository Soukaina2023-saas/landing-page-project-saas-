export const config = {
  runtime: 'nodejs',
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createEndpoint } from "../lib/middleware/orchestrator.js";

async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: "ok",
    runtime: "vercel-serverless",
    timestamp: new Date().toISOString()
  });
}

export default createEndpoint({ handler });
