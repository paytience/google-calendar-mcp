#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OutlookClient } from "./outlook-client.js";
import { OAuthConfig } from "./auth.js";
import { getAccounts, removeAccount } from "./config.js";
import { setupAccount } from "./setup.js";

const oauthConfig: OAuthConfig = {
  clientId: "bd342cd6-3cef-481a-8afb-2e7a7b7a24f0",
  clientSecret: "",
  tenantId: "common",
  redirectUri: "https://mcpoutlook.com/api/auth/callback",
};

async function main() {
  let accounts = getAccounts();

  if (accounts.length === 0) {
    await setupAccount();
    accounts = getAccounts();
    if (accounts.length === 0) {
      console.error("No accounts connected. Exiting.");
      process.exit(1);
    }
  }

  const outlook = new OutlookClient(oauthConfig);
  outlook.switchAccount(accounts[0]);

  const server = new McpServer({
    name: "outlook-mcp",
    version: "2.0.0",
  });

  server.tool("list_accounts", "List all connected Outlook accounts", {}, async () => {
    const all = getAccounts();
    const result = all.map((a) => ({
      email: a.email,
      displayName: a.displayName,
      active: outlook.getCurrentAccount() === a.email,
    }));
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool(
    "switch_account",
    "Switch to a different connected Outlook account",
    { email: z.string().describe("Email address of the account to switch to") },
    async ({ email }) => {
      const account = getAccounts().find((a) => a.email === email);
      if (!account) return { content: [{ type: "text", text: `Account not found: ${email}` }], isError: true };
      outlook.switchAccount(account);
      return { content: [{ type: "text", text: `Switched to: ${email}` }] };
    }
  );

  server.tool("add_account", "Connect a new Outlook account", {}, async () => {
    const { email, displayName } = await setupAccount();
    const account = getAccounts().find((a) => a.email === email);
    if (account) outlook.switchAccount(account);
    return { content: [{ type: "text", text: `Connected: ${displayName} (${email})` }] };
  });

  server.tool(
    "remove_account",
    "Remove a connected Outlook account",
    { email: z.string().describe("Email address of the account to remove") },
    async ({ email }) => {
      const success = removeAccount(email);
      if (!success) return { content: [{ type: "text", text: `Account not found: ${email}` }], isError: true };
      return { content: [{ type: "text", text: `Removed: ${email}` }] };
    }
  );

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
      const messages = await outlook.listMessages({ folder, top: count || 10, skip, filter, search });
      return { content: [{ type: "text", text: JSON.stringify(messages, null, 2) }] };
    }
  );

  server.tool(
    "read_email",
    "Read the full content of a specific email",
    { messageId: z.string().describe("The ID of the email message to read") },
    async ({ messageId }) => {
      const message = await outlook.getMessage(messageId);
      return { content: [{ type: "text", text: JSON.stringify(message, null, 2) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
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
      const events = await outlook.listCalendarEvents({ startDateTime, endDateTime, top: count });
      return { content: [{ type: "text", text: JSON.stringify(events, null, 2) }] };
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
      const event = await outlook.createCalendarEvent({ subject, start, end, timeZone, body, attendees, location, isOnlineMeeting });
      return { content: [{ type: "text", text: JSON.stringify(event, null, 2) }] };
    }
  );

  server.tool("list_mail_folders", "List all mail folders in the mailbox", {}, async () => {
    const folders = await outlook.listMailFolders();
    return { content: [{ type: "text", text: JSON.stringify(folders, null, 2) }] };
  });

  server.tool(
    "move_email",
    "Move an email to a different folder",
    {
      messageId: z.string().describe("The ID of the email to move"),
      destinationFolderId: z.string().describe("The ID of the destination folder"),
    },
    async ({ messageId, destinationFolderId }) => {
      const result = await outlook.moveMessage(messageId, destinationFolderId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
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
      return { content: [{ type: "text", text: JSON.stringify(messages, null, 2) }] };
    }
  );

  server.tool(
    "delete_email",
    "Delete an email",
    { messageId: z.string().describe("The ID of the email to delete") },
    async ({ messageId }) => {
      const result = await outlook.deleteMessage(messageId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "mark_email_read",
    "Mark an email as read or unread",
    {
      messageId: z.string().describe("The ID of the email"),
      isRead: z.boolean().describe("true to mark as read, false for unread"),
    },
    async ({ messageId, isRead }) => {
      const result = await outlook.markMessageRead(messageId, isRead);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "forward_email",
    "Forward an email to other recipients",
    {
      messageId: z.string().describe("The ID of the email to forward"),
      to: z.array(z.string()).describe("List of recipient email addresses"),
      comment: z.string().optional().describe("Optional comment to include"),
    },
    async ({ messageId, to, comment }) => {
      const result = await outlook.forwardMessage(messageId, to, comment);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "create_draft",
    "Create an email draft without sending",
    {
      to: z.array(z.string()).describe("List of recipient email addresses"),
      cc: z.array(z.string()).optional().describe("List of CC email addresses"),
      subject: z.string().describe("Email subject"),
      body: z.string().describe("Email body content"),
      bodyType: z.enum(["HTML", "Text"]).optional().describe("Body content type (default: HTML)"),
    },
    async ({ to, cc, subject, body, bodyType }) => {
      const result = await outlook.createDraft({ to, cc, subject, body, bodyType });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "delete_calendar_event",
    "Delete a calendar event",
    { eventId: z.string().describe("The ID of the event to delete") },
    async ({ eventId }) => {
      const result = await outlook.deleteCalendarEvent(eventId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "update_calendar_event",
    "Update an existing calendar event",
    {
      eventId: z.string().describe("The ID of the event to update"),
      subject: z.string().optional().describe("New subject"),
      body: z.string().optional().describe("New body/description"),
      start: z.string().optional().describe("New start date/time in ISO format"),
      end: z.string().optional().describe("New end date/time in ISO format"),
      timeZone: z.string().optional().describe("Time zone"),
      location: z.string().optional().describe("New location"),
    },
    async ({ eventId, subject, body, start, end, timeZone, location }) => {
      const result = await outlook.updateCalendarEvent(eventId, { subject, body, start, end, timeZone, location });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "get_attachment",
    "Download an email attachment",
    {
      messageId: z.string().describe("The ID of the email"),
      attachmentId: z.string().describe("The ID of the attachment"),
    },
    async ({ messageId, attachmentId }) => {
      const result = await outlook.getAttachment(messageId, attachmentId);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  server.tool(
    "flag_email",
    "Flag or unflag an email",
    {
      messageId: z.string().describe("The ID of the email"),
      status: z.enum(["flagged", "complete", "notFlagged"]).describe("Flag status"),
    },
    async ({ messageId, status }) => {
      const result = await outlook.flagMessage(messageId, status);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Outlook MCP server running. Active account: ${outlook.getCurrentAccount()}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
