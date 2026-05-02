import { ConfigSnippets } from "./components/config-snippets";
import { AnimatedDemo } from "./components/demo/animated-demo";
import { TrackedCTA } from "./components/tracked-cta";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Outlook MCP",
  description:
    "MCP server that connects Microsoft Outlook email and calendar to AI assistants like Claude Code, Cursor, Windsurf, and Kiro.",
  url: "https://mcpoutlook.com",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  offers: {
    "@type": "Offer",
    price: "5.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  author: {
    "@type": "Organization",
    name: "Paytience",
    url: "https://github.com/paytience",
  },
  softwareRequirements: "Node.js, MCP-compatible client",
  keywords:
    "outlook mcp, mcp server, outlook ai, claude email, cursor email, windsurf email, model context protocol",
};

export default function Home() {
  return (
    <main className="flex flex-col items-center px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl w-full text-center">
        {/* Hero */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          MCP Server for Outlook
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Outlook, inside your AI tools.
        </h1>

        <p className="text-lg text-zinc-400 mb-10 max-w-lg mx-auto">
          Let your AI agent control Outlook. Send, search, and manage email and calendar without leaving your workflow.
        </p>

        <div className="flex justify-center mb-14">
          <TrackedCTA href="/pricing" source="hero">
            Get Started
          </TrackedCTA>
        </div>

        {/* Animated demo */}
        <div className="mb-20 w-full">
          <AnimatedDemo />
        </div>

        {/* Features */}
        <h2 className="text-2xl font-bold mb-8">What you can do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left mb-20">
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl mb-2">📬</div>
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-sm text-zinc-400">Read, send, reply, forward, search, flag, categorize, and organize your inbox.</p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold mb-1">Calendar</h3>
            <p className="text-sm text-zinc-400">View events, create meetings, RSVP to invitations, and manage multiple calendars.</p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl mb-2">👤</div>
            <h3 className="font-semibold mb-1">Contacts</h3>
            <p className="text-sm text-zinc-400">Search, create, update, and manage your Outlook address book.</p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl mb-2">✈️</div>
            <h3 className="font-semibold mb-1">Auto-Reply</h3>
            <p className="text-sm text-zinc-400">Set and manage out-of-office replies with scheduled start and end times.</p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Focused Inbox</h3>
            <p className="text-sm text-zinc-400">Control which senders go to Focused or Other. View and manage inbox rules.</p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-semibold mb-1">Secure</h3>
            <p className="text-sm text-zinc-400">OAuth 2.0 with encrypted token storage. Your credentials never touch disk.</p>
          </div>
        </div>

        {/* SEO copy */}
        <p className="text-sm text-zinc-500 text-center max-w-2xl mx-auto mb-20">
          Outlook MCP is a Model Context Protocol server that lets your AI agent control Microsoft Outlook.
          Connect any MCP client to read, send, and organize emails, schedule meetings, and manage contacts
          across personal and enterprise Microsoft 365 accounts.
        </p>

        {/* How it works + Config */}
        <h2 className="text-2xl font-bold mb-10">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 mb-4">1</div>
            <h3 className="font-semibold mb-2">Purchase &amp; Get API Key</h3>
            <p className="text-sm text-zinc-400">Pay once, sign in with Microsoft, and receive your personal API key.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 mb-4">2</div>
            <h3 className="font-semibold mb-2">Add the config</h3>
            <p className="text-sm text-zinc-400">Paste the MCP config into Claude Code, Cursor, Windsurf, or Kiro with your API key.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 mb-4">3</div>
            <h3 className="font-semibold mb-2">Ask your AI</h3>
            <p className="text-sm text-zinc-400">&ldquo;Check my inbox&rdquo;, &ldquo;Send a reply&rdquo;, &ldquo;What&apos;s on my calendar?&rdquo;</p>
          </div>
        </div>

        <div className="mb-20 w-full">
          <ConfigSnippets />
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-20 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            OAuth 2.0
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            No passwords stored
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            Encrypted tokens
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Works with enterprise M365
          </span>
        </div>

        {/* Final CTA */}
        <div className="py-12 border-t border-zinc-800 w-full">
          <h2 className="text-2xl font-bold mb-4">Ready to connect Outlook?</h2>
          <p className="text-zinc-400 mb-6">One-time purchase. No subscription.</p>
          <a
            href="/pricing"
            className="inline-block px-8 py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>

      <footer className="mt-12 pb-8 text-xs text-zinc-600">
        Built by <a href="https://github.com/paytience" className="hover:text-zinc-400 transition-colors">Paytience</a>
      </footer>
    </main>
  );
}
