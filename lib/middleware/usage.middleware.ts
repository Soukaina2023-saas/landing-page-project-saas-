import type { VercelRequest } from "@vercel/node";
import type { RequestContext } from "../../src/lib/auth/context.js";
import { checkUserQuota, resolveUsageContext } from "../../usage/usage.service.js";
import type { UsageContext } from "../../usage/usage.types.js";

export async function applyUsageContext(
  req: VercelRequest,
  requestedUnits: number,
  authContext?: RequestContext
): Promise<UsageContext> {
  const usageContext = await resolveUsageContext(req, authContext);
  await checkUserQuota(usageContext, requestedUnits);
  return usageContext;
}
