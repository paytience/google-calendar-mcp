import { describe, it, expect, vi } from "vitest";
import { withRetry } from "../retry.js";

describe("withRetry", () => {
  it("returns result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on 429 errors", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429 Too Many Requests"))
      .mockResolvedValue("ok");

    const result = await withRetry(fn, { maxRetries: 2, initialDelay: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on 500 errors", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("500 Internal Server Error"))
      .mockResolvedValue("ok");

    const result = await withRetry(fn, { maxRetries: 2, initialDelay: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not retry on 401 errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("401 Unauthorized"));

    await expect(withRetry(fn, { maxRetries: 3, initialDelay: 1 })).rejects.toThrow("401");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not retry on 403 errors", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("403 Forbidden"));

    await expect(withRetry(fn, { maxRetries: 3, initialDelay: 1 })).rejects.toThrow("403");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("throws after exhausting retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("500 Server Error"));

    await expect(withRetry(fn, { maxRetries: 2, initialDelay: 1 })).rejects.toThrow("500");
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("uses exponential backoff", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429"))
      .mockRejectedValueOnce(new Error("429"))
      .mockResolvedValue("ok");

    const start = Date.now();
    await withRetry(fn, { maxRetries: 3, initialDelay: 50 });
    const elapsed = Date.now() - start;

    // first delay: 50ms, second delay: 100ms = 150ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(100);
  });

  it("uses default options when none provided", async () => {
    const fn = vi.fn().mockResolvedValue("result");
    const result = await withRetry(fn);
    expect(result).toBe("result");
  });
});
