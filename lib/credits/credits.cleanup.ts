import { prisma } from "./credits.repository.js";
import { rollbackCredits } from "./credits.service.js";
import { ReservationAlreadySettledError } from "./credits.types.js";
import { logger } from "../utils/logger.js";

export interface CleanupExpiredReservationsResult {
  /** Rows matching PENDING + expired at query time */
  scanned: number;
  /** `rollbackCredits` completed without throwing (includes idempotent no-ops inside rollback) */
  released: number;
  /** Count of rows where rollback threw (see `failures`) */
  failed: number;
  failures: Array<{ reservationId: string; message: string }>;
}

/**
 * Releases credits held on expired PENDING reservations by delegating to {@link rollbackCredits}.
 *
 * Safe to run on a schedule or manually, including concurrent overlapping runs: rollback is
 * idempotent (ledger key `rollback:{id}`) and uses Serializable transactions.
 */
export async function cleanupExpiredReservations(): Promise<CleanupExpiredReservationsResult> {
  const now = new Date();

  const expired = await prisma.creditReservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
    },
    select: {
      id: true,
      userId: true,
      amount: true,
      expiresAt: true,
    },
    orderBy: { expiresAt: "asc" },
  });

  logger.info("credits.cleanup.start", {
    scanned: expired.length,
    asOf: now.toISOString(),
  });

  const failures: Array<{ reservationId: string; message: string }> = [];
  let released = 0;

  for (const row of expired) {
    try {
      await rollbackCredits(row.id);
      released++;
      logger.info("credits.cleanup.released", {
        reservationId: row.id,
        userId: row.userId,
        amount: row.amount,
        expiresAt: row.expiresAt.toISOString(),
      });
    } catch (e) {
      if (
        e instanceof ReservationAlreadySettledError &&
        e.currentStatus === "FINALIZED"
      ) {
        logger.info("credits.cleanup.skip_finalized", {
          reservationId: row.id,
        });
        continue;
      }

      const message = e instanceof Error ? e.message : String(e);
      failures.push({ reservationId: row.id, message });
      logger.error("credits.cleanup.rollback_failed", {
        reservationId: row.id,
        userId: row.userId,
        err: message,
      });
    }
  }

  const failed = failures.length;

  logger.info("credits.cleanup.done", {
    scanned: expired.length,
    released,
    failed,
  });

  return {
    scanned: expired.length,
    released,
    failed,
    failures,
  };
}
