# Codebase Concerns

**Analysis Date:** 2026-10-01
**last_mapped_commit:** ff4d7688f16342c02a651f25adf2b7067499fadc

## Tech Debt

**Leftover bakery ERP surface still in the repo:**
- Issue: The live app only routes login, register, projects, and boards (`src/routes/index.tsx`), but a full confeitaria ERP remains in source: 14 unused pages plus supporting hooks, services, schemas, and UI.
- Files: `src/pages/DashboardPage.tsx`, `src/pages/OrdersPage.tsx`, `src/pages/ProductsPage.tsx`, `src/pages/ClientsPage.tsx`, `src/pages/CouponsPage.tsx`, `src/pages/StockPage.tsx`, `src/pages/RecipesPage.tsx`, `src/pages/ProductionPage.tsx`, `src/pages/DeliveriesPage.tsx`, `src/pages/FinancePage.tsx`, `src/pages/ReportsPage.tsx`, `src/pages/ShoppingPage.tsx`, `src/pages/EmployeesPage.tsx`, `src/pages/SettingsPage.tsx`, `src/pages/TasksPage.tsx`, `src/pages/BlankPage.tsx`, `src/hooks/queries.ts`, `src/services/modules.service.ts` (~919 lines), `src/schemas/modules.schema.ts`, `src/lib/permissions.ts`, `src/lib/labels.tsx`, `src/components/dashboard/SalesChart.tsx`, `src/components/layout/GlobalSearch.tsx`, `src/components/layout/NotificationsMenu.tsx`
- Why: The Kanban was forked from a bakery ERP; routes were swapped to `/projetos` without deleting the old domain.
- Impact: `tsc --noEmit` and ESLint still compile bakery types and RPCs. New work can import the wrong Kanban (`src/pages/TasksPage.tsx` / `tasks` table vs `src/pages/BoardPage.tsx` / `cards`). `src/types/database.types.ts` documents bakery tables, not Kanban tables. `src/pages/SettingsPage.tsx` claims soft-deletes and order RPCs that the Kanban does not use.
- Fix approach: Delete unused ERP pages and their exclusive dependencies. Keep only Kanban + auth. Move leftover bakery types out of `src/types/database.types.ts` or replace that file with generated Supabase types that include `projects`, `board_lists`, and `cards`.

**Schema and migrations are outside git:**
- Issue: `.gitignore` ignores `/supabase/`, so the source of truth for RLS, triggers, and Storage policies is a local folder that is not versioned with the app.
- Files: `.gitignore` (line 14), `supabase/migrations/20260821120000_kanban_boards.sql`, `supabase/migrations/20260821130000_card_assignees_text.sql`, `supabase/migrations/20260821140000_seed_requisitos.sql`, `supabase/migrations/20260822190000_card_notes.sql`
- Why: Comment in `.gitignore` treats the folder as CLI scratch while asking people to run SQL by hand.
- Impact: A clone of the repo cannot recreate the database. `src/services/kanban.service.ts` and `src/pages/SetupPage.tsx` tell operators to run `supabase/migrations/`, but those files never ship with git. Environments drift; note columns (`note`, `note_image_path`) can be missing and only fail at runtime.
- Fix approach: Stop ignoring `supabase/migrations/*.sql`. Commit the four migration files. Add `supabase/config.toml` if the CLI is used. Keep `.env` ignored.

**Kanban client is untyped against the database:**
- Issue: `src/lib/supabase/client.ts` uses `SupabaseClient<any>`. `src/types/database.types.ts` has no `projects`, `board_lists`, or `cards` tables. Queries in `src/services/kanban.service.ts` cast results (`data as Project[]`, `data as Card[]`).
- Why: Comment in `src/lib/supabase/client.ts` says generated Insert/Update types became `never`.
- Impact: Renames and missing columns (notes migration not applied) compile cleanly and fail in production. `seedRequirementCards` and board filters cannot be type-checked against RLS or constraints.
- Fix approach: Generate types from the live schema (`supabase gen types`) into `src/types/database.types.ts`, then type the client. Keep a narrow escape hatch only if a specific Insert type is still broken.

**Assignees are a hardcoded two-person list, not profiles:**
- Issue: Cards store `assigned_to` as free text (`artur` / `fabricio`). The UI cannot assign a logged-in `profiles` row.
- Files: `src/config/kanban.ts`, `src/schemas/kanban.schema.ts`, `src/types/kanban.ts` (`withAssignee`), `src/services/kanban.service.ts` (`seedRequirementCards` sets `assigned_to: 'artur'`), `supabase/migrations/20260821130000_card_assignees_text.sql`
- Why: Seed for the requisitos board needed names before profile UUIDs existed.
- Impact: Adding a teammate requires a code change. Filter and card modal ignore real users. `listEmployees` in `src/services/modules.service.ts` is unused by the live board.
- Fix approach: Point `assigned_to` at `profiles.id` (uuid) or keep a small `board_members` table. Drive the dropdown from `profiles`, not `BOARD_ASSIGNEES`.

**Auth roles still describe a bakery staff model:**
- Issue: New users get `role = 'atendente'` via `handle_new_user()` in `supabase/migrations/20260821120000_kanban_boards.sql`. `src/lib/permissions.ts` and `src/schemas/auth.schema.ts` still list `confeiteiro` / `entregador`. Kanban RLS does not use role at all.
- Why: Profiles table was reused from the ERP.
- Impact: UI can show a bakery role that does not gate boards. Future “admin-only delete” checks against `isAdmin()` would be meaningless unless RLS matches.
- Fix approach: Replace bakery roles with Kanban roles (`membro` / `admin`) or drop role from the product until membership exists.

**Manual SQL apply instead of a migration runner:**
- Issue: Every migration file starts with “Cole no SQL Editor do Supabase”. There is no `supabase db push`, no CI apply, and no `.env.example` even though `src/pages/SetupPage.tsx` tells developers to copy one.
- Files: `src/pages/SetupPage.tsx`, `src/config/env.ts`, `supabase/migrations/*.sql`
- Why: Small-team bootstrap without the Supabase CLI in CI.
- Impact: Partial applies (boards without notes, notes without Storage policies) are a common failure mode. `saveCardNote` in `src/services/kanban.service.ts` has a special-case error for missing `note` columns.
- Fix approach: Add `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders. Document a single apply order. Prefer CLI-linked migrations.

## Known Bugs

**Drag-and-drop order is overwritten by label and REQ sort:**
- Symptoms: After dropping a card, it snaps back next to same-priority / same-REQ siblings instead of staying where it was dropped. `position` is written to the database but the board ignores it unless labels and REQ numbers tie.
- Trigger: Drag any card above/below another card that has a different first label or a different `REQ-NN` title on `src/pages/BoardPage.tsx`.
- Files: `src/pages/BoardPage.tsx` (`cardsOf`, `applyCardMove`), `src/hooks/kanban.ts` (`useMoveCards`), `src/services/kanban.service.ts` (`persistCardMoves`)
- Workaround: Change the card’s label if the goal is to move it among priority groups. List-to-list moves still work; intra-list order among mixed priorities does not.
- Root cause: `cardsOf` sorts by `LABEL_RANK` then `REQ-(\d+)` then `position`. Persist updates `position`, then the same sorter discards that order.
- Fix: Sort visible cards by `position` (and `created_at` as tie-break). Keep priority grouping as an optional filter, not the default comparator.

**HTML5 drag does not work on touch:**
- Symptoms: Phones and tablets cannot move cards or lists. There are no drag handles; the whole card is `draggable`.
- Trigger: Open `/projetos/:projectId` on a touch device and try to drag.
- Files: `src/components/kanban/KanbanCard.tsx`, `src/components/kanban/KanbanList.tsx`, `src/pages/BoardPage.tsx`
- Workaround: Use a desktop browser, or edit the card and change list by recreating it.
- Root cause: Native HTML5 DnD is desktop-oriented; no Pointer Events / touch fallback.
- Fix: Use a pointer-based library or implement touch fallbacks; add a visible handle so buttons and click-to-open do not fight the drag.

**Concurrent card/list creates can share `position`:**
- Symptoms: Two cards (or lists) created at the same time land on the same `position`. After refresh they can swap or interleave unpredictably.
- Trigger: Two users (or a double-submit) create cards in the same list before either insert finishes.
- Files: `src/services/kanban.service.ts` (`nextPosition`, `createCard`, `createList`, `createProject`)
- Workaround: Reload and drag to force a rewrite of positions.
- Root cause: `nextPosition` is `select max(position) + 1` with no unique constraint on `(list_id, position)` / `(project_id, position)` in `supabase/migrations/20260821120000_kanban_boards.sql`.
- Fix: Unique index plus a Postgres function that assigns position in one statement, or use fractional ranking.

**`persistCardMoves` is not transactional:**
- Symptoms: A failed mid-batch update leaves some cards on the new list and others on the old list. Optimistic UI rolls back only if the mutation throws after all requests; a partial success can persist.
- Trigger: Drag a card while another client updates the same rows, or hit a transient RLS/network error on one of the `Promise.all` updates.
- Files: `src/services/kanban.service.ts` (`persistCardMoves`, `reorderLists`), `src/hooks/kanban.ts` (`useMoveCards`, `useReorderLists`)
- Workaround: Reload the board; drag again.
- Root cause: Each row is an independent `update`. There is no RPC wrapping the batch.
- Fix: Add `reorder_cards(updates jsonb)` and `reorder_lists(updates jsonb)` RPCs that run in one transaction.

**Project create is two steps; list insert can fail after the project exists:**
- Symptoms: A new project appears on `/projetos` with zero lists if `board_lists` insert fails.
- Trigger: RLS/network error after `projects` insert in `createProject`.
- Files: `src/services/kanban.service.ts` (`createProject`)
- Workaround: Open the empty board and add lists manually, or delete the project.
- Root cause: Client-side sequence instead of a single RPC.
- Fix: `create_project_with_lists` RPC that inserts the project and default lists together.

**Note image can be deleted or orphaned when the card row update fails:**
- Symptoms: After a failed save, the card still points at a path that was already removed, or Storage keeps a JPEG that no card references. Deleting a list or project cascades cards in Postgres but leaves files in `card-notes`.
- Trigger: `saveCardNote` uploads/removes Storage first, then updates `cards`. `deleteList` / `deleteProject` only delete SQL rows.
- Files: `src/services/kanban.service.ts` (`saveCardNote`, `deleteCardNote`, `deleteCard`, `deleteList`, `deleteProject`), `supabase/migrations/20260822190000_card_notes.sql`
- Workaround: Re-upload the image; unused files remain until a Storage cleanup.
- Root cause: No compensating transaction across Storage + Postgres. List/project delete does not enumerate `note_image_path`.
- Fix: Update the row first when removing an image; on upload failure delete the new object. Before deleting a list/project, select `note_image_path` and `storage.remove` those paths (or a Storage trigger).

**`fetchProfile` treats query errors as “no profile”:**
- Symptoms: A temporary `profiles` outage or RLS mistake shows `AccountWithoutProfile` (`src/components/auth/ProtectedRoute.tsx`) instead of a retryable error. The user is signed in but locked out of the app.
- Trigger: Any error from `profiles` select in `src/services/auth.service.ts` (`return null`).
- Files: `src/services/auth.service.ts`, `src/providers/AuthProvider.tsx`, `src/components/auth/ProtectedRoute.tsx`
- Workaround: Sign out and sign in again after the database recovers.
- Root cause: Error and “no active row” share the same `null`.
- Fix: Distinguish `{ error }` from `data === null`. Surface `mapDbError` and retry.

## Security Considerations

**Open signup plus shared-board RLS (`using (true)`):**
- Risk: Anyone who completes `/cadastro` gets an active `profiles` row (`handle_new_user` sets `is_active = true`, role `atendente`) and then full CRUD on every project, list, and card. There is no membership, invite, or per-board ACL.
- Files: `src/pages/auth/RegisterPage.tsx`, `src/routes/index.tsx`, `src/services/auth.service.ts`, `supabase/migrations/20260821120000_kanban_boards.sql` (policies `projects_*`, `board_lists_*`, `cards_*`)
- Current mitigation: Password complexity in `src/schemas/auth.schema.ts`. Client rate limit in `src/lib/security/index.ts` (sessionStorage; trivially bypassed). Auth errors are mapped so Supabase internals are not shown.
- Recommendations: Disable public signup or require invite/approval (`is_active` default false). Replace `using (true)` with project membership (`project_members`) or a fixed allow-list of emails. Until then, treat the app as a single trusted team only.

**`card-notes` Storage policies are bucket-wide:**
- Risk: Any authenticated user can list, upload, overwrite, and delete every object in `card-notes`, and can mint a 1-hour signed URL for any path via `getNoteImageUrl`. Combined with open signup this exposes all note photos.
- Files: `supabase/migrations/20260822190000_card_notes.sql`, `src/services/kanban.service.ts` (`NOTE_BUCKET`, `getNoteImageUrl`)
- Current mitigation: Bucket is not public. `file_size_limit` 512000 and MIME allow-list `image/jpeg|png|webp`. Client compresses to JPEG ≤ 350KB in `src/lib/compress-image.ts`.
- Recommendations: Scope policies to `storage.foldername(name)[1]` matching a card the user may access. Prefer path `{projectId}/{cardId}/{uuid}.jpg`. Do not grant `update`/`delete` on the whole bucket.

**All profiles (email, name, role) are readable by every signed-in user:**
- Risk: `profiles_select` is `using (true)`. Email harvesting if signup is open.
- Files: `supabase/migrations/20260821120000_kanban_boards.sql`, `src/services/auth.service.ts`, `src/services/modules.service.ts` (`listEmployees`)
- Current mitigation: Role/email/`is_active` cannot be changed by the user (`protect_profile_fields` trigger). There is no live Employees UI in `src/routes/index.tsx`.
- Recommendations: Restrict select to `auth.uid() = id` plus a membership join. Do not re-enable `EmployeesPage` without an admin RPC check on the server (the old page only hid the form with `isAdmin()`).

**Client-only rate limit and mapped errors are not a server control:**
- Risk: `checkRateLimit` in `src/lib/security/index.ts` lives in `sessionStorage` under `template.auth.rate`. Attackers call Supabase Auth directly with the anon key from the Vite bundle.
- Files: `src/lib/security/index.ts`, `src/services/auth.service.ts`, `src/config/env.ts`
- Current mitigation: Honest UX throttle. Supabase project-level Auth rate limits (must be configured in the dashboard — not in this repo).
- Recommendations: Confirm Supabase Auth rate limits and leaky-bucket settings in the project. Do not treat the client helper as security.

**Vercel deploy is missing the Netlify CSP/security headers:**
- Risk: `netlify.toml` sets CSP, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`. `vercel.json` only rewrites SPA routes. `vite.config.ts` sets some headers for `vite dev`, not production on Vercel.
- Files: `vercel.json`, `netlify.toml`, `vite.config.ts`, `public/_redirects`
- Current mitigation: If the site is on Netlify, headers apply. Dual config invites deploying the weaker one.
- Recommendations: Copy the Netlify header set into `vercel.json` `headers`. Pick one host. Keep CSP `connect-src` limited to `https://*.supabase.co` and `wss://*.supabase.co`.

**Service role must never enter the frontend:**
- Risk: Vite inlines `VITE_*` at build time. A service_role key in `.env` as `VITE_SUPABASE_ANON_KEY` would ship to the browser and bypass RLS.
- Files: `src/config/env.ts`, `src/pages/SetupPage.tsx`, `src/lib/supabase/client.ts`
- Current mitigation: Setup copy warns against service_role. `.env` is gitignored. `isEnvConfigured()` rejects placeholder URL/key and non-HTTPS.
- Recommendations: Keep using the anon key only. Add `.env.example` with fake values. Never name a service key `VITE_*`.

## Performance Bottlenecks

**Full board fetch on every invalidation:**
- Problem: `getBoard` loads the project, all lists, then every card in those lists (`select *`). Every create/rename/move/note save invalidates `['board', projectId]`.
- Files: `src/services/kanban.service.ts` (`getBoard`), `src/hooks/kanban.ts`, `src/main.tsx` (`staleTime: 60_000`)
- Measurement: Not measured in production. Cost grows with card count × description size (requisito cards hold multi-paragraph text in `src/data/requirements.ts`).
- Cause: No pagination, no column subset, no realtime patch.
- Improvement path: Select card columns needed for the tile; load description/note in the modal. After moves, keep the optimistic cache and skip a full refetch when the mutation succeeds.

**Signed URL per open card note:**
- Problem: Opening a card with an image calls `createSignedUrl` (1 hour) in `getNoteImageUrl`. Closing and reopening repeats the request.
- Files: `src/components/kanban/CardNote.tsx`, `src/services/kanban.service.ts`
- Measurement: Not measured. Extra Storage API round-trip per open.
- Cause: URL is not cached on the card/query client.
- Improvement path: Cache signed URLs on `['note-image', path]` with `staleTime` under 1 hour.

**Dead ERP modules are compiled but not routed:**
- Problem: `npm run build` typechecks bakery pages and `src/services/modules.service.ts` (dashboard aggregations over `orders` / `expenses` in JS).
- Files: `src/services/modules.service.ts` (`getFinanceSummary` loops orders in the client), `src/hooks/queries.ts`, `package.json` (`build`: `tsc --noEmit && vite build`)
- Measurement: Not measured. Rollup should tree-shake unused pages from the JS bundle because `src/routes/index.tsx` does not import them; TypeScript still parses them every build.
- Cause: Leftover domain still in `src/`.
- Improvement path: Delete the unused tree (see Tech Debt).

## Fragile Areas

**Board drag state machine:**
- Why fragile: `drag`, `dropListId`, `dropCardId`, and `ignoreClick` in `src/pages/BoardPage.tsx` must stay in sync with HTML5 events on both the list (`KanbanList`) and the card (`KanbanCard`). Drop-on-list uses `cardsOf(list.id).length` (unfiltered), drop-on-card uses the unfiltered index, while the UI renders `visibleCardsOf` (filters).
- Common failures: Dropping onto a filtered list writes an index that does not match what the user saw. Click-after-drag can still open the modal if `ignoreClick` loses the race. Nested `onDragOver` stopPropagation can leave `dropListId` and `dropCardId` inconsistent.
- Safe modification: Add a single helper that maps “visible index + filters” to “absolute index in `cardsOf`”. Cover `applyCardMove` with unit tests before changing sort or filters.
- Test coverage: None. No `*.test.*` / `*.spec.*` in the repo.

**Auth session vs profile loading:**
- Why fragile: `onAuthStateChange` must stay synchronous (comment in `src/providers/AuthProvider.tsx` — awaiting DB inside the callback deadlocks supabase-js). Profile is loaded in a second effect. `GuestRoute` redirects on session alone; `ProtectedRoute` requires profile.
- Common failures: Putting `fetchProfile` back inside the auth callback (infinite login spinner). Treating a failed profile fetch as unauthenticated.
- Safe modification: Keep the split. Add an explicit `profileError` state rather than overloading `profile === null`.
- Test coverage: None for login, register, or the no-profile screen.

**Card description section parser:**
- Why fragile: `parseCardSections` in `src/components/kanban/CardModal.tsx` splits on `/Como funciona|Importância|Observações/`. Saving in edit mode rejoins sections with `\n\n`. User-written descriptions that contain those words will be re-sliced on the next open.
- Common failures: Headings vanish or body text is split incorrectly after edit.
- Safe modification: Store structured sections or only run the parser when the text matches the seed format from `src/data/requirements.ts`.
- Test coverage: None.

**Manual SQL migrations:**
- Why fragile: Files are written to be re-run (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`) but `20260821140000_seed_requisitos.sql` inserts cards every time it is executed (no uniqueness on title). Notes migration drops and recreates Storage policies.
- Common failures: Duplicate requisito cards; briefly open Storage if someone applies an incomplete snippet; local SQL not matching what production ran.
- Safe modification: Never re-run the seed without a “already seeded” guard. Version migrations in git (see Tech Debt).
- Test coverage: Not applicable (no SQL tests).

## Scaling Limits

**Shared-everything RLS and client fan-out:**
- Current capacity: Designed for a handful of authenticated teammates and one requisitos board (~36 cards in `src/data/requirements.ts` / seed SQL).
- Limit: Every signed-in user reads and writes the entire `projects` / `cards` dataset. `getBoard` downloads all cards for a project in one payload.
- Symptoms at limit: Slow board open; conflicting `position` updates; Storage listing the whole `card-notes` bucket.
- Scaling path: Membership-scoped RLS, per-project queries, transactional reorder RPCs, Storage paths scoped by project.

**Supabase Free / Pro quotas (project-side, not encoded in repo):**
- Current capacity: Not measured in this codebase. Card notes use a private bucket with 512KB object cap (`supabase/migrations/20260822190000_card_notes.sql`) and client compression to 350KB (`src/lib/compress-image.ts`).
- Limit: Database size, Storage, and Auth MAU on the chosen Supabase plan. Signed URL generation per card open adds Storage API usage.
- Symptoms at limit: Uploads fail, signed URLs 429, or `saveCardNote` throws mapped DB errors.
- Scaling path: Upgrade the Supabase plan; cache signed URLs; purge orphan objects after list/project delete.

**SPA hosts (Vercel / Netlify):**
- Current capacity: Static Vite build (`package.json` `build`, `vercel.json`, `netlify.toml`). No server functions in-repo.
- Limit: Host bandwidth and build minutes. No SSR timeout issue.
- Symptoms at limit: Failed deploys or asset 404s if SPA rewrite is missing (rewrites exist on both hosts).
- Scaling path: Keep the app static; put API work in Supabase RPCs, not new serverless routes, unless membership/webhooks require them.

## Dependencies at Risk

**`src/lib/supabase/client.ts` untyped `any` database:**
- Risk: `@supabase/supabase-js` ^2.49.8 is current, but the app opts out of generated types. Schema drift will not fail `npm run typecheck`.
- Impact: Runtime errors on missing `note` columns or renamed tables; false confidence from CI-less `tsc`.
- Migration plan: Generate `Database` types and restore the generic on `createClient`.

**No test runner in `package.json`:**
- Risk: There is no Vitest/Jest/Playwright dependency. Refactors of `BoardPage` or RLS have no automated safety net.
- Impact: Regressions in drag, auth redirect, and note upload ship unnoticed.
- Migration plan: Add Vitest for `applyCardMove` / `sanitize` / `isSafeInternalPath`, plus one Playwright flow for login → board → note.

**Dual hosting config can diverge:**
- Risk: `vercel.json` and `netlify.toml` both exist. Security headers live only in Netlify.
- Impact: Production may lack CSP if the team deploys to Vercel.
- Migration plan: Single deploy target; duplicate headers on the one you keep.

**Bakery-era packages are not the problem — unused modules are:**
- Risk: `src/services/modules.service.ts` still imports RPCs (`admin_update_profile`, order/production flows) that the live UI never calls. If those RPCs were dropped in Supabase, the file still typechecks because of `any` client.
- Impact: Someone re-hooks `EmployeesPage` or `OrdersPage` and hits missing RPCs or leftover bakery tables.
- Migration plan: Delete the service with the pages.

## Missing Critical Features

**Board membership, invites, and role-aware RLS:**
- Problem: No way to share a board with a subset of users or to revoke access without disabling the whole Auth user.
- Current workaround: Share the signup link and trust everyone who registers (`src/pages/auth/RegisterPage.tsx`).
- Blocks: Safe use outside a two-person trusted team; client/contractor access; audit of who deleted a board.
- Implementation complexity: Medium (membership table + RLS rewrite + invite UX).

**Realtime (or at least refetch-on-focus) collaboration:**
- Problem: `src/main.tsx` sets `refetchOnWindowFocus: false` and `staleTime: 60_000`. There is no `supabase.channel` subscription. A second user can overwrite moves without seeing the latest board.
- Current workaround: Hard refresh.
- Blocks: Two people grooming the requisitos board at once.
- Implementation complexity: Medium (postgres_changes on `cards` / `board_lists` + conflict handling).

**Mobile-usable board:**
- Problem: No touch drag, list width is fixed at 272px, filters wrap in the header (`src/pages/BoardPage.tsx`).
- Current workaround: Desktop only.
- Blocks: Updating cards from a phone on the shop floor / clinic.
- Implementation complexity: Medium (touch DnD + header layout).

**`.env.example` and committed migrations:**
- Problem: New clones cannot configure or migrate from the repo alone (`src/pages/SetupPage.tsx` documents files that are missing from git).
- Current workaround: Copy env and SQL from another machine.
- Blocks: Reproducible deploys and onboarding.
- Implementation complexity: Low.

**Error boundary and profile-error state:**
- Problem: `src/main.tsx` has no React error boundary. A throw in `BoardPage` whitescreens the shell.
- Current workaround: Refresh.
- Blocks: Recoverable UI after a bad card payload or Storage error.
- Implementation complexity: Low.

## Test Coverage Gaps

**Entire Kanban domain:**
- What's not tested: `applyCardMove` / `applyListMove`, optimistic cache in `src/hooks/kanban.ts`, `nextPosition`, note upload/delete, `compressNoteImage`, Zod schemas in `src/schemas/kanban.schema.ts`.
- Risk: The known drag-sort bug can return after a “fix”; note orphaning goes unseen.
- Priority: High
- Difficulty to test: Pure move helpers can be extracted and unit-tested without Supabase. Storage tests need mocks.

**Auth and redirect safety:**
- What's not tested: `safeRedirectPath` / `isSafeInternalPath` in `src/lib/security/index.ts`, `GuestRoute` vs `ProtectedRoute`, register duplicate-email probe in `src/services/auth.service.ts`.
- Risk: Open-redirect regressions or login spinner deadlocks if the auth callback is changed.
- Priority: High
- Difficulty to test: Path helpers are unit-testable. Auth flows need a mocked Supabase client.

**RLS and Storage policies:**
- What's not tested: `using (true)` policies and `card-notes` bucket rules in `supabase/migrations/`.
- Risk: Tightening RLS later can lock the UI; loosening it further would not be caught.
- Priority: High
- Difficulty to test: Needs Supabase local or a staging project with two users.

**Leftover ERP (if not deleted):**
- What's not tested: All of `src/services/modules.service.ts` and bakery pages.
- Risk: Low for production (unrouted) unless someone mounts the pages again.
- Priority: Low (delete instead of testing)
- Difficulty to test: High (many RPCs and tables that may not exist on the Kanban project).

**CI:**
- What's not tested: No `.github/workflows` (or other CI) runs `lint`, `typecheck`, or `build` on pull requests.
- Risk: Broken TypeScript or ESLint can land on the default branch.
- Priority: Medium
- Difficulty to test: Low to add a workflow that runs `npm ci && npm run build`.

---

*Concerns audit: 2026-10-01*
*Update as issues are fixed or new ones discovered*
