import { getPrisma } from '../lib/db/client.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

/** Force Node.js runtime — Edge does not fully support Prisma. */
export const runtime = 'nodejs'

/** Dummy config to nudge a clean re-bundle on Vercel (Next-style shape; harmless for @vercel/node). */
export const config = { api: { bodyParser: false } }

function logHealthError(phase: string, err: unknown) {
  const payload: Record<string, unknown> = {
    phase,
    timestamp: new Date().toISOString(),
  }
  if (err instanceof Error) {
    payload.name = err.name
    payload.message = err.message
    payload.stack = err.stack
    const cause = (err as Error & { cause?: unknown }).cause
    if (cause !== undefined) {
      payload.cause =
        cause instanceof Error
          ? { name: cause.name, message: cause.message, stack: cause.stack }
          : String(cause)
    }
  } else {
    payload.raw = typeof err === 'object' ? JSON.stringify(err) : String(err)
  }
  console.error('[api/health]', JSON.stringify(payload, null, 2))
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('[api/health]', JSON.stringify({ phase: 'config', path: req.url }))
      return res.status(500).json({ status: 'error' })
    }

    const prisma = getPrisma()

    try {
      await prisma.$connect()
    } catch (connectErr: unknown) {
      logHealthError('prisma_connect', connectErr)
      return res.status(503).json({ status: 'error' })
    }

    return res.status(200).json({
      status: 'ok',
    })
  } catch (err: unknown) {
    logHealthError('unhandled', err)
    return res.status(500).json({ status: 'error' })
  }
}
