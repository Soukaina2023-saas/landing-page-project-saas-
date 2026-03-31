import { prisma } from "../db/client.js";
import type { UsageRecord } from "../../usage/usage.types.js";

function toUsageRecord(usage: { requests: number; images: number; updatedAt: Date }): UsageRecord {
  return {
    requestCount: usage.requests,
    imageCount: usage.images,
    lastUpdated: usage.updatedAt.getTime(),
  };
}

export async function getUsage(userId: string, periodKey: string): Promise<UsageRecord | undefined> {
  const usage = await prisma.usage.findUnique({
    where: {
      userId_periodKey: { userId, periodKey },
    },
  });

  return usage ? toUsageRecord(usage) : undefined;
}

export async function incrementRequests(userId: string, periodKey: string): Promise<UsageRecord> {
  const usage = await prisma.usage.upsert({
    where: {
      userId_periodKey: { userId, periodKey },
    },
    update: {
      requests: { increment: 1 },
    },
    create: {
      userId,
      periodKey,
      requests: 1,
      images: 0,
    },
  });

  return toUsageRecord(usage);
}

export async function incrementImages(userId: string, periodKey: string, amount: number): Promise<UsageRecord> {
  const usage = await prisma.usage.upsert({
    where: {
      userId_periodKey: { userId, periodKey },
    },
    update: {
      images: { increment: amount },
    },
    create: {
      userId,
      periodKey,
      requests: 0,
      images: amount,
    },
  });

  return toUsageRecord(usage);
}
