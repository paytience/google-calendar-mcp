import { randomUUID } from "node:crypto";
import { addAccount, getAccounts } from "./config.js";
import { fetchTokens, refreshTokensRemote } from "./token-store.js";

const AUTH_BASE_URL = process.env.OUTLOOK_MCP_AUTH_URL || "https://mcpoutlook.com";
const POLL_INTERVAL = 2000;
const POLL_TIMEOUT = 600000; // 10 minutes

export interface SetupDeps {
  getApiKey: () => string | undefined;
  fetchTokens: (apiKey: string) => ReturnType<typeof fetchTokens>;
  refreshTokens: (apiKey: string) => ReturnType<typeof refreshTokensRemote>;
  openUrl: (url: string) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  getAccounts: typeof getAccounts;
  addAccount: typeof addAccount;
  now: () => number;
  authBaseUrl: string;
  pollInterval: number;
  pollTimeout: number;
}

const defaultDeps: SetupDeps = {
  getApiKey: () => process.env.OUTLOOK_MCP_API_KEY,
  fetchTokens,
  refreshTokens: refreshTokensRemote,
  openUrl: async (url: string) => {
    const open = await import("open");
    await open.default(url);
  },
  sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  getAccounts,
  addAccount,
  now: () => Date.now(),
  authBaseUrl: AUTH_BASE_URL,
  pollInterval: POLL_INTERVAL,
  pollTimeout: POLL_TIMEOUT,
};

export async function setupAccount(deps: SetupDeps = defaultDeps): Promise<{ email: string; displayName: string }> {
  const apiKey = deps.getApiKey();
  if (apiKey) {
    try {
      const remote = await deps.fetchTokens(apiKey);
      if (remote.tokens.expiresAt > deps.now()) {
        return { email: remote.email, displayName: remote.displayName };
      }
      // Tokens expired, try refreshing
      await deps.refreshTokens(apiKey);
      const refreshed = await deps.fetchTokens(apiKey);
      return { email: refreshed.email, displayName: refreshed.displayName };
    } catch {
      // Tokens revoked/invalid, need full re-authentication via OAuth
      return await reauthAccount(apiKey, deps);
    }
  }

  // New user: go through pricing flow
  const sessionId = randomUUID();
  const pricingUrl = `${deps.authBaseUrl}/pricing?session_id=${sessionId}`;

  console.error(`Opening browser to set up Outlook MCP...`);
  console.error(`If it doesn't open, visit: ${pricingUrl}`);

  await deps.openUrl(pricingUrl);

  const result = await pollForCompletion(sessionId, deps);

  deps.addAccount({
    email: result.user_email,
    displayName: result.display_name,
    apiKey: result.api_key,
  });

  console.error(`Connected: ${result.display_name} (${result.user_email})`);
  return { email: result.user_email, displayName: result.display_name };
}

export async function reauthAccount(apiKey: string, deps: SetupDeps = defaultDeps): Promise<{ email: string; displayName: string }> {
  const loginUrl = `${deps.authBaseUrl}/api/auth/reauth?api_key=${encodeURIComponent(apiKey)}`;

  console.error(`Re-authenticating your Microsoft account...`);
  console.error(`If the browser doesn't open, visit: ${loginUrl}`);

  await deps.openUrl(loginUrl);

  // Poll with a short timeout (80s) to stay within MCP tool call limits
  const deadline = deps.now() + Math.min(deps.pollTimeout, 80000);
  while (deps.now() < deadline) {
    await deps.sleep(deps.pollInterval);
    try {
      const remote = await deps.fetchTokens(apiKey);
      if (remote.tokens.expiresAt > deps.now()) {
        console.error(`Reconnected: ${remote.displayName} (${remote.email})`);
        return { email: remote.email, displayName: remote.displayName };
      }
    } catch {
      // Still waiting
    }
  }

  // Instead of a generic timeout error, give actionable instructions
  throw new Error(
    `Authentication is pending. A browser window was opened for Microsoft sign-in. ` +
    `After completing sign-in in the browser, call add_account again to verify the connection. ` +
    `If no browser opened, visit: ${loginUrl}`
  );
}

/**
 * Verify that tokens are valid after a reauth flow.
 * Returns quickly without opening a browser.
 */
export async function verifyAccount(deps: SetupDeps = defaultDeps): Promise<{ email: string; displayName: string } | null> {
  const apiKey = deps.getApiKey();
  if (!apiKey) return null;

  try {
    const remote = await deps.fetchTokens(apiKey);
    if (remote.tokens.expiresAt > deps.now()) {
      return { email: remote.email, displayName: remote.displayName };
    }
    await deps.refreshTokens(apiKey);
    const refreshed = await deps.fetchTokens(apiKey);
    if (refreshed.tokens.expiresAt > deps.now()) {
      return { email: refreshed.email, displayName: refreshed.displayName };
    }
  } catch {
    // Still invalid
  }
  return null;
}

async function pollForCompletion(sessionId: string, deps: SetupDeps): Promise<{
  user_email: string;
  display_name: string;
  api_key: string;
}> {
  const statusUrl = `${deps.authBaseUrl}/api/auth/status?session_id=${sessionId}`;
  const deadline = deps.now() + deps.pollTimeout;

  while (deps.now() < deadline) {
    await deps.sleep(deps.pollInterval);

    try {
      const response = await fetch(statusUrl);
      if (!response.ok) {
        if (response.status === 410) throw new Error("Session expired. Please try again.");
        continue;
      }

      const data = await response.json();
      if (data.ready && data.api_key) {
        return data;
      }
    } catch (e) {
      if ((e as Error).message.includes("expired")) throw e;
    }
  }

  throw new Error("Authentication timed out. Please try again.");
}
