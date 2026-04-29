import "dotenv/config";
import http from "node:http";
import { URL } from "node:url";
import {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  fetchUserProfile,
  AccountStore,
  OAuthConfig,
} from "./auth.js";

const config: OAuthConfig = {
  clientId: process.env.OUTLOOK_CLIENT_ID || "",
  clientSecret: process.env.OUTLOOK_CLIENT_SECRET || "",
  tenantId: process.env.OUTLOOK_TENANT_ID || "common",
  redirectUri: process.env.OUTLOOK_REDIRECT_URI || "http://localhost:3333/callback",
};

const ACCOUNTS_DIR = process.env.OUTLOOK_ACCOUNTS_DIR || "./accounts";
const store = new AccountStore(ACCOUNTS_DIR);

if (!config.clientId || !config.clientSecret) {
  console.error("Missing OUTLOOK_CLIENT_ID or OUTLOOK_CLIENT_SECRET");
  process.exit(1);
}

const port = parseInt(process.env.AUTH_PORT || "3333", 10);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);

  if (url.pathname === "/login") {
    const authUrl = getAuthorizationUrl(config);
    res.writeHead(302, { Location: authUrl });
    res.end();
    return;
  }

  if (url.pathname === "/callback") {
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(`<h1>Authorization failed</h1><p>${url.searchParams.get("error_description")}</p>`);
      return;
    }

    if (!code) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end("<h1>Missing authorization code</h1>");
      return;
    }

    try {
      const tokens = await exchangeCodeForTokens(config, code);
      const profile = await fetchUserProfile(tokens.accessToken);

      store.save({
        email: profile.email,
        displayName: profile.displayName,
        tokens,
      });

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<h1>Connected: ${profile.displayName}</h1><p>${profile.email} added successfully.</p><p><a href="/login">Add another account</a> | <a href="/accounts">View all accounts</a></p>`);
      console.log(`Account added: ${profile.email} (${profile.displayName})`);
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(`<h1>Token exchange failed</h1><p>${err}</p>`);
    }
    return;
  }

  if (url.pathname === "/accounts") {
    const accounts = store.list();
    const list = accounts
      .map((a) => `<li>${a.displayName} (${a.email})</li>`)
      .join("");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(accounts.map((a) => ({ email: a.email, displayName: a.displayName }))));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <h1>Outlook MCP Auth</h1>
    <p><a href="/login">Connect an Outlook account</a></p>
    <p><a href="/accounts">View connected accounts</a></p>
  `);
});

server.listen(port, () => {
  console.log(`Auth server running at http://localhost:${port}`);
  console.log(`Open http://localhost:${port}/login to connect an Outlook account`);
  console.log(`Accounts stored in: ${ACCOUNTS_DIR}`);
});
