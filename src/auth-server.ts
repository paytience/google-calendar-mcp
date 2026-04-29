import "dotenv/config";
import http from "node:http";
import { URL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  OAuthConfig,
  TokenSet,
} from "./auth.js";

const config: OAuthConfig = {
  clientId: process.env.OUTLOOK_CLIENT_ID || "",
  clientSecret: process.env.OUTLOOK_CLIENT_SECRET || "",
  tenantId: process.env.OUTLOOK_TENANT_ID || "common",
  redirectUri: process.env.OUTLOOK_REDIRECT_URI || "http://localhost:3333/callback",
};

const TOKEN_FILE = process.env.OUTLOOK_TOKEN_FILE || "./tokens.json";

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
      saveTokens(tokens);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>Outlook connected successfully</h1><p>You can close this window. The MCP server will use these credentials.</p>");
      console.log("Tokens saved successfully. The MCP server can now access Outlook.");
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/html" });
      res.end(`<h1>Token exchange failed</h1><p>${err}</p>`);
    }
    return;
  }

  if (url.pathname === "/status") {
    const hasTokens = fs.existsSync(TOKEN_FILE);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ authenticated: hasTokens }));
    return;
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <h1>Outlook MCP Auth</h1>
    <p><a href="/login">Click here to connect your Outlook account</a></p>
  `);
});

function saveTokens(tokens: TokenSet) {
  const dir = path.dirname(TOKEN_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
}

server.listen(port, () => {
  console.log(`Auth server running at http://localhost:${port}`);
  console.log(`Open http://localhost:${port}/login to connect your Outlook account`);
});
