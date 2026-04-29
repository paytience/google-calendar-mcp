"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ConfigSnippets } from "../components/config-snippets";

function SetupContent() {
  const params = useSearchParams();
  const sessionId = params.get("session");
  const apiKey = params.get("key");
  const error = params.get("error");

  const [status, setStatus] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/setup/status?session=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.status);
        if (data.user_email) setEmail(data.user_email);
      })
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Setup Link</h1>
        <p className="text-zinc-400">No session found. Please purchase first.</p>
        <a href="/pricing" className="inline-block mt-6 px-6 py-2 bg-white text-zinc-900 font-semibold rounded-lg">
          Go to Pricing
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Connection Failed</h1>
        <p className="text-zinc-400 mb-6">{error}</p>
        <a
          href={`/api/auth/login?session_id=${sessionId}`}
          className="inline-block px-6 py-2 bg-white text-zinc-900 font-semibold rounded-lg"
        >
          Try Again
        </a>
      </div>
    );
  }

  const isCompleted = status === "completed" || !!apiKey;
  const isPaid = status === "pending" || status === "paid";

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sendKeyEmail = async () => {
    if (!apiKey || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/setup/send-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, api_key: apiKey }),
      });
      if (res.ok) setEmailSent(true);
    } catch {
      // ignore
    }
    setSending(false);
  };

  return (
    <div className="w-full max-w-lg">
      <h1 className="text-3xl font-bold text-center mb-2">Setup</h1>
      <p className="text-zinc-400 text-center mb-10">Complete these steps to connect Outlook to your AI tools.</p>

      <div className="space-y-4 mb-10">
        {/* Step 1: Payment */}
        <div className="flex items-start gap-4 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold">Payment complete</h3>
            <p className="text-sm text-zinc-500">One-time purchase confirmed.</p>
          </div>
        </div>

        {/* Step 2: Connect Microsoft */}
        <div className="flex items-start gap-4 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          {isCompleted ? (
            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-blue-400">2</span>
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold">Connect Microsoft Account</h3>
            {isCompleted ? (
              <p className="text-sm text-zinc-500">{email || "Connected"}</p>
            ) : isPaid ? (
              <div className="mt-3">
                <a
                  href={`/api/auth/login?session_id=${sessionId}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-sm"
                >
                  Sign in with Microsoft
                </a>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Loading...</p>
            )}
          </div>
        </div>

        {/* Step 3: API Key */}
        <div className="flex items-start gap-4 p-5 rounded-xl bg-zinc-900 border border-zinc-800">
          {apiKey ? (
            <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-zinc-500">3</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">Your API Key</h3>
            {apiKey ? (
              <div className="mt-3">
                <div onClick={copyKey} className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 mb-3 cursor-pointer hover:border-emerald-500/40 transition-colors">
                  <code className="text-xs text-emerald-400 font-mono break-all select-all">{apiKey}</code>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyKey}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={sendKeyEmail}
                    disabled={emailSent || sending}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    {emailSent ? "Sent!" : sending ? "Sending..." : "Send to my email"}
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">This key was also sent to your email.</p>
              </div>
            ) : isCompleted ? (
              <p className="text-sm text-zinc-500">Key was sent to your email. Check your inbox.</p>
            ) : (
              <p className="text-sm text-zinc-500">Complete step 2 first.</p>
            )}
          </div>
        </div>
      </div>

      {/* Config snippets */}
      {apiKey && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-center mb-4">Add to your AI tool</h2>
          <ConfigSnippets />
        </div>
      )}
    </div>
  );
}

export default function SetupPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
      <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
        <SetupContent />
      </Suspense>
    </main>
  );
}
