"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { track } from "@vercel/analytics";
import { AnimatedDemo } from "../components/demo/animated-demo";

function PricingContent() {
  const params = useSearchParams();
  const canceled = params.get("canceled");
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    track("pricing_page_view");
  }, []);

  async function handleCheckout() {
    setLoading(true);
    track("checkout_start");
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
    <main className="flex flex-col items-center px-6 py-20">
      <div className="max-w-3xl w-full">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors mb-8 block">
          &larr; Back
        </Link>

        {canceled && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            Payment was canceled. Try again when ready.
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Get Outlook MCP</h1>
          <p className="text-zinc-400 text-lg">One-time payment. Lifetime access. Unlimited accounts.</p>
        </div>

        {/* Pricing card */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 mb-12 max-w-lg mx-auto">
          <div className="flex items-baseline gap-2 mb-6 justify-center">
            <span className="text-5xl font-bold">$5</span>
            <span className="text-zinc-400">one-time</span>
          </div>

          <ul className="space-y-3 mb-8">
            {[
              "Read, send, search, forward, and organize emails",
              "Create meetings, check availability, manage calendars",
              "Manage contacts and address book",
              "Connect unlimited Outlook accounts",
              "Works with Claude Code, Cursor, Windsurf",
              "Lifetime updates",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 px-6 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? "Redirecting..." : "Purchase"}
          </button>

          <div className="flex items-center justify-center gap-4 mt-5 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure payment via Stripe
            </span>
            <span>No subscription</span>
          </div>

          {/* Refund guarantee inside card */}
          <div className="mt-6 pt-5 border-t border-zinc-800 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-sm text-zinc-300 font-medium">
              Full refund anytime
            </p>
          </div>
        </div>

        {/* Demo */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold mb-4 text-center">See it in action</h2>
          <AnimatedDemo />
        </div>

        {/* Tools list */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6 text-center">26 tools included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Email */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="font-medium text-zinc-200 text-sm">Email</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li>List emails</li>
                <li>Read email</li>
                <li>Send email</li>
                <li>Reply to email</li>
                <li>Forward email</li>
                <li>Search emails</li>
                <li>Move email</li>
                <li>Delete email</li>
                <li>Mark read/unread</li>
                <li>Flag/unflag</li>
                <li>List folders</li>
              </ul>
            </div>
            {/* Calendar */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-medium text-zinc-200 text-sm">Calendar</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li>List events</li>
                <li>Create event</li>
                <li>Update event</li>
                <li>Delete event</li>
                <li>Search events</li>
                <li>Check availability</li>
                <li>List calendars</li>
              </ul>
            </div>
            {/* Contacts & Accounts */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="font-medium text-zinc-200 text-sm">Contacts & Accounts</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li>List contacts</li>
                <li>Get contact</li>
                <li>Create contact</li>
                <li>Update contact</li>
                <li>Delete contact</li>
                <li>List accounts</li>
                <li>Switch account</li>
                <li>Add account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="py-3 px-8 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Redirecting..." : "Get Outlook MCP for $5"}
          </button>
          <p className="text-xs text-zinc-500 mt-3">One-time payment. Full refund anytime.</p>
        </div>
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
