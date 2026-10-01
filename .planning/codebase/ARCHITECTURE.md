# Architecture

**Analysis Date:** 2026-10-01
**last_mapped_commit:** ff4d7688f16342c02a651f25adf2b7067499fadc

## Pattern Overview

**Overall:** Single-page React client (Vite) with a layered domain stack and Supabase as the backend (Auth, Postgres + RLS, Storage). No app server of our own.

**Key Characteristics:**
- Browser SPA: `index.html` mounts `src/main.tsx`, React Router owns screens, TanStack Query owns server cache
- Kanban is the live product: projects → lists → cards → notes, with HTML5 drag-and-drop
- Pages never talk to Supabase directly; they call `src/hooks/kanban.ts`, which calls `src/services/kanban.service.ts`
- Auth is session + active `profiles` row; RLS on Postgres is the real permission boundary
- A leftover bakery/ERP module stack (`src/services/modules.service.ts`, `src/hooks/queries.ts`, most `src/pages/*Page.tsx`) exists on disk but is **not routed** — do not extend it for Kanban work

```text
┌─────────────────────────────────────────────────────────────────┐
│  Browser SPA                                                     │
│  `index.html` → `src/main.tsx` → `src/App.tsx`                   │
│  QueryClientProvider · BrowserRouter · AuthProvider · Toasts     │
├──────────────────┬──────────────────┬────────────────────────────┤
│  Routes/Guards   │  Pages           │  Feature UI                │
│  `src/routes/`   │  `src/pages/`    │  `src/components/kanban/`  │
│  `ProtectedRoute`│  Projects/Board  │  Card/List/Note/Modals     │
└────────┬─────────┴────────┬─────────┴────────────┬───────────────┘
         │                  │                      │
         ▼                  ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Domain hooks — TanStack Query                                   │
│  `src/hooks/kanban.ts`  (`['projects']`, `['board', id]`)        │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Services — named async functions                                │
│  `src/services/kanban.service.ts` · `src/services/auth.service.ts`│
│  sanitize + Zod types + `throwDb` / `mapAuthError`               │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase (BaaS)                                                 │
│  Auth · `projects`/`board_lists`/`cards` · bucket `card-notes`   │
│  Client: `src/lib/supabase/client.ts`                            │
└─────────────────────────────────────────────────────────────────┘
```

## Layers

**Bootstrap / shell:**
- Purpose: Mount React, configure the query client, gate on env, wrap router + auth + toasts
- Contains: `src/main.tsx`, `src/App.tsx`, `src/pages/SetupPage.tsx`, `src/components/ui/ToastViewport.tsx`
- Depends on: `src/config/env.ts`, `@tanstack/react-query`, `react-router-dom`
- Used by: Browser entry (`index.html` script `/src/main.tsx`)

**Routing and access control:**
- Purpose: Map URLs to pages; keep guests on auth screens and authenticated users inside the app shell
- Contains: `src/routes/index.tsx`, `src/components/auth/ProtectedRoute.tsx`, `src/components/layout/AppShell.tsx`
- Depends on: `src/hooks/useAuth.ts`, `src/lib/security` (`safeRedirectPath`)
- Used by: `src/App.tsx`

**Presentation:**
- Purpose: Screens and feature UI. Pages own local UI state (filters, open modal, drag). Components stay presentational and receive callbacks
- Contains: `src/pages/ProjectsPage.tsx`, `src/pages/BoardPage.tsx`, `src/pages/auth/LoginPage.tsx`, `src/pages/auth/RegisterPage.tsx`, `src/components/kanban/*`, `src/components/ui/*`
- Depends on: hooks, Zod schemas, `src/config/kanban.ts`, UI primitives
- Used by: `src/routes/index.tsx`

**Domain hooks:**
- Purpose: The only place pages should load or mutate Kanban data. Wraps services in `useQuery` / `useMutation`, invalidates cache, shows toasts
- Contains: `src/hooks/kanban.ts`, `src/hooks/useAuth.ts`
- Depends on: `src/services/kanban.service.ts`, `src/stores/toast.store.ts`
- Used by: pages and `src/components/kanban/CardNote.tsx`
- Do not use: `src/hooks/queries.ts` for new Kanban features (bakery leftover)

**Services:**
- Purpose: All Supabase I/O, sanitization, position assignment, storage uploads, mapped errors
- Contains: `src/services/kanban.service.ts`, `src/services/auth.service.ts`
- Depends on: `src/lib/supabase/client.ts`, `src/lib/security`, `src/config/kanban.ts`, `src/types/kanban.ts`
- Used by: domain hooks (Kanban) and auth pages / `src/providers/AuthProvider.tsx`
- Do not use: `src/services/modules.service.ts` for new Kanban features

**Validation and types:**
- Purpose: Form contracts (Zod) and domain shapes. Services accept inferred form types; UI uses `zodResolver`
- Contains: `src/schemas/kanban.schema.ts`, `src/schemas/auth.schema.ts`, `src/types/kanban.ts`
- Depends on: `src/config/kanban.ts` for color / label / assignee enums
- Used by: pages, modals, services
- Leftover: `src/schemas/modules.schema.ts`, `src/types/database.types.ts` (bakery + `profiles`)

**Config and shared lib:**
- Purpose: Env, board constants, sanitization, permissions leftovers, image compression
- Contains: `src/config/env.ts`, `src/config/kanban.ts`, `src/config/navigation.ts`, `src/lib/security/index.ts`, `src/lib/compress-image.ts`, `src/lib/permissions.ts`
- Depends on: Vite `import.meta.env` only in `src/config/env.ts`
- Used by: every layer above

**Persistence (Supabase):**
- Purpose: Source of truth. SQL lives in `supabase/migrations/` (local; root `/supabase/` is gitignored)
- Contains: `projects`, `board_lists`, `cards` (+ `note`, `note_image_path`), `profiles`; Storage bucket `card-notes`
- Depends on: nothing in the SPA
- Used by: services through the singleton client

## Data Flow

**App boot:**

1. `index.html` loads `/src/main.tsx`
2. `src/main.tsx` creates `QueryClient` (staleTime 60s, query retry 1, mutation retry 0) and renders `src/App.tsx`
3. `src/App.tsx` reads `env.isConfigured` from `src/config/env.ts`
4. If env is missing or still a placeholder, render `src/pages/SetupPage.tsx` and stop
5. Otherwise wrap `src/routes/index.tsx` in `BrowserRouter` + `src/providers/AuthProvider.tsx` + `ToastViewport`

**Auth (login):**

1. Guest hits `/` → `GuestRoute` in `src/components/auth/ProtectedRoute.tsx`
2. `src/pages/auth/LoginPage.tsx` validates with `loginSchema` (`src/schemas/auth.schema.ts`) via `react-hook-form`
3. `signInWithEmail` in `src/services/auth.service.ts` sanitizes, rate-limits, calls `supabase.auth.signInWithPassword`
4. `AuthProvider` updates session synchronously in `onAuthStateChange` (must stay sync — async work there deadlocks supabase-js)
5. A second effect loads `fetchProfile` (`profiles` where `is_active = true`)
6. `isAuthenticated` is `session && profile`. Session without profile shows `AccountWithoutProfile` on protected routes
7. `GuestRoute` redirects a session to `safeRedirectPath(...)` (default `/projetos`)

**Board load and mutate:**

1. `/projetos` → `ProjectsPage` → `useProjects()` → `listProjects()` → `projects` table
2. `/projetos/:projectId` → `BoardPage` → `useBoard(projectId)` → `getBoard()` loads project + lists + cards, then `withAssignee()`
3. Forms (`ProjectModal`, `CardModal`) validate with `projectSchema` / `cardSchema` and call mutation hooks
4. Hooks call service functions, then `invalidateQueries` on `['projects']` and/or `['board', projectId]`, then `toast(...)`
5. Errors thrown from services become toasts via the shared `onError` in `src/hooks/kanban.ts`

**Drag and drop (cards / lists):**

1. `KanbanCard` / `KanbanList` use native HTML5 `draggable` and report `DragState` up to `BoardPage`
2. `BoardPage.applyCardMove` / `applyListMove` compute new `position` arrays
3. `useMoveCards` / `useReorderLists` apply **optimistic** cache updates, persist via `persistCardMoves` / `reorderLists`, rollback on error, then invalidate

**Card notes:**

1. `CardModal` embeds `CardNote` (`src/components/kanban/CardNote.tsx`)
2. Images are compressed in `src/lib/compress-image.ts`, then `saveCardNote` uploads to Storage bucket `card-notes` and writes `note` + `note_image_path` on `cards`
3. Display uses `getNoteImageUrl` (signed URL, 1 hour)

**State Management:**
- Server state: TanStack Query only. Keys: `['projects']`, `['board', projectId]`
- Auth state: React context in `src/providers/AuthProvider.tsx` + `src/hooks/useAuth.ts`
- Ephemeral UI: React `useState` on the page (filters, open card, drag)
- Toasts: Zustand store `src/stores/toast.store.ts` (`toast()` helper)
- No global Kanban store. Do not introduce Redux or a second query client
- Auth session is persisted by supabase-js (PKCE, `persistSession: true`)

## Key Abstractions

**Service module (named exports, not classes):**
- Purpose: One function per use case; throw `Error` with a safe Portuguese message
- Examples: `listProjects`, `getBoard`, `createCard`, `saveCardNote` in `src/services/kanban.service.ts`; `signInWithEmail`, `fetchProfile` in `src/services/auth.service.ts`
- Pattern: `throwDb` / `mapAuthError` + `sanitizeText` before insert/update

**Query hook:**
- Purpose: Bind a service to a cache key and user feedback
- Examples: `useProjects`, `useBoard`, `useCreateCard`, `useMoveCards`, `useSaveCardNote` in `src/hooks/kanban.ts`
- Pattern: `useQuery` / `useMutation`; optimistic `onMutate` only for reorder/move; `onError` → `toast`

**Zod form schema:**
- Purpose: Client-side contract shared by UI and service argument types
- Examples: `projectSchema`, `cardSchema` in `src/schemas/kanban.schema.ts`; `loginSchema`, `registerSchema` in `src/schemas/auth.schema.ts`
- Pattern: `z.infer<>` types + `zodResolver` in `react-hook-form`

**Board aggregate:**
- Purpose: One query returns the whole board
- Examples: `BoardData` in `src/types/kanban.ts` (`project`, `lists`, `cards`)
- Pattern: flatten cards with `list_id`; sort/filter in `BoardPage`, not in the service

**Supabase singleton proxy:**
- Purpose: Lazy client so `SetupPage` can render when env is missing
- Examples: `getSupabase()`, exported `supabase` Proxy in `src/lib/supabase/client.ts`
- Pattern: module singleton; do not create extra clients

**Route guards:**
- Purpose: Split guest vs authenticated trees
- Examples: `GuestRoute`, `ProtectedRoute` in `src/components/auth/ProtectedRoute.tsx`
- Pattern: `Outlet` + `Navigate`; never put data fetching in the guard

**Native drag state:**
- Purpose: Reorder cards/lists without a DnD library
- Examples: `DragState` in `src/types/kanban.ts`; orchestration in `src/pages/BoardPage.tsx`
- Pattern: lift drag to the page; lists/cards only emit events

## Entry Points

**Vite / React mount:**
- Location: `index.html`, `src/main.tsx`
- Triggers: Dev server or static host (Vercel / Netlify SPA fallback)
- Responsibilities: CSS, `QueryClientProvider`, render `App`

**Application root:**
- Location: `src/App.tsx`
- Triggers: After React mount
- Responsibilities: Env gate → `SetupPage` or router + `AuthProvider` + routes + toasts

**Route table:**
- Location: `src/routes/index.tsx`
- Triggers: URL change
- Live routes only: `/`, `/cadastro`, `/projetos`, `/projetos/:projectId` (`/login` and `/painel` redirect)
- Responsibilities: Compose `GuestRoute` / `ProtectedRoute` / `AppShell`. Add new screens here — unused pages under `src/pages/` are not entry points

**Auth session:**
- Location: `src/providers/AuthProvider.tsx`
- Triggers: `getSession` + `onAuthStateChange`
- Responsibilities: Session, profile fetch, `signOut`. Keep the auth callback synchronous

**SQL / Storage:**
- Location: `supabase/migrations/20260821120000_kanban_boards.sql`, `supabase/migrations/20260822190000_card_notes.sql`
- Triggers: Manual run in the Supabase SQL editor (not wired to a CLI pipeline in-repo)
- Responsibilities: Tables, RLS, profile trigger, `card-notes` bucket

## Error Handling

**Strategy:** Services throw `Error` with a user-safe message. Hooks catch via mutation `onError` and push a toast. Auth pages catch in `onSubmit` and set `serverError` inline.

**Patterns:**
- Map PostgREST / Auth errors in `src/lib/security/index.ts` (`mapDbError`, `mapAuthError`) — never surface raw Postgres text
- `throwDb` in `src/services/kanban.service.ts` special-cases missing tables (`42P01`) and missing note columns (`42703`) with “run the SQL” messages
- Query errors on `ProjectsPage` / `BoardPage` render inline empty/error panels; do not crash the tree
- `fetchProfile` returns `null` on error (fail closed: no profile → not authenticated)
- Client rate limit in `checkRateLimit` (`sessionStorage` + memory) is UX only; Supabase Auth still enforces server limits

## Cross-Cutting Concerns

**Logging:**
- No logging framework. User feedback is `toast()` from `src/stores/toast.store.ts`
- Do not `console.log` secrets, tokens, or raw Supabase errors in new code

**Validation:**
- Zod at form boundaries (`src/schemas/kanban.schema.ts`, `src/schemas/auth.schema.ts`)
- `sanitizeText` / `sanitizeEmail` again in services before write
- Check constraints + RLS in SQL (`supabase/migrations/`)
- `safeRedirectPath` blocks open redirects after login

**Authentication:**
- Supabase Auth (email/password, PKCE) via `src/services/auth.service.ts`
- App access requires an active row in `public.profiles` (`AuthProvider.isAuthenticated`)
- New users get a profile from trigger `handle_new_user` (default role `atendente`)
- Kanban RLS is currently “any authenticated user can CRUD all boards” — treat every signed-in user as a full collaborator
- `src/lib/permissions.ts` is bakery-role leftovers (`canManageOrders`, etc.) and is unused by live Kanban routes — do not use it for board ACL unless product design changes

**Styling:**
- Tailwind v4 via `@tailwindcss/vite` and tokens in `src/index.css`
- UI primitives in `src/components/ui/` (`Button`, `Modal`, `Input`, `ConfirmDialog`, `PageHeader`)
- Board chrome uses CSS variables (`--board-color`) set on `BoardPage`

**Constraints for new work:**
- Import with `@/` (`vite.config.ts` + `tsconfig.json` paths)
- Keep `onAuthStateChange` synchronous
- Assignees are hardcoded in `src/config/kanban.ts` (`artur`, `fabricio`), not `profiles.id`
- Do not route leftover bakery pages unless the product scope expands
- Do not add a Node API layer; persist through Supabase

---

*Architecture analysis: 2026-10-01*
*Update when major patterns change*
