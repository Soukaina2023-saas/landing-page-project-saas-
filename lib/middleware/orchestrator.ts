import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ZodType } from "zod";
import type { RequestContext } from "../../src/lib/auth/context.js";
import type { UsageContext } from "../../usage/usage.types.js";
import { ApiError } from "../utils/apiError.js";
import { handleError } from "../utils/errorHandler.js";
import { checkRateLimit } from "../utils/rateLimiter.js";
import { requestWithRetry } from "../utils/requestWithRetry.js";
import { applyAuthContext } from "./auth.middleware.js";
import { applyUsageContext } from "./usage.middleware.js";

export type EndpointRequestContext<T = unknown> = {
  auth?: RequestContext;
  usage?: UsageContext;
  validatedBody?: T;
};

export type OrchestratedRequest<T = unknown> = VercelRequest & {
  context?: EndpointRequestContext<T>;
};

type BodyReader = (req: VercelRequest) => unknown;

type EndpointOptions<TSchema = unknown> = {
  auth?: boolean;
  usage?:
    | boolean
    | {
        requestedUnits?: (req: VercelRequest) => number;
      };
  validation?:
    | ZodType<TSchema>
    | {
        schema: ZodType<TSchema>;
        readBody?: BodyReader;
      };
  rateLimit?: boolean;
  retry?:
    | boolean
    | {
        retries?: number;
        timeoutMs?: number;
      };
  handler: (req: OrchestratedRequest<TSchema>, res: VercelResponse) => Promise<unknown> | unknown;
};

export function createEndpoint<TSchema = unknown>(options: EndpointOptions<TSchema>) {
  return async function endpoint(req: VercelRequest, res: VercelResponse) {
    const request = req as OrchestratedRequest<TSchema>;
    request.context = request.context ?? {};

    try {
      if (options.auth) {
        request.context.auth = applyAuthContext(request);
      }

      if (options.usage) {
        const usageConfig = typeof options.usage === "object" ? options.usage : undefined;
        const requestedUnits = Math.max(1, usageConfig?.requestedUnits?.(request) ?? 1);
        request.context.usage = await applyUsageContext(request, requestedUnits, request.context.auth);
      }

      if (options.validation) {
        const validationConfig =
          "safeParse" in options.validation
            ? { schema: options.validation, readBody: undefined }
            : options.validation;
        const payload = validationConfig.readBody?.(request) ?? request.body;
        const parsed = validationConfig.schema.safeParse(payload);
        if (!parsed.success) {
          throw new ApiError(400, "VALIDATION_ERROR", "Invalid request body");
        }
        request.context.validatedBody = parsed.data;
      }

      if (options.rateLimit) {
        const ip =
          (request.headers["x-forwarded-for"] as string)?.split(",")[0] ||
          request.socket?.remoteAddress ||
          "unknown";
        const rate = checkRateLimit(ip);
        if (!rate.allowed) {
          throw new ApiError(
            429,
            "RATE_LIMIT_EXCEEDED",
            "Too many requests. Please try again later."
          );
        }
      }

      if (options.retry) {
        const retryConfig = typeof options.retry === "object" ? options.retry : undefined;
        await requestWithRetry(
          async () => {
            await options.handler(request, res);
            return true;
          },
          {
            retries: retryConfig?.retries,
            timeoutMs: retryConfig?.timeoutMs,
          }
        );
        return;
      }

      await options.handler(request, res);
    } catch (error) {
      return handleError(error, res);
    }
  };
}
