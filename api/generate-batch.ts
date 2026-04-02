export const config = {
  runtime: 'nodejs',
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FEATURE_FLAGS } from "../src/config/featureFlags.js";
import { generateBatchSchema } from "../lib/validation/generateBatch.schema.js";
import { ApiError } from "../lib/utils/apiError.js";
import { logger } from "../lib/utils/logger.js";
import { requestWithRetry } from "../lib/utils/requestWithRetry.js";
import { createEndpoint, type OrchestratedRequest } from "../lib/middleware/orchestrator.js";
import {
  checkOperationLimits,
  incrementUsage,
} from "../usage/usage.service.js";
import { prisma } from "../lib/db/client.js";
import {
  calculateCost,
  checkBalance,
  finalizeCredits,
  reserveCredits,
  rollbackCredits,
} from "../lib/credits/credits.service.js";
import type { CreditOperation } from "../lib/credits/credits.types.js";
import { randomUUID } from "node:crypto";

const LOW_BALANCE_THRESHOLD = 0.2;

type GenerateBatchBody = {
  prompts: Array<{ image_role?: string; prompt_text: string; aspect_ratio?: string }>;
  batchSize?: number;
};

async function handler(req: OrchestratedRequest<GenerateBatchBody>, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  logger.info("Incoming request", { endpoint: req.url, method: req.method });

  const parsedBody = req.context?.validatedBody;
  if (!parsedBody) {
    logger.warn("Validation failed", { endpoint: req.url });
    throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body");
  }

  const { prompts } = parsedBody;
  const input = { batchSize: parsedBody.batchSize ?? prompts.length };
  checkOperationLimits({
    imagesRequested: input.batchSize ?? 1,
    batchSize: input.batchSize ?? 1,
  });
  if (!FEATURE_FLAGS.ENABLE_AI_GENERATION) {
    throw new ApiError(
      503,
      "FEATURE_DISABLED",
      "AI generation is temporarily unavailable"
    );
  }

  const usageContext = req.context?.usage;
  if (!usageContext) {
    throw new ApiError(500, "INTERNAL_ERROR", "Missing usage context");
  }

  const userId = req.context?.auth?.userId;
  const useCredits = FEATURE_FLAGS.ENABLE_CREDIT_SYSTEM && userId;

  const coreLogic = async () => {
    await requestWithRetry(
      async () => {
        return "ok";
      },
      {
        retries: 2,
        timeoutMs: 3000
      }
    );

    const results = prompts.map((prompt: any, index: number) => ({
      image_role: prompt.image_role || `image_${index}`,
      image_url: `https://via.placeholder.com/512?text=Mock+Image+${index + 1}`,
      status: 'mock_generated',
    }));

    await incrementUsage(usageContext, input.batchSize ?? 1);

    return {
      success: true,
      results,
      source: 'mock' as const,
      note: 'Image generation is in mock mode until Replicate API is configured.',
    };
  };

  let responsePayload;

  if (useCredits) {
    const operation: CreditOperation = "generate_batch";
    const requiredCredits = calculateCost(operation, { batchSize: input.batchSize });

    const headerKey = req.headers?.["x-idempotency-key"];
    const idempotencyKey =
      typeof headerKey === "string" && headerKey.trim().length > 0
        ? headerKey.trim()
        : randomUUID();

    const generationRequest = await prisma.generationRequest.create({
      data: {
        userId,
        operation,
        status: "CREATED",
        input: parsedBody as any,
        idempotencyKey,
      },
      select: { id: true },
    });

    await checkBalance(userId, requiredCredits);

    let reservationId: string | undefined;

    try {
      const { reservationId: rid } = await reserveCredits(
        userId,
        requiredCredits,
        idempotencyKey
      );
      reservationId = rid;

      if (process.env.CREDIT_DEBUG_INJECT_AFTER_RESERVE === "1") {
        throw new Error("Injected failure after reserveCredits");
      }

      await prisma.generationRequest.update({
        where: { id: generationRequest.id },
        data: {
          creditReservationId: reservationId,
          status: "RUNNING",
        },
      });

      const result = await coreLogic();

      await prisma.generationRequest.update({
        where: { id: generationRequest.id },
        data: { status: "SUCCEEDED" },
      });

      await finalizeCredits(reservationId, generationRequest.id);

      const balance = await prisma.creditBalance.findUnique({
        where: { userId },
        select: { credits: true },
      });
      const remainingBalance = balance?.credits ?? 0;

      const lowBalanceWarning =
        remainingBalance <= requiredCredits * LOW_BALANCE_THRESHOLD;

      responsePayload = {
        ...result,
        credits: {
          used: requiredCredits,
          remaining: remainingBalance,
          requiredCredits,
          ...(lowBalanceWarning && { warning: true }),
        },
      };
    } catch (err) {
      await prisma.generationRequest
        .update({
          where: { id: generationRequest.id },
          data: { status: "FAILED" },
        })
        .catch(() => {});

      if (reservationId) {
        await rollbackCredits(reservationId).catch((rollbackErr) => {
          logger.error("credits.rollback.failed", {
            reservationId,
            err:
              rollbackErr instanceof Error
                ? rollbackErr.message
                : String(rollbackErr),
          });
        });
      }
      throw err;
    }
  } else {
    responsePayload = await coreLogic();
  }

  logger.info("Request successful", { endpoint: req.url });
  return res.json(responsePayload);
}

export default createEndpoint<GenerateBatchBody>({
  auth: true,
  usage: {
    requestedUnits: (req) => {
      const body = (req.body ?? {}) as { batchSize?: number; prompts?: unknown[] };
      return body.batchSize ?? body.prompts?.length ?? 1;
    },
  },
  validation: generateBatchSchema,
  rateLimit: true,
  retry: false,
  handler,
});
