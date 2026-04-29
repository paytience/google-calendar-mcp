# Outlook MCP

MCP server for Microsoft Outlook integration via Microsoft Graph API. Provides email and calendar tools for AI assistants.

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

## Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com) > Azure Active Directory > App registrations
2. Create a new registration
3. Under "API permissions", add Microsoft Graph application permissions:
   - `Mail.Read`
   - `Mail.Send`
   - `Mail.ReadWrite`
   - `Calendars.Read`
   - `Calendars.ReadWrite`
4. Grant admin consent for your organization
5. Under "Certificates & secrets", create a new client secret
6. Note your Client ID, Tenant ID, and Client Secret

## Setup

Copy `.env.example` to `.env` and fill in your Azure credentials:

```
OUTLOOK_CLIENT_ID=your-azure-app-client-id
OUTLOOK_CLIENT_SECRET=your-azure-app-client-secret
OUTLOOK_TENANT_ID=your-azure-tenant-id
OUTLOOK_USER_EMAIL=user@yourdomain.com
```

## Running with Docker

```bash
docker compose up --build -d
```

## Claude Code Configuration

Add to your MCP settings:

```json
{
  "mcpServers": {
    "outlook": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--env-file", "/path/to/.env", "outlook-mcp"]
    }
  }
}
```

Or with docker compose:

```json
{
  "mcpServers": {
    "outlook": {
      "command": "docker",
      "args": ["compose", "-f", "/path/to/docker-compose.yml", "run", "--rm", "-T", "outlook-mcp"]
    }
  }
}
```

## Development

```bash
npm install
npm run dev
```
