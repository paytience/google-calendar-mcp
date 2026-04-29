import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Graph client
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();
const mockSelect = vi.fn(() => ({ get: mockGet, expand: mockExpand, orderby: vi.fn(() => ({ top: vi.fn(() => ({ get: mockGet })) })) }));
const mockQuery = vi.fn(() => ({ select: mockSelect, orderby: vi.fn(() => ({ top: vi.fn(() => ({ get: mockGet })) })) }));
const mockTop = vi.fn(() => ({ get: mockGet }));
const mockExpand = vi.fn(() => ({ get: mockGet }));
const mockApi = vi.fn(() => ({
  get: mockGet,
  post: mockPost,
  patch: mockPatch,
  delete: mockDelete,
  select: mockSelect,
  query: mockQuery,
  top: mockTop,
  expand: mockExpand,
  orderby: vi.fn(() => ({ top: vi.fn(() => ({ get: mockGet })) })),
}));

vi.mock("@microsoft/microsoft-graph-client", () => ({
  Client: {
    init: () => ({ api: mockApi }),
  },
}));

vi.mock("isomorphic-fetch", () => ({}));
vi.mock("../token-store.js", () => ({
  fetchTokens: vi.fn(() => Promise.resolve({
    tokens: { accessToken: "test-token", refreshToken: "test-refresh", expiresAt: Date.now() + 3600000 },
  })),
  updateTokens: vi.fn(),
}));
vi.mock("../auth.js", () => ({
  refreshAccessToken: vi.fn(),
}));

import { OutlookClient } from "../outlook-client.js";

describe("OutlookClient", () => {
  let client: OutlookClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new OutlookClient({
      clientId: "test",
      clientSecret: "test",
      tenantId: "common",
      redirectUri: "http://localhost",
    });
    client.switchAccount({ email: "test@example.com", displayName: "Test", apiKey: "key" });
  });

  describe("Email", () => {
    it("listMessages returns messages", async () => {
      mockGet.mockResolvedValue({ value: [{ id: "1", subject: "Test" }] });
      const result = await client.listMessages({ folder: "inbox", top: 10 });
      expect(result).toEqual([{ id: "1", subject: "Test" }]);
      expect(mockApi).toHaveBeenCalledWith(expect.stringContaining("/me/mailFolders/inbox/messages"));
    });

    it("getMessage returns a single message", async () => {
      mockGet.mockResolvedValue({ id: "1", subject: "Test", body: { content: "hello" } });
      const result = await client.getMessage("msg-1");
      expect(result).toHaveProperty("id", "1");
    });

    it("sendMessage posts to /me/sendMail", async () => {
      mockPost.mockResolvedValue(undefined);
      const result = await client.sendMessage({ to: ["a@b.com"], subject: "Hi", body: "Hello" });
      expect(result).toEqual({ success: true });
      expect(mockApi).toHaveBeenCalledWith("/me/sendMail");
    });

    it("replyToMessage posts reply", async () => {
      mockPost.mockResolvedValue(undefined);
      const result = await client.replyToMessage("msg-1", { body: "Thanks" });
      expect(result).toEqual({ success: true });
      expect(mockApi).toHaveBeenCalledWith("/me/messages/msg-1/reply");
    });

    it("replyToMessage with replyAll", async () => {
      mockPost.mockResolvedValue(undefined);
      await client.replyToMessage("msg-1", { body: "Thanks", replyAll: true });
      expect(mockApi).toHaveBeenCalledWith("/me/messages/msg-1/replyAll");
    });

    it("forwardMessage posts forward", async () => {
      mockPost.mockResolvedValue(undefined);
      const result = await client.forwardMessage("msg-1", ["c@d.com"], "FYI");
      expect(result).toEqual({ success: true });
      expect(mockApi).toHaveBeenCalledWith("/me/messages/msg-1/forward");
    });

    it("deleteMessage deletes a message", async () => {
      mockDelete.mockResolvedValue(undefined);
      const result = await client.deleteMessage("msg-1");
      expect(result).toEqual({ success: true });
      expect(mockApi).toHaveBeenCalledWith("/me/messages/msg-1");
    });

    it("markMessageRead patches isRead", async () => {
      mockPatch.mockResolvedValue({ isRead: true });
      const result = await client.markMessageRead("msg-1", true);
      expect(mockPatch).toHaveBeenCalledWith({ isRead: true });
      expect(result).toHaveProperty("isRead", true);
    });

    it("moveMessage posts to move endpoint", async () => {
      mockPost.mockResolvedValue({ id: "msg-1" });
      const result = await client.moveMessage("msg-1", "folder-2");
      expect(mockApi).toHaveBeenCalledWith("/me/messages/msg-1/move");
      expect(mockPost).toHaveBeenCalledWith({ destinationId: "folder-2" });
    });

    it("createDraft posts a draft message", async () => {
      mockPost.mockResolvedValue({ id: "draft-1", subject: "Draft" });
      const result = await client.createDraft({ to: ["a@b.com"], subject: "Draft", body: "content" });
      expect(mockApi).toHaveBeenCalledWith("/me/messages");
      expect(result).toHaveProperty("id", "draft-1");
    });

    it("flagMessage patches flag status", async () => {
      mockPatch.mockResolvedValue({ flag: { flagStatus: "flagged" } });
      const result = await client.flagMessage("msg-1", "flagged");
      expect(mockPatch).toHaveBeenCalledWith({ flag: { flagStatus: "flagged" } });
    });

    it("getAttachment gets an attachment", async () => {
      mockGet.mockResolvedValue({ id: "att-1", name: "file.pdf" });
      const result = await client.getAttachment("msg-1", "att-1");
      expect(mockApi).toHaveBeenCalledWith("/me/messages/msg-1/attachments/att-1");
    });

    it("listMailFolders returns folders", async () => {
      mockGet.mockResolvedValue({ value: [{ id: "inbox", displayName: "Inbox" }] });
      const result = await client.listMailFolders();
      expect(result).toEqual([{ id: "inbox", displayName: "Inbox" }]);
    });

    it("searchMessages calls listMessages with search", async () => {
      mockGet.mockResolvedValue({ value: [{ id: "1", subject: "Match" }] });
      const result = await client.searchMessages("test query", 5);
      expect(mockApi).toHaveBeenCalledWith(expect.stringContaining("$search"));
    });
  });

  describe("Calendar", () => {
    it("listCalendarEvents returns events", async () => {
      mockGet.mockResolvedValue({ value: [{ id: "ev-1", subject: "Meeting" }] });
      const result = await client.listCalendarEvents();
      expect(result).toEqual([{ id: "ev-1", subject: "Meeting" }]);
    });

    it("createCalendarEvent posts an event", async () => {
      mockPost.mockResolvedValue({ id: "ev-1", subject: "New Event" });
      const result = await client.createCalendarEvent({
        subject: "New Event",
        start: "2026-01-01T10:00:00",
        end: "2026-01-01T11:00:00",
      });
      expect(mockApi).toHaveBeenCalledWith("/me/events");
      expect(result).toHaveProperty("subject", "New Event");
    });

    it("createCalendarEvent with Teams meeting", async () => {
      mockPost.mockResolvedValue({ id: "ev-1", isOnlineMeeting: true });
      await client.createCalendarEvent({
        subject: "Teams Call",
        start: "2026-01-01T10:00:00",
        end: "2026-01-01T11:00:00",
        isOnlineMeeting: true,
      });
      expect(mockPost).toHaveBeenCalledWith(expect.objectContaining({ isOnlineMeeting: true }));
    });

    it("deleteCalendarEvent deletes an event", async () => {
      mockDelete.mockResolvedValue(undefined);
      const result = await client.deleteCalendarEvent("ev-1");
      expect(result).toEqual({ success: true });
      expect(mockApi).toHaveBeenCalledWith("/me/events/ev-1");
    });

    it("updateCalendarEvent patches an event", async () => {
      mockPatch.mockResolvedValue({ id: "ev-1", subject: "Updated" });
      const result = await client.updateCalendarEvent("ev-1", { subject: "Updated" });
      expect(mockApi).toHaveBeenCalledWith("/me/events/ev-1");
    });

    it("respondToEvent accepts an invitation", async () => {
      mockPost.mockResolvedValue(undefined);
      const result = await client.respondToEvent("ev-1", "accept", "I'll be there");
      expect(result).toEqual({ success: true });
      expect(mockApi).toHaveBeenCalledWith("/me/events/ev-1/accept");
    });

    it("respondToEvent declines an invitation", async () => {
      mockPost.mockResolvedValue(undefined);
      await client.respondToEvent("ev-1", "decline");
      expect(mockApi).toHaveBeenCalledWith("/me/events/ev-1/decline");
    });

    it("listCalendars returns calendars", async () => {
      mockGet.mockResolvedValue({ value: [{ id: "cal-1", name: "My Calendar" }] });
      const result = await client.listCalendars();
      expect(result).toEqual([{ id: "cal-1", name: "My Calendar" }]);
    });
  });

  describe("Contacts", () => {
    it("listContacts returns contacts", async () => {
      mockGet.mockResolvedValue({ value: [{ id: "c-1", displayName: "John" }] });
      const result = await client.listContacts({ top: 10 });
      expect(result).toEqual([{ id: "c-1", displayName: "John" }]);
    });

    it("getContact returns a single contact", async () => {
      mockGet.mockResolvedValue({ id: "c-1", displayName: "John" });
      const result = await client.getContact("c-1");
      expect(result).toHaveProperty("displayName", "John");
    });

    it("createContact posts a contact", async () => {
      mockPost.mockResolvedValue({ id: "c-1", givenName: "Jane" });
      const result = await client.createContact({ givenName: "Jane", surname: "Doe" });
      expect(mockApi).toHaveBeenCalledWith("/me/contacts");
    });

    it("updateContact patches a contact", async () => {
      mockPatch.mockResolvedValue({ id: "c-1", jobTitle: "Engineer" });
      const result = await client.updateContact("c-1", { jobTitle: "Engineer" });
      expect(mockApi).toHaveBeenCalledWith("/me/contacts/c-1");
    });

    it("deleteContact deletes a contact", async () => {
      mockDelete.mockResolvedValue(undefined);
      const result = await client.deleteContact("c-1");
      expect(result).toEqual({ success: true });
    });
  });

  describe("Categories", () => {
    it("listCategories returns categories", async () => {
      mockGet.mockResolvedValue({ value: [{ displayName: "Red", color: "preset0" }] });
      const result = await client.listCategories();
      expect(result).toEqual([{ displayName: "Red", color: "preset0" }]);
    });

    it("setMessageCategories patches categories on a message", async () => {
      mockPatch.mockResolvedValue({ categories: ["Important"] });
      const result = await client.setMessageCategories("msg-1", ["Important"]);
      expect(mockPatch).toHaveBeenCalledWith({ categories: ["Important"] });
    });
  });

  describe("Auto-Reply", () => {
    it("getAutoReplySettings returns settings", async () => {
      mockGet.mockResolvedValue({ status: "disabled" });
      const result = await client.getAutoReplySettings();
      expect(result).toHaveProperty("status", "disabled");
    });

    it("setAutoReply patches mailbox settings", async () => {
      mockPatch.mockResolvedValue({ automaticRepliesSetting: { status: "alwaysEnabled" } });
      const result = await client.setAutoReply({ status: "alwaysEnabled", internalReplyMessage: "OOO" });
      expect(mockApi).toHaveBeenCalledWith("/me/mailboxSettings");
    });
  });

  describe("Focused Inbox", () => {
    it("getFocusedInboxOverrides returns overrides", async () => {
      mockGet.mockResolvedValue({ value: [{ senderEmailAddress: { address: "a@b.com" }, classifyAs: "focused" }] });
      const result = await client.getFocusedInboxOverrides();
      expect(result).toHaveLength(1);
    });

    it("setFocusedInboxOverride posts an override", async () => {
      mockPost.mockResolvedValue({ classifyAs: "other" });
      const result = await client.setFocusedInboxOverride("spam@evil.com", "other");
      expect(mockApi).toHaveBeenCalledWith("/me/inferenceClassification/overrides");
    });
  });

  describe("Mail Rules", () => {
    it("listMailRules returns rules", async () => {
      mockGet.mockResolvedValue({ value: [{ id: "rule-1", displayName: "Move newsletters" }] });
      const result = await client.listMailRules();
      expect(result).toEqual([{ id: "rule-1", displayName: "Move newsletters" }]);
    });
  });
});
