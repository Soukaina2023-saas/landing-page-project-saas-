import { getPrisma } from '../lib/db/client'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const prisma = getPrisma()
    await prisma.$connect()

    return res.status(200).json({
      status: 'ok',
      db: 'connected'
    })
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || 'Internal Server Error',
      code: err.code
    })
  }
}