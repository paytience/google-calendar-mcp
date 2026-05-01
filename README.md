# Outlook MCP

Connect Microsoft Outlook to AI assistants via the Model Context Protocol. Read, send, and search emails. View and create calendar events. Works with Claude Code, Cursor, Windsurf, and any MCP-compatible client.

## Quick Start

```bash
npx @paytience/outlook-mcp
```

On first run, your browser opens to complete payment ($5 one-time) and connect your Microsoft account. After that, the MCP server starts automatically.

## Configuration

Add to your MCP client settings:

### Claude Code

```json
{
  "mcpServers": {
    "outlook": {
      "command": "npx",
      "args": ["-y", "@paytience/outlook-mcp@latest"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "outlook": {
      "command": "npx",
      "args": ["-y", "@paytience/outlook-mcp@latest"]
    }
  }
}
```

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
| `list_accounts` | List connected Outlook accounts |
| `switch_account` | Switch active account |
| `add_account` | Connect another Outlook account |

## Multi-Account Support

Connect unlimited Microsoft/Outlook accounts with a single purchase. Use `switch_account` to change which account is active. All email and calendar tools operate on the currently selected account.

## Security

- OAuth 2.0 Authorization Code flow (industry standard)
- Tokens encrypted at rest (AES-256-GCM)
- Client secrets never stored on your machine
- API keys scoped per installation

## Pricing

$5 one-time payment. Lifetime access. Unlimited accounts.

Purchase at [mcpoutlook.com](https://mcpoutlook.com).

## Support

Open an issue on this repository or email support via mcpoutlook.com.
