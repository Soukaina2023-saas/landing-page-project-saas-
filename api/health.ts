import { getPrisma } from '../lib/db/client'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  runtime: 'nodejs',
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
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      error: 'DATABASE_URL is not configured',
      code: 'ENV_MISSING',
      phase: 'config',
    })
  }

  const prisma = getPrisma()

  try {
    await prisma.$connect()
  } catch (connectErr: unknown) {
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
}
