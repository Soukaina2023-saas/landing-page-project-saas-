import { prisma } from "../db/client.js";

export async function upsertBillingCustomer(params: {
  userId: string;
  provider: string;
  externalId: string;
}) {
  return prisma.billingCustomer.upsert({
    where: {
      userId_provider: { userId: params.userId, provider: params.provider },
    },
    update: { externalId: params.externalId },
    create: {
      userId: params.userId,
      provider: params.provider,
      externalId: params.externalId,
    },
  });
}

export async function recordWebhookEvent(params: {
  provider: string;
  externalId: string;
  type?: string;
  payload: unknown;
  userId?: string;
}) {
  return prisma.billingWebhookEvent.create({
    data: {
      provider: params.provider,
      externalId: params.externalId,
      type: params.type,
      payload: params.payload as any,
      userId: params.userId,
    },
  });
}

export async function markWebhookEventProcessed(id: string) {
  return prisma.billingWebhookEvent.update({
    where: { id },
    data: { processedAt: new Date() },
  });
}

export async function createCreditGrant(params: {
  userId: string;
  subscriptionId?: string;
  periodKey: string;
  amount: number;
  idempotencyKey?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const grant = await tx.creditGrant.create({
      data: {
        userId: params.userId,
        subscriptionId: params.subscriptionId,
        periodKey: params.periodKey,
        amount: params.amount,
      },
    });

    await Promise.all([
      tx.creditBalance.upsert({
        where: { userId: params.userId },
        update: { credits: { increment: params.amount } },
        create: { userId: params.userId, credits: params.amount },
      }),
      tx.creditLedgerEntry.create({
        data: {
          userId: params.userId,
          direction: "CREDIT",
          amount: params.amount,
          reason: "subscription_grant",
          grantId: grant.id,
          idempotencyKey: params.idempotencyKey,
        },
      }),
    ]);

    return grant;
  });
}

export async function createCreditPurchase(params: {
  userId: string;
  credits: number;
  provider?: string;
  externalId?: string;
  currency?: string;
  amountCents?: number;
}) {
  return prisma.creditPurchase.create({
    data: {
      userId: params.userId,
      credits: params.credits,
      provider: params.provider,
      externalId: params.externalId,
      currency: params.currency,
      amountCents: params.amountCents,
      status: "PENDING",
    },
  });
}

export async function markCreditPurchasePaid(params: {
  purchaseId: string;
  idempotencyKey?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.creditPurchase.update({
      where: { id: params.purchaseId },
      data: { status: "PAID", paidAt: new Date() },
    });

    await Promise.all([
      tx.creditBalance.upsert({
        where: { userId: purchase.userId },
        update: { credits: { increment: purchase.credits } },
        create: { userId: purchase.userId, credits: purchase.credits },
      }),
      tx.creditLedgerEntry.create({
        data: {
          userId: purchase.userId,
          direction: "CREDIT",
          amount: purchase.credits,
          reason: "topup_purchase",
          purchaseId: purchase.id,
          idempotencyKey: params.idempotencyKey,
        },
      }),
    ]);

    return purchase;
  });
}

