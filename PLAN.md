# Google Calendar MCP: Remaining Steps

Code conversion from Outlook MCP is complete. The following manual/infrastructure tasks remain.

## 1. Google Cloud Console Setup

1. Create a Google Cloud project (or reuse existing)
2. Enable the **Google Calendar API**
3. Create OAuth 2.0 credentials (Web application type):
   - Authorized redirect URI: `https://mcpcalendar.com/api/auth/callback`
4. Set the OAuth consent screen:
   - Scopes: `calendar`, `calendar.events`, `userinfo.email`, `userinfo.profile`
   - App name: "Google Calendar MCP"
5. Submit for Google verification (required for production; can test with < 100 users before approval)
6. Note the Client ID and Client Secret for env vars

## 2. Vercel Project

1. Create a Vercel project for the `web/` directory
2. Link to GitHub repo `paytience/google-calendar-mcp`
3. Set root directory to `web`
4. Add environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI` = `https://mcpcalendar.com/api/auth/callback`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ENCRYPTION_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID`
   - `RESEND_API_KEY`

## 3. Domain & DNS

1. Register or configure `mcpcalendar.com`
2. Point DNS to Vercel
3. Add domain in Vercel project settings
4. Verify SSL is working

## 4. Supabase

The existing Supabase project + edge functions can be reused (token storage is provider agnostic).
- Confirm the `mcp_sessions`, `mcp_tokens`, `mcp_api_keys` tables exist
- The edge function for token refresh needs updating to use `https://oauth2.googleapis.com/token` instead of Microsoft token endpoint
- Update the edge function's env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## 5. Stripe

1. Create a new product "Google Calendar MCP" in Stripe
2. Create a price ($5 one-time)
3. Update the `STRIPE_PRICE_ID` env var
4. Set up webhook endpoint: `https://mcpcalendar.com/api/stripe/webhook`

## 6. Resend (Email)

1. Add `mcpcalendar.com` domain to Resend
2. Verify DNS records (SPF, DKIM)
3. Update `RESEND_API_KEY` if using a different key

## 7. NPM Publish

1. Run `npm install` to install `googleapis` and update lockfile
2. Run `npm run build` to verify the build succeeds
3. Run `npm publish --access public` to publish `@paytience/google-calendar-mcp`

## 8. Docker / GHCR

1. Build: `docker build -t ghcr.io/paytience/google-calendar-mcp:latest .`
2. Push: `docker push ghcr.io/paytience/google-calendar-mcp:latest`
3. Make package public in GitHub packages settings

## 9. Testing

1. Run unit tests: `npm test`
2. Set `GOOGLE_CALENDAR_MCP_API_KEY` and run e2e: `npm run test:e2e`
3. Manually test the full purchase flow on staging

## 10. GitHub Repo

- Update repo description: "MCP server for Google Calendar"
- Add topics: `mcp`, `google-calendar`, `ai`, `claude`, `cursor`
- Ensure Actions/CI are set up if desired

## Summary of Key Env Vars

| Variable | Where | Purpose |
|----------|-------|---------|
| `GOOGLE_CLIENT_ID` | Vercel, Supabase edge fn | OAuth client |
| `GOOGLE_CLIENT_SECRET` | Vercel, Supabase edge fn | OAuth client |
| `GOOGLE_REDIRECT_URI` | Vercel | OAuth callback URL |
| `GOOGLE_CALENDAR_MCP_API_KEY` | User's local env | Per-user API key |
| `SUPABASE_URL` | Vercel | Token storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel | Token storage admin |
| `ENCRYPTION_KEY` | Vercel, Supabase edge fn | AES-256 token encryption |
| `STRIPE_SECRET_KEY` | Vercel | Payment processing |
| `STRIPE_PRICE_ID` | Vercel | Product price |
| `RESEND_API_KEY` | Vercel | Transactional email |
