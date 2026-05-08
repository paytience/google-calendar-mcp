# Google Calendar MCP: Remaining Manual Steps

Code conversion is complete. Build and tests pass. The following tasks require manual action.

## Done

- [x] Stripe product created, webhook configured (checkout.session.completed, charge.refunded)
- [x] Stripe sandbox keys added to Vercel Preview (dev branch), live keys to Production (main)
- [x] GitHub repo: `paytience/google-calendar-mcp` (public, code pushed, PR merged to main)
- [x] All source code converted, 35 unit tests passing
- [x] Vercel project created, domain gcalmcp.com configured
- [x] DNS configured (GoDaddy → Vercel)
- [x] Google Cloud project `gcalmcp-prod` created, Calendar API enabled
- [x] OAuth consent screen configured (branding, scopes, privacy policy)
- [x] OAuth 2.0 client created (redirect URI: `https://gcalmcp.com/api/auth/callback`)
- [x] Supabase: project renamed to "business-mcps", shared for both outlook-mcp and gcalmcp
- [x] Supabase: `gcal_sessions`, `gcal_tokens`, `gcal_api_keys`, `gcal_customers` tables created
- [x] Supabase: `gcal-tokens` edge function deployed (Google token endpoint)
- [x] Codebase updated to use `gcal_` prefixed tables
- [x] Brevo account created, gcalmcp.com domain added
- [x] Privacy policy page exists at /privacy
- [x] Brevo DNS verified (DKIM, Brevo code, DMARC)
- [x] Brevo API key generated, added to Vercel
- [x] Email code updated from Resend to Brevo API
- [x] Gmail "Send as" configured (support@gcalmcp.com via Brevo SMTP)
- [x] ImprovMX configured, MX records added (forwarding *@gcalmcp.com → Gmail)
- [x] Vercel env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ENCRYPTION_KEY`, `BREVO_API_KEY`
- [x] Supabase edge function secrets: `GCAL_ENCRYPTION_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Remaining

### 1. Google verification

- [ ] Submit app for Google OAuth verification (can test with <100 users before approval)

### 6. NPM Publish

```bash
npm publish --access public
```

Package: `@paytience/google-calendar-mcp`

### 7. Docker / GHCR

```bash
docker build -t ghcr.io/paytience/google-calendar-mcp:latest .
docker push ghcr.io/paytience/google-calendar-mcp:latest
```

Make package public in GitHub Packages settings.

### 8. Post-deploy Testing

1. Set `GOOGLE_CALENDAR_MCP_API_KEY` and run: `npm run test:e2e`
2. Manually test the full purchase flow on staging
3. Verify token refresh works via edge function

## 4. Vercel (new project, manual)

1. Go to https://vercel.com/new
2. Import `paytience/google-calendar-mcp` from GitHub
3. Set root directory to `web`
4. Framework preset: Next.js
5. Add environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` = `https://gcalmcp.com/api/auth/callback`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ENCRYPTION_KEY` (generate: `openssl rand -hex 32`)
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID`
   - `RESEND_API_KEY`

## 5. Domain & DNS

1. Purchase a domain (can buy directly via Vercel for easy DNS setup)
2. Point DNS to Vercel (add CNAME or use Vercel nameservers)
3. Add domain in Vercel project settings
4. Verify SSL is working
5. Update all references in code if not using `gcalmcp.com`

### Suggested domains

| Domain | Price/yr | Notes |
|--------|----------|-------|
| `gcalmcp.com` | $11.25 | Short, clear |
| `gcal-mcp.com` | $11.25 | Hyphenated variant |
| `googlecalmcp.com` | $11.25 | Explicit |
| `mcpgcal.com` | $11.25 | MCP-first |
| `calendarforai.com` | $11.25 | Descriptive |
| `gcal.tools` | $17.99 | Clean TLD |
| `gcalmcp.io` | $37.99 | .io option |
| `mcpcalendar.io` | $37.99 | .io option |

Unavailable: `gcalmcp.com`, `calendarmcp.com`, `mcp-calendar.com`

Purchase link (Vercel): https://vercel.com/domains/search

## 6. Resend (Email)

1. Add `gcalmcp.com` domain to Resend
2. Verify DNS records (SPF, DKIM)
3. Note: `RESEND_API_KEY` (reuse existing key or create new)

## 7. NPM Publish

```bash
npm publish --access public
```

Package: `@paytience/google-calendar-mcp`

## 8. Docker / GHCR

```bash
docker build -t ghcr.io/paytience/google-calendar-mcp:latest .
docker push ghcr.io/paytience/google-calendar-mcp:latest
```

Make package public in GitHub Packages settings.

## 9. Post-deploy Testing

1. Set `GOOGLE_CALENDAR_MCP_API_KEY` and run: `npm run test:e2e`
2. Manually test the full purchase flow on staging
3. Verify token refresh works via edge function

## Summary of Env Vars

| Variable | Where | Source |
|----------|-------|--------|
| `GOOGLE_CLIENT_ID` | Vercel, Supabase edge fn | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Vercel, Supabase edge fn | Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | Vercel | `https://gcalmcp.com/api/auth/callback` |
| `SUPABASE_URL` | Vercel | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Supabase dashboard |
| `ENCRYPTION_KEY` | Vercel, Supabase edge fn | `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | Vercel | New Stripe account |
| `STRIPE_WEBHOOK_SECRET` | Vercel | New Stripe account |
| `STRIPE_PRICE_ID` | Vercel | New Stripe account |
| `RESEND_API_KEY` | Vercel | Resend dashboard |
