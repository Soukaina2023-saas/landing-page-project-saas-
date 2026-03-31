import { isDemoMode } from "../src/config/runtime.js";
import { ApiError } from "../lib/utils/apiError.js";
import { prisma } from "../lib/db/client.js";
import { getUsageRecord, setUsageRecord } from "./usage.store.js";
import { getUsage, incrementImages, incrementRequests } from "../lib/usage/usage.repository.js";
import {
  BASIC_LIMITS,
  DEMO_LIMITS,
  MAX_BATCH_SIZE,
  MAX_IMAGES_PER_REQUEST,
  PRO_LIMITS,
} from "./limits.config.js";
import type { RequestContext } from "../src/lib/auth/context.js";
import type { UsageContext, UsagePlan, UsageRecord } from "./usage.types.js";

function getLimitsForPlan(plan: UsageContext["plan"]) {
  switch (plan) {
    case "demo":
      return DEMO_LIMITS;
    case "basic":
      return BASIC_LIMITS;
    case "pro":
      return PRO_LIMITS;
    default:
      return DEMO_LIMITS;
  }
}

function buildPeriodKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function mapDbPlanToUsagePlan(dbPlan: string): UsagePlan {
  switch (dbPlan.toUpperCase()) {
    case "BASIC":
      return "basic";
    case "PRO":
      return "pro";
    case "AGENCY":
      return "agency";
    default:
      return "demo";
  }
}

export async function resolveUsageContext(
  _req: { headers?: Record<string, string | string[] | undefined> },
  authContext?: RequestContext
): Promise<UsageContext> {
  const periodKey = buildPeriodKey();

  // Demo mode ENV flag overrides everything
  if (isDemoMode) {
    return { userId: "demo-user", plan: "demo", periodKey };
  }

  // No authenticated user — fall back to demo
  if (!authContext?.isAuthenticated || !authContext.userId) {
    return { userId: "demo-user", plan: "demo", periodKey };
  }

  const userId = authContext.userId;

  // Fetch real plan from DB
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const plan: UsagePlan = user ? mapDbPlanToUsagePlan(user.plan) : "demo";
    return { userId, plan, periodKey };
  } catch {
    // DB unavailable — fall back to demo to avoid blocking the request
    return { userId, plan: "demo", periodKey };
  }
}

export function checkOperationLimits(input: { imagesRequested?: number; batchSize?: number }): void {
  if (input.imagesRequested != null && input.imagesRequested > MAX_IMAGES_PER_REQUEST) {
    throw new ApiError(
      400,
      "OPERATION_LIMIT_EXCEEDED",
      `Images per request must not exceed ${MAX_IMAGES_PER_REQUEST}`
    );
  }
  if (input.batchSize != null && input.batchSize > MAX_BATCH_SIZE) {
    throw new ApiError(
      400,
      "OPERATION_LIMIT_EXCEEDED",
      `Batch size must not exceed ${MAX_BATCH_SIZE}`
    );
  }
}

export function checkUserQuota(context: UsageContext, requestedImages: number): void | Promise<void> {
  if (context.plan !== "demo") {
    return checkUserQuotaFromDb(context, requestedImages);
  }

  const key = `${context.userId}:${context.periodKey}`;
  const existing = getUsageRecord(key);
  const record: UsageRecord = existing ?? {
    requestCount: 0,
    imageCount: 0,
    lastUpdated: 0,
  };
  const limits = getLimitsForPlan(context.plan);

  if (record.requestCount + 1 > limits.maxRequests) {
    throw new ApiError(
      429,
      "USAGE_LIMIT_EXCEEDED",
      "Request limit exceeded for this period"
    );
  }
  if (record.imageCount + requestedImages > limits.maxImages) {
    throw new ApiError(
      429,
      "USAGE_LIMIT_EXCEEDED",
      "Image quota exceeded for this period"
    );
  }
}

async function checkUserQuotaFromDb(context: UsageContext, requestedImages: number): Promise<void> {
  const record = await getUsage(context.userId, context.periodKey);
  const current = record ?? {
    requestCount: 0,
    imageCount: 0,
    lastUpdated: 0,
  };
  const limits = getLimitsForPlan(context.plan);

  if (current.requestCount + 1 > limits.maxRequests) {
    throw new ApiError(
      429,
      "USAGE_LIMIT_EXCEEDED",
      "Request limit exceeded for this period"
    );
  }
  if (current.imageCount + requestedImages > limits.maxImages) {
    throw new ApiError(
      429,
      "USAGE_LIMIT_EXCEEDED",
      "Image quota exceeded for this period"
    );
  }
}

export function incrementUsage(context: UsageContext, usedImages: number): void | Promise<void> {
  if (context.plan !== "demo") {
    return incrementUsageInDb(context, usedImages);
  }

  const key = `${context.userId}:${context.periodKey}`;
  const existing = getUsageRecord(key);
  const now = Date.now();
  const record: UsageRecord = existing
    ? {
        requestCount: existing.requestCount + 1,
        imageCount: existing.imageCount + usedImages,
        lastUpdated: now,
      }
    : {
        requestCount: 1,
        imageCount: usedImages,
        lastUpdated: now,
      };
  setUsageRecord(key, record);
}

async function incrementUsageInDb(context: UsageContext, usedImages: number): Promise<void> {
  await incrementRequests(context.userId, context.periodKey);
  await incrementImages(context.userId, context.periodKey, usedImages);
}
