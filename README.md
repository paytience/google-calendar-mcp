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
| `forward_email` | Forward an email to other recipients |
| `search_emails` | Search emails by keyword |
| `list_mail_folders` | List all mail folders |
| `move_email` | Move an email to a different folder |
| `delete_email` | Delete an email |
| `mark_email_read` | Mark an email as read or unread |
| `flag_email` | Flag or unflag an email |
| `list_calendar_events` | List upcoming calendar events |
| `create_calendar_event` | Create a new calendar event (auto-detects timezone) |
| `update_calendar_event` | Update an existing calendar event |
| `delete_calendar_event` | Delete a calendar event |
| `search_calendar_events` | Search events by subject text |
| `get_free_busy` | Check availability for attendees |
| `list_calendars` | List all calendars in the account |
| `list_contacts` | List contacts from your address book |
| `get_contact` | Get details of a specific contact |
| `create_contact` | Create a new contact |
| `update_contact` | Update an existing contact |
| `delete_contact` | Delete a contact |
| `list_accounts` | List connected Outlook accounts |
| `switch_account` | Switch active account |
| `add_account` | Connect another Outlook account |

## Multi-Account Support

Connect unlimited Microsoft/Outlook accounts with a single purchase. Use `switch_account` to change which account is active. All email and calendar tools operate on the currently selected account.

## Compatibility

### Supported accounts

| Account type | Status |
|---|---|
| Personal Microsoft (outlook.com, hotmail.com, live.com) | Fully supported |
| Microsoft 365 / Work accounts | Supported (may require admin consent) |
| Gmail linked to Microsoft (personal) | Fully supported |

### Enterprise / organizational accounts

Works with Microsoft 365 enterprise accounts. However, your organization's IT admin may need to grant consent before you can use the app. This depends on your tenant's consent policy:

- **If your org allows user consent**: You can connect immediately.
- **If your org requires admin consent**: Ask your IT admin to approve the app for your tenant, or grant consent for your account specifically.

The app requests these Microsoft Graph permissions (all delegated):

| Permission | Purpose |
|---|---|
| `Mail.Read` | Read emails |
| `Mail.Send` | Send emails |
| `Mail.ReadWrite` | Move, delete, flag emails |
| `Calendars.ReadWrite` | View and create calendar events |
| `Contacts.ReadWrite` | View and manage contacts |
| `MailboxSettings.ReadWrite` | Read timezone and auto-reply settings |
| `User.Read` | Read your profile (name, email) |

### Not supported

- On-premises Exchange Server (no Microsoft Graph access)
- US Government Cloud (GCC, GCC High, DoD)
- Shared mailboxes (require interactive login)
- Accounts without Exchange Online license

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
