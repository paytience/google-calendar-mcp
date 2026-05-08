import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Get Google Calendar MCP for a one-time $5 payment. Lifetime access to Google Calendar integration for Claude Code, Cursor, Windsurf, and Kiro.",
  openGraph: {
    title: "Get Google Calendar MCP for $5",
    description:
      "One-time payment. Lifetime access to Google Calendar in your AI tools.",
    url: "https://gcalmcp.com/pricing",
  },
  alternates: {
    canonical: "https://gcalmcp.com/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
