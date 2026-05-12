import { google, calendar_v3 } from "googleapis";
import { OAuthConfig, TokenSet } from "./auth.js";
import { fetchTokens, refreshTokensRemote } from "./token-store.js";
import { AccountConfig } from "./config.js";
import { withRetry } from "./retry.js";

export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar | null = null;
  private oauthConfig: OAuthConfig;
  private currentAccount: AccountConfig | null = null;
  private tokens: TokenSet | null = null;

  constructor(oauthConfig: OAuthConfig) {
    this.oauthConfig = oauthConfig;
  }

  private async initClient() {
    const token = await this.getValidAccessToken();
    const oauth2Client = new google.auth.OAuth2(
      this.oauthConfig.clientId,
      this.oauthConfig.clientSecret,
      this.oauthConfig.redirectUri
    );
    oauth2Client.setCredentials({ access_token: token });
    this.calendar = google.calendar({ version: "v3", auth: oauth2Client });
  }

  private async getValidAccessToken(): Promise<string> {
    if (!this.currentAccount) {
      throw new Error("No account selected. Use switch_account to select one.");
    }

    if (!this.tokens) {
      const remote = await fetchTokens(this.currentAccount.apiKey);
      this.tokens = remote.tokens;
    }

    if (Date.now() < this.tokens.expiresAt - 60000) {
      return this.tokens.accessToken;
    }

    const newTokens = await refreshTokensRemote(this.currentAccount.apiKey);
    this.tokens = newTokens;
    return newTokens.accessToken;
  }

  switchAccount(account: AccountConfig): void {
    this.currentAccount = account;
    this.tokens = null;
    this.calendar = null;
  }

  getCurrentAccount(): string | null {
    return this.currentAccount?.email || null;
  }

  private async ensureClient(): Promise<calendar_v3.Calendar> {
    if (!this.currentAccount) {
      throw new Error("No account selected. Use switch_account to select one.");
    }
    await this.initClient();
    return this.calendar!;
  }

  async listCalendars() {
    const cal = await this.ensureClient();
    return withRetry(async () => {
      const response = await cal.calendarList.list();
      return response.data.items || [];
    });
  }

  async listEvents(options?: {
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    query?: string;
    pageToken?: string;
  }) {
    const cal = await this.ensureClient();
    const calendarId = options?.calendarId || "primary";
    const now = new Date();
    const timeMin = options?.timeMin || now.toISOString();
    const timeMax = options?.timeMax || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return withRetry(async () => {
      const response = await cal.events.list({
        calendarId,
        timeMin,
        timeMax,
        maxResults: options?.maxResults || 25,
        singleEvents: true,
        orderBy: "startTime",
        q: options?.query,
        pageToken: options?.pageToken,
      });
      return {
        items: response.data.items || [],
        nextPageToken: response.data.nextPageToken,
      };
    });
  }

  async getEvent(eventId: string, calendarId?: string) {
    const cal = await this.ensureClient();
    return withRetry(async () => {
      const response = await cal.events.get({
        calendarId: calendarId || "primary",
        eventId,
      });
      return response.data;
    });
  }

  async createEvent(options: {
    calendarId?: string;
    summary: string;
    description?: string;
    start: string;
    end: string;
    timeZone?: string;
    attendees?: string[];
    location?: string;
    conferenceData?: boolean;
    reminders?: { method: string; minutes: number }[];
    recurrence?: string[];
    colorId?: string;
    visibility?: "default" | "public" | "private" | "confidential";
  }) {
    const cal = await this.ensureClient();
    const tz = options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const event: calendar_v3.Schema$Event = {
      summary: options.summary,
      start: { dateTime: options.start, timeZone: tz },
      end: { dateTime: options.end, timeZone: tz },
    };

    if (options.description) event.description = options.description;
    if (options.location) event.location = options.location;
    if (options.attendees) {
      event.attendees = options.attendees.map((email) => ({ email }));
    }
    if (options.recurrence) event.recurrence = options.recurrence;
    if (options.colorId) event.colorId = options.colorId;
    if (options.visibility) event.visibility = options.visibility;
    if (options.reminders) {
      event.reminders = {
        useDefault: false,
        overrides: options.reminders.map((r) => ({ method: r.method, minutes: r.minutes })),
      };
    }

    const requestParams: calendar_v3.Params$Resource$Events$Insert = {
      calendarId: options.calendarId || "primary",
      requestBody: event,
    };

    if (options.conferenceData) {
      event.conferenceData = {
        createRequest: {
          requestId: `mcp-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      };
      requestParams.conferenceDataVersion = 1;
    }

    return withRetry(async () => {
      const response = await cal.events.insert(requestParams);
      return response.data;
    });
  }

  async updateEvent(
    eventId: string,
    options: {
      calendarId?: string;
      summary?: string;
      description?: string;
      start?: string;
      end?: string;
      timeZone?: string;
      location?: string;
      attendees?: string[];
      colorId?: string;
      visibility?: "default" | "public" | "private" | "confidential";
      recurrence?: string[];
    }
  ) {
    const cal = await this.ensureClient();
    const update: calendar_v3.Schema$Event = {};

    if (options.summary) update.summary = options.summary;
    if (options.description !== undefined) update.description = options.description;
    const tz = options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    if (options.start) update.start = { dateTime: options.start, timeZone: tz };
    if (options.end) update.end = { dateTime: options.end, timeZone: tz };
    if (options.location !== undefined) update.location = options.location;
    if (options.attendees) update.attendees = options.attendees.map((email) => ({ email }));
    if (options.colorId) update.colorId = options.colorId;
    if (options.visibility) update.visibility = options.visibility;
    if (options.recurrence) update.recurrence = options.recurrence;

    return withRetry(async () => {
      const response = await cal.events.patch({
        calendarId: options.calendarId || "primary",
        eventId,
        requestBody: update,
      });
      return response.data;
    });
  }

  async deleteEvent(eventId: string, calendarId?: string) {
    const cal = await this.ensureClient();
    return withRetry(async () => {
      await cal.events.delete({
        calendarId: calendarId || "primary",
        eventId,
      });
      return { success: true };
    });
  }

  async respondToEvent(eventId: string, response: "accepted" | "tentative" | "declined", calendarId?: string) {
    const cal = await this.ensureClient();
    const currentEvent = await this.getEvent(eventId, calendarId);
    const myEmail = this.currentAccount?.email;

    const attendees = (currentEvent.attendees || []).map((a) => {
      if (a.email === myEmail || a.self) {
        return { ...a, responseStatus: response };
      }
      return a;
    });

    return withRetry(async () => {
      const res = await cal.events.patch({
        calendarId: calendarId || "primary",
        eventId,
        requestBody: { attendees },
      });
      return res.data;
    });
  }

  async getFreeBusy(options: {
    emails: string[];
    timeMin: string;
    timeMax: string;
    timeZone?: string;
  }) {
    const cal = await this.ensureClient();
    return withRetry(async () => {
      const response = await cal.freebusy.query({
        requestBody: {
          timeMin: options.timeMin,
          timeMax: options.timeMax,
          timeZone: options.timeZone || "UTC",
          items: options.emails.map((email) => ({ id: email })),
        },
      });
      return response.data.calendars || {};
    });
  }

  async searchEvents(query: string, options?: { calendarId?: string; maxResults?: number }) {
    const cal = await this.ensureClient();
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    return withRetry(async () => {
      const response = await cal.events.list({
        calendarId: options?.calendarId || "primary",
        q: query,
        timeMin: oneYearAgo.toISOString(),
        maxResults: options?.maxResults || 10,
        singleEvents: true,
        orderBy: "startTime",
      });
      return response.data.items || [];
    });
  }

  async quickAdd(text: string, calendarId?: string) {
    const cal = await this.ensureClient();
    return withRetry(async () => {
      const response = await cal.events.quickAdd({
        calendarId: calendarId || "primary",
        text,
      });
      return response.data;
    });
  }

  async getColors() {
    const cal = await this.ensureClient();
    return withRetry(async () => {
      const response = await cal.colors.get();
      return response.data;
    });
  }

  async moveEvent(eventId: string, destinationCalendarId: string, sourceCalendarId?: string) {
    const cal = await this.ensureClient();
    return withRetry(async () => {
      const response = await cal.events.move({
        calendarId: sourceCalendarId || "primary",
        eventId,
        destination: destinationCalendarId,
      });
      return response.data;
    });
  }
}
