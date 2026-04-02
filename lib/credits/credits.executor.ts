import type { CreditOperation } from "./credits.types.js";
import {
  calculateCost,
  checkBalance,
  finalizeCredits,
  reserveCredits,
  rollbackCredits,
} from "./credits.service.js";
import { logger } from "../utils/logger.js";

interface ExecuteWithCreditsParams<T> {
  userId: string;
  operation: CreditOperation;
  handler: () => Promise<T>;
  idempotencyKey: string;
  generationRequestId: string;
}

interface ExecuteWithCreditsResult<T> {
  result: T;
  creditsUsed: number;
  remainingBalance: number;
}

export async function executeWithCredits<T>({
  userId,
  operation,
  handler,
  idempotencyKey,
  generationRequestId,
}: ExecuteWithCreditsParams<T>): Promise<ExecuteWithCreditsResult<T>> {
  const cost = calculateCost(operation);

  await checkBalance(userId, cost);

  const { reservationId } = await reserveCredits(userId, cost, idempotencyKey);

  let result: T;
  try {
    result = await handler();
  } catch (handlerError) {
    await rollbackCredits(reservationId).catch((rollbackErr) => {
      logger.error("credits.rollback.failed", {
        reservationId,
        err:
          rollbackErr instanceof Error
            ? rollbackErr.message
            : String(rollbackErr),
      });
    });
    throw handlerError;
  }

  await finalizeCredits(reservationId, generationRequestId);

  return { result, creditsUsed: cost, remainingBalance: -1 };
}
