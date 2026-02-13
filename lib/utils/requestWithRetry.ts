import { logger } from "./logger.js";

export async function requestWithRetry<T>(
  requestFn: () => Promise<T>,
  options?: {
    retries?: number;
    timeoutMs?: number;
  }
): Promise<T> {
  const retries = options?.retries ?? 2;
  const timeoutMs = options?.timeoutMs ?? 8000;

  const withTimeout = (): Promise<T> => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), timeoutMs);
    });
    return Promise.race([requestFn(), timeoutPromise]);
  };

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        logger.warn("Retry attempt", { attempt: attempt + 1, retries, error });
      } else {
        logger.error("All retries failed", { retries, error });
        throw error;
      }
    }
  }

  throw lastError;
}
