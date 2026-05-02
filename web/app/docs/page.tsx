import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs: Setup, Tools & Permissions",
  description:
    "Setup guides, supported accounts, permissions, and enterprise compatibility for Outlook MCP.",
};

export default function DocsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">Documentation</h1>
      <p className="text-zinc-400 mb-12">
        Everything you need to set up Outlook MCP and let your AI agent control Microsoft Outlook.
        Works with Claude Code, Cursor, Windsurf, Kiro, and any MCP-compatible client.
      </p>

      {/* Tools */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4" id="tools">
          Tools
        </h2>
        <p className="text-zinc-400 text-sm mb-4">
          All tools available through the MCP server:
        </p>
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-zinc-300">Tool</th>
                <th className="px-4 py-2 font-medium text-zinc-300">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[
                ["list_emails", "List emails from a mailbox folder"],
                ["read_email", "Read the full content of a specific email"],
                ["send_email", "Send a new email"],
                ["reply_to_email", "Reply to an existing email"],
                ["forward_email", "Forward an email to other recipients"],
                ["search_emails", "Search emails by keyword"],
                ["list_mail_folders", "List all mail folders"],
                ["move_email", "Move an email to a different folder"],
                ["delete_email", "Delete an email"],
                ["mark_email_read", "Mark an email as read or unread"],
                ["flag_email", "Flag or unflag an email"],
                [
                  "list_calendar_events",
                  "List upcoming calendar events",
                ],
                [
                  "create_calendar_event",
                  "Create a new event (auto-detects timezone)",
                ],
                [
                  "update_calendar_event",
                  "Update an existing calendar event",
                ],
                ["delete_calendar_event", "Delete a calendar event"],
                [
                  "search_calendar_events",
                  "Search events by subject text",
                ],
                [
                  "get_free_busy",
                  "Check availability for attendees",
                ],
                ["list_calendars", "List all calendars in the account"],
                ["list_contacts", "List contacts from your address book"],
                ["get_contact", "Get details of a specific contact"],
                ["create_contact", "Create a new contact"],
                ["update_contact", "Update an existing contact"],
                ["delete_contact", "Delete a contact"],
                ["list_accounts", "List connected Outlook accounts"],
                ["switch_account", "Switch active account"],
                ["add_account", "Connect another Outlook account"],
              ].map(([tool, desc]) => (
                <tr key={tool} className="text-zinc-300">
                  <td className="px-4 py-2 font-mono text-xs text-blue-400">
                    {tool}
                  </td>
                  <td className="px-4 py-2 text-zinc-400">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Compatibility */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4" id="compatibility">
          Compatibility
        </h2>

        <h3 className="text-base font-medium mb-3 text-zinc-200">
          Supported accounts
        </h3>
        <div className="overflow-x-auto rounded-lg border border-zinc-800 mb-8">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-zinc-300">
                  Account type
                </th>
                <th className="px-4 py-2 font-medium text-zinc-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-400">
              <tr>
                <td className="px-4 py-2">
                  Personal Microsoft (outlook.com, hotmail.com, live.com)
                </td>
                <td className="px-4 py-2 text-emerald-400">
                  Fully supported
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Microsoft 365 / Work accounts</td>
                <td className="px-4 py-2 text-yellow-400">
                  Supported (may require admin consent)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Gmail linked to Microsoft (personal)
                </td>
                <td className="px-4 py-2 text-emerald-400">
                  Fully supported
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-medium mb-3 text-zinc-200">
          Enterprise / organizational accounts
        </h3>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 mb-8 text-sm text-zinc-400 space-y-3">
          <p>
            Works with Microsoft 365 enterprise accounts. Your organization's IT
            admin may need to grant consent before you can use the app. This
            depends on your tenant's consent policy:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="text-zinc-200">
                If your org allows user consent:
              </span>{" "}
              You can connect immediately.
            </li>
            <li>
              <span className="text-zinc-200">
                If your org requires admin consent:
              </span>{" "}
              Ask your IT admin to approve the app for your tenant, or grant
              consent for your account specifically.
            </li>
          </ul>
        </div>

        <h3 className="text-base font-medium mb-3 text-zinc-200">
          Not supported
        </h3>
        <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-1 mb-8">
          <li>On-premises Exchange Server (no Microsoft Graph access)</li>
          <li>US Government Cloud (GCC, GCC High, DoD)</li>
          <li>Shared mailboxes (require interactive login)</li>
          <li>Accounts without Exchange Online license</li>
        </ul>
      </section>

      {/* Permissions */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4" id="permissions">
          Permissions
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          The app requests these Microsoft Graph permissions (all delegated, meaning
          it can only access data on behalf of the signed-in user):
        </p>
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-zinc-300">
                  Permission
                </th>
                <th className="px-4 py-2 font-medium text-zinc-300">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-400">
              {[
                ["Mail.Read", "Read emails"],
                ["Mail.Send", "Send emails"],
                ["Mail.ReadWrite", "Move, delete, flag emails"],
                ["Calendars.ReadWrite", "View and create calendar events"],
                ["Contacts.ReadWrite", "View and manage contacts"],
                [
                  "MailboxSettings.ReadWrite",
                  "Read timezone and auto-reply settings",
                ],
                ["User.Read", "Read your profile (name, email)"],
              ].map(([perm, purpose]) => (
                <tr key={perm}>
                  <td className="px-4 py-2 font-mono text-xs text-blue-400">
                    {perm}
                  </td>
                  <td className="px-4 py-2">{purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Security */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4" id="security">
          Security
        </h2>
        <ul className="list-disc pl-5 text-sm text-zinc-400 space-y-2">
          <li>
            <span className="text-zinc-200">OAuth 2.0 Authorization Code flow</span>{" "}
            (industry standard)
          </li>
          <li>
            <span className="text-zinc-200">Tokens encrypted at rest</span>{" "}
            using AES-256-GCM
          </li>
          <li>
            <span className="text-zinc-200">
              Client secrets never stored on your machine
            </span>{" "}
            (kept server-side only)
          </li>
          <li>
            <span className="text-zinc-200">API keys scoped per installation</span>{" "}
            (one key per purchase)
          </li>
          <li>
            <span className="text-zinc-200">No data storage</span>{" "}
            (emails and calendar data pass through, never persisted on our servers)
          </li>
        </ul>
      </section>

      {/* Multi-account */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4" id="multi-account">
          Multi-account support
        </h2>
        <p className="text-sm text-zinc-400">
          Connect unlimited Microsoft/Outlook accounts with a single purchase.
          Use the <code className="text-blue-400 text-xs">switch_account</code>{" "}
          tool to change which account is active. All email and calendar tools
          operate on the currently selected account.
        </p>
      </section>
    </main>
  );
}
