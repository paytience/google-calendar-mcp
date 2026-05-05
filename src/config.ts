import fs from "node:fs";
import path from "node:path";
import os from "node:os";

export interface McpConfig {
  accounts: AccountConfig[];
}

export interface AccountConfig {
  email: string;
  displayName: string;
  apiKey: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".google-calendar-mcp");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function loadConfig(): McpConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { accounts: [] };
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
}

export function saveConfig(config: McpConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function addAccount(account: AccountConfig): void {
  const config = loadConfig();
  const existing = config.accounts.findIndex((a) => a.email === account.email);
  if (existing >= 0) {
    config.accounts[existing] = account;
  } else {
    config.accounts.push(account);
  }
  saveConfig(config);
}

export function removeAccount(email: string): boolean {
  const config = loadConfig();
  const before = config.accounts.length;
  config.accounts = config.accounts.filter((a) => a.email !== email);
  if (config.accounts.length === before) return false;
  saveConfig(config);
  return true;
}

export function getAccounts(): AccountConfig[] {
  return loadConfig().accounts;
}
