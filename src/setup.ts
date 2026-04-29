import { randomUUID } from "node:crypto";
import { addAccount } from "./config.js";

const AUTH_BASE_URL = process.env.OUTLOOK_MCP_AUTH_URL || "https://mcpoutlook.com";
const POLL_INTERVAL = 2000;
const POLL_TIMEOUT = 600000; // 10 minutes

export async function setupAccount(): Promise<{ email: string; displayName: string }> {
  const sessionId = randomUUID();
  const pricingUrl = `${AUTH_BASE_URL}/pricing?session_id=${sessionId}`;

  console.error(`Opening browser to set up Outlook MCP...`);
  console.error(`If it doesn't open, visit: ${pricingUrl}`);

  const open = await import("open");
  await open.default(pricingUrl);

  const result = await pollForCompletion(sessionId);

  addAccount({
    email: result.user_email,
    displayName: result.display_name,
    apiKey: result.api_key,
  });

  console.error(`Connected: ${result.display_name} (${result.user_email})`);
  return { email: result.user_email, displayName: result.display_name };
}

async function pollForCompletion(sessionId: string): Promise<{
  user_email: string;
  display_name: string;
  api_key: string;
}> {
  const statusUrl = `${AUTH_BASE_URL}/api/auth/status?session_id=${sessionId}`;
  const deadline = Date.now() + POLL_TIMEOUT;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL);

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
