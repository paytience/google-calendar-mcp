import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { fetchTokens, updateTokens } from "../token-store.js";

describe("token-store", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchTokens", () => {
    it("returns account data on success", async () => {
      const mockData = {
        email: "user@example.com",
        displayName: "User",
        tokens: { accessToken: "at", refreshToken: "rt", expiresAt: 123 },
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchTokens("api-key-123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("mcp-tokens"),
        expect.objectContaining({
          method: "GET",
          headers: { "x-api-key": "api-key-123" },
        })
      );
      expect(result).toEqual(mockData);
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      });

      await expect(fetchTokens("bad-key")).rejects.toThrow("Failed to fetch tokens (401): Unauthorized");
    });
  });

  describe("updateTokens", () => {
    it("sends PUT with tokens", async () => {
      mockFetch.mockResolvedValue({ ok: true });

      const tokens = { accessToken: "new-at", refreshToken: "new-rt", expiresAt: 999 };
      await updateTokens("api-key-123", tokens);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("mcp-tokens"),
        expect.objectContaining({
          method: "PUT",
          headers: { "x-api-key": "api-key-123", "Content-Type": "application/json" },
          body: JSON.stringify({ tokens }),
        })
      );
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal error"),
      });

      const tokens = { accessToken: "at", refreshToken: "rt", expiresAt: 0 };
      await expect(updateTokens("key", tokens)).rejects.toThrow("Failed to update tokens (500): Internal error");
    });
  });
});
