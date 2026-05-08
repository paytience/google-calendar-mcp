import { TokenSet } from "./auth.js";

const EDGE_FUNCTION_URL = process.env.GOOGLE_CALENDAR_MCP_TOKEN_URL || "https://baushlqryuckehdslhik.supabase.co/functions/v1/gcal-tokens";

export interface RemoteAccount {
  email: string;
  displayName: string;
  tokens: TokenSet;
}

export async function fetchTokens(apiKey: string): Promise<RemoteAccount> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "GET",
    headers: { "x-api-key": apiKey },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to fetch tokens (${response.status}): ${body}`);
  }

  return response.json();
}

export async function refreshTokensRemote(apiKey: string): Promise<TokenSet> {
  const response = await fetch(`${EDGE_FUNCTION_URL}/refresh`, {
    method: "POST",
    headers: { "x-api-key": apiKey },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to refresh tokens (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.tokens;
}

export async function updateTokens(apiKey: string, tokens: TokenSet): Promise<void> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "PUT",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tokens }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to update tokens (${response.status}): ${body}`);
  }
}
