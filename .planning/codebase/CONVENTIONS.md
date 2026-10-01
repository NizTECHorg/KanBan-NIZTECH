# Coding Conventions

**Analysis Date:** 2026-10-01
**last_mapped_commit:** ff4d7688f16342c02a651f25adf2b7067499fadc

## Naming Patterns

**Files:**
- PascalCase for React components and pages: `Button.tsx`, `CardModal.tsx`, `BoardPage.tsx`, `LoginPage.tsx`
- Page files always end with `Page` (`src/pages/ProjectsPage.tsx`, `src/pages/auth/RegisterPage.tsx`)
- kebab-case for non-component modules: `kanban.service.ts`, `auth.schema.ts`, `toast.store.ts`, `compress-image.ts`, `database.types.ts`
- Suffixes: `*.service.ts` (data access), `*.schema.ts` (Zod), `*.store.ts` (Zustand), `*.types.ts` (domain/DB types)
- Hook files: `useAuth.ts` when a single hook; domain collections without the `use` prefix (`src/hooks/kanban.ts`, `src/hooks/queries.ts`)
- No `*.test.ts` / `*.spec.ts` files exist — when adding tests, colocate as `name.test.ts` next to the source

**Functions:**
- camelCase for all functions (`listProjects`, `sanitizeText`, `mapDbError`)
- No `async` prefix on names
- Local UI handlers: `handleCreate`, `handleSaveCard`, `handlePick` in pages/components; form submit handlers may be `onSubmit` (`src/pages/auth/LoginPage.tsx`, `src/pages/ProductsPage.tsx`)
- Component callback props: `onClose`, `onSave`, `onSubmit`, `onConfirm`, `onChanged` (`src/components/ui/ConfirmDialog.tsx`, `src/components/kanban/ProjectModal.tsx`)
- Permission helpers: `canManage*` / `isAdmin` (`src/lib/permissions.ts`)
- Service CRUD verbs: `list*`, `get*`, `create*`, `update*`, `delete*`, `upsert*`, `persist*`

**Variables:**
- camelCase for locals (`projectId`, `queryClient`, `serverError`)
- UPPER_SNAKE_CASE for module constants (`NOTE_BUCKET`, `DEFAULT_BOARD_COLOR`, `MAX_EDGE`, `AUTH_PATHS`)
- No underscore prefix for private members — unexported functions stay file-private (`throwDb` in `src/services/kanban.service.ts`)
- Boolean locals/props: `isLoading`, `isAuthenticated`, `isConfigured`, `isSaving`, `hasNote`
- DB columns stay snake_case on types and most form fields (`due_date`, `assigned_to`, `category_id` in `src/types/kanban.ts`, `src/schemas/modules.schema.ts`)
- Auth form fields are camelCase (`fullName` in `src/schemas/auth.schema.ts`) — map to `full_name` only at the Supabase boundary

**Types:**
- PascalCase interfaces, no `I` prefix (`Project`, `Card`, `ButtonProps`, `AuthContextValue`)
- PascalCase type aliases for unions, intersections, and Zod inference (`CardWithAssignee`, `DragState`, `LoginFormData`)
- Form types: `z.infer<typeof *Schema>` exported as `*FormData` (`src/schemas/kanban.schema.ts`, `src/schemas/auth.schema.ts`)
- No TypeScript `enum` — use `as const` arrays and derived unions (`employeeRoles` in `src/schemas/auth.schema.ts`, `CARD_LABELS` in `src/config/kanban.ts`)
- Props interfaces named `*Props` and kept file-private unless shared (`CardModalProps` in `src/components/kanban/CardModal.tsx`)

## Code Style

**Formatting:**
- No Prettier / Biome / EditorConfig — match neighboring files by hand
- Single quotes for JS/TS strings; double quotes for JSX attributes
- Semicolons omitted
- 2-space indentation, trailing commas in multi-line lists
- Numeric separators for large literals (`60_000`, `350_000` in `src/main.tsx`, `src/lib/compress-image.ts`)
- No hard line-length tool; keep lines readable, wrap long Tailwind class strings
- User-facing copy is Portuguese (errors, toasts, labels, routes like `/projetos`, `/cadastro`)

**Linting:**
- ESLint 9 flat config in `eslint.config.js`
- Extends `@eslint/js` recommended + `typescript-eslint` recommended
- Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` (`react-refresh/only-export-components` is warn)
- TypeScript `strict` plus `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` (`tsconfig.json`)
- Run: `npm run lint` and `npm run typecheck`
- Only documented disable: `// eslint-disable-next-line @typescript-eslint/no-explicit-any` in `src/lib/supabase/client.ts`

## Import Organization

**Order:**
1. React and external packages (`react`, `react-router-dom`, `@tanstack/react-query`, `zod`, `lucide-react`)
2. Internal `@/` modules (components, hooks, services, schemas, lib, stores, config, types)
3. Relative imports — rare; prefer `@/`
4. Inline `type` on the same line when the module also exports values (`import { loginSchema, type LoginFormData } from '@/schemas/auth.schema'`)

**Grouping:**
- Blank line between external and `@/` groups
- `import type { X }` when the import is types-only (required by `verbatimModuleSyntax`)
- Not strictly alphabetical — group by layer (components → hooks → schemas → services)

**Path Aliases:**
- `@/` maps to `src/` (`tsconfig.json` paths + `vite.config.ts` resolve.alias)
- Import from `@/routes` and `@/lib/security` (those folders expose `index.tsx` / `index.ts`)
- Import other modules by file path, not barrels (`@/hooks/kanban`, `@/services/kanban.service`)

## Error Handling

**Patterns:**
- Services throw `new Error(portugueseMessage)` — never leak raw Supabase text
- Map DB/auth errors through `mapDbError` / `mapAuthError` in `src/lib/security/index.ts`
- Shared helper `throwDb` in `src/services/kanban.service.ts` and `src/services/modules.service.ts`
- Special-case missing schema (`42P01`, column `42703`) with setup messages that point at `supabase/migrations`
- No custom `*Error` classes
- Catch at UI boundaries: `try/catch` on auth forms (`src/pages/auth/LoginPage.tsx`); React Query `onError` for mutations
- Mutation errors go to toast: `toast(error instanceof Error ? error.message : 'Erro inesperado', 'error')` in `src/hooks/kanban.ts` and `src/hooks/queries.ts`
- Fire-and-forget promises: prefix with `void` (`void handleSave()`, `void signOut()`)
- Optimistic mutations roll back `previous` query data, then call `onError` (`useMoveCards`, `useReorderLists`, `useMoveTask`)

**Error Types:**
- Throw on invalid input after Zod parse (`loginSchema.parse` in `src/services/auth.service.ts`)
- Throw on invariant violations (`useAuth` outside provider; missing board; unconfigured Supabase)
- Return `null` only for expected empty lookups (`fetchProfile` in `src/services/auth.service.ts`, `getNoteImageUrl` when path is empty)
- Query pages render `error instanceof Error ? error.message : fallback` (`src/pages/ProjectsPage.tsx`)

## Logging

**Framework:**
- Not detected — no logger package; no `console.log` / `console.error` in `src/`

**Patterns:**
- Do not add `console.*` in committed app code
- Surface failures via Portuguese `Error` messages, toasts (`src/stores/toast.store.ts`), or inline `role="alert"` blocks
- Keep auth-state side effects silent except user-visible toasts

## Comments

**When to Comment:**
- Explain why, in Portuguese, when the reason is non-obvious
- Required-style comments exist for auth lock deadlock (`src/providers/AuthProvider.tsx`) and GuestRoute session-without-profile (`src/components/auth/ProtectedRoute.tsx`)
- Short why-comments on optimistic updates in `src/hooks/queries.ts`
- Do not narrate obvious assignments

**JSDoc/TSDoc:**
- Used on public security helpers in `src/lib/security/index.ts` and the Supabase client note in `src/lib/supabase/client.ts`
- Not required on every function — add JSDoc when documenting a security or inference constraint
- No `@param` / `@returns` tags in current code

**TODO Comments:**
- Not used — no `TODO` / `FIXME` / `HACK` in `src/`
- If needed: `// TODO: description` (no username); prefer a phase task over leftover TODOs

## Function Design

**Size:**
- Keep new functions focused; extract helpers (`throwDb`, `nextPosition`, `parseCardSections`, `onError`)
- Avoid growing `src/services/modules.service.ts` further as a dump — add a new `*.service.ts` when introducing a distinct domain
- Pages compose hooks + local handlers; keep data access out of JSX

**Parameters:**
- 1–3 positional args for simple service calls (`updateCard(id, form)`, `createList(projectId, title)`)
- Options object when the payload has optional fields (`saveCardNote(cardId, input)`)
- Destructure props in the component signature
- Zod schemas own validation; services then `sanitizeText` / `sanitizeEmail` before write

**Return Values:**
- Explicit `Promise<T>` on exported service functions
- Early return for guards (`if (!openCard) return`, `if (!path) return null`)
- Empty lists as `[]`, not `null` (`listProjects`, `listCategories`)
- Mutations that only persist return `Promise<void>`
- Use `mutateAsync` when the page must await then close a modal; use `mutate` for fire-and-forget drag/reorder

## Module Design

**Exports:**
- Named exports only — no `export default` in `src/`
- `export function` for pages, most components, hooks, and services
- `export const` + `forwardRef` + `displayName` for form primitives (`src/components/ui/Button.tsx`, `src/components/ui/Input.tsx`)
- Re-export inferred types next to their schema
- Query keys are English string tuples: `['projects']`, `['board', projectId]`, `['tasks']` — reuse the same key when invalidating

**Barrel Files:**
- Use only where already present: `src/lib/security/index.ts`, `src/routes/index.tsx`
- Do not add `index.ts` barrels under `components/`, `hooks/`, or `services/`
- Import from the concrete file (`@/hooks/kanban`, `@/components/ui/Button`)

**React Query / forms:**
- Default query: `staleTime: 60_000`, `retry: 1`, `refetchOnWindowFocus: false`; mutations `retry: 0` (`src/main.tsx`)
- Forms: `react-hook-form` + `zodResolver(*Schema)` + `noValidate` (`src/pages/auth/LoginPage.tsx`, `src/components/kanban/ProjectModal.tsx`)
- Zustand store in `src/stores/toast.store.ts`; call `toast(message, tone)` from hooks, not raw `useToastStore` in services

---

*Convention analysis: 2026-10-01*
*Update when patterns change*
