import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Docs: Setup, Tools & Permissions",
  description:
    "Setup guides, supported accounts, permissions, and tools for Google Calendar MCP.",
};

export default function DocsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">Documentation</h1>
      <p className="text-zinc-400 mb-12">
        Everything you need to set up Google Calendar MCP and let your AI agent manage your calendar.
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
                ["list_events", "List upcoming calendar events within a time range"],
                ["get_event", "Get full details of a specific event"],
                ["create_event", "Create a new event with attendees, Meet link, recurrence"],
                ["update_event", "Update an existing calendar event"],
                ["delete_event", "Delete a calendar event"],
                ["search_events", "Search events by text query"],
                ["quick_add_event", "Create an event using natural language"],
                ["respond_to_event", "RSVP to an event (accept, tentative, decline)"],
                ["get_free_busy", "Check free/busy status for people"],
                ["list_calendars", "List all accessible calendars"],
                ["move_event", "Move an event to a different calendar"],
                ["get_colors", "Get available event color options"],
                ["list_accounts", "List connected Google accounts"],
                ["switch_account", "Switch active account"],
                ["add_account", "Connect another Google account"],
                ["remove_account", "Disconnect an account"],
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
                  Personal Google accounts (gmail.com)
                </td>
                <td className="px-4 py-2 text-emerald-400">
                  Fully supported
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Google Workspace accounts</td>
                <td className="px-4 py-2 text-emerald-400">
                  Fully supported
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Google Workspace with restricted API access
                </td>
                <td className="px-4 py-2 text-yellow-400">
                  May require admin approval
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-medium mb-3 text-zinc-200">
          Google Workspace organizations
        </h3>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 mb-8 text-sm text-zinc-400 space-y-3">
          <p>
            Works with Google Workspace accounts. Some organizations restrict
            third-party app access:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="text-zinc-200">
                If your org allows third-party apps:
              </span>{" "}
              You can connect immediately.
            </li>
            <li>
              <span className="text-zinc-200">
                If your org restricts OAuth apps:
              </span>{" "}
              Ask your admin to allowlist the app&apos;s OAuth client ID.
            </li>
          </ul>
        </div>
      </section>

      {/* Permissions */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4" id="permissions">
          Permissions
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          The app requests these Google OAuth scopes (all delegated, meaning
          it can only access data on behalf of the signed-in user):
        </p>
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-left">
              <tr>
                <th className="px-4 py-2 font-medium text-zinc-300">
                  Scope
                </th>
                <th className="px-4 py-2 font-medium text-zinc-300">
                  Purpose
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-400">
              {[
                ["calendar", "Full read/write access to calendars and events"],
                ["calendar.events", "Create, update, delete events"],
                ["userinfo.email", "Read your email address for account identification"],
                ["userinfo.profile", "Read your display name"],
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
            (calendar data passes through, never persisted on our servers)
          </li>
        </ul>
      </section>

      {/* Multi-account */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-4" id="multi-account">
          Multi-account support
        </h2>
        <p className="text-sm text-zinc-400">
          Connect unlimited Google accounts with a single purchase.
          Use the <code className="text-blue-400 text-xs">switch_account</code>{" "}
          tool to change which account is active. All calendar tools
          operate on the currently selected account.
        </p>
      </section>
    </main>
  );
}
