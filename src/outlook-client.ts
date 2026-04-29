import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

export interface OutlookConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  userEmail: string;
}

export class OutlookClient {
  private client: Client;
  private config: OutlookConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: OutlookConfig) {
    this.config = config;
    this.client = Client.init({
      authProvider: async (done) => {
        const token = await this.getAccessToken();
        done(null, token);
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken!;
  }

  async listMessages(options?: {
    folder?: string;
    top?: number;
    skip?: number;
    filter?: string;
    search?: string;
  }) {
    const folder = options?.folder || "inbox";
    let url = `/users/${this.config.userEmail}/mailFolders/${folder}/messages`;
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
      .api(`/users/${this.config.userEmail}/messages/${messageId}`)
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

    await this.client
      .api(`/users/${this.config.userEmail}/sendMail`)
      .post({ message });

    return { success: true };
  }

  async replyToMessage(messageId: string, options: { body: string; replyAll?: boolean }) {
    const endpoint = options.replyAll ? "replyAll" : "reply";
    await this.client
      .api(`/users/${this.config.userEmail}/messages/${messageId}/${endpoint}`)
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
      .api(`/users/${this.config.userEmail}/calendarView`)
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

    const response = await this.client
      .api(`/users/${this.config.userEmail}/events`)
      .post(event);

    return response;
  }

  async listMailFolders() {
    const response = await this.client
      .api(`/users/${this.config.userEmail}/mailFolders`)
      .top(50)
      .get();
    return response.value;
  }

  async moveMessage(messageId: string, destinationFolderId: string) {
    const response = await this.client
      .api(`/users/${this.config.userEmail}/messages/${messageId}/move`)
      .post({ destinationId: destinationFolderId });
    return response;
  }

  async searchMessages(query: string, top?: number) {
    return this.listMessages({ search: query, top: top || 10 });
  }
}
