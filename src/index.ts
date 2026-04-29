import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OutlookClient } from "./outlook-client.js";
import { OAuthConfig } from "./auth.js";

const oauthConfig: OAuthConfig = {
  clientId: process.env.OUTLOOK_CLIENT_ID || "",
  clientSecret: process.env.OUTLOOK_CLIENT_SECRET || "",
  tenantId: process.env.OUTLOOK_TENANT_ID || "common",
  redirectUri: process.env.OUTLOOK_REDIRECT_URI || "http://localhost:3333/callback",
};

const tokenFile = process.env.OUTLOOK_TOKEN_FILE || "./tokens.json";

if (!oauthConfig.clientId || !oauthConfig.clientSecret) {
  console.error("Missing required environment variables: OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET");
  process.exit(1);
}

const outlook = new OutlookClient({ oauthConfig, tokenFile });

if (!outlook.isAuthenticated()) {
  console.error(
    "Not authenticated. Run the auth server first: docker compose up auth"
  );
  process.exit(1);
}

const server = new McpServer({
  name: "outlook-mcp",
  version: "1.0.0",
});

server.tool(
  "list_emails",
  "List emails from a mailbox folder",
  {
    folder: z.string().optional().describe("Mail folder (default: inbox)"),
    count: z.number().optional().describe("Number of emails to return (default: 10)"),
    skip: z.number().optional().describe("Number of emails to skip for pagination"),
    filter: z.string().optional().describe("OData filter expression"),
    search: z.string().optional().describe("Search query string"),
  },
  async ({ folder, count, skip, filter, search }) => {
    const messages = await outlook.listMessages({
      folder,
      top: count || 10,
      skip,
      filter,
      search,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(messages, null, 2) }],
    };
  }
);

server.tool(
  "read_email",
  "Read the full content of a specific email",
  {
    messageId: z.string().describe("The ID of the email message to read"),
  },
  async ({ messageId }) => {
    const message = await outlook.getMessage(messageId);
    return {
      content: [{ type: "text", text: JSON.stringify(message, null, 2) }],
    };
  }
);

server.tool(
  "send_email",
  "Send a new email",
  {
    to: z.array(z.string()).describe("List of recipient email addresses"),
    cc: z.array(z.string()).optional().describe("List of CC email addresses"),
    bcc: z.array(z.string()).optional().describe("List of BCC email addresses"),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Email body content"),
    bodyType: z.enum(["HTML", "Text"]).optional().describe("Body content type (default: HTML)"),
  },
  async ({ to, cc, bcc, subject, body, bodyType }) => {
    const result = await outlook.sendMessage({ to, cc, bcc, subject, body, bodyType });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "reply_to_email",
  "Reply to an existing email",
  {
    messageId: z.string().describe("The ID of the email to reply to"),
    body: z.string().describe("Reply body content"),
    replyAll: z.boolean().optional().describe("Whether to reply all (default: false)"),
  },
  async ({ messageId, body, replyAll }) => {
    const result = await outlook.replyToMessage(messageId, { body, replyAll });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "list_calendar_events",
  "List upcoming calendar events",
  {
    startDateTime: z.string().optional().describe("Start date/time in ISO format (default: now)"),
    endDateTime: z.string().optional().describe("End date/time in ISO format (default: 7 days from now)"),
    count: z.number().optional().describe("Number of events to return (default: 25)"),
  },
  async ({ startDateTime, endDateTime, count }) => {
    const events = await outlook.listCalendarEvents({
      startDateTime,
      endDateTime,
      top: count,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(events, null, 2) }],
    };
  }
);

server.tool(
  "create_calendar_event",
  "Create a new calendar event",
  {
    subject: z.string().describe("Event subject/title"),
    start: z.string().describe("Start date/time in ISO format"),
    end: z.string().describe("End date/time in ISO format"),
    timeZone: z.string().optional().describe("Time zone (default: UTC)"),
    body: z.string().optional().describe("Event body/description"),
    attendees: z.array(z.string()).optional().describe("List of attendee email addresses"),
    location: z.string().optional().describe("Event location"),
    isOnlineMeeting: z.boolean().optional().describe("Create as Teams meeting"),
  },
  async ({ subject, start, end, timeZone, body, attendees, location, isOnlineMeeting }) => {
    const event = await outlook.createCalendarEvent({
      subject,
      start,
      end,
      timeZone,
      body,
      attendees,
      location,
      isOnlineMeeting,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(event, null, 2) }],
    };
  }
);

server.tool(
  "list_mail_folders",
  "List all mail folders in the mailbox",
  {},
  async () => {
    const folders = await outlook.listMailFolders();
    return {
      content: [{ type: "text", text: JSON.stringify(folders, null, 2) }],
    };
  }
);

server.tool(
  "move_email",
  "Move an email to a different folder",
  {
    messageId: z.string().describe("The ID of the email to move"),
    destinationFolderId: z.string().describe("The ID of the destination folder"),
  },
  async ({ messageId, destinationFolderId }) => {
    const result = await outlook.moveMessage(messageId, destinationFolderId);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "search_emails",
  "Search emails by keyword",
  {
    query: z.string().describe("Search query"),
    count: z.number().optional().describe("Number of results (default: 10)"),
  },
  async ({ query, count }) => {
    const messages = await outlook.searchMessages(query, count);
    return {
      content: [{ type: "text", text: JSON.stringify(messages, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Outlook MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
