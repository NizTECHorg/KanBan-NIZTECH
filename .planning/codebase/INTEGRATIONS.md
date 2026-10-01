---
last_mapped_commit: ff4d7688f16342c02a651f25adf2b7067499fadc
---

# External Integrations

**Analysis Date:** 2026-10-01

## APIs & External Services

**Payment Processing:**
- Not applicable - No Stripe/PayPal SDK or checkout flow. Payment method enums in `src/types/database.types.ts` are leftover bakery-domain types, not live processors.

**Email/SMS:**
- Supabase Auth built-in email - Confirmation / magic-link style delivery when `signUp` returns no session (`src/services/auth.service.ts` `emailRedirectTo: ${window.location.origin}/`)
  - SDK/Client: `@supabase/supabase-js` 2.110.7
  - Auth: Project SMTP is configured in the Supabase dashboard (not in this repo)
  - Templates: Supabase Auth email templates in the dashboard — no SendGrid/Resend/Twilio client

**External APIs:**
- Supabase (Auth + PostgREST + Storage + RPC) - Sole application backend
  - Integration method: `@supabase/supabase-js` via `src/lib/supabase/client.ts`; services in `src/services/auth.service.ts`, `src/services/kanban.service.ts`, `src/services/modules.service.ts`
  - Auth: Anon key + user JWT session (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
  - Rate limits: Client-side login/register throttling in `src/lib/security/index.ts` (`sessionStorage` key `template.auth.rate`); platform limits are Supabase-project defaults
  - CSP `connect-src` allows `https://*.supabase.co` and `wss://*.supabase.co` (`index.html`, `netlify.toml`)
- Google Fonts - Montserrat and Outfit loaded from `fonts.googleapis.com` / `fonts.gstatic.com` in `index.html`
  - Integration method: `<link rel="stylesheet">` (not an npm package)
  - Auth: Public CDN
  - Rate limits: Not applicable

## Data Storage

**Databases:**
- PostgreSQL on Supabase - Primary data store
  - Connection: Browser client uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `src/config/env.ts` (no `DATABASE_URL` in the frontend)
  - Client: `@supabase/supabase-js` (`createClient` in `src/lib/supabase/client.ts`); security authority is RLS + RPCs, not the TS types
  - Migrations: Local SQL applied manually in the Supabase SQL Editor. Files (gitignored under `/supabase/` per `.gitignore`):
    - `supabase/migrations/20260821120000_kanban_boards.sql` — `profiles`, `projects`, `board_lists`, `cards`, RLS, `handle_new_user` trigger on `auth.users`
    - `supabase/migrations/20260821130000_card_assignees_text.sql`
    - `supabase/migrations/20260821140000_seed_requisitos.sql`
    - `supabase/migrations/20260822190000_card_notes.sql` — `cards.note`, `cards.note_image_path`, Storage bucket
  - Domain types: `src/types/kanban.ts` (boards) and `src/types/database.types.ts` (broader bakery schema + RPCs still referenced by `src/services/modules.service.ts`)
  - Kanban tables used by the live routes: `profiles`, `projects`, `board_lists`, `cards`

**File Storage:**
- Supabase Storage - Card note images
  - SDK/Client: `supabase.storage` in `src/services/kanban.service.ts`
  - Auth: Authenticated user JWT (anon key + session). Bucket is private
  - Buckets: `card-notes` (private, 512 KB limit, jpeg/png/webp) created in `supabase/migrations/20260822190000_card_notes.sql`
  - Access: `createSignedUrl(..., 60 * 60)` in `getNoteImageUrl`; uploads as `{cardId}/{uuid}.jpg` after client compression in `src/lib/compress-image.ts`

**Caching:**
- None (no Redis/CDN cache layer)
  - Connection: Not applicable
  - Client: In-memory TanStack Query (`staleTime: 60_000` in `src/main.tsx`)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email + password only
  - Implementation: `signInWithPassword` / `signUp` / `signOut` in `src/services/auth.service.ts`; session wiring in `src/providers/AuthProvider.tsx`
  - Client options in `src/lib/supabase/client.ts`: `flowType: 'pkce'`, `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: true`
  - Token storage: supabase-js default persisted session (browser `localStorage`); not httpOnly cookies (no `@supabase/ssr`)
  - Session management: `getSession()` + `onAuthStateChange` in `src/providers/AuthProvider.tsx`; profile loaded from `public.profiles` via `fetchProfile`
  - Gate: `isAuthenticated` requires session **and** an active profile (`src/providers/AuthProvider.tsx`); routes in `src/components/auth/ProtectedRoute.tsx`
  - New users: DB trigger `public.handle_new_user` on `auth.users` inserts `profiles` (`supabase/migrations/20260821120000_kanban_boards.sql`)

**OAuth Integrations:**
- None in application code - No `signInWithOAuth`, Google, or GitHub provider calls

## Monitoring & Observability

**Error Tracking:**
- None - No Sentry/Datadog client or DSN env var

**Analytics:**
- None - No Mixpanel/GA/PostHog

**Logs:**
- Browser `console` only (no structured logger)
  - Hosting platforms retain deploy/request logs (Vercel/Netlify) if used
  - User-facing errors go through Zustand toasts (`src/stores/toast.store.ts`)

## CI/CD & Deployment

**Hosting:**
- Vercel - Documented production path in `src/pages/SetupPage.tsx` (`Settings → Environment Variables`, rebuild required for `VITE_*`)
  - Deployment: Static `dist/` SPA; SPA rewrite in `vercel.json`
  - Environment vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in the Vercel project (Production)
- Netlify - Alternate static host
  - Deployment: `netlify.toml` `command = "npm run build"`, `publish = "dist"`; also `public/_redirects`
  - Environment vars: Same `VITE_*` names, injected at Netlify build time
  - Security headers + CSP in `netlify.toml` (Vite also sets headers for `vite` dev in `vite.config.ts`)

**CI Pipeline:**
- None - No `.github/workflows/` directory

## Environment Configuration

**Development:**
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Secrets location: `.env` (gitignored). `.env.example` is mentioned in `src/pages/SetupPage.tsx` but is not present in the repo
- Mock/stub services: None — point the Vite app at a real Supabase project and run SQL in `supabase/migrations/`
- Guard: `isEnvConfigured()` in `src/config/env.ts` blocks placeholder URLs/keys and non-HTTPS URLs

**Staging:**
- Not detected - No staging env files, workflows, or documented second Supabase project

**Production:**
- Secrets management: Host dashboard env vars (Vercel documented; Netlify supported by config). Values are baked into the JS bundle at build time
- Failover/redundancy: Relies on the hosted Supabase project; no app-level multi-region or fallback API
- Client header: `X-Client-Info: niztech-kanban` (`src/lib/supabase/client.ts`)

## Webhooks & Callbacks

**Incoming:**
- None - SPA has no `/api` routes or webhook handlers
  - Auth redirect: Supabase email confirmation returns the user to `window.location.origin/` (`src/services/auth.service.ts`); PKCE + `detectSessionInUrl` consume the hash/query
  - Database callback (internal): `on_auth_user_created` trigger on `auth.users` → `public.handle_new_user` (`supabase/migrations/20260821120000_kanban_boards.sql`)

**Outgoing:**
- None - App does not POST to third-party webhooks
  - Realtime: CSP allows `wss://*.supabase.co` and supabase-js includes `realtime-js`, but application code does not subscribe to channels

---

*Integration audit: 2026-10-01*
*Update when adding/removing external services*
