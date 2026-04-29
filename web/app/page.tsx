import { ConfigSnippets } from "./components/config-snippets";

export default function Home() {
  return (
    <main className="flex flex-col items-center px-6 py-20">
      <div className="max-w-3xl w-full text-center">
        {/* Hero */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          MCP Server for Outlook
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Outlook, inside your AI tools.
        </h1>

        <p className="text-lg text-zinc-400 mb-10 max-w-lg mx-auto">
          Give Claude, Cursor, and other MCP clients direct access to your Outlook email and calendar. Send, search, and manage messages without leaving your workflow.
        </p>

        <div className="flex justify-center mb-14">
          <a
            href="/pricing"
            className="px-8 py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Get Started
          </a>
        </div>

        {/* Terminal demo */}
        <div className="mb-20 w-full rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl shadow-blue-500/5">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
            <span className="ml-2 text-xs text-zinc-500">Claude Code</span>
          </div>
          <div className="p-6 md:p-8 font-mono text-sm md:text-base text-left space-y-4">
            <div className="animate-fade-in-1">
              <span className="text-zinc-500">&gt;</span> <span className="text-zinc-200">Check my inbox for anything urgent</span>
            </div>
            <div className="animate-fade-in-2 pl-4 text-zinc-400 text-xs md:text-sm">
              <span className="text-blue-400">tool:</span> list_emails (filter: isRead eq false, top: 5)
            </div>
            <div className="animate-fade-in-3 pl-4 text-zinc-500 text-xs md:text-sm">
              Found 3 unread emails. 1 flagged as high importance from Sarah Chen re: &quot;Q3 Budget Review&quot;
            </div>
            <div className="animate-fade-in-4 mt-4">
              <span className="text-zinc-500">&gt;</span> <span className="text-zinc-200">Reply to Sarah that I&apos;ll review it by EOD</span>
            </div>
            <div className="animate-fade-in-5 pl-4 text-zinc-400 text-xs md:text-sm">
              <span className="text-blue-400">tool:</span> reply_to_email (messageId: ..., body: &quot;Hi Sarah, I&apos;ll review the Q3 budget by end of day...&quot;)
            </div>
            <div className="animate-fade-in-6 pl-4 text-green-400 text-xs md:text-sm">
              Reply sent successfully.
            </div>
          </div>
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
            <p className="text-sm text-zinc-400">Paste the MCP config into Claude Code, Cursor, or Windsurf with your API key.</p>
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
