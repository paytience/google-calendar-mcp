"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const error = params.get("error");

  if (error) {
    return (
      <main style={{ maxWidth: 600, margin: "80px auto", padding: "0 20px", fontFamily: "system-ui" }}>
        <h1>Authorization Failed</h1>
        <p style={{ color: "#c00" }}>{error}</p>
        <p>Please close this window and try again.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 600, margin: "80px auto", padding: "0 20px", fontFamily: "system-ui" }}>
      <h1>Outlook Connected</h1>
      <p>Successfully connected <strong>{email}</strong>.</p>
      <p>You can close this tab and return to your terminal.</p>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <SuccessContent />
    </Suspense>
  );
}
