import { ConfigSnippets } from "./components/config-snippets";
import { AnimatedDemo } from "./components/demo/animated-demo";
import { TrackedCTA } from "./components/tracked-cta";
import { GlowCard } from "./components/glow-card";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Google Calendar MCP",
  description:
    "MCP server that connects Google Calendar to AI assistants like Claude Code, Cursor, Windsurf, and Kiro.",
  url: "https://mcpcalendar.com",
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
    "google calendar mcp, mcp server, calendar ai, claude calendar, cursor calendar, windsurf calendar, model context protocol",
};

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: "Events",
    description: "List, create, update, delete, and search calendar events with full details.",
    color: "text-blue-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Scheduling",
    description: "Check free/busy status, find available slots, and coordinate across attendees.",
    color: "text-purple-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    title: "Attendees",
    description: "Add attendees, send invitations, and RSVP to events on your behalf.",
    color: "text-emerald-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "Google Meet",
    description: "Automatically create Google Meet links when scheduling video meetings.",
    color: "text-amber-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
      </svg>
    ),
    title: "Recurring Events",
    description: "Create and manage recurring events with full RRULE support.",
    color: "text-cyan-400",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: "Secure",
    description: "OAuth 2.0 with encrypted token storage. Your credentials never touch disk.",
    color: "text-rose-400",
  },
];

const steps = [
  {
    title: "Purchase & Sign in with Google",
    description: "Pay once, sign in with your Google account, and receive your personal API key instantly.",
  },
  {
    title: "Add the config",
    description: "Paste the MCP config into your AI tool with your API key. Takes 30 seconds.",
  },
  {
    title: "Ask your AI",
    description: "\"What's on my calendar today?\", \"Schedule a meeting with Alice tomorrow at 2pm\", \"Find a free slot this week\"",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="hero-glow relative w-full flex flex-col items-center px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="relative z-10 max-w-4xl w-full text-center">
          <div className="animate-fade-in-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              MCP Server for Google Calendar
            </div>
          </div>

          <h1 className="animate-fade-in-2 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 gradient-text-animated leading-tight">
            Google Calendar, inside your AI tools
          </h1>

          <p className="animate-fade-in-3 text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Give your AI agent direct access to Google Calendar. Create events, check availability, and manage your schedule without leaving your workflow.
          </p>

          <div className="animate-fade-in-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <TrackedCTA href="/pricing" source="hero" variant="primary">
              Get Started
            </TrackedCTA>
            <TrackedCTA href="/docs" source="hero" variant="secondary">
              View Documentation
            </TrackedCTA>
          </div>

          {/* Supported tools */}
          <div className="animate-fade-in-5 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="text-zinc-400 mr-1">Works with</span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">Claude Code</span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">Cursor</span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">Windsurf</span>
            <span className="px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">Kiro</span>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="w-full max-w-4xl px-6 pb-20 md:pb-28">
        <p className="text-center text-sm text-zinc-500 mb-6">See it in action</p>
        <div className="relative">
          <div className="absolute inset-0 -m-4 rounded-2xl bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
          <AnimatedDemo />
        </div>
      </section>

      <div className="section-divider w-full max-w-3xl mx-auto"></div>

      {/* Features */}
      <section className="w-full max-w-5xl px-6 py-20 md:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need</h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">14 tools covering events, scheduling, and calendar management. Full control over Google Calendar from any AI assistant.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <GlowCard key={feature.title} className="flex flex-col gap-3">
              <div className={`${feature.color}`}>{feature.icon}</div>
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      <div className="section-divider w-full max-w-3xl mx-auto"></div>

      {/* How it works */}
      <section className="w-full max-w-4xl px-6 py-20 md:py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Up and running in minutes</h2>
          <p className="text-zinc-400 text-lg">Three steps to connect your Google Calendar to AI.</p>
        </div>

        {/* Steps */}
        <div className="relative max-w-lg mx-auto mb-16">
          {/* Vertical connecting line */}
          <div className="absolute left-5 top-10 bottom-10 w-px bg-gradient-to-b from-blue-500/40 via-blue-500/20 to-transparent"></div>

          <div className="space-y-12">
            {steps.map((step, i) => (
              <div key={step.title} className="flex items-start gap-5">
                <div className="relative z-10 w-10 h-10 rounded-full bg-zinc-900 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-blue-400">{i + 1}</span>
                </div>
                <div className="pt-1.5">
                  <h3 className="font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Config snippets */}
        <ConfigSnippets />
      </section>

      {/* Trust / Security */}
      <section className="w-full px-6 py-12">
        <div className="flex flex-wrap justify-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            OAuth 2.0
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            No passwords stored
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            AES-256 encrypted tokens
          </span>
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Personal &amp; Workspace accounts
          </span>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full px-6 py-20 md:py-24">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 -m-8 bg-gradient-to-t from-blue-500/5 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
          <div className="relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 px-8 py-14 md:px-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to connect Google Calendar?</h2>
            <p className="text-zinc-400 text-lg mb-8">One-time purchase. No subscription. Full refund anytime.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <TrackedCTA href="/pricing" source="bottom_cta" variant="primary">
                Get Started for $5
              </TrackedCTA>
            </div>
          </div>
        </div>
      </section>

      {/* SEO text */}
      <section className="w-full max-w-3xl mx-auto px-6 pb-12 text-center">
        <p className="text-xs text-zinc-600 max-w-2xl mx-auto leading-relaxed">
          Google Calendar MCP is a Model Context Protocol server that lets your AI agent control Google Calendar.
          Connect any MCP client to create events, check availability, manage schedules, and coordinate meetings
          across personal and Google Workspace accounts.
        </p>
      </section>
    </main>
  );
}
