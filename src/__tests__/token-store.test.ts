import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { fetchTokens, updateTokens, refreshTokensRemote } from "../token-store.js";

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
        expect.stringContaining("gcal-tokens"),
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

  describe("refreshTokensRemote", () => {
    it("calls refresh endpoint and returns tokens", async () => {
      const tokens = { accessToken: "new-at", refreshToken: "new-rt", expiresAt: 999 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tokens }),
      });

      const result = await refreshTokensRemote("api-key-123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("gcal-tokens/refresh"),
        expect.objectContaining({
          method: "POST",
          headers: { "x-api-key": "api-key-123" },
        })
      );
      expect(result).toEqual(tokens);
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Invalid API key"),
      });

      await expect(refreshTokensRemote("bad-key")).rejects.toThrow("Failed to refresh tokens (401): Invalid API key");
    });
  });
});
