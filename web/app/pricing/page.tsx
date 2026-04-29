"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";

function PricingContent() {
  const params = useSearchParams();
  const canceled = params.get("canceled");
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    const sid = sessionId || crypto.randomUUID();
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid }),
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="max-w-md w-full">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8 block">
          &larr; Back
        </Link>

        {canceled && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            Payment was canceled. Try again when ready.
          </div>
        )}

        <h1 className="text-3xl font-bold tracking-tight mb-2">Get Outlook MCP</h1>
        <p className="text-zinc-400 mb-8">One-time payment. Lifetime access. Unlimited accounts.</p>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8">
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-5xl font-bold">$5</span>
            <span className="text-zinc-500 text-sm">one-time</span>
          </div>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Read, send, and search emails
            </li>
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Calendar events (view and create)
            </li>
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Connect unlimited Outlook accounts
            </li>
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Works with Claude Code, Cursor, Windsurf
            </li>
            <li className="flex items-center gap-3 text-sm text-zinc-300">
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Lifetime updates
            </li>
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 px-6 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Redirecting..." : "Purchase"}
          </button>
        </div>

        <p className="text-xs text-zinc-600 text-center mt-6">
          Secure payment via Stripe. No subscription required.
        </p>
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-zinc-500">Loading...</div>}>
      <PricingContent />
    </Suspense>
  );
}
