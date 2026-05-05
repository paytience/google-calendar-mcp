export function logEvent(event: string, metadata?: Record<string, string>) {
  fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event, metadata }),
  }).catch(() => {});
}
