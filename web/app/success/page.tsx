"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { track } from "@vercel/analytics";
import { ConfigSnippets } from "../components/config-snippets";

function SuccessContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const error = params.get("error");
  const apiKey = params.get("key");

  useEffect(() => {
    if (!error && apiKey) {
      track("purchase_complete");
    }
  }, [error, apiKey]);

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
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Google Calendar Connected</h1>
          <p className="text-zinc-400">
            Successfully connected <span className="text-white font-medium">{email}</span>
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 mb-6">
          <h2 className="font-semibold mb-4">Setup Instructions</h2>

          {apiKey && (
            <div className="mb-5 p-4 rounded-lg bg-zinc-950 border border-zinc-800">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-medium">Your API Key</p>
              <code className="block text-xs text-green-400 font-mono break-all select-all">{apiKey}</code>
              <p className="text-xs text-zinc-500 mt-2">Save this key. It won&apos;t be shown again.</p>
            </div>
          )}

          <div className="space-y-5">
            <ConfigSnippets apiKey={apiKey || undefined} />
          </div>
        </div>

        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">Available Tools</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
            <div>list_events</div>
            <div>get_event</div>
            <div>create_event</div>
            <div>update_event</div>
            <div>delete_event</div>
            <div>search_events</div>
            <div>quick_add_event</div>
            <div>respond_to_event</div>
            <div>get_free_busy</div>
            <div>list_calendars</div>
            <div>move_event</div>
            <div>get_colors</div>
            <div>list_accounts</div>
            <div>switch_account</div>
          </div>
        </div>

        <p className="text-xs text-zinc-600 text-center mt-6">
          If you ran <code className="text-zinc-500">npx @paytience/google-calendar-mcp</code> from your terminal, it should now be connected automatically.
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
