import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mcpoutlook.com"),
  title: {
    default: "Outlook MCP: Connect Microsoft Outlook to AI Assistants",
    template: "%s | Outlook MCP",
  },
  description:
    "Give Claude, Cursor, and Windsurf direct access to your Outlook email and calendar via MCP. Read, send, search, and manage messages without leaving your AI workflow.",
  keywords: [
    "outlook mcp",
    "mcp server",
    "outlook ai",
    "claude outlook",
    "cursor outlook",
    "windsurf outlook",
    "microsoft outlook mcp",
    "model context protocol",
    "outlook email ai",
    "outlook calendar ai",
    "mcp email",
    "ai email assistant",
    "claude code email",
    "outlook integration",
    "microsoft graph mcp",
  ],
  openGraph: {
    title: "Outlook MCP: Connect Microsoft Outlook to AI Assistants",
    description:
      "Give Claude, Cursor, and Windsurf direct access to your Outlook email and calendar. Read, send, and manage messages without leaving your AI workflow.",
    url: "https://mcpoutlook.com",
    siteName: "Outlook MCP",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Outlook MCP: Connect Microsoft Outlook to AI Assistants",
    description:
      "Give Claude, Cursor, and Windsurf direct access to your Outlook email and calendar via MCP.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://mcpoutlook.com",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-zinc-950 text-white antialiased">
      <body className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
          <Link href="/" className="text-sm font-semibold">Outlook MCP</Link>
          <nav className="flex items-center gap-4">
            <Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/pricing" className="px-4 py-1.5 text-sm font-medium bg-white text-zinc-900 rounded-md hover:bg-zinc-200 transition-colors">
              Get Started
            </Link>
          </nav>
        </header>
        <div className="pt-14">
          {children}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
