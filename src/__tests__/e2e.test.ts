import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";

/**
 * End-to-end tests for the Google Calendar MCP server.
 *
 * Prerequisites:
 *   - GOOGLE_CALENDAR_MCP_API_KEY env var set with a valid key
 *   - Tokens must be valid (run add_account manually if expired)
 *
 * Run with:
 *   npm run test:e2e
 */

const API_KEY = process.env.GOOGLE_CALENDAR_MCP_API_KEY;
const USE_DOCKER = process.env.E2E_DOCKER === "true";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");

function getServerCommand(): { command: string; args: string[] } {
  if (USE_DOCKER) {
    return {
      command: "docker",
      args: ["run", "--rm", "-i", "-e", `GOOGLE_CALENDAR_MCP_API_KEY=${API_KEY}`, "google-calendar-mcp:latest"],
    };
  }
  return {
    command: "node",
    args: [path.join(PROJECT_ROOT, "dist/index.js")],
  };
}

describe.skipIf(!API_KEY)("e2e: Google Calendar MCP Server", () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    const { command, args } = getServerCommand();
    transport = new StdioClientTransport({
      command,
      args,
      env: { ...process.env, GOOGLE_CALENDAR_MCP_API_KEY: API_KEY! },
      cwd: PROJECT_ROOT,
    });

    client = new Client({ name: "e2e-test", version: "1.0.0" });
    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    await transport?.close();
  });

  it("lists tools", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain("list_events");
    expect(names).toContain("create_event");
    expect(names).toContain("search_events");
    expect(names).toContain("get_free_busy");
    expect(names).toContain("add_account");
  });

  it("list_accounts returns current account", async () => {
    const result = await client.callTool({ name: "list_accounts", arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const accounts = JSON.parse(text);
    expect(accounts.length).toBeGreaterThan(0);
    expect(accounts[0]).toHaveProperty("email");
    expect(accounts[0]).toHaveProperty("active", true);
  });

  it("list_events returns events", async () => {
    const result = await client.callTool({ name: "list_events", arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const events = JSON.parse(text);
    expect(Array.isArray(events)).toBe(true);
  });

  it("search_events works", async () => {
    const result = await client.callTool({ name: "search_events", arguments: { query: "test" } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const events = JSON.parse(text);
    expect(Array.isArray(events)).toBe(true);
  });

  it("list_calendars returns calendars", async () => {
    const result = await client.callTool({ name: "list_calendars", arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const calendars = JSON.parse(text);
    expect(Array.isArray(calendars)).toBe(true);
    expect(calendars.length).toBeGreaterThan(0);
  });

  it("create and delete calendar event", { timeout: 15000 }, async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const start = tomorrow.toISOString().split("T")[0] + "T10:00:00";
    const end = tomorrow.toISOString().split("T")[0] + "T10:30:00";

    const createResult = await client.callTool({
      name: "create_event",
      arguments: {
        summary: "E2E Test Event (auto-delete)",
        start,
        end,
      },
    });
    const text = (createResult.content as Array<{ type: string; text: string }>)[0].text;
    const event = JSON.parse(text);

    expect(event).toHaveProperty("id");
    expect(event.summary).toBe("E2E Test Event (auto-delete)");

    const deleteResult = await client.callTool({
      name: "delete_event",
      arguments: { eventId: event.id },
    });
    const deleteText = (deleteResult.content as Array<{ type: string; text: string }>)[0].text;
    expect(JSON.parse(deleteText)).toHaveProperty("success", true);
  });
});
