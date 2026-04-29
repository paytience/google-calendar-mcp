export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          MCP Server for Outlook
        </div>

        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Outlook, inside your AI tools.
        </h1>

        <p className="text-lg text-zinc-400 mb-12 max-w-lg mx-auto">
          Give Claude, Cursor, and other MCP clients direct access to your Outlook email and calendar. Send, search, and manage messages without leaving your workflow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="/pricing"
            className="px-8 py-3 bg-white text-zinc-900 font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
          >
            Get Started &mdash; $5
          </a>
          <a
            href="https://github.com/paytience/outlook-mcp"
            className="px-8 py-3 border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:border-zinc-500 hover:text-white transition-colors"
          >
            View on GitHub
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl mb-2">📬</div>
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-sm text-zinc-400">Read, send, reply, search, and organize your inbox.</p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-semibold mb-1">Calendar</h3>
            <p className="text-sm text-zinc-400">View events, create meetings, invite attendees.</p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="font-semibold mb-1">Secure</h3>
            <p className="text-sm text-zinc-400">OAuth 2.0 with encrypted token storage. Your credentials never touch disk.</p>
          </div>
        </div>

        <div className="mt-16 mb-16 w-full">
          <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 mb-4">1</div>
              <h3 className="font-semibold mb-2">Purchase &amp; Connect</h3>
              <p className="text-sm text-zinc-400">Pay once, then sign in with your Microsoft account to grant access.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 mb-4">2</div>
              <h3 className="font-semibold mb-2">Add to your AI tool</h3>
              <p className="text-sm text-zinc-400">Drop the MCP config into Claude Code, Cursor, or Windsurf settings.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 mb-4">3</div>
              <h3 className="font-semibold mb-2">Ask your AI</h3>
              <p className="text-sm text-zinc-400">&ldquo;Check my inbox&rdquo;, &ldquo;Send a reply&rdquo;, &ldquo;What&apos;s on my calendar?&rdquo;</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 text-left w-full">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-medium">Quick Setup</p>
          <code className="block text-sm text-zinc-300 font-mono">
            npx outlook-mcp
          </code>
          <p className="text-xs text-zinc-500 mt-3">Works with Claude Code, Cursor, Windsurf, and any MCP client.</p>
        </div>
      </div>

      <footer className="absolute bottom-8 text-xs text-zinc-600">
        Built by Paytience
      </footer>
    </main>
  );
}
