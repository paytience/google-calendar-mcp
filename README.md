# Outlook MCP

MCP server for Microsoft Outlook integration via Microsoft Graph API. Uses OAuth 2.0 Authorization Code flow for secure, commercial-grade authentication.

## Architecture

Two services running in Docker:

1. **Auth Server** (port 3333): Handles the OAuth flow. Users visit `/login`, sign in with Microsoft, and the refresh token is stored in a shared volume.
2. **MCP Server** (stdio): Uses the stored refresh token to access Outlook on behalf of the user.

## Tools

| Tool | Description |
|------|-------------|
| `list_emails` | List emails from a mailbox folder |
| `read_email` | Read the full content of a specific email |
| `send_email` | Send a new email |
| `reply_to_email` | Reply to an existing email |
| `search_emails` | Search emails by keyword |
| `list_mail_folders` | List all mail folders |
| `move_email` | Move an email to a different folder |
| `list_calendar_events` | List upcoming calendar events |
| `create_calendar_event` | Create a new calendar event |

## Azure AD App Registration (one time)

1. Go to [Azure Portal](https://portal.azure.com) > Azure Active Directory > App registrations
2. Click "New registration"
3. Set "Supported account types" to **"Accounts in any organizational directory and personal Microsoft accounts"** (multi-tenant)
4. Set Redirect URI to `http://localhost:3333/callback` (Web platform)
5. Under "API permissions", add Microsoft Graph **delegated** permissions:
   - `Mail.Read`
   - `Mail.Send`
   - `Mail.ReadWrite`
   - `Calendars.Read`
   - `Calendars.ReadWrite`
   - `offline_access`
6. Under "Certificates & secrets", create a client secret
7. Note your **Client ID** and **Client Secret**

No admin consent needed for delegated permissions; each user consents individually.

## Setup

```bash
cp .env.example .env
# Fill in OUTLOOK_CLIENT_ID and OUTLOOK_CLIENT_SECRET
```

## Running

### 1. Start services

```bash
docker compose up --build -d
```

### 2. Authenticate

Open `http://localhost:3333/login` in your browser. Sign in with your Microsoft account and grant permissions. Once you see "Outlook connected successfully", the MCP server is ready.

### 3. Configure Claude Code

```json
{
  "mcpServers": {
    "outlook": {
      "command": "docker",
      "args": ["compose", "-f", "/path/to/docker-compose.yml", "run", "--rm", "-T", "mcp"]
    }
  }
}
```

## Development

```bash
npm install
npm run dev:auth   # Start auth server
npm run dev        # Start MCP server
```

## How Token Refresh Works

The auth server obtains an initial access + refresh token pair. The MCP server automatically refreshes the access token when it expires (every ~1 hour). The refresh token itself is long-lived (90 days with rolling refresh), so re-authentication is rarely needed.
