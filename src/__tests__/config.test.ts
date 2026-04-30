import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

vi.mock("node:fs");
vi.mock("node:os", () => ({
  default: { homedir: () => "/home/testuser" },
  homedir: () => "/home/testuser",
}));

import { loadConfig, saveConfig, addAccount, removeAccount, getAccounts, getConfigPath } from "../config.js";

const CONFIG_DIR = path.join("/home/testuser", ".outlook-mcp");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

describe("config", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("getConfigPath", () => {
    it("returns path in home directory", () => {
      expect(getConfigPath()).toBe(CONFIG_FILE);
    });
  });

  describe("loadConfig", () => {
    it("returns empty accounts when config file does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const config = loadConfig();
      expect(config).toEqual({ accounts: [] });
    });

    it("parses config file when it exists", () => {
      const mockConfig = { accounts: [{ email: "test@example.com", displayName: "Test", apiKey: "key123" }] };
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const config = loadConfig();
      expect(config).toEqual(mockConfig);
    });
  });

  describe("saveConfig", () => {
    it("creates directory if it does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as any);

      saveConfig({ accounts: [] });

      expect(fs.mkdirSync).toHaveBeenCalledWith(CONFIG_DIR, { recursive: true });
    });

    it("writes config as formatted JSON", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const config = { accounts: [{ email: "a@b.com", displayName: "A", apiKey: "k" }] };
      saveConfig(config);

      expect(fs.writeFileSync).toHaveBeenCalledWith(CONFIG_FILE, JSON.stringify(config, null, 2));
    });
  });

  describe("addAccount", () => {
    it("adds a new account", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ accounts: [] }));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      addAccount({ email: "new@example.com", displayName: "New", apiKey: "key" });

      const written = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string);
      expect(written.accounts).toHaveLength(1);
      expect(written.accounts[0].email).toBe("new@example.com");
    });

    it("updates existing account by email", () => {
      const existing = { accounts: [{ email: "a@b.com", displayName: "Old", apiKey: "old" }] };
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      addAccount({ email: "a@b.com", displayName: "New", apiKey: "new" });

      const written = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string);
      expect(written.accounts).toHaveLength(1);
      expect(written.accounts[0].apiKey).toBe("new");
    });
  });

  describe("removeAccount", () => {
    it("removes an existing account and returns true", () => {
      const existing = { accounts: [{ email: "a@b.com", displayName: "A", apiKey: "k" }] };
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(existing));
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const result = removeAccount("a@b.com");
      expect(result).toBe(true);

      const written = JSON.parse(vi.mocked(fs.writeFileSync).mock.calls[0][1] as string);
      expect(written.accounts).toHaveLength(0);
    });

    it("returns false when account does not exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ accounts: [] }));

      const result = removeAccount("nonexistent@example.com");
      expect(result).toBe(false);
    });
  });

  describe("getAccounts", () => {
    it("returns accounts from config", () => {
      const accounts = [{ email: "a@b.com", displayName: "A", apiKey: "k" }];
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ accounts }));

      expect(getAccounts()).toEqual(accounts);
    });
  });
});
