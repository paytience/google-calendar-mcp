import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mcpcalendar.com"),
  title: {
    default: "Google Calendar MCP: Connect Google Calendar to AI Assistants",
    template: "%s | Google Calendar MCP",
  },
  description:
    "Let your AI agent control Google Calendar. Give Claude, Cursor, Kiro, and Windsurf direct access to your calendar via MCP. Create events, check availability, and manage schedules without leaving your AI workflow.",
  keywords: [
    "google calendar mcp",
    "mcp server",
    "google calendar ai",
    "ai agent calendar",
    "ai agent scheduling",
    "claude calendar",
    "cursor calendar",
    "windsurf calendar",
    "kiro calendar",
    "google calendar mcp server",
    "model context protocol",
    "google calendar api",
    "ai scheduling assistant",
    "claude code calendar",
    "google workspace mcp",
    "ai calendar integration",
    "google meet mcp",
    "ai coding assistant calendar",
    "calendar automation ai",
  ],
  openGraph: {
    title: "Google Calendar MCP: Connect Google Calendar to AI Assistants",
    description:
      "Give Claude, Cursor, and Windsurf direct access to your Google Calendar. Create events, check availability, and manage schedules without leaving your AI workflow.",
    url: "https://mcpcalendar.com",
    siteName: "Google Calendar MCP",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Google Calendar MCP: Connect Google Calendar to AI Assistants",
    description:
      "Give Claude, Cursor, and Windsurf direct access to your Google Calendar via MCP.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://mcpcalendar.com",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-zinc-950 text-white antialiased">
      <body className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3.5 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/40">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <svg className="w-4.5 h-4.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Google Calendar MCP
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
                Google Calendar MCP
              </Link>
              <p className="text-xs text-zinc-600 mt-1.5">MCP server for Google Calendar</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-xs text-zinc-500">
              <div className="flex flex-col gap-2">
                <span className="font-medium text-zinc-400 uppercase tracking-wider text-[10px]">Product</span>
                <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</Link>
                <Link href="/docs" className="hover:text-zinc-300 transition-colors">Documentation</Link>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-zinc-400 uppercase tracking-wider text-[10px]">Support</span>
                <a href="mailto:support@mcpcalendar.com" className="hover:text-zinc-300 transition-colors">Email Support</a>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-medium text-zinc-400 uppercase tracking-wider text-[10px]">Legal</span>
                <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
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
