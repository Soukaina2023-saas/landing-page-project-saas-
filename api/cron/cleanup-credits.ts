import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cleanupExpiredReservations } from '../../lib/credits/credits.cleanup.js'
import { logger } from '../../lib/utils/logger.js'

/** Force Node.js runtime — Prisma and cleanup must run on Node. */
export const runtime = 'nodejs'

export const config = { api: { bodyParser: false } }

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    logger.error('cron.cleanup-credits.misconfigured', {
      reason: 'CRON_SECRET is not set',
    })
    return res.status(500).json({
      error: 'CRON_SECRET not configured',
    })
  }

  const rawAuth = req.headers.authorization
  const auth = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth

  if (auth !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }

  try {
    const result = await cleanupExpiredReservations()
    logger.info('cron.cleanup-credits.completed', result)
    return res.status(200).json({
      ok: true,
      scanned: result.scanned,
      released: result.released,
      failed: result.failed,
      failures: result.failures,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('cron.cleanup-credits.unhandled', { err: message })
    return res.status(500).json({
      ok: false,
      error: 'Cleanup failed',
    })
  }
}
