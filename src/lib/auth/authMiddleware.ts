import type { VercelRequest } from "@vercel/node";
import type { RequestContext } from "./context.js";
import { verifyJwt } from "./verifyJwt.js";
import { logger } from "../../../lib/utils/logger.js";

const DEMO_CONTEXT: RequestContext = {
  userId: undefined,
  isAuthenticated: false,
  plan: "demo",
};

// plan is intentionally left as "basic" here — the real plan is resolved
// from the DB inside the usage layer using the userId from this context.

/**
 * Resolves a RequestContext from the incoming request.
 * Never mutates req — returns a plain context object.
 * Falls back to demo mode on missing or invalid tokens.
 */
export function resolveAuthContext(req: VercelRequest): RequestContext {
  const authHeader = req.headers["authorization"];

  if (!authHeader || typeof authHeader !== "string") {
    return DEMO_CONTEXT;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    logger.warn("Malformed Authorization header — falling back to demo mode");
    return DEMO_CONTEXT;
  }

  const token = parts[1];
  const payload = verifyJwt(token);

  if (!payload) {
    return DEMO_CONTEXT;
  }

  logger.info("Authenticated request", { userId: payload.userId });

  return {
    userId: payload.userId,
    isAuthenticated: true,
    plan: "basic",
  };
}
