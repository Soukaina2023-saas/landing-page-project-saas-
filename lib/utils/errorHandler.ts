import { logger } from "./logger.js";

export function handleError(error: any, res: any) {
  if (error?.name === "ZodError") {
    logger.warn("Invalid request body", { error });
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request body"
      }
    });
    return;
  }

  if (error?.code === "VALIDATION_ERROR") {
    logger.warn(error?.message ?? "Invalid request body", { error });
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: error?.message ?? "Invalid request body"
      }
    });
    return;
  }

  if (error?.statusCode === 429 || error?.code === "RATE_LIMIT_EXCEEDED") {
    logger.warn(error?.message ?? "Too many requests", { error });
    res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later."
      }
    });
    return;
  }

  if (error?.code === "RETRY_FAILED") {
    logger.error(error?.message ?? "External service failed after retries", { error });
    res.status(500).json({
      success: false,
      error: {
        code: "RETRY_FAILED",
        message: error?.message ?? "External service failed after retries"
      }
    });
    return;
  }

  logger.error("Unhandled error", { error });
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong"
    }
  });
}
