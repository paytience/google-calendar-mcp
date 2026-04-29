"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const error = params.get("error");

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Authorization Failed</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <p className="text-sm text-zinc-500">Close this window and try again from your terminal.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Outlook Connected</h1>
          <p className="text-zinc-400">
            Successfully connected <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 mb-6">
          <h2 className="font-semibold mb-4">Setup Instructions</h2>

          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Claude Code</h3>
              <p className="text-xs text-zinc-500 mb-2">Add to your MCP settings:</p>
              <pre className="text-xs bg-zinc-950 rounded-lg p-3 overflow-x-auto text-zinc-300 border border-zinc-800">
{`{
  "mcpServers": {
    "outlook": {
      "command": "npx",
      "args": ["-y", "outlook-mcp"]
    }
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Cursor</h3>
              <p className="text-xs text-zinc-500 mb-2">Add to <code className="text-zinc-400">.cursor/mcp.json</code>:</p>
              <pre className="text-xs bg-zinc-950 rounded-lg p-3 overflow-x-auto text-zinc-300 border border-zinc-800">
{`{
  "mcpServers": {
    "outlook": {
      "command": "npx",
      "args": ["-y", "outlook-mcp"]
    }
  }
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Windsurf / Other MCP Clients</h3>
              <p className="text-xs text-zinc-500 mb-2">Same configuration format. Point to:</p>
              <pre className="text-xs bg-zinc-950 rounded-lg p-3 overflow-x-auto text-zinc-300 border border-zinc-800">
{`command: npx
args: ["-y", "outlook-mcp"]`}
              </pre>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Available Tools</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
            <div>list_emails</div>
            <div>read_email</div>
            <div>send_email</div>
            <div>reply_to_email</div>
            <div>search_emails</div>
            <div>move_email</div>
            <div>list_calendar_events</div>
            <div>create_calendar_event</div>
            <div>list_mail_folders</div>
            <div>list_accounts</div>
            <div>switch_account</div>
            <div>add_account</div>
          </div>
        </div>

        <p className="text-xs text-zinc-600 text-center mt-6">
          If you ran <code className="text-zinc-500">npx outlook-mcp</code> from your terminal, it should now be connected automatically.
        </p>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-zinc-500">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
