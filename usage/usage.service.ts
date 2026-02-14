import { ApiError } from "../lib/utils/apiError.js";
import { getUsageRecord, setUsageRecord } from "./usage.store.js";
import {
  BASIC_LIMITS,
  DEMO_LIMITS,
  MAX_BATCH_SIZE,
  MAX_IMAGES_PER_REQUEST,
  PRO_LIMITS,
} from "./limits.config.js";
import type { UsageContext, UsageRecord } from "./usage.types.js";

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

export function resolveUsageContext(_req: { headers?: Record<string, string | string[] | undefined> }): UsageContext {
  const userId = "mock-user";
  const plan: UsageContext["plan"] = "demo";
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const periodKey = `${year}-${month}`;
  return { userId, plan, periodKey };
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

export function checkUserQuota(context: UsageContext, requestedImages: number): void {
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

export function incrementUsage(context: UsageContext, usedImages: number): void {
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
