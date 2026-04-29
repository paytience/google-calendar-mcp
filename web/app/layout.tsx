import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outlook MCP",
  description: "Connect Microsoft Outlook to AI assistants via MCP",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-zinc-950 text-white antialiased">
      <body className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
          <a href="/" className="text-sm font-semibold">Outlook MCP</a>
          <a href="/pricing" className="px-4 py-1.5 text-sm font-medium bg-white text-zinc-900 rounded-md hover:bg-zinc-200 transition-colors">
            Get Started
          </a>
        </header>
        <div className="pt-14">
          {children}
        </div>
      </body>
    </html>
  );
}
