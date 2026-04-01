import { prisma } from "../db/client.js";
import type { PrismaClient } from "@prisma/client";
import type {
  CreditBalance,
  CreditReservation,
  ReservationStatus,
} from "./credits.types.js";

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

function toReservationStatus(raw: string): ReservationStatus {
  if (raw === "PENDING" || raw === "FINALIZED" || raw === "ROLLED_BACK") {
    return raw;
  }
  throw new Error(`Unknown reservation status: ${raw}`);
}

export async function getBalance(userId: string): Promise<CreditBalance | null> {
  const row = await prisma.creditBalance.findUnique({ where: { userId } });
  if (!row) return null;
  return row;
}

export async function getBalanceForUpdate(
  tx: TxClient,
  userId: string
): Promise<CreditBalance | null> {
  const row = await tx.creditBalance.findUnique({ where: { userId } });
  if (!row) return null;
  return row;
}

export async function upsertBalance(
  tx: TxClient,
  userId: string,
  delta: number
): Promise<CreditBalance> {
  return tx.creditBalance.upsert({
    where: { userId },
    update: { credits: { increment: delta } },
    create: { userId, credits: Math.max(0, delta) },
  });
}

export async function createReservation(
  tx: TxClient,
  userId: string,
  amount: number,
  expiresAt: Date
): Promise<CreditReservation> {
  const row = await tx.creditReservation.create({
    data: { userId, amount, expiresAt },
  });
  return {
    ...row,
    status: toReservationStatus(row.status),
  };
}

export async function getReservation(
  reservationId: string
): Promise<CreditReservation | null> {
  const row = await prisma.creditReservation.findUnique({
    where: { id: reservationId },
  });
  if (!row) return null;
  return {
    ...row,
    status: toReservationStatus(row.status),
  };
}

export async function getReservationForUpdate(
  tx: TxClient,
  reservationId: string
): Promise<CreditReservation | null> {
  const row = await tx.creditReservation.findUnique({
    where: { id: reservationId },
  });
  if (!row) return null;
  return {
    ...row,
    status: toReservationStatus(row.status),
  };
}

export async function settleReservation(
  tx: TxClient,
  reservationId: string,
  status: "FINALIZED" | "ROLLED_BACK"
): Promise<CreditReservation> {
  const row = await tx.creditReservation.update({
    where: { id: reservationId },
    data: {
      status,
      finalizedAt: new Date(),
    },
  });
  return {
    ...row,
    status: toReservationStatus(row.status),
  };
}

export { prisma };
