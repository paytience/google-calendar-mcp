# Google Calendar MCP: Deployment Status

## Done

- [x] Stripe product created, webhook configured (checkout.session.completed, charge.refunded)
- [x] Stripe sandbox keys on Vercel Preview (dev), live keys on Production (main)
- [x] GitHub repo: `paytience/google-calendar-mcp` (public)
- [x] All source code converted, 35 unit tests passing
- [x] Vercel project created, domain gcalmcp.com configured
- [x] DNS configured (GoDaddy → Vercel)
- [x] Google Cloud project `gcalmcp-prod` created, Calendar API enabled
- [x] OAuth consent screen configured (branding, scopes, privacy policy)
- [x] OAuth 2.0 client created (redirect URI: `https://gcalmcp.com/api/auth/callback`)
- [x] Supabase: project "business-mcps", shared for both outlook-mcp and gcalmcp
- [x] Supabase: `gcal_sessions`, `gcal_tokens`, `gcal_api_keys`, `gcal_customers` tables created
- [x] Supabase: `gcal-tokens` edge function deployed
- [x] Codebase updated to use `gcal_` prefixed tables
- [x] Brevo account created, gcalmcp.com domain verified (DKIM, DMARC, Brevo code)
- [x] Brevo API key generated, added to Vercel
- [x] Email code switched from Resend to Brevo API
- [x] ImprovMX configured, MX records verified (forwarding *@gcalmcp.com → Gmail)
- [x] Gmail "Send as" configured (support@gcalmcp.com via Brevo SMTP)
- [x] Privacy policy page at /privacy (references Brevo)
- [x] Vercel env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ENCRYPTION_KEY`, `BREVO_API_KEY`
- [x] Supabase edge function secrets: `GCAL_ENCRYPTION_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- [x] NPM token created, `NPM_TOKEN` secret added to GitHub
- [x] v1.0.0 published to NPM (`@paytience/google-calendar-mcp`)
- [x] v1.0.0 Docker image built and pushed to GHCR (private)

- [x] Google OAuth verification completed (branding verified)
- [x] Terms of service page at /terms

## Remaining

### 1. Post-deploy testing

- [ ] Test full purchase flow on production
- [ ] Test token refresh via edge function
- [ ] Run e2e tests: `GOOGLE_CALENDAR_MCP_API_KEY=... npm run test:e2e`
