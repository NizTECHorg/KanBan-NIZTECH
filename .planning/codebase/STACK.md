---
last_mapped_commit: ff4d7688f16342c02a651f25adf2b7067499fadc
---

# Technology Stack

**Analysis Date:** 2026-10-01

## Languages

**Primary:**
- TypeScript 5.8.3 (`typescript` `~5.8.3` in `package.json`, resolved 5.8.3 in `package-lock.json`) - All application code under `src/` (`tsconfig.json` `include: ["src"]`, `strict: true`, `jsx: "react-jsx"`, target `ES2022`)

**Secondary:**
- JavaScript ESM (`"type": "module"` in `package.json`) - Build/tooling files: `vite.config.ts`, `eslint.config.js`, `scripts/generate-seed-sql.mjs`, `scripts/requirements.mjs`
- SQL - Local Supabase schema/seed scripts in `supabase/migrations/` (directory is gitignored via `.gitignore`)
- HTML/CSS - `index.html`, `src/index.css` (Tailwind v4 `@import "tailwindcss"` + `@theme`)

## Runtime

**Environment:**
- Browser SPA (Vite + React) - App runs entirely in the browser; no Node server or API routes in-repo
- Node.js for the toolchain - Vite 6 requires `^18 || ^20 || >=22` (`package-lock.json` `node_modules/vite`); `@supabase/supabase-js` 2.110.7 declares `engines.node >= 22.0.0`
- No `.nvmrc`, `.node-version`, or `package.json` `engines` field - Use Node 22+ (local environment observed: Node v24.18.0)
- `@types/node` `^22.15.21` in `package.json` for Vite config typing (`tsconfig.node.json`)

**Package Manager:**
- npm (lockfileVersion 3 in `package-lock.json`; local npm 12.0.2)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.2.7 (`react` / `react-dom` `^19.1.0` in `package.json`) - UI library; mounted in `src/main.tsx`
- React Router DOM 7.18.1 (`react-router-dom` `^7.6.1`) - Client routing in `src/App.tsx` and `src/routes/index.tsx`
- Tailwind CSS 4.3.3 (`tailwindcss` `^4.1.7`, `@tailwindcss/vite` `^4.1.7`) - Utility CSS via Vite plugin in `vite.config.ts`; tokens in `src/index.css`

**Testing:**
- Not detected - No Vitest, Jest, Playwright, or `*.test.*` / `*.spec.*` files; `package.json` has no `test` script

**Build/Dev:**
- Vite 6.4.3 (`vite` `^6.3.5`) - Dev server, bundler, preview (`npm run dev` / `build` / `preview` in `package.json`)
- `@vitejs/plugin-react` 4.7.0 - React Fast Refresh (`vite.config.ts`)
- TypeScript 5.8.3 - Typecheck-only (`"noEmit": true` in `tsconfig.json`; `npm run build` runs `tsc --noEmit && vite build`)
- ESLint 9.39.5 flat config (`eslint.config.js`) with `typescript-eslint` 8.64.0, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.110.7 (`^2.49.8`) - Auth, PostgREST queries, Storage, RPCs; singleton in `src/lib/supabase/client.ts`
- `@tanstack/react-query` 5.101.2 (`^5.76.1`) - Server-state cache; `QueryClient` in `src/main.tsx`, hooks in `src/hooks/queries.ts` and `src/hooks/kanban.ts`
- `zod` 3.25.76 (`^3.25.28`) - Form/API payload validation in `src/schemas/auth.schema.ts`, `src/schemas/kanban.schema.ts`, `src/schemas/modules.schema.ts`
- `react-hook-form` 7.81.0 + `@hookform/resolvers` 5.4.0 - Forms with `zodResolver` (e.g. `src/pages/auth/LoginPage.tsx`)
- `zustand` 5.0.14 (`^5.0.5`) - Client toast store in `src/stores/toast.store.ts`

**Infrastructure:**
- `react-router-dom` 7.18.1 - SPA routes and auth gates (`src/routes/index.tsx`, `src/components/auth/ProtectedRoute.tsx`)
- `lucide-react` 1.25.0 - Icon set used across pages/components
- Browser `fetch` via supabase-js - No Express/Fastify/Next.js backend
- No Prisma/Drizzle/ORM - Typed table shapes live in `src/types/database.types.ts` and `src/types/kanban.ts`

## Configuration

**Environment:**
- Vite `import.meta.env` only - Read and validated in `src/config/env.ts`; typed in `src/vite-env.d.ts`
- Required vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (HTTPS URL required; placeholder values containing `seu-projeto` / `sua-chave` rejected)
- Missing/invalid env renders `src/pages/SetupPage.tsx` from `src/App.tsx` instead of the app
- `.env` present locally and gitignored (`.gitignore`); `.env.example` is referenced by `src/pages/SetupPage.tsx` but is not in the repo
- Never put `service_role` in frontend env (`src/pages/SetupPage.tsx`)

**Build:**
- `vite.config.ts` - React + Tailwind plugins, `@` → `src` alias, security headers on the dev server, `sourcemap: false`, manual chunks `vendor` and `supabase`
- `tsconfig.json` - App TS (`paths`: `@/*` → `src/*`)
- `tsconfig.node.json` - Vite config typing
- `eslint.config.js` - Lint for `**/*.{ts,tsx}`, ignores `dist`
- `netlify.toml` - `npm run build`, publish `dist`, SPA fallback, CSP/security headers
- `vercel.json` - SPA rewrite `/(.*)` → `/index.html`
- `public/_redirects` - Netlify SPA fallback `/* /index.html 200`
- `index.html` - Entry, CSP, Google Fonts (Montserrat, Outfit)

## Platform Requirements

**Development:**
- Any OS with Node.js 22+ and npm
- Copy env vars into `.env` (Vite loads them at startup); restart `npm run dev` after changes
- Apply SQL in `supabase/migrations/` via the Supabase SQL Editor (no Supabase CLI config committed; `/supabase/` is gitignored)
- No Docker, no local Postgres required if using a hosted Supabase project
- Seed helper: `scripts/generate-seed-sql.mjs` writes SQL from `scripts/requirements.mjs`

**Production:**
- Static SPA (`dist/`) on Vercel (documented in `src/pages/SetupPage.tsx`) or Netlify (`netlify.toml`)
- Vite inlines `VITE_*` at **build** time — changing host env vars requires a rebuild/redeploy
- CSP must allow `https://*.supabase.co`, `wss://*.supabase.co`, `https://fonts.googleapis.com`, `https://fonts.gstatic.com` (`index.html`, `netlify.toml`)

---

*Stack analysis: 2026-10-01*
*Update after major dependency changes*
