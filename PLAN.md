# Outlook MCP: Commercial Architecture Plan

## Context
The outlook-mcp project currently works locally with flat-file token storage and a localhost auth server. To make it commercial, we need hosted auth (HTTPS), secure token storage, and easy distribution via npm. The Azure AD app is already registered (multi-tenant), and Supabase + Vercel are available.

## Architecture Overview

**Three components:**
1. **Vercel auth app** (mcpoutlook.com): Handles OAuth callback, stores encrypted tokens in Supabase
2. **Supabase backend**: Stores encrypted tokens + API keys. Edge Function decrypts tokens for authorized clients.
3. **npm package** (outlook-mcp): Local MCP server that fetches tokens from Supabase via API key

## Phase 1: Supabase Schema

Create tables in project `xinunseqsgmktmbrzahw`:

```sql
CREATE TABLE public.mcp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_email TEXT,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes')
);

CREATE TABLE public.mcp_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES public.mcp_sessions(session_id),
  user_email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  encrypted_tokens TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  encryption_tag TEXT NOT NULL,
  token_expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_email)
);

CREATE TABLE public.mcp_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_hash TEXT NOT NULL UNIQUE,
  session_id TEXT NOT NULL REFERENCES public.mcp_sessions(session_id),
  user_email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);
```

Deploy Edge Function `mcp-tokens` that validates API keys and returns decrypted tokens.

## Phase 2: Vercel Auth App

New Next.js app deployed to mcpoutlook.com:

```
outlook-mcp-web/
  app/
    api/auth/login/route.ts      -- Redirect to Microsoft OAuth
    api/auth/callback/route.ts   -- Exchange code, encrypt tokens, store in Supabase
    api/auth/status/route.ts     -- Polling endpoint for local CLI
    page.tsx                     -- Landing page
    success/page.tsx             -- Post-auth success
  lib/
    encryption.ts                -- AES-256-GCM helpers
    supabase.ts                  -- Admin client
    microsoft-oauth.ts           -- OAuth helpers
```

- `/api/auth/login?session_id=X`: Redirects to Microsoft
- `/api/auth/callback`: Stores encrypted tokens, issues API key, marks session complete
- `/api/auth/status?session_id=X`: Returns `{ ready, api_key, user_email }` when done

## Phase 3: Refactor npm Package

Files to modify in `/Users/caspernilsen/Dropbox/Projects/outlook-mcp/src/`:

- **Remove**: `auth-server.ts` (replaced by Vercel)
- **Remove**: `AccountStore` class from `auth.ts`
- **Add**: `src/token-store.ts` (fetches tokens from Supabase Edge Function via API key)
- **Add**: `src/setup.ts` (first-run: opens browser, polls for completion, saves API key)
- **Add**: `src/config.ts` (manages `~/.outlook-mcp/config.json`)
- **Add**: `src/retry.ts` (exponential backoff for Graph API 429/5xx)
- **Add**: `bin/outlook-mcp.ts` (CLI entry point)
- **Modify**: `outlook-client.ts` (use SupabaseTokenStore instead of AccountStore)
- **Modify**: `index.ts` (use setup flow, remove filesystem deps)
- **Modify**: `package.json` (add `bin`, `open` dep, remove `dotenv`)

## Phase 4: End-to-end User Flow

1. `npx outlook-mcp` (first run)
2. Opens browser: `https://mcpoutlook.com/api/auth/login?session_id=abc123`
3. User signs in with Microsoft, consents
4. Callback stores encrypted tokens in Supabase
5. CLI poll detects completion, receives API key
6. Saves API key to `~/.outlook-mcp/config.json`
7. MCP server starts, fetches tokens via Edge Function

## Phase 5: Security

- AES-256-GCM encryption key lives only on Vercel/Supabase (never on user machine)
- Client secret lives only on Vercel (not in npm package)
- API keys: `omk_` + 32 random bytes, only hash stored server-side
- RLS enabled on all tables, no anon access
- Sessions expire after 10 minutes

## Phase 6: Azure AD Updates

- Add redirect URI: `https://mcpoutlook.com/api/auth/callback`
- Publisher verification via MPN ID

## Verification

1. Run Supabase migration, verify tables created
2. Deploy Vercel app, visit mcpoutlook.com
3. Run `npx outlook-mcp`, verify browser opens and auth completes
4. Use `list_emails` tool to confirm Graph API access works
5. Kill and restart MCP server, verify tokens persist via Supabase
6. Test token refresh (wait for expiry or force-expire)
