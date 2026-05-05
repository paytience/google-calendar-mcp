# Google Calendar MCP: Remaining Manual Steps

Code conversion is complete. Build and tests pass. The following tasks require manual action.

## Done (automated)

- [x] Stripe product created: `prod_USaHAVqgd6nwPM` (Google Calendar MCP, $5 one-time, `price_1TTf7KIvnPDvHV9e2uvplEBa`) on existing outlookmcp account
- [x] GitHub repo: `paytience/google-calendar-mcp` (public, code pushed, PR merged to main)
- [x] All source code converted, 35 unit tests passing

## 1. Stripe (new account required)

1. Sign up at https://dashboard.stripe.com/register with a new email/business
2. Business name: "Google Calendar MCP" or "mcpcalendar.com"
3. Create product: "Google Calendar MCP" ($5 one-time)
4. Set up webhook endpoint: `https://mcpcalendar.com/api/stripe/webhook`
5. Note: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`

## 2. Google Cloud Console

1. Create a Google Cloud project (or reuse existing)
2. Enable the **Google Calendar API**
3. Create OAuth 2.0 credentials (Web application type):
   - Authorized redirect URI: `https://mcpcalendar.com/api/auth/callback`
4. Set the OAuth consent screen:
   - Scopes: `calendar`, `calendar.events`, `userinfo.email`, `userinfo.profile`
   - App name: "Google Calendar MCP"
5. Submit for Google verification (required for production; can test with < 100 users before approval)
6. Note: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## 3. Supabase

Free tier limit reached (2 projects). Choose one:
- **Option A**: Pause/delete the `outlook-mcp` project, then create `google-calendar-mcp`
- **Option B**: Reuse `outlook-mcp` project (schema is provider-agnostic), rename it
- **Option C**: Upgrade to Pro to remove the limit

Regardless of option:
- Confirm tables exist: `mcp_sessions`, `mcp_tokens`, `mcp_api_keys`
- Update the token-refresh edge function to use `https://oauth2.googleapis.com/token`
- Update edge function env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

Existing project ID: `baushlqryuckehdslhik`

## 4. Vercel (new project, manual)

1. Go to https://vercel.com/new
2. Import `paytience/google-calendar-mcp` from GitHub
3. Set root directory to `web`
4. Framework preset: Next.js
5. Add environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` = `https://mcpcalendar.com/api/auth/callback`
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
5. Update all references in code if not using `mcpcalendar.com`

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

Unavailable: `mcpcalendar.com`, `calendarmcp.com`, `mcp-calendar.com`

Purchase link (Vercel): https://vercel.com/domains/search

## 6. Resend (Email)

1. Add `mcpcalendar.com` domain to Resend
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
| `GOOGLE_REDIRECT_URI` | Vercel | `https://mcpcalendar.com/api/auth/callback` |
| `SUPABASE_URL` | Vercel | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Supabase dashboard |
| `ENCRYPTION_KEY` | Vercel, Supabase edge fn | `openssl rand -hex 32` |
| `STRIPE_SECRET_KEY` | Vercel | New Stripe account |
| `STRIPE_WEBHOOK_SECRET` | Vercel | New Stripe account |
| `STRIPE_PRICE_ID` | Vercel | New Stripe account |
| `RESEND_API_KEY` | Vercel | Resend dashboard |
