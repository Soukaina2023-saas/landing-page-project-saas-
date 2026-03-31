import type { VercelRequest } from "@vercel/node";
import type { RequestContext } from "../../src/lib/auth/context.js";
import { resolveAuthContext } from "../../src/lib/auth/authMiddleware.js";

export function applyAuthContext(req: VercelRequest): RequestContext {
  return resolveAuthContext(req);
}
