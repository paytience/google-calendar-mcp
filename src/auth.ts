import fs from "node:fs";
import path from "node:path";
import "isomorphic-fetch";

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface StoredAccount {
  email: string;
  displayName: string;
  tokens: TokenSet;
}

const SCOPES = [
  "offline_access",
  "Mail.Read",
  "Mail.Send",
  "Mail.ReadWrite",
  "Calendars.Read",
  "Calendars.ReadWrite",
  "User.Read",
];

export function getAuthorizationUrl(config: OAuthConfig, state?: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: "code",
    redirect_uri: config.redirectUri,
    response_mode: "query",
    scope: SCOPES.join(" "),
    state: state || "outlook-mcp",
  });

  return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  config: OAuthConfig,
  code: string
): Promise<TokenSet> {
  const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
    scope: SCOPES.join(" "),
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshAccessToken(
  config: OAuthConfig,
  refreshToken: string
): Promise<TokenSet> {
  const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
    scope: SCOPES.join(" "),
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function fetchUserProfile(accessToken: string): Promise<{ email: string; displayName: string }> {
  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const data = await response.json();
  return {
    email: data.mail || data.userPrincipalName,
    displayName: data.displayName || data.mail || data.userPrincipalName,
  };
}

export class AccountStore {
  private storePath: string;

  constructor(storePath: string) {
    this.storePath = storePath;
    if (!fs.existsSync(storePath)) {
      fs.mkdirSync(storePath, { recursive: true });
    }
  }

  private accountFilePath(email: string): string {
    const safe = email.toLowerCase().replace(/[^a-z0-9@._-]/g, "_");
    return path.join(this.storePath, `${safe}.json`);
  }

  save(account: StoredAccount): void {
    fs.writeFileSync(this.accountFilePath(account.email), JSON.stringify(account, null, 2));
  }

  get(email: string): StoredAccount | null {
    const filePath = this.accountFilePath(email);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  list(): StoredAccount[] {
    if (!fs.existsSync(this.storePath)) return [];
    return fs
      .readdirSync(this.storePath)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(this.storePath, f), "utf-8")));
  }

  remove(email: string): boolean {
    const filePath = this.accountFilePath(email);
    if (!fs.existsSync(filePath)) return false;
    fs.unlinkSync(filePath);
    return true;
  }
}
