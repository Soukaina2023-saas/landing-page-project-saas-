import { getPrisma } from '../lib/db/client'

export const config = {
  runtime: 'nodejs',
}

export default async function handler(req, res) {
  try {
    const prisma = getPrisma()
    await prisma.$connect()

    return res.status(200).json({
      status: 'ok',
      db: 'connected'
    })
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      code: error.code
    })
  }
}