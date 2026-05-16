#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GoogleCalendarClient } from "./google-calendar-client.js";
import { OAuthConfig } from "./auth.js";
import { getAccounts, removeAccount, addAccount } from "./config.js";
import { setupAccount, verifyAccount } from "./setup.js";
import { fetchTokens } from "./token-store.js";

/* eslint-disable @typescript-eslint/no-explicit-any */

const formatEvent = (e: any) => ({
  id: e.id,
  summary: e.summary,
  start: e.start?.dateTime || e.start?.date,
  end: e.end?.dateTime || e.end?.date,
  timeZone: e.start?.timeZone,
  location: e.location,
  description: e.description,
  organizer: e.organizer?.email,
  attendees: e.attendees?.map((a: any) => ({
    email: a.email,
    name: a.displayName,
    response: a.responseStatus,
    organizer: a.organizer,
    self: a.self,
  })),
  hangoutLink: e.hangoutLink,
  conferenceData: e.conferenceData?.entryPoints?.map((ep: any) => ({
    type: ep.entryPointType,
    uri: ep.uri,
  })),
  status: e.status,
  htmlLink: e.htmlLink,
  recurrence: e.recurrence,
  colorId: e.colorId,
});

const formatCalendar = (c: any) => ({
  id: c.id,
  summary: c.summary,
  description: c.description,
  primary: c.primary,
  timeZone: c.timeZone,
  accessRole: c.accessRole,
  backgroundColor: c.backgroundColor,
});

/* eslint-enable @typescript-eslint/no-explicit-any */

const oauthConfig: OAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID || "",
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  redirectUri: process.env.GOOGLE_REDIRECT_URI || "https://gcalmcp.com/api/auth/callback",
};

async function main() {
  let accounts = getAccounts();

  const envApiKey = process.env.GOOGLE_CALENDAR_MCP_API_KEY;
  if (accounts.length === 0 && envApiKey) {
    const remote = await fetchTokens(envApiKey);
    addAccount({ email: remote.email, displayName: remote.displayName, apiKey: envApiKey });
    accounts = getAccounts();
  }

  if (accounts.length === 0) {
    await setupAccount();
    accounts = getAccounts();
    if (accounts.length === 0) {
      console.error("No accounts connected. Exiting.");
      process.exit(1);
    }
  }

  const gcal = new GoogleCalendarClient(oauthConfig);
  gcal.switchAccount(accounts[0]);

  const server = new McpServer({
    name: "google-calendar-mcp",
    version: "1.0.0",
  });

  // Account management

  server.tool("list_accounts", "List all connected Google accounts", {}, async () => {
    const all = getAccounts();
    const result = all.map((a) => ({
      email: a.email,
      displayName: a.displayName,
      active: gcal.getCurrentAccount() === a.email,
    }));
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool(
    "switch_account",
    "Switch to a different connected Google account",
    { email: z.string().describe("Email address of the account to switch to") },
    async ({ email }) => {
      const account = getAccounts().find((a) => a.email === email);
      if (!account) return { content: [{ type: "text", text: `Account not found: ${email}` }], isError: true };
      gcal.switchAccount(account);
      return { content: [{ type: "text", text: `Switched to: ${email}` }] };
    }
  );

  server.tool("add_account", "Connect a new Google account or re-authenticate an existing one. If sign-in was recently completed in the browser, this will verify the connection without opening a new browser window.", {}, async () => {
    const verified = await verifyAccount();
    if (verified) {
      const account = getAccounts().find((a) => a.email === verified.email);
      if (account) gcal.switchAccount(account);
      return { content: [{ type: "text", text: `Connected: ${verified.displayName} (${verified.email})` }] };
    }

    const { email, displayName } = await setupAccount();
    const account = getAccounts().find((a) => a.email === email);
    if (account) gcal.switchAccount(account);
    return { content: [{ type: "text", text: `Connected: ${displayName} (${email})` }] };
  });

  server.tool(
    "remove_account",
    "Remove a connected Google account",
    { email: z.string().describe("Email address of the account to remove") },
    async ({ email }) => {
      const success = removeAccount(email);
      if (!success) return { content: [{ type: "text", text: `Account not found: ${email}` }], isError: true };
      return { content: [{ type: "text", text: `Removed: ${email}` }] };
    }
  );

  // Calendar operations

  server.tool("list_calendars", "List all calendars accessible by this account", {}, async () => {
    try {
      const calendars = await gcal.listCalendars();
      return { content: [{ type: "text", text: JSON.stringify(calendars.map(formatCalendar), null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error listing calendars: ${e.message}` }], isError: true };
    }
  });

  server.tool(
    "create_calendar",
    "Create a new calendar",
    {
      summary: z.string().describe("Name of the calendar"),
      description: z.string().optional().describe("Calendar description"),
      timeZone: z.string().optional().describe("Time zone (e.g., America/New_York)"),
    },
    async ({ summary, description, timeZone }) => {
      try {
        const calendar = await gcal.createCalendar({ summary, description, timeZone });
        return { content: [{ type: "text", text: JSON.stringify(formatCalendar(calendar), null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error creating calendar: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "list_events",
    "List upcoming calendar events within a time range",
    {
      calendarId: z.string().optional().describe("Calendar ID (default: primary)"),
      timeMin: z.string().optional().describe("Start of time range in ISO format (default: now)"),
      timeMax: z.string().optional().describe("End of time range in ISO format (default: 7 days from now)"),
      maxResults: z.number().optional().describe("Maximum number of events to return (default: 25)"),
      pageToken: z.string().optional().describe("Token for fetching the next page of results"),
    },
    async ({ calendarId, timeMin, timeMax, maxResults, pageToken }) => {
      try {
        const result = await gcal.listEvents({ calendarId, timeMin, timeMax, maxResults, pageToken });
        const output = {
          events: result.items.map(formatEvent),
          nextPageToken: result.nextPageToken,
        };
        return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error listing events: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_event",
    "Get full details of a specific calendar event",
    {
      eventId: z.string().describe("The event ID"),
      calendarId: z.string().optional().describe("Calendar ID (default: primary)"),
    },
    async ({ eventId, calendarId }) => {
      try {
        const event = await gcal.getEvent(eventId, calendarId);
        return { content: [{ type: "text", text: JSON.stringify(formatEvent(event), null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error getting event: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "create_event",
    "Create a new calendar event",
    {
      summary: z.string().describe("Event title"),
      start: z.string().describe("Start date/time in ISO format"),
      end: z.string().describe("End date/time in ISO format"),
      timeZone: z.string().optional().describe("Time zone (e.g., America/New_York)"),
      description: z.string().optional().describe("Event description"),
      attendees: z.array(z.string()).optional().describe("List of attendee email addresses"),
      location: z.string().optional().describe("Event location"),
      conferenceData: z.boolean().optional().describe("Create a Google Meet link"),
      calendarId: z.string().optional().describe("Calendar ID (default: primary)"),
      recurrence: z.array(z.string()).optional().describe("RRULE recurrence rules (e.g., ['RRULE:FREQ=WEEKLY;COUNT=5'])"),
      colorId: z.string().optional().describe("Color ID for the event"),
      visibility: z.enum(["default", "public", "private", "confidential"]).optional().describe("Event visibility"),
      reminders: z.array(z.object({ method: z.string(), minutes: z.number() })).optional().describe("Custom reminders"),
    },
    async ({ summary, start, end, timeZone, description, attendees, location, conferenceData, calendarId, recurrence, colorId, visibility, reminders }) => {
      try {
        const event = await gcal.createEvent({
          calendarId, summary, start, end, timeZone, description, attendees, location, conferenceData, recurrence, colorId, visibility, reminders,
        });
        return { content: [{ type: "text", text: JSON.stringify(formatEvent(event), null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error creating event: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "update_event",
    "Update an existing calendar event",
    {
      eventId: z.string().describe("The event ID to update"),
      calendarId: z.string().optional().describe("Calendar ID (default: primary)"),
      summary: z.string().optional().describe("New title"),
      description: z.string().optional().describe("New description"),
      start: z.string().optional().describe("New start date/time in ISO format"),
      end: z.string().optional().describe("New end date/time in ISO format"),
      timeZone: z.string().optional().describe("Time zone"),
      location: z.string().optional().describe("New location"),
      attendees: z.array(z.string()).optional().describe("Updated attendee email addresses"),
      colorId: z.string().optional().describe("Color ID"),
      visibility: z.enum(["default", "public", "private", "confidential"]).optional().describe("Event visibility"),
      recurrence: z.array(z.string()).optional().describe("Updated RRULE recurrence rules"),
    },
    async ({ eventId, calendarId, summary, description, start, end, timeZone, location, attendees, colorId, visibility, recurrence }) => {
      try {
        const event = await gcal.updateEvent(eventId, { calendarId, summary, description, start, end, timeZone, location, attendees, colorId, visibility, recurrence });
        return { content: [{ type: "text", text: JSON.stringify(formatEvent(event), null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error updating event: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "delete_event",
    "Delete a calendar event",
    {
      eventId: z.string().describe("The event ID to delete"),
      calendarId: z.string().optional().describe("Calendar ID (default: primary)"),
    },
    async ({ eventId, calendarId }) => {
      try {
        await gcal.deleteEvent(eventId, calendarId);
        return { content: [{ type: "text", text: "Event deleted." }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error deleting event: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "search_events",
    "Search calendar events by text query",
    {
      query: z.string().describe("Search text to match in event fields"),
      calendarId: z.string().optional().describe("Calendar ID (default: primary)"),
      maxResults: z.number().optional().describe("Maximum results (default: 10)"),
    },
    async ({ query, calendarId, maxResults }) => {
      try {
        const events = await gcal.searchEvents(query, { calendarId, maxResults });
        return { content: [{ type: "text", text: JSON.stringify(events.map(formatEvent), null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error searching events: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "respond_to_event",
    "RSVP to a calendar event (accept, tentative, or decline)",
    {
      eventId: z.string().describe("The event ID"),
      response: z.enum(["accepted", "tentative", "declined"]).describe("Your response"),
      calendarId: z.string().optional().describe("Calendar ID (default: primary)"),
    },
    async ({ eventId, response, calendarId }) => {
      try {
        await gcal.respondToEvent(eventId, response, calendarId);
        return { content: [{ type: "text", text: `Response "${response}" sent.` }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error responding to event: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "get_free_busy",
    "Check free/busy status for one or more people within a time range",
    {
      emails: z.array(z.string()).describe("Email addresses to check availability for"),
      timeMin: z.string().describe("Start of time range in ISO format"),
      timeMax: z.string().describe("End of time range in ISO format"),
      timeZone: z.string().optional().describe("Time zone (default: UTC)"),
    },
    async ({ emails, timeMin, timeMax, timeZone }) => {
      try {
        const result = await gcal.getFreeBusy({ emails, timeMin, timeMax, timeZone });
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error checking availability: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool(
    "quick_add_event",
    "Create an event using natural language (e.g., 'Dinner with Alice tomorrow at 7pm')",
    {
      text: z.string().describe("Natural language event description"),
      calendarId: z.string().optional().describe("Calendar ID (default: primary)"),
    },
    async ({ text, calendarId }) => {
      try {
        const event = await gcal.quickAdd(text, calendarId);
        return { content: [{ type: "text", text: JSON.stringify(formatEvent(event), null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error creating event: ${e.message}` }], isError: true };
      }
    }
  );

  server.tool("get_colors", "Get available event and calendar color options", {}, async () => {
    try {
      const colors = await gcal.getColors();
      return { content: [{ type: "text", text: JSON.stringify(colors, null, 2) }] };
    } catch (e: any) {
      return { content: [{ type: "text", text: `Error getting colors: ${e.message}` }], isError: true };
    }
  });

  server.tool(
    "move_event",
    "Move an event to a different calendar",
    {
      eventId: z.string().describe("The event ID to move"),
      destinationCalendarId: z.string().describe("Target calendar ID"),
      sourceCalendarId: z.string().optional().describe("Source calendar ID (default: primary)"),
    },
    async ({ eventId, destinationCalendarId, sourceCalendarId }) => {
      try {
        const event = await gcal.moveEvent(eventId, destinationCalendarId, sourceCalendarId);
        return { content: [{ type: "text", text: JSON.stringify(formatEvent(event), null, 2) }] };
      } catch (e: any) {
        return { content: [{ type: "text", text: `Error moving event: ${e.message}` }], isError: true };
      }
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Google Calendar MCP server running. Active account: ${gcal.getCurrentAccount()}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
