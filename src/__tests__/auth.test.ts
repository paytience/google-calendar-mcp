import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { refreshAccessToken } from "../auth.js";

const oauthConfig = {
  clientId: "client-id",
  clientSecret: "client-secret",
  redirectUri: "http://localhost/callback",
};

describe("auth", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("refreshAccessToken", () => {
    it("returns new token set on success", async () => {
      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "new-access-token",
            refresh_token: "new-refresh-token",
            expires_in: 3600,
          }),
      });

      const result = await refreshAccessToken(oauthConfig, "old-refresh-token");

      expect(result).toEqual({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        expiresAt: now + 3600 * 1000,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://oauth2.googleapis.com/token",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
      );
    });

    it("keeps old refresh token if new one not provided", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "at",
            expires_in: 3600,
          }),
      });

      const result = await refreshAccessToken(oauthConfig, "keep-this-token");
      expect(result.refreshToken).toBe("keep-this-token");
    });

    it("throws on failed refresh", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        text: () => Promise.resolve("invalid_grant"),
      });

      await expect(refreshAccessToken(oauthConfig, "expired-token")).rejects.toThrow(
        "Token refresh failed: invalid_grant"
      );
    });
  });
});
