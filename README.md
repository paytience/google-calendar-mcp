# Google Calendar MCP

Connect Google Calendar to AI assistants via the Model Context Protocol. View, create, update, and search calendar events. Check availability and manage multiple calendars. Works with Claude Code, Cursor, Windsurf, Kiro, and any MCP-compatible client.

## Quick Start

```bash
npx @paytience/google-calendar-mcp
```

On first run, your browser opens to complete payment ($5 one-time) and connect your Google account. After that, the MCP server starts automatically.

## Configuration

Add to your MCP client settings:

### Claude Code

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@paytience/google-calendar-mcp@latest"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@paytience/google-calendar-mcp@latest"]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@paytience/google-calendar-mcp@latest"]
    }
  }
}
```

### Kiro

Add to `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@paytience/google-calendar-mcp@latest"]
    }
  }
}
```


### Docker

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "-e", "GOOGLE_CALENDAR_MCP_API_KEY", "ghcr.io/paytience/google-calendar-mcp:latest"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `list_events` | List upcoming calendar events |
| `get_event` | Get details of a specific event |
| `create_event` | Create a new calendar event |
| `update_event` | Update an existing calendar event |
| `delete_event` | Delete a calendar event |
| `search_events` | Search events by keyword |
| `quick_add_event` | Create an event using natural language |
| `respond_to_event` | RSVP to an event (accept, tentative, decline) |

| `get_free_busy` | Check availability for attendees |
| `move_event` | Move an event to a different calendar |
| `get_colors` | Get available event color options |
| `list_calendars` | List all calendars in the account |
| `list_accounts` | List connected Google accounts |
| `switch_account` | Switch active account |
| `add_account` | Connect another Google account |
| `remove_account` | Remove a connected account |

## Multi-Account Support

Connect unlimited Google accounts with a single purchase. Use `switch_account` to change which account is active. All calendar tools operate on the currently selected account.

## Compatibility

### Supported accounts

| Account type | Status |
|---|---|
| Personal Google (gmail.com) | Fully supported |
| Google Workspace | Supported (admin may need to allow the app) |

### Google Workspace

Works with Google Workspace accounts. If your organization restricts third-party app access, your admin may need to allow the app in the Admin Console under Security > API Controls.

The app requests these Google OAuth scopes:

| Scope | Purpose |
|---|---|
| `calendar` | Full calendar access |
| `calendar.events` | View and manage events |
| `userinfo.email` | Read your email address |
| `userinfo.profile` | Read your name |

### Not supported

- Accounts with Google Advanced Protection Program (may block third-party OAuth)

## Security

- OAuth 2.0 Authorization Code flow (industry standard)
- Tokens encrypted at rest (AES-256-GCM)
- Client secrets never stored on your machine
- API keys scoped per installation
- Refresh tokens use offline access with consent prompt

## Pricing

$5 one-time payment. Lifetime access. Unlimited accounts.

## Support

Open an issue on this repository.

## Privacy

See our [Privacy Policy](https://mcpcalendar.com/privacy).

## License

[Business Source License 1.1](LICENSE). Free to use with a valid license key ($5 one-time purchase). Converts to MIT after 4 years.
