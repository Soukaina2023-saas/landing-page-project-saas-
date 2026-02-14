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
      setTimeout(
        () =>
          reject({
            message: "REQUEST_TIMEOUT",
          }),
        timeoutMs
      );
    });
    return Promise.race([requestFn(), timeoutPromise]);
  };

  const structuredThrow = (originalError: unknown): never => {
    throw {
      code: "RETRY_FAILED",
      statusCode: 500,
      message: "External service failed after retries",
      isOperational: true,
      originalError,
    };
  };

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout();
    } catch (error) {
      lastError = error;
      const statusCode = (error as any)?.statusCode;
      if (statusCode === 400 || statusCode === 429) {
        structuredThrow(lastError);
      }
      if (attempt < retries) {
        continue;
      }
      structuredThrow(lastError);
    }
  }

  return structuredThrow(lastError!);
}
