import jwt from "jsonwebtoken";
import { logger } from "../../../lib/utils/logger.js";

export type JwtPayload = {
  userId: string;
  iat?: number;
  exp?: number;
};

const JWT_SECRET = process.env.JWT_SECRET ?? "";

/**
 * Verifies a JWT token and returns the decoded payload.
 * Returns null on any verification failure — never throws.
 */
export function verifyJwt(token: string): JwtPayload | null {
  if (!JWT_SECRET) {
    logger.warn("JWT_SECRET is not configured — all tokens will be rejected");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.userId || typeof decoded.userId !== "string") {
      logger.warn("JWT payload missing userId field");
      return null;
    }

    return decoded;
  } catch (error) {
    logger.warn("JWT verification failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}
