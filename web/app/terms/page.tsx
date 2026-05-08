import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Google Calendar MCP.",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-zinc-400 mb-12 text-sm">Last updated: May 8, 2026</p>

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-zinc-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Service Description</h2>
          <p>
            Google Calendar MCP (&quot;the Service&quot;) is operated by Paytience. The Service
            provides a Model Context Protocol (MCP) server that enables AI assistants to interact
            with your Google Calendar on your behalf.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Account and Access</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>You must purchase a license to use the Service.</li>
            <li>Each license provides one API key tied to one Google account.</li>
            <li>You are responsible for keeping your API key confidential.</li>
            <li>You must not share, resell, or redistribute your API key or access.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Acceptable Use</h2>
          <p className="text-zinc-400 mb-3">You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>Use the Service to violate any law or regulation.</li>
            <li>Attempt to reverse-engineer, decompile, or extract source code from the hosted service.</li>
            <li>Exceed reasonable usage limits or abuse the API in a way that degrades service for others.</li>
            <li>Use the Service to send spam, phishing invites, or unsolicited calendar events.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Payment and Refunds</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>The Service is sold as a one-time purchase. Pricing is displayed at checkout.</li>
            <li>Payments are processed by Stripe.</li>
            <li>
              Refunds are available within 14 days of purchase. Upon refund, your API key and
              stored tokens will be deactivated.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Google Account Authorization</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>The Service requires access to your Google Calendar via OAuth 2.0.</li>
            <li>
              You can revoke access at any time via{" "}
              <a href="https://myaccount.google.com/permissions" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Google Account Permissions
              </a>.
            </li>
            <li>Revoking Google access will prevent the Service from functioning but does not cancel your license.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Availability and Warranties</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>The Service is provided &quot;as is&quot; without warranty of any kind.</li>
            <li>We do not guarantee uninterrupted availability. The Service depends on Google Calendar API uptime.</li>
            <li>We are not responsible for actions taken by AI assistants using the Service on your behalf.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
          <p className="text-zinc-400">
            To the maximum extent permitted by law, Paytience shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of the Service,
            including but not limited to calendar data loss, missed events, or incorrect event
            modifications made by AI assistants.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Termination</h2>
          <ul className="list-disc pl-5 space-y-2 text-zinc-400">
            <li>We may suspend or terminate your access if you violate these terms.</li>
            <li>Upon termination, your API key will be deactivated and stored data deleted within 30 days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Changes to Terms</h2>
          <p className="text-zinc-400">
            We may update these terms from time to time. Material changes will be posted on this
            page with an updated &quot;Last updated&quot; date. Continued use of the Service after
            changes constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
          <p className="text-zinc-400">
            For questions about these terms, email support@gcalmcp.com.
          </p>
        </section>
      </div>
    </main>
  );
}
