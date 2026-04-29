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

      // Don't retry auth errors
      if (message.includes("401") || message.includes("403")) throw lastError;

      // Retry on throttling or server errors
      if (attempt < maxRetries && (message.includes("429") || message.includes("5"))) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError;
}
