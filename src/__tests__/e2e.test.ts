import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";

/**
 * End-to-end tests for the Outlook MCP server.
 *
 * Prerequisites:
 *   - OUTLOOK_MCP_API_KEY env var set with a valid key
 *   - Tokens must be valid (run add_account manually if expired)
 *
 * Run with:
 *   npm run test:e2e
 *   npm run test:e2e:docker
 */

const API_KEY = process.env.OUTLOOK_MCP_API_KEY;
const USE_DOCKER = process.env.E2E_DOCKER === "true";
const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");

function getServerCommand(): { command: string; args: string[] } {
  if (USE_DOCKER) {
    return {
      command: "docker",
      args: ["run", "--rm", "-i", "-e", `OUTLOOK_MCP_API_KEY=${API_KEY}`, "outlook-mcp:latest"],
    };
  }
  return {
    command: "node",
    args: [path.join(PROJECT_ROOT, "dist/index.js")],
  };
}

describe.skipIf(!API_KEY)("e2e: Outlook MCP Server", () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    const { command, args } = getServerCommand();
    transport = new StdioClientTransport({
      command,
      args,
      env: { ...process.env, OUTLOOK_MCP_API_KEY: API_KEY! },
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
    expect(names).toContain("list_emails");
    expect(names).toContain("list_calendar_events");
    expect(names).toContain("search_calendar_events");
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

  it("list_emails returns messages", async () => {
    const result = await client.callTool({ name: "list_emails", arguments: { count: 3 } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const messages = JSON.parse(text);
    expect(Array.isArray(messages)).toBe(true);
    if (messages.length > 0) {
      expect(messages[0]).toHaveProperty("id");
      expect(messages[0]).toHaveProperty("subject");
    }
  });

  it("list_calendar_events returns events", async () => {
    const result = await client.callTool({ name: "list_calendar_events", arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const events = JSON.parse(text);
    expect(Array.isArray(events)).toBe(true);
  });

  it("search_calendar_events works", async () => {
    const result = await client.callTool({ name: "search_calendar_events", arguments: { query: "test" } });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const events = JSON.parse(text);
    expect(Array.isArray(events)).toBe(true);
  });

  it("list_mail_folders returns folders", async () => {
    const result = await client.callTool({ name: "list_mail_folders", arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const folders = JSON.parse(text);
    expect(Array.isArray(folders)).toBe(true);
    expect(folders.length).toBeGreaterThan(0);
    const names = folders.map((f: { displayName: string }) => f.displayName);
    expect(names).toContain("Inbox");
  });

  it("list_calendars returns calendars", async () => {
    const result = await client.callTool({ name: "list_calendars", arguments: {} });
    const text = (result.content as Array<{ type: string; text: string }>)[0].text;
    const calendars = JSON.parse(text);
    expect(Array.isArray(calendars)).toBe(true);
    expect(calendars.length).toBeGreaterThan(0);
  });

  it("create and delete calendar event (timezone test)", async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const start = tomorrow.toISOString().split("T")[0] + "T10:00:00";
    const end = tomorrow.toISOString().split("T")[0] + "T10:30:00";

    const createResult = await client.callTool({
      name: "create_calendar_event",
      arguments: {
        subject: "E2E Test Event (auto-delete)",
        start,
        end,
      },
    });
    const text = (createResult.content as Array<{ type: string; text: string }>)[0].text;
    const event = JSON.parse(text);

    expect(event).toHaveProperty("id");
    expect(event.subject).toBe("E2E Test Event (auto-delete)");
    // Verify timezone is NOT UTC (should use mailbox default)
    expect(event.start.timeZone).not.toBe("UTC");

    // Clean up
    const deleteResult = await client.callTool({
      name: "delete_calendar_event",
      arguments: { eventId: event.id },
    });
    const deleteText = (deleteResult.content as Array<{ type: string; text: string }>)[0].text;
    expect(JSON.parse(deleteText)).toHaveProperty("success", true);
  });
});
