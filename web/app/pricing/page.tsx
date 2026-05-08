"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { track } from "@vercel/analytics";
import { AnimatedDemo } from "../components/demo/animated-demo";
import { logEvent } from "@/lib/analytics";
import { trackInitiateCheckout } from "@/lib/track";

function PricingContent() {
  const params = useSearchParams();
  const canceled = params.get("canceled");
  const sessionId = params.get("session_id");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    track("pricing_page_view");
    logEvent("pricing_view");
  }, []);

  async function handleCheckout() {
    setLoading(true);
    track("checkout_start");
    logEvent("checkout_click");
    trackInitiateCheckout(5);
    const sid = sessionId || crypto.randomUUID();
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid }),
    });
    if (!response.ok) {
      setLoading(false);
      return;
    }
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
        {canceled && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            Payment was canceled. Try again when ready.
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Get Google Calendar MCP</h1>
          <p className="text-zinc-400 text-lg">One-time payment. Lifetime access. Unlimited accounts.</p>
        </div>

        {/* Pricing card */}
        <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-8 md:p-10 mb-14 max-w-lg mx-auto overflow-hidden">
          {/* Lifetime badge */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Lifetime
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-8 justify-center">
            <span className="text-5xl md:text-6xl font-bold">$5</span>
            <span className="text-zinc-400 text-lg">one-time</span>
          </div>

          <ul className="space-y-3.5 mb-9">
            {[
              "Create, update, delete, and search calendar events",
              "Check free/busy status and coordinate across attendees",
              "Auto-create Google Meet links for video meetings",
              "Connect unlimited Google accounts",
              "Works with Claude Code, Cursor, Windsurf, Kiro",
              "Lifetime updates included",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 px-6 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-white/10 hover:shadow-white/20"
          >
            {loading ? "Redirecting..." : "Purchase"}
          </button>

          <div className="flex items-center justify-center gap-5 mt-5 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure payment via Stripe
            </span>
            <span>No subscription</span>
          </div>

          {/* Refund guarantee */}
          <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center justify-center gap-2.5">
            <svg className="w-4.5 h-4.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p className="text-sm text-zinc-300 font-medium">Full refund anytime, no questions asked</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-14 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            OAuth 2.0
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            No passwords stored
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Encrypted tokens
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Personal & Workspace accounts
          </span>
        </div>

        {/* Demo */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-5 text-center">See it in action</h2>
          <AnimatedDemo />
        </div>

        {/* Tools list */}
        <div className="mb-14">
          <h2 className="text-xl font-semibold mb-6 text-center">14 tools included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Events */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-medium text-zinc-200 text-sm">Events</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li>List events</li>
                <li>Get event</li>
                <li>Create event</li>
                <li>Update event</li>
                <li>Delete event</li>
                <li>Search events</li>
                <li>Quick add event</li>
                <li>Move event</li>
              </ul>
            </div>
            {/* Scheduling */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-medium text-zinc-200 text-sm">Scheduling</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li>Check free/busy</li>
                <li>Respond to event</li>
                <li>List calendars</li>
                <li>Get colors</li>
              </ul>
            </div>
            {/* Accounts */}
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="font-medium text-zinc-200 text-sm">Accounts</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li>List accounts</li>
                <li>Switch account</li>
                <li>Add account</li>
                <li>Remove account</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="py-3.5 px-8 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10 hover:shadow-white/20"
          >
            {loading ? "Redirecting..." : "Get Google Calendar MCP for $5"}
          </button>
          <p className="text-xs text-zinc-400 mt-3">One-time payment. Full refund anytime.</p>
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
