import { describe, it, expect, vi, beforeEach } from "vitest";
import { setupAccount, reauthAccount, SetupDeps } from "../setup.js";

function createMockDeps(overrides: Partial<SetupDeps> = {}): SetupDeps {
  return {
    getApiKey: () => undefined,
    fetchTokens: vi.fn().mockRejectedValue(new Error("not mocked")),
    refreshTokens: vi.fn().mockRejectedValue(new Error("not mocked")),
    openUrl: vi.fn().mockResolvedValue(undefined),
    sleep: vi.fn().mockResolvedValue(undefined),
    getAccounts: vi.fn().mockReturnValue([]),
    addAccount: vi.fn(),
    now: vi.fn().mockReturnValue(1000000),
    authBaseUrl: "https://test.example.com",
    pollInterval: 100,
    pollTimeout: 5000,
    ...overrides,
  };
}

describe("setupAccount", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns immediately when tokens are valid", async () => {
    const deps = createMockDeps({
      getApiKey: () => "omk_test123",
      fetchTokens: vi.fn().mockResolvedValue({
        email: "user@example.com",
        displayName: "Test User",
        tokens: { accessToken: "at", refreshToken: "rt", expiresAt: 2000000 },
      }),
    });

    const result = await setupAccount(deps);

    expect(result).toEqual({ email: "user@example.com", displayName: "Test User" });
    expect(deps.openUrl).not.toHaveBeenCalled();
    expect(deps.sleep).not.toHaveBeenCalled();
  });

  it("refreshes expired tokens and returns", async () => {
    const deps = createMockDeps({
      getApiKey: () => "omk_test123",
      fetchTokens: vi.fn()
        .mockResolvedValueOnce({
          email: "user@example.com",
          displayName: "Test User",
          tokens: { accessToken: "at", refreshToken: "rt", expiresAt: 500000 }, // expired
        })
        .mockResolvedValueOnce({
          email: "user@example.com",
          displayName: "Test User",
          tokens: { accessToken: "new-at", refreshToken: "new-rt", expiresAt: 3000000 },
        }),
      refreshTokens: vi.fn().mockResolvedValue({
        accessToken: "new-at",
        refreshToken: "new-rt",
        expiresAt: 3000000,
      }),
    });

    const result = await setupAccount(deps);

    expect(result).toEqual({ email: "user@example.com", displayName: "Test User" });
    expect(deps.refreshTokens).toHaveBeenCalledWith("omk_test123");
    expect(deps.openUrl).not.toHaveBeenCalled();
  });

  it("falls through to reauth when refresh fails", async () => {
    let callCount = 0;
    const deps = createMockDeps({
      getApiKey: () => "omk_test123",
      fetchTokens: vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: expired tokens
          return Promise.resolve({
            email: "user@example.com",
            displayName: "Test User",
            tokens: { accessToken: "at", refreshToken: "rt", expiresAt: 500000 },
          });
        }
        // Subsequent calls during reauth polling: return valid tokens
        return Promise.resolve({
          email: "user@example.com",
          displayName: "Test User",
          tokens: { accessToken: "new-at", refreshToken: "new-rt", expiresAt: 2000000 },
        });
      }),
      refreshTokens: vi.fn().mockRejectedValue(new Error("invalid_grant")),
    });

    const result = await setupAccount(deps);

    expect(result).toEqual({ email: "user@example.com", displayName: "Test User" });
    expect(deps.openUrl).toHaveBeenCalledWith(
      "https://test.example.com/api/auth/reauth?api_key=omk_test123"
    );
  });

  it("opens pricing page for new users without API key", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ready: true, user_email: "new@example.com", display_name: "New User", api_key: "omk_new" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const deps = createMockDeps({
      getApiKey: () => undefined,
    });

    const result = await setupAccount(deps);

    expect(result).toEqual({ email: "new@example.com", displayName: "New User" });
    expect(deps.openUrl).toHaveBeenCalledWith(
      expect.stringContaining("https://test.example.com/pricing?session_id=")
    );
    expect(deps.addAccount).toHaveBeenCalledWith({
      email: "new@example.com",
      displayName: "New User",
      apiKey: "omk_new",
    });

    vi.unstubAllGlobals();
  });
});

describe("reauthAccount", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("opens reauth URL and polls until tokens are valid", async () => {
    let pollCount = 0;
    const deps = createMockDeps({
      fetchTokens: vi.fn().mockImplementation(() => {
        pollCount++;
        if (pollCount < 3) {
          // First two polls: still expired
          return Promise.resolve({
            email: "user@example.com",
            displayName: "Test User",
            tokens: { accessToken: "old", refreshToken: "old", expiresAt: 500000 },
          });
        }
        // Third poll: fresh tokens
        return Promise.resolve({
          email: "user@example.com",
          displayName: "Test User",
          tokens: { accessToken: "new-at", refreshToken: "new-rt", expiresAt: 2000000 },
        });
      }),
    });

    const result = await reauthAccount("omk_test123", deps);

    expect(result).toEqual({ email: "user@example.com", displayName: "Test User" });
    expect(deps.openUrl).toHaveBeenCalledWith(
      "https://test.example.com/api/auth/reauth?api_key=omk_test123"
    );
    expect(deps.sleep).toHaveBeenCalledTimes(3);
  });

  it("times out when tokens never refresh", async () => {
    let time = 1000000;
    const deps = createMockDeps({
      fetchTokens: vi.fn().mockResolvedValue({
        email: "user@example.com",
        displayName: "Test User",
        tokens: { accessToken: "old", refreshToken: "old", expiresAt: 500000 },
      }),
      now: vi.fn().mockImplementation(() => {
        time += 2000; // advance 2s per call
        return time;
      }),
      pollTimeout: 5000,
    });

    await expect(reauthAccount("omk_test123", deps)).rejects.toThrow(
      "Re-authentication timed out"
    );
  });

  it("continues polling when fetchTokens throws", async () => {
    let pollCount = 0;
    const deps = createMockDeps({
      fetchTokens: vi.fn().mockImplementation(() => {
        pollCount++;
        if (pollCount < 3) {
          return Promise.reject(new Error("network error"));
        }
        return Promise.resolve({
          email: "user@example.com",
          displayName: "Test User",
          tokens: { accessToken: "new-at", refreshToken: "new-rt", expiresAt: 2000000 },
        });
      }),
    });

    const result = await reauthAccount("omk_test123", deps);

    expect(result).toEqual({ email: "user@example.com", displayName: "Test User" });
    expect(deps.sleep).toHaveBeenCalledTimes(3);
  });
});
