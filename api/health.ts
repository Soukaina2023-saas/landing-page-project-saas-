import { getPrisma } from '../lib/db/client.js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

/** Force Node.js runtime — Edge does not fully support Prisma. */
export const runtime = 'nodejs'

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

function connectFailurePayload(err: unknown) {
  if (err !== null && typeof err === 'object') {
    const o = err as {
      message?: unknown
      code?: unknown
      name?: unknown
    }
    return {
      error:
        typeof o.message === 'string'
          ? o.message
          : 'Database connection failed',
      code: typeof o.code === 'string' ? o.code : undefined,
      name: typeof o.name === 'string' ? o.name : undefined,
    }
  }
  return {
    error: 'Database connection failed',
    code: undefined as string | undefined,
    name: undefined as string | undefined,
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    if (!process.env.DATABASE_URL) {
      const body = {
        error: 'DATABASE_URL is not configured',
        code: 'ENV_MISSING' as const,
        phase: 'config' as const,
      }
      console.error('[api/health]', JSON.stringify({ ...body, path: req.url }))
      return res.status(500).json(body)
    }

    const prisma = getPrisma()

    try {
      await prisma.$connect()
    } catch (connectErr: unknown) {
      logHealthError('prisma_connect', connectErr)
      const body = connectFailurePayload(connectErr)
      return res.status(500).json({
        ...body,
        phase: 'prisma_connect',
      })
    }

    return res.status(200).json({
      status: 'ok',
      db: 'connected',
    })
  } catch (err: unknown) {
    logHealthError('unhandled', err)
    const body = connectFailurePayload(err)
    return res.status(500).json({
      ...body,
      phase: 'unhandled',
    })
  }
}
