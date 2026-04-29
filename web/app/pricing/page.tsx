"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PricingContent() {
  const params = useSearchParams();
  const canceled = params.get("canceled");
  const sessionId = params.get("session_id");

  async function handleCheckout() {
    const sid = sessionId || crypto.randomUUID();
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid }),
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <main style={{ maxWidth: 500, margin: "80px auto", padding: "0 20px", fontFamily: "system-ui", textAlign: "center" }}>
      <h1>Outlook MCP</h1>
      <p style={{ color: "#666", marginBottom: 40 }}>
        Connect Microsoft Outlook to Claude, Cursor, and other AI assistants.
      </p>

      {canceled && (
        <p style={{ color: "#c00", marginBottom: 20 }}>Payment was canceled. Try again when ready.</p>
      )}

      <div style={{ border: "1px solid #e0e0e0", borderRadius: 12, padding: 32, marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 8px" }}>Lifetime Access</h2>
        <p style={{ fontSize: 48, fontWeight: 700, margin: "16px 0" }}>$5</p>
        <p style={{ color: "#666", margin: "0 0 24px" }}>One-time payment. Unlimited Outlook accounts.</p>
        <ul style={{ textAlign: "left", listStyle: "none", padding: 0, margin: "0 0 24px" }}>
          <li style={{ padding: "8px 0" }}>&#10003; Read, send, and search emails</li>
          <li style={{ padding: "8px 0" }}>&#10003; Calendar events (view and create)</li>
          <li style={{ padding: "8px 0" }}>&#10003; Connect unlimited accounts</li>
          <li style={{ padding: "8px 0" }}>&#10003; Works with Claude Code, Cursor, Windsurf</li>
        </ul>
        <button
          onClick={handleCheckout}
          style={{
            background: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "14px 32px",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Get Started
        </button>
      </div>

      <p style={{ color: "#999", fontSize: 13 }}>
        After payment you&apos;ll connect your Microsoft account. No credit card stored on our servers.
      </p>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <PricingContent />
    </Suspense>
  );
}
