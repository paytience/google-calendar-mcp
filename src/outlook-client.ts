import { Client } from "@microsoft/microsoft-graph-client";
import fs from "node:fs";
import "isomorphic-fetch";
import { refreshAccessToken, OAuthConfig, TokenSet } from "./auth.js";

export interface OutlookClientConfig {
  oauthConfig: OAuthConfig;
  tokenFile: string;
}

export class OutlookClient {
  private client: Client;
  private config: OutlookClientConfig;
  private tokens: TokenSet | null = null;

  constructor(config: OutlookClientConfig) {
    this.config = config;
    this.loadTokens();

    this.client = Client.init({
      authProvider: async (done) => {
        try {
          const token = await this.getValidAccessToken();
          done(null, token);
        } catch (err) {
          done(err as Error, null);
        }
      },
    });
  }

  private loadTokens() {
    if (fs.existsSync(this.config.tokenFile)) {
      const data = fs.readFileSync(this.config.tokenFile, "utf-8");
      this.tokens = JSON.parse(data);
    }
  }

  private saveTokens(tokens: TokenSet) {
    this.tokens = tokens;
    fs.writeFileSync(this.config.tokenFile, JSON.stringify(tokens, null, 2));
  }

  private async getValidAccessToken(): Promise<string> {
    if (!this.tokens) {
      this.loadTokens();
    }
    if (!this.tokens) {
      throw new Error("Not authenticated. Run the auth server first to connect an Outlook account.");
    }

    if (Date.now() < this.tokens.expiresAt - 60000) {
      return this.tokens.accessToken;
    }

    const newTokens = await refreshAccessToken(
      this.config.oauthConfig,
      this.tokens.refreshToken
    );
    this.saveTokens(newTokens);
    return newTokens.accessToken;
  }

  isAuthenticated(): boolean {
    this.loadTokens();
    return this.tokens !== null;
  }

  async listMessages(options?: {
    folder?: string;
    top?: number;
    skip?: number;
    filter?: string;
    search?: string;
  }) {
    const folder = options?.folder || "inbox";
    let url = `/me/mailFolders/${folder}/messages`;
    const params: string[] = [];

    if (options?.top) params.push(`$top=${options.top}`);
    if (options?.skip) params.push(`$skip=${options.skip}`);
    if (options?.filter) params.push(`$filter=${options.filter}`);
    if (options?.search) params.push(`$search="${options.search}"`);

    params.push("$select=id,subject,from,toRecipients,receivedDateTime,isRead,bodyPreview,hasAttachments");
    params.push("$orderby=receivedDateTime desc");

    if (params.length > 0) url += `?${params.join("&")}`;

    const response = await this.client.api(url).get();
    return response.value;
  }

  async getMessage(messageId: string) {
    const response = await this.client
      .api(`/me/messages/${messageId}`)
      .select("id,subject,from,toRecipients,ccRecipients,receivedDateTime,body,hasAttachments,attachments")
      .expand("attachments")
      .get();
    return response;
  }

  async sendMessage(options: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyType?: "HTML" | "Text";
  }) {
    const message = {
      subject: options.subject,
      body: {
        contentType: options.bodyType || "HTML",
        content: options.body,
      },
      toRecipients: options.to.map((email) => ({
        emailAddress: { address: email },
      })),
      ccRecipients: options.cc?.map((email) => ({
        emailAddress: { address: email },
      })),
      bccRecipients: options.bcc?.map((email) => ({
        emailAddress: { address: email },
      })),
    };

    await this.client.api("/me/sendMail").post({ message });
    return { success: true };
  }

  async replyToMessage(messageId: string, options: { body: string; replyAll?: boolean }) {
    const endpoint = options.replyAll ? "replyAll" : "reply";
    await this.client
      .api(`/me/messages/${messageId}/${endpoint}`)
      .post({ comment: options.body });
    return { success: true };
  }

  async listCalendarEvents(options?: {
    startDateTime?: string;
    endDateTime?: string;
    top?: number;
  }) {
    const now = new Date();
    const start = options?.startDateTime || now.toISOString();
    const end = options?.endDateTime || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const response = await this.client
      .api("/me/calendarView")
      .query({ startDateTime: start, endDateTime: end })
      .select("id,subject,start,end,location,organizer,attendees,isOnlineMeeting,onlineMeetingUrl,bodyPreview")
      .orderby("start/dateTime")
      .top(options?.top || 25)
      .get();

    return response.value;
  }

  async createCalendarEvent(options: {
    subject: string;
    body?: string;
    start: string;
    end: string;
    timeZone?: string;
    attendees?: string[];
    location?: string;
    isOnlineMeeting?: boolean;
  }) {
    const event: Record<string, unknown> = {
      subject: options.subject,
      start: { dateTime: options.start, timeZone: options.timeZone || "UTC" },
      end: { dateTime: options.end, timeZone: options.timeZone || "UTC" },
    };

    if (options.body) {
      event.body = { contentType: "HTML", content: options.body };
    }
    if (options.attendees) {
      event.attendees = options.attendees.map((email) => ({
        emailAddress: { address: email },
        type: "required",
      }));
    }
    if (options.location) {
      event.location = { displayName: options.location };
    }
    if (options.isOnlineMeeting) {
      event.isOnlineMeeting = true;
      event.onlineMeetingProvider = "teamsForBusiness";
    }

    const response = await this.client.api("/me/events").post(event);
    return response;
  }

  async listMailFolders() {
    const response = await this.client.api("/me/mailFolders").top(50).get();
    return response.value;
  }

  async moveMessage(messageId: string, destinationFolderId: string) {
    const response = await this.client
      .api(`/me/messages/${messageId}/move`)
      .post({ destinationId: destinationFolderId });
    return response;
  }

  async searchMessages(query: string, top?: number) {
    return this.listMessages({ search: query, top: top || 10 });
  }
}
