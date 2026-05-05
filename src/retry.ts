export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { maxRetries?: number; initialDelay?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const initialDelay = options?.initialDelay ?? 1000;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const message = lastError.message || "";
      const statusCode = (error as any).statusCode || (error as any).code || 0;

      // Don't retry auth errors
      if (statusCode === 401 || statusCode === 403 || message.includes("401") || message.includes("403")) throw lastError;

      // Retry on throttling (429) or server errors (5xx)
      const isThrottle = statusCode === 429 || message.includes("429") || message.includes("Rate Limit");
      const isServerError = statusCode >= 500 || /\b5\d{2}\b/.test(message);
      if (attempt < maxRetries && (isThrottle || isServerError)) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
}
