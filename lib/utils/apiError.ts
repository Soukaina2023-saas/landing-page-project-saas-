import { logger } from "./logger.js";

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  public statusCode: number;
  public code: ErrorCode;

  constructor(statusCode: number, code: ErrorCode, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "VALIDATION_ERROR") {
      logger.warn(error.message, { code: error.code, statusCode: error.statusCode });
    } else if (error.code === "RATE_LIMIT_EXCEEDED") {
      logger.warn(error.message, { code: error.code, statusCode: error.statusCode });
    } else {
      logger.error(error.message, { code: error.code, statusCode: error.statusCode });
    }
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      }
    };
  }

  logger.error("Unhandled error", { error });
  return {
    statusCode: 500,
    body: {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong"
      }
    }
  };
}
