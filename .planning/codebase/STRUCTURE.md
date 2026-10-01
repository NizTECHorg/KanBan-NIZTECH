# Codebase Structure

**Analysis Date:** 2026-10-01
**last_mapped_commit:** ff4d7688f16342c02a651f25adf2b7067499fadc

## Directory Layout

```
KanBan-NIZTECH/
├── src/                        # Application source (TypeScript + React)
│   ├── App.tsx                 # Env gate, router, auth, toasts
│   ├── main.tsx                # React mount + QueryClient
│   ├── index.css               # Tailwind v4 theme tokens
│   ├── components/             # UI by concern
│   │   ├── auth/               # Guest/protected layouts and guards
│   │   ├── brand/              # Wordmark
│   │   ├── dashboard/          # Leftover bakery chart (unrouted)
│   │   ├── kanban/             # Live board UI
│   │   ├── layout/             # AppShell (+ unused search/notifications)
│   │   └── ui/                 # Shared primitives
│   ├── config/                 # Env, board constants, nav
│   ├── data/                   # Static seed/requirements catalog
│   ├── hooks/                  # TanStack Query + auth context hook
│   ├── lib/                    # Supabase client, security, helpers
│   ├── pages/                  # Route screens (only some are wired)
│   │   └── auth/               # Login / register
│   ├── providers/              # AuthProvider
│   ├── routes/                 # Route table
│   ├── schemas/                # Zod contracts
│   ├── services/               # Supabase I/O
│   ├── stores/                 # Zustand toast store
│   └── types/                  # Domain + leftover Database types
├── supabase/                   # Local SQL (root /supabase/ is gitignored)
│   └── migrations/             # Kanban + notes SQL
├── public/                     # Static assets + SPA rewrite
├── scripts/                    # One-off seed/requirements generators
├── dist/                       # Vite build output (gitignored)
├── .planning/                  # GSD planning artifacts
├── index.html                  # HTML shell + CSP
├── package.json                # Scripts and dependencies
├── vite.config.ts              # Aliases, chunks, security headers
├── tsconfig.json               # Strict TS + `@/*`
├── eslint.config.js            # ESLint flat config
├── vercel.json                 # SPA rewrite
├── netlify.toml                # SPA rewrite + headers
└── Requisitos.md               # Product requirements (physiotherapy domain)
```

## Directory Purposes

**src/**
- Purpose: Entire frontend. Path alias `@/` maps here (`vite.config.ts`, `tsconfig.json`)
- Contains: `*.ts` / `*.tsx` / `index.css`
- Key files: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`
- Subdirectories: layered by kind (pages, components, hooks, services), not by feature folder-per-domain

**src/pages/**
- Purpose: Route-level screens. One exported `*Page` function per file
- Contains: Kanban screens plus many unrouted bakery leftovers
- Key files (live): `src/pages/ProjectsPage.tsx`, `src/pages/BoardPage.tsx`, `src/pages/SetupPage.tsx`, `src/pages/auth/LoginPage.tsx`, `src/pages/auth/RegisterPage.tsx`
- Unrouted leftovers — do not wire unless scope changes: `DashboardPage.tsx`, `TasksPage.tsx`, `OrdersPage.tsx`, `ProductsPage.tsx`, `ClientsPage.tsx`, `CouponsPage.tsx`, `ProductionPage.tsx`, `DeliveriesPage.tsx`, `StockPage.tsx`, `ShoppingPage.tsx`, `FinancePage.tsx`, `RecipesPage.tsx`, `EmployeesPage.tsx`, `ReportsPage.tsx`, `SettingsPage.tsx`, `BlankPage.tsx`
- Subdirectories: `src/pages/auth/` for guest screens

**src/components/kanban/**
- Purpose: Live board widgets
- Contains: `KanbanList.tsx`, `KanbanCard.tsx`, `CardModal.tsx`, `CardNote.tsx`, `CardComposer.tsx`, `ListComposer.tsx`, `ProjectModal.tsx`, `ProjectTile.tsx`
- Key files: `CardModal.tsx` (edit card + embed notes), `CardNote.tsx` (note + image)
- Subdirectories: None (flat)

**src/components/ui/**
- Purpose: Reusable primitives. Prefer these over one-off markup
- Contains: `Button.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Modal.tsx`, `ConfirmDialog.tsx`, `PageHeader.tsx`, `Badge.tsx`, `DataTable.tsx`, `ToastViewport.tsx`
- Key files: `Modal.tsx`, `ConfirmDialog.tsx`, `ToastViewport.tsx`
- Subdirectories: None

**src/components/auth/** and **src/components/layout/**
- Purpose: Guards and chrome
- Contains: `ProtectedRoute.tsx`, `AuthLayout.tsx`, `AppShell.tsx`
- Key files: `src/components/auth/ProtectedRoute.tsx`, `src/components/layout/AppShell.tsx`
- Unused in routes: `src/components/layout/GlobalSearch.tsx`, `src/components/layout/NotificationsMenu.tsx`

**src/hooks/**
- Purpose: Data and auth hooks
- Contains: `kanban.ts` (live), `useAuth.ts` (context consumer), `queries.ts` (unrouted bakery)
- Key files: `src/hooks/kanban.ts` — add new Kanban query/mutation hooks here
- Subdirectories: None

**src/services/**
- Purpose: Supabase access only. No React
- Contains: `kanban.service.ts`, `auth.service.ts`, `modules.service.ts` (leftover)
- Key files: `src/services/kanban.service.ts`, `src/services/auth.service.ts`
- Subdirectories: None

**src/schemas/** and **src/types/**
- Purpose: Zod forms vs TypeScript domain models
- Contains: `kanban.schema.ts`, `auth.schema.ts`, `modules.schema.ts` (leftover); `kanban.ts`, `database.types.ts` (profiles + bakery)
- Key files: `src/schemas/kanban.schema.ts`, `src/types/kanban.ts`
- `profiles` type for auth lives in `src/types/database.types.ts`

**src/lib/**
- Purpose: Cross-cutting helpers and the Supabase client
- Contains: `src/lib/supabase/client.ts`, `src/lib/security/index.ts`, `src/lib/compress-image.ts`, `src/lib/permissions.ts`, `src/lib/labels.tsx`
- Key files: `client.ts` (singleton), `security/index.ts` (sanitize, errors, rate limit, dates)
- Subdirectories: `supabase/`, `security/`

**src/config/**
- Purpose: Constants and env
- Contains: `env.ts`, `kanban.ts`, `navigation.ts`
- Key files: `src/config/kanban.ts` (colors, default lists, labels, assignees)
- Subdirectories: None

**src/providers/** and **src/stores/** and **src/routes/**
- Purpose: App-wide wrappers
- Contains: `src/providers/AuthProvider.tsx`, `src/stores/toast.store.ts`, `src/routes/index.tsx`
- Key files: those three — no extra providers/stores yet
- Subdirectories: None

**src/data/**
- Purpose: Static requirement cards used by `seedRequirementCards` in `src/services/kanban.service.ts`
- Contains: `src/data/requirements.ts`
- Key files: `requirements.ts`
- Subdirectories: None

**supabase/**
- Purpose: SQL applied manually in the Supabase dashboard
- Contains: `migrations/*.sql`
- Key files: `supabase/migrations/20260821120000_kanban_boards.sql`, `supabase/migrations/20260821130000_card_assignees_text.sql`, `supabase/migrations/20260821140000_seed_requisitos.sql`, `supabase/migrations/20260822190000_card_notes.sql`
- Subdirectories: `migrations/`
- Note: `.gitignore` ignores `/supabase/` at repo root — files exist locally and are referenced by `SetupPage` / service error copy

**public/**, **scripts/**, **.planning/**
- Purpose: Static hosting files, one-off generators, GSD docs
- Contains: `public/_redirects`; `scripts/generate-seed-sql.mjs`, `scripts/requirements.mjs`; `.planning/codebase/`
- Key files: `public/_redirects` (Netlify SPA fallback)
- Subdirectories: `.planning/codebase/`

## Key File Locations

**Entry Points:**
- `index.html` — HTML shell, CSP, fonts, mounts `#root`
- `src/main.tsx` — `createRoot` + `QueryClientProvider`
- `src/App.tsx` — env gate and provider tree
- `src/routes/index.tsx` — live route table

**Configuration:**
- `package.json` — `dev`, `build` (`tsc --noEmit && vite build`), `lint`, `typecheck`
- `vite.config.ts` — `@` alias, vendor/supabase chunks, dev security headers
- `tsconfig.json` — strict TS, `@/*` → `src/*`
- `tsconfig.node.json` — Vite config TS
- `eslint.config.js` — `typescript-eslint` + react-hooks + react-refresh
- `src/config/env.ts` — reads `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (never commit values)
- `.env` — present locally, gitignored; do not read or quote
- `vercel.json` / `netlify.toml` / `public/_redirects` — SPA fallbacks

**Core Logic:**
- `src/services/kanban.service.ts` — projects, lists, cards, notes, storage, seed
- `src/services/auth.service.ts` — sign-in/up/out, profile
- `src/hooks/kanban.ts` — query keys and mutations
- `src/pages/BoardPage.tsx` — board orchestration + DnD
- `src/pages/ProjectsPage.tsx` — board grid
- `src/providers/AuthProvider.tsx` — session + profile
- `src/lib/supabase/client.ts` — lazy Supabase client
- `src/lib/security/index.ts` — sanitize, error maps, client rate limit
- `src/types/kanban.ts` — `Project`, `BoardList`, `Card`, `BoardData`, `DragState`

**Testing:**
- Not detected — no `*.test.*` / `*.spec.*`, no `tests/` directory, no Vitest/Jest config

**Documentation:**
- `Requisitos.md` — physiotherapy requirement list (also seeded via `src/data/requirements.ts`)
- `.planning/codebase/` — GSD maps (`ARCHITECTURE.md`, this file)

## Naming Conventions

**Files:**
- PascalCase `.tsx` for React components and pages: `BoardPage.tsx`, `KanbanCard.tsx`, `ProtectedRoute.tsx`
- Page suffix `*Page.tsx` for route screens: `ProjectsPage.tsx`
- kebab-case for non-component modules: `kanban.service.ts`, `kanban.schema.ts`, `compress-image.ts`, `database.types.ts`
- Domain suffix: `*.service.ts`, `*.schema.ts`, `*.store.ts`, `*.types.ts`
- Hook files: `useAuth.ts` for a single hook; `kanban.ts` / `queries.ts` for grouped hooks
- CSS: `src/index.css` only (no CSS modules)

**Directories:**
- lowercase singular layer names: `src/hooks`, `src/services`, `src/schemas`, `src/types`, `src/stores`, `src/routes`
- Component folders by concern: `components/kanban`, `components/ui`, `components/auth`
- `src/pages/auth/` for guest pages

**Special Patterns:**
- Named exports for components and functions (`export function BoardPage`) — no default exports in app source
- Types exported from the same file as the schema or model (`export type CardFormData = z.infer<typeof cardSchema>`)
- Query keys are string tuples in `src/hooks/kanban.ts`: `['projects']`, `['board', projectId]`
- SQL migrations: `YYYYMMDDHHMMSS_snake_case.sql` under `supabase/migrations/`
- Only barrel: `src/lib/security/index.ts` — do not add `index.ts` barrels under `components/`

## Where to Add New Code

**New Kanban feature (e.g. card comments, labels UI):**
- Types: `src/types/kanban.ts`
- Zod (if a form): `src/schemas/kanban.schema.ts`
- Persistence: functions in `src/services/kanban.service.ts`
- Hooks: `src/hooks/kanban.ts` (same query keys; invalidate `['board', projectId]` or `['projects']`)
- UI: `src/components/kanban/{Name}.tsx` or extend `CardModal.tsx` / `BoardPage.tsx`
- Route (only if a new screen): `src/pages/{Name}Page.tsx` + register in `src/routes/index.tsx`
- SQL: new file in `supabase/migrations/`
- Tests: not established — if adding, colocate `*.test.ts` next to the module or create `src/**/__tests__/`

**New page that is part of the live app:**
- Implementation: `src/pages/{Name}Page.tsx`
- Nav: `src/components/layout/AppShell.tsx` and/or `src/config/navigation.ts`
- Guard: nest under `ProtectedRoute` + `AppShell` in `src/routes/index.tsx`
- Do not revive leftover bakery pages by default

**New shared UI primitive:**
- Implementation: `src/components/ui/{Name}.tsx`
- Follow existing prop style (`className` join, `variant` unions) in `Button.tsx` / `Modal.tsx`

**New auth or security helper:**
- Auth I/O: `src/services/auth.service.ts`
- Sanitize / error map / redirect: `src/lib/security/index.ts`
- Schema: `src/schemas/auth.schema.ts`

**Utilities:**
- Board constants (colors, assignees, default lists): `src/config/kanban.ts`
- Image helpers: `src/lib/compress-image.ts`
- Env: `src/config/env.ts` only — never read `import.meta.env` in services
- Toasts: `toast()` from `src/stores/toast.store.ts`

**Do not add Kanban logic here:**
- `src/services/modules.service.ts`
- `src/hooks/queries.ts`
- `src/schemas/modules.schema.ts`
- `src/lib/permissions.ts` (bakery roles)
- Unrouted `src/pages/*Page.tsx` leftovers
- `src/pages/TasksPage.tsx` (different `tasks` table Kanban)

## Special Directories

**dist/**
- Purpose: Vite production build
- Source: `npm run build`
- Committed: No (`.gitignore`)

**node_modules/**
- Purpose: npm packages
- Source: `npm install`
- Committed: No

**supabase/**
- Purpose: Local SQL migrations and (if present) CLI artifacts
- Source: Hand-written SQL; applied in Supabase SQL editor
- Committed: No at repo root (`/supabase/` in `.gitignore`). Keep copies in the workspace; document new filenames in service error strings when a column/table is required

**.planning/**
- Purpose: GSD maps and later phase artifacts
- Source: `/gsd-map-codebase` and other GSD commands
- Committed: Yes (planning docs)

**.env**
- Purpose: Local `VITE_SUPABASE_*` values
- Source: Developer machine
- Committed: No — file exists locally; never quote contents
- `src/pages/SetupPage.tsx` mentions `.env.example`; that file is not in the repo

---

*Structure analysis: 2026-10-01*
*Update when directory structure changes*
