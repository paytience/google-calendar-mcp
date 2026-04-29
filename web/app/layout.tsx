import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outlook MCP",
  description: "Connect Microsoft Outlook to AI assistants via MCP",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-zinc-950 text-white antialiased">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
