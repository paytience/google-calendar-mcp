import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Get Outlook MCP for a one-time $5 payment. Lifetime access to email, calendar, and contacts integration for Claude Code, Cursor, and Windsurf.",
  openGraph: {
    title: "Get Outlook MCP for $5",
    description:
      "One-time payment. Lifetime access to Outlook email and calendar in your AI tools.",
    url: "https://mcpoutlook.com/pricing",
  },
  alternates: {
    canonical: "https://mcpoutlook.com/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
