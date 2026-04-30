import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { OAuthConfig, TokenSet } from "./auth.js";
import { fetchTokens, refreshTokensRemote } from "./token-store.js";
import { AccountConfig } from "./config.js";
import { withRetry } from "./retry.js";

export class OutlookClient {
  private client: Client | null = null;
  private oauthConfig: OAuthConfig;
  private currentAccount: AccountConfig | null = null;
  private tokens: TokenSet | null = null;

  constructor(oauthConfig: OAuthConfig) {
    this.oauthConfig = oauthConfig;
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
    this.initClient();
  }

  getCurrentAccount(): string | null {
    return this.currentAccount?.email || null;
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

    return withRetry(async () => {
      const response = await client.api(url).get();
      return response.value;
    });
  }

  async getMessage(messageId: string) {
    const client = this.ensureClient();
    return withRetry(async () => {
      return client
        .api(`/me/messages/${messageId}`)
        .select("id,subject,from,toRecipients,ccRecipients,receivedDateTime,body,hasAttachments,attachments")
        .expand("attachments")
        .get();
    });
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
      body: { contentType: options.bodyType || "HTML", content: options.body },
      toRecipients: options.to.map((email) => ({ emailAddress: { address: email } })),
      ccRecipients: options.cc?.map((email) => ({ emailAddress: { address: email } })),
      bccRecipients: options.bcc?.map((email) => ({ emailAddress: { address: email } })),
    };

    return withRetry(async () => {
      await client.api("/me/sendMail").post({ message });
      return { success: true };
    });
  }

  async replyToMessage(messageId: string, options: { body: string; replyAll?: boolean }) {
    const client = this.ensureClient();
    const endpoint = options.replyAll ? "replyAll" : "reply";
    return withRetry(async () => {
      await client.api(`/me/messages/${messageId}/${endpoint}`).post({ comment: options.body });
      return { success: true };
    });
  }

  async listCalendarEvents(options?: { startDateTime?: string; endDateTime?: string; top?: number }) {
    const client = this.ensureClient();
    const now = new Date();
    const start = options?.startDateTime || now.toISOString();
    const end = options?.endDateTime || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    return withRetry(async () => {
      const response = await client
        .api("/me/calendarView")
        .query({ startDateTime: start, endDateTime: end })
        .select("id,subject,start,end,location,organizer,attendees,isOnlineMeeting,onlineMeetingUrl,bodyPreview")
        .orderby("start/dateTime")
        .top(options?.top || 25)
        .get();
      return response.value;
    });
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
    if (options.body) event.body = { contentType: "HTML", content: options.body };
    if (options.attendees) {
      event.attendees = options.attendees.map((email) => ({ emailAddress: { address: email }, type: "required" }));
    }
    if (options.location) event.location = { displayName: options.location };
    if (options.isOnlineMeeting) {
      event.isOnlineMeeting = true;
      event.onlineMeetingProvider = "teamsForBusiness";
    }

    return withRetry(async () => client.api("/me/events").post(event));
  }

  async listMailFolders() {
    const client = this.ensureClient();
    return withRetry(async () => {
      const response = await client.api("/me/mailFolders").top(50).get();
      return response.value;
    });
  }

  async moveMessage(messageId: string, destinationFolderId: string) {
    const client = this.ensureClient();
    return withRetry(async () => {
      return client.api(`/me/messages/${messageId}/move`).post({ destinationId: destinationFolderId });
    });
  }

  async searchMessages(query: string, top?: number) {
    return this.listMessages({ search: query, top: top || 10 });
  }

  async deleteMessage(messageId: string) {
    const client = this.ensureClient();
    return withRetry(async () => {
      await client.api(`/me/messages/${messageId}`).delete();
      return { success: true };
    });
  }

  async markMessageRead(messageId: string, isRead: boolean) {
    const client = this.ensureClient();
    return withRetry(async () => {
      return client.api(`/me/messages/${messageId}`).patch({ isRead });
    });
  }

  async forwardMessage(messageId: string, to: string[], comment?: string) {
    const client = this.ensureClient();
    return withRetry(async () => {
      await client.api(`/me/messages/${messageId}/forward`).post({
        comment: comment || "",
        toRecipients: to.map((email) => ({ emailAddress: { address: email } })),
      });
      return { success: true };
    });
  }

  async createDraft(options: {
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    bodyType?: "HTML" | "Text";
  }) {
    const client = this.ensureClient();
    const message = {
      subject: options.subject,
      body: { contentType: options.bodyType || "HTML", content: options.body },
      toRecipients: options.to.map((email) => ({ emailAddress: { address: email } })),
      ccRecipients: options.cc?.map((email) => ({ emailAddress: { address: email } })),
    };
    return withRetry(async () => client.api("/me/messages").post(message));
  }

  async deleteCalendarEvent(eventId: string) {
    const client = this.ensureClient();
    return withRetry(async () => {
      await client.api(`/me/events/${eventId}`).delete();
      return { success: true };
    });
  }

  async updateCalendarEvent(eventId: string, options: {
    subject?: string;
    body?: string;
    start?: string;
    end?: string;
    timeZone?: string;
    location?: string;
  }) {
    const client = this.ensureClient();
    const update: Record<string, unknown> = {};
    if (options.subject) update.subject = options.subject;
    if (options.body) update.body = { contentType: "HTML", content: options.body };
    if (options.start) update.start = { dateTime: options.start, timeZone: options.timeZone || "UTC" };
    if (options.end) update.end = { dateTime: options.end, timeZone: options.timeZone || "UTC" };
    if (options.location) update.location = { displayName: options.location };
    return withRetry(async () => client.api(`/me/events/${eventId}`).patch(update));
  }

  async getAttachment(messageId: string, attachmentId: string) {
    const client = this.ensureClient();
    return withRetry(async () => {
      return client.api(`/me/messages/${messageId}/attachments/${attachmentId}`).get();
    });
  }

  async flagMessage(messageId: string, flagStatus: "flagged" | "complete" | "notFlagged") {
    const client = this.ensureClient();
    return withRetry(async () => {
      return client.api(`/me/messages/${messageId}`).patch({
        flag: { flagStatus },
      });
    });
  }

  // Contacts

  async listContacts(options?: { top?: number; skip?: number; search?: string }) {
    const client = this.ensureClient();
    let url = "/me/contacts";
    const params: string[] = [];
    if (options?.top) params.push(`$top=${options.top}`);
    if (options?.skip) params.push(`$skip=${options.skip}`);
    if (options?.search) params.push(`$search="${options.search}"`);
    params.push("$select=id,displayName,emailAddresses,mobilePhone,businessPhones,companyName,jobTitle");
    params.push("$orderby=displayName");
    if (params.length > 0) url += `?${params.join("&")}`;
    return withRetry(async () => {
      const response = await client.api(url).get();
      return response.value;
    });
  }

  async getContact(contactId: string) {
    const client = this.ensureClient();
    return withRetry(async () => client.api(`/me/contacts/${contactId}`).get());
  }

  async createContact(options: {
    givenName?: string;
    surname?: string;
    displayName?: string;
    emailAddresses?: { address: string; name?: string }[];
    mobilePhone?: string;
    businessPhones?: string[];
    companyName?: string;
    jobTitle?: string;
  }) {
    const client = this.ensureClient();
    const contact: Record<string, unknown> = {};
    if (options.givenName) contact.givenName = options.givenName;
    if (options.surname) contact.surname = options.surname;
    if (options.displayName) contact.displayName = options.displayName;
    if (options.emailAddresses) contact.emailAddresses = options.emailAddresses;
    if (options.mobilePhone) contact.mobilePhone = options.mobilePhone;
    if (options.businessPhones) contact.businessPhones = options.businessPhones;
    if (options.companyName) contact.companyName = options.companyName;
    if (options.jobTitle) contact.jobTitle = options.jobTitle;
    return withRetry(async () => client.api("/me/contacts").post(contact));
  }

  async updateContact(contactId: string, options: {
    givenName?: string;
    surname?: string;
    displayName?: string;
    emailAddresses?: { address: string; name?: string }[];
    mobilePhone?: string;
    businessPhones?: string[];
    companyName?: string;
    jobTitle?: string;
  }) {
    const client = this.ensureClient();
    const update: Record<string, unknown> = {};
    if (options.givenName) update.givenName = options.givenName;
    if (options.surname) update.surname = options.surname;
    if (options.displayName) update.displayName = options.displayName;
    if (options.emailAddresses) update.emailAddresses = options.emailAddresses;
    if (options.mobilePhone) update.mobilePhone = options.mobilePhone;
    if (options.businessPhones) update.businessPhones = options.businessPhones;
    if (options.companyName) update.companyName = options.companyName;
    if (options.jobTitle) update.jobTitle = options.jobTitle;
    return withRetry(async () => client.api(`/me/contacts/${contactId}`).patch(update));
  }

  async deleteContact(contactId: string) {
    const client = this.ensureClient();
    return withRetry(async () => {
      await client.api(`/me/contacts/${contactId}`).delete();
      return { success: true };
    });
  }

  // Calendar RSVP

  async respondToEvent(eventId: string, response: "accept" | "tentativelyAccept" | "decline", message?: string) {
    const client = this.ensureClient();
    const body: Record<string, unknown> = { sendResponse: true };
    if (message) body.comment = message;
    return withRetry(async () => {
      await client.api(`/me/events/${eventId}/${response}`).post(body);
      return { success: true };
    });
  }

  // List calendars

  async listCalendars() {
    const client = this.ensureClient();
    return withRetry(async () => {
      const response = await client.api("/me/calendars").select("id,name,color,isDefaultCalendar,owner").get();
      return response.value;
    });
  }

  // Categories

  async listCategories() {
    const client = this.ensureClient();
    return withRetry(async () => {
      const response = await client.api("/me/outlook/masterCategories").get();
      return response.value;
    });
  }

  async setMessageCategories(messageId: string, categories: string[]) {
    const client = this.ensureClient();
    return withRetry(async () => {
      return client.api(`/me/messages/${messageId}`).patch({ categories });
    });
  }

  // Auto-reply / Out of office

  async getAutoReplySettings() {
    const client = this.ensureClient();
    return withRetry(async () => {
      return client.api("/me/mailboxSettings/automaticRepliesSetting").get();
    });
  }

  async setAutoReply(options: {
    status: "disabled" | "alwaysEnabled" | "scheduled";
    internalReplyMessage?: string;
    externalReplyMessage?: string;
    scheduledStartDateTime?: string;
    scheduledEndDateTime?: string;
    externalAudience?: "none" | "contactsOnly" | "all";
  }) {
    const client = this.ensureClient();
    const settings: Record<string, unknown> = { status: options.status };
    if (options.internalReplyMessage) settings.internalReplyMessage = { message: options.internalReplyMessage };
    if (options.externalReplyMessage) settings.externalReplyMessage = { message: options.externalReplyMessage };
    if (options.scheduledStartDateTime) settings.scheduledStartDateTime = { dateTime: options.scheduledStartDateTime, timeZone: "UTC" };
    if (options.scheduledEndDateTime) settings.scheduledEndDateTime = { dateTime: options.scheduledEndDateTime, timeZone: "UTC" };
    if (options.externalAudience) settings.externalAudience = options.externalAudience;
    return withRetry(async () => {
      return client.api("/me/mailboxSettings").patch({ automaticRepliesSetting: settings });
    });
  }

  // Focused inbox

  async getFocusedInboxOverrides() {
    const client = this.ensureClient();
    return withRetry(async () => {
      const response = await client.api("/me/inferenceClassification/overrides").get();
      return response.value;
    });
  }

  async setFocusedInboxOverride(senderEmail: string, classifyAs: "focused" | "other") {
    const client = this.ensureClient();
    return withRetry(async () => {
      return client.api("/me/inferenceClassification/overrides").post({
        classifyAs,
        senderEmailAddress: { address: senderEmail },
      });
    });
  }

  // Mail rules

  async listMailRules() {
    const client = this.ensureClient();
    return withRetry(async () => {
      const response = await client.api("/me/mailFolders/inbox/messageRules").get();
      return response.value;
    });
  }
}
