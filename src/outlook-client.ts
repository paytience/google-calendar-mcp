import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { refreshAccessToken, AccountStore, OAuthConfig, StoredAccount } from "./auth.js";

export interface OutlookClientConfig {
  oauthConfig: OAuthConfig;
  accountsDir: string;
}

export class OutlookClient {
  private client: Client | null = null;
  private config: OutlookClientConfig;
  private store: AccountStore;
  private currentAccount: StoredAccount | null = null;

  constructor(config: OutlookClientConfig) {
    this.config = config;
    this.store = new AccountStore(config.accountsDir);
  }

  private initClient() {
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

  private async getValidAccessToken(): Promise<string> {
    if (!this.currentAccount) {
      throw new Error("No account selected. Use switch_account to select one.");
    }

    const tokens = this.currentAccount.tokens;
    if (Date.now() < tokens.expiresAt - 60000) {
      return tokens.accessToken;
    }

    const newTokens = await refreshAccessToken(
      this.config.oauthConfig,
      tokens.refreshToken
    );
    this.currentAccount.tokens = newTokens;
    this.store.save(this.currentAccount);
    return newTokens.accessToken;
  }

  listAccounts(): { email: string; displayName: string; active: boolean }[] {
    return this.store.list().map((a) => ({
      email: a.email,
      displayName: a.displayName,
      active: this.currentAccount?.email === a.email,
    }));
  }

  switchAccount(email: string): boolean {
    const account = this.store.get(email);
    if (!account) return false;
    this.currentAccount = account;
    this.initClient();
    return true;
  }

  removeAccount(email: string): boolean {
    if (this.currentAccount?.email === email) {
      this.currentAccount = null;
      this.client = null;
    }
    return this.store.remove(email);
  }

  getCurrentAccount(): string | null {
    return this.currentAccount?.email || null;
  }

  hasAccounts(): boolean {
    return this.store.list().length > 0;
  }

  autoSelectAccount(): boolean {
    const accounts = this.store.list();
    if (accounts.length === 0) return false;
    this.currentAccount = accounts[0];
    this.initClient();
    return true;
  }

  private ensureClient(): Client {
    if (!this.client || !this.currentAccount) {
      throw new Error("No account selected. Use switch_account to select one.");
    }
    return this.client;
  }

  async listMessages(options?: {
    folder?: string;
    top?: number;
    skip?: number;
    filter?: string;
    search?: string;
  }) {
    const client = this.ensureClient();
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

    const response = await client.api(url).get();
    return response.value;
  }

  async getMessage(messageId: string) {
    const client = this.ensureClient();
    const response = await client
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
    const client = this.ensureClient();
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

    await client.api("/me/sendMail").post({ message });
    return { success: true };
  }

  async replyToMessage(messageId: string, options: { body: string; replyAll?: boolean }) {
    const client = this.ensureClient();
    const endpoint = options.replyAll ? "replyAll" : "reply";
    await client
      .api(`/me/messages/${messageId}/${endpoint}`)
      .post({ comment: options.body });
    return { success: true };
  }

  async listCalendarEvents(options?: {
    startDateTime?: string;
    endDateTime?: string;
    top?: number;
  }) {
    const client = this.ensureClient();
    const now = new Date();
    const start = options?.startDateTime || now.toISOString();
    const end = options?.endDateTime || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const response = await client
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
    const client = this.ensureClient();
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

    const response = await client.api("/me/events").post(event);
    return response;
  }

  async listMailFolders() {
    const client = this.ensureClient();
    const response = await client.api("/me/mailFolders").top(50).get();
    return response.value;
  }

  async moveMessage(messageId: string, destinationFolderId: string) {
    const client = this.ensureClient();
    const response = await client
      .api(`/me/messages/${messageId}/move`)
      .post({ destinationId: destinationFolderId });
    return response;
  }

  async searchMessages(query: string, top?: number) {
    return this.listMessages({ search: query, top: top || 10 });
  }
}
