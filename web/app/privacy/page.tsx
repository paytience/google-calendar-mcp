import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Google Calendar MCP.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-zinc-400 mb-12 text-sm">Last updated: May 8, 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-zinc-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
          <p>
            Google Calendar MCP (&quot;the Service&quot;) is operated by Paytience. This policy describes
            what data we collect, how we use it, and your rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>
              <span className="text-zinc-200">Email address and display name</span> from your
              Google account during OAuth sign-in.
            </li>
            <li>
              <span className="text-zinc-200">OAuth tokens</span> (access and refresh tokens)
              encrypted at rest using AES-256-GCM. Used solely to authenticate API requests to
              Google Calendar on your behalf.
            </li>
            <li>
              <span className="text-zinc-200">Payment information</span> processed by Stripe.
              We do not store card numbers or billing details on our servers.
            </li>
            <li>
              <span className="text-zinc-200">Usage metadata</span> (last access timestamp,
              session identifiers) for operational purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Data We Do Not Collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>Calendar event content, titles, descriptions, or attendee lists are never stored on our servers.</li>
            <li>Calendar data passes through the MCP server at runtime and is returned directly to your AI client.</li>
            <li>We do not read, analyze, or retain your calendar data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">How We Use Your Data</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>Authenticate requests to the Google Calendar API on your behalf.</li>
            <li>Process payments and manage your license.</li>
            <li>Send transactional emails (setup instructions, API key delivery).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Data Storage and Security</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>OAuth tokens are encrypted with AES-256-GCM before storage.</li>
            <li>Data is stored in Supabase (hosted on AWS) with row-level security.</li>
            <li>API keys are stored as SHA-256 hashes (irreversible).</li>
            <li>All communication uses TLS/HTTPS.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Third-Party Services</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li><span className="text-zinc-200">Google</span> for OAuth authentication and Calendar API access.</li>
            <li><span className="text-zinc-200">Stripe</span> for payment processing.</li>
            <li><span className="text-zinc-200">Supabase</span> for encrypted token storage.</li>
            <li><span className="text-zinc-200">Vercel</span> for website hosting and analytics.</li>
            <li><span className="text-zinc-200">Brevo</span> for transactional email.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Your Rights</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>
              <span className="text-zinc-200">Revoke access:</span> Remove the app from your
              Google account at any time via{" "}
              <a href="https://myaccount.google.com/permissions" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Google Account Permissions
              </a>.
            </li>
            <li>
              <span className="text-zinc-200">Delete data:</span> Contact us to permanently
              delete all stored data associated with your account.
            </li>
            <li>
              <span className="text-zinc-200">Export data:</span> Request a copy of all personal
              data we hold.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Data Retention</h2>
          <p className="text-zinc-400">
            We retain your encrypted tokens and account data for as long as your license is active.
            If you request deletion or your license is revoked via refund, all associated data is
            permanently removed within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
          <p className="text-zinc-400">
            For privacy inquiries, data deletion requests, or questions about this policy,
            email privacy@gcalmcp.com.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Changes</h2>
          <p className="text-zinc-400">
            We may update this policy from time to time. Material changes will be posted on this
            page with an updated &quot;Last updated&quot; date.
          </p>
        </section>
      </div>
    </main>
  );
}
