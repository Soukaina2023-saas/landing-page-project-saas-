import {
  OPERATION_COSTS,
  InsufficientCreditsError,
  ReservationAlreadySettledError,
  ReservationNotFoundError,
} from "./credits.types.js";
import type {
  CreditCostInput,
  CreditOperation,
  ReserveCreditsResult,
} from "./credits.types.js";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  createReservation,
  getBalance,
  getBalanceForUpdate,
  getReservationForUpdate,
  prisma,
  settleReservation,
  upsertBalance,
} from "./credits.repository.js";
import { logger } from "../utils/logger.js";

const RESERVATION_TTL_MS = 5 * 60 * 1000;

/** Prevents read–modify–write races on balance + reservation rows under concurrent requests. */
const SERIALIZABLE = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
} as const;

export function calculateCost(
  operation: CreditOperation,
  input?: CreditCostInput
): number {
  const base = OPERATION_COSTS[operation];

  if (operation === "generate_batch") {
    const batchSize =
      typeof (input as any)?.batchSize === "number" ? (input as any).batchSize : 1;
    return Math.max(0, base * Math.max(1, batchSize));
  }

  if (operation === "generate_prompts") {
    const imagesRequested =
      typeof (input as any)?.imagesRequested === "number"
        ? (input as any).imagesRequested
        : 1;
    return Math.max(0, base * Math.max(1, imagesRequested));
  }

  return base;
}

export async function checkBalance(userId: string, cost: number): Promise<void> {
  const balance = await getBalance(userId);
  const currentBalance = balance?.credits ?? 0;
  if (currentBalance < cost) {
    throw new InsufficientCreditsError(currentBalance, cost);
  }
}

export async function reserveCredits(
  userId: string,
  cost: number,
  idempotencyKey: string
): Promise<ReserveCreditsResult> {
  const reserveKey = `reserve:${idempotencyKey}`;

  try {
    return await prisma.$transaction(
      async (tx) => {
        const existing = await tx.creditLedgerEntry.findUnique({
          where: { idempotencyKey: reserveKey },
          select: { reservationId: true },
        });

        if (existing?.reservationId) {
          logger.info("credits.reserve.idempotent_hit", {
            userId,
            reservationId: existing.reservationId,
          });
          return { reservationId: existing.reservationId };
        }

        const balance = await getBalanceForUpdate(tx, userId);
        const currentBalance = balance?.credits ?? 0;

        if (currentBalance < cost) {
          throw new InsufficientCreditsError(currentBalance, cost);
        }

        const expiresAt = new Date(Date.now() + RESERVATION_TTL_MS);

        const [reservation] = await Promise.all([
          createReservation(tx, userId, cost, expiresAt),
          upsertBalance(tx, userId, -cost),
        ]);

        await tx.creditLedgerEntry.create({
          data: {
            userId,
            direction: "DEBIT",
            amount: cost,
            reason: "reservation_hold",
            reservationId: reservation.id,
            idempotencyKey: reserveKey,
          },
        });

        logger.info("credits.reserve.ok", {
          userId,
          reservationId: reservation.id,
        });

        return {
          reservationId: reservation.id,
        };
      },
      SERIALIZABLE
    );
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
      const existing = await prisma.creditLedgerEntry.findUnique({
        where: { idempotencyKey: reserveKey },
        select: { reservationId: true },
      });
      if (existing?.reservationId) {
        logger.info("credits.reserve.idempotent_race_resolved", {
          userId,
          reservationId: existing.reservationId,
        });
        return { reservationId: existing.reservationId };
      }
    }
    throw e;
  }
}

export async function finalizeCredits(
  reservationId: string,
  generationRequestId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const finalizeKey = `finalize:${reservationId}`;
    const existing = await tx.creditLedgerEntry.findUnique({
      where: { idempotencyKey: finalizeKey },
      select: { id: true },
    });
    if (existing) {
      logger.info("credits.finalize.idempotent_hit", {
        reservationId,
        generationRequestId,
      });
      return;
    }

    const reservation = await getReservationForUpdate(tx, reservationId);

    if (!reservation) {
      throw new ReservationNotFoundError(reservationId);
    }

    if (reservation.status !== "PENDING") {
      if (reservation.status === "FINALIZED") {
        // If already finalized but ledger key missing (legacy), write it once.
        await tx.creditLedgerEntry.create({
          data: {
            userId: reservation.userId,
            direction: "DEBIT",
            amount: 0,
            reason: "reservation_finalize",
            reservationId,
            generationRequestId,
            idempotencyKey: finalizeKey,
          },
        });
        logger.info("credits.finalize.ok_already_finalized", {
          reservationId,
          generationRequestId,
        });
        return;
      }
      throw new ReservationAlreadySettledError(
        reservationId,
        reservation.status
      );
    }

    await settleReservation(tx, reservationId, "FINALIZED");

    // No balance movement here (balance already decremented at reservation time).
    // We still record an audit entry to make settlement explicit.
    await tx.creditLedgerEntry.create({
      data: {
        userId: reservation.userId,
        direction: "DEBIT",
        amount: 0,
        reason: "reservation_finalize",
        reservationId,
        generationRequestId,
        idempotencyKey: finalizeKey,
      },
    });

    logger.info("credits.finalize.ok", { reservationId, generationRequestId });
  }, SERIALIZABLE);
}

export async function rollbackCredits(reservationId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const rollbackKey = `rollback:${reservationId}`;
    const existing = await tx.creditLedgerEntry.findUnique({
      where: { idempotencyKey: rollbackKey },
      select: { id: true },
    });
    if (existing) {
      logger.info("credits.rollback.idempotent_hit", { reservationId });
      return;
    }

    const reservation = await getReservationForUpdate(tx, reservationId);

    if (!reservation) {
      throw new ReservationNotFoundError(reservationId);
    }

    if (reservation.status !== "PENDING") {
      if (reservation.status === "ROLLED_BACK") {
        logger.info("credits.rollback.ok_already_rolled_back", {
          reservationId,
        });
        return;
      }
      throw new ReservationAlreadySettledError(
        reservationId,
        reservation.status
      );
    }

    await Promise.all([
      settleReservation(tx, reservationId, "ROLLED_BACK"),
      upsertBalance(tx, reservation.userId, reservation.amount),
    ]);

    await tx.creditLedgerEntry.create({
      data: {
        userId: reservation.userId,
        direction: "CREDIT",
        amount: reservation.amount,
        reason: "reservation_rollback",
        reservationId,
        idempotencyKey: rollbackKey,
      },
    });

    logger.info("credits.rollback.ok", { reservationId });
  }, SERIALIZABLE);
}
