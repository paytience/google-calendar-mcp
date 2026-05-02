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
    "Let your AI agent control Outlook. Give Claude, Cursor, Kiro, and Windsurf direct access to your Outlook email and calendar via MCP. Read, send, search, and manage messages without leaving your AI workflow.",
  keywords: [
    "outlook mcp",
    "mcp server",
    "outlook ai",
    "ai agent outlook",
    "ai agent control outlook",
    "claude outlook",
    "cursor outlook",
    "windsurf outlook",
    "kiro outlook",
    "microsoft outlook mcp",
    "model context protocol",
    "outlook email ai",
    "outlook calendar ai",
    "mcp email",
    "ai email assistant",
    "claude code email",
    "outlook integration",
    "microsoft graph mcp",
    "ai coding assistant email",
    "outlook automation ai",
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
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/40">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <svg className="w-4.5 h-4.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Outlook MCP
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/docs" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Docs
            </Link>
            <Link
              href="/pricing"
              className="px-4 py-1.5 text-sm font-medium bg-white text-zinc-900 rounded-md hover:bg-zinc-100 transition-all duration-200 shadow-sm shadow-white/10"
            >
              Get Started
            </Link>
          </nav>
        </header>
        <div className="pt-14">
          {children}
        </div>
        <footer className="border-t border-zinc-800/40 px-6 py-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="text-center md:text-left">
              <Link href="/" className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
                Outlook MCP
              </Link>
              <p className="text-xs text-zinc-600 mt-1.5">MCP server for Microsoft Outlook</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-xs text-zinc-500">
              <div className="flex flex-col gap-2">
                <span className="font-medium text-zinc-400 uppercase tracking-wider text-[10px]">Product</span>
                <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</Link>
                <Link href="/docs" className="hover:text-zinc-300 transition-colors">Documentation</Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-zinc-400 uppercase tracking-wider text-[10px]">Support</span>
                <a href="mailto:hellomcpoutlook@gmail.com" className="hover:text-zinc-300 transition-colors">Email Support</a>
              </div>
            </div>
          </div>
          <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-zinc-800/30 text-center text-xs text-zinc-600">
            Built by <a href="https://github.com/paytience" className="hover:text-zinc-400 transition-colors">Paytience</a>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
