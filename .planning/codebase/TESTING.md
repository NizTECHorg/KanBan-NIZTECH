# Testing Patterns

**Analysis Date:** 2026-10-01
**last_mapped_commit:** ff4d7688f16342c02a651f25adf2b7067499fadc

## Test Framework

**Runner:**
- Not detected — no Vitest, Jest, Playwright, or Cypress in `package.json`
- No `vitest.config.*`, `jest.config.*`, or `playwright.config.*`
- No `test` / `test:coverage` script

**Assertion Library:**
- Not detected

**Current verification (use until a runner exists):**
```bash
npm run typecheck            # tsc --noEmit (strict)
npm run lint                 # eslint .
npm run build                # typecheck + vite build
```

**When introducing tests, add Vitest** (matches Vite 6 + TypeScript in `vite.config.ts`) plus Testing Library for components. Do not add Jest.

**Run Commands:**
```bash
npm run typecheck            # Static checks (current)
npm run lint                 # Lint (current)
# After Vitest is added:
# npm test                   # Run all tests
# npm test -- --watch        # Watch mode
# npm test -- src/lib/security/index.test.ts
# npm run test:coverage      # Coverage report
```

## Test File Organization

**Location:**
- No test files in the repo (`*.test.*` / `*.spec.*` count: 0)
- No `__tests__/`, `tests/`, or `e2e/` directories
- No CI workflows under `.github/`

**Naming (use this when adding tests):**
- Colocate `*.test.ts` next to pure modules
- Colocate `*.test.tsx` next to React components
- `*.integration.test.ts` only if a test hits a real or emulator Supabase
- Do not use `*.spec.ts`

**Structure:**
```
src/
  lib/
    security/
      index.ts
      index.test.ts          # first tests belong here
    compress-image.ts
    compress-image.test.ts
  schemas/
    auth.schema.ts
    auth.schema.test.ts
    kanban.schema.ts
    kanban.schema.test.ts
  types/
    kanban.ts
    kanban.test.ts
  services/
    kanban.service.ts
    kanban.service.test.ts   # mock @/lib/supabase/client
  hooks/
    kanban.ts
    kanban.test.ts           # wrap QueryClient
  components/
    kanban/
      CardNote.tsx
      CardNote.test.tsx
```

## Test Structure

**Suite Organization:**
No existing suite. Use this shape for new tests (Vitest):

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mapAuthError, mapDbError, isSafeInternalPath } from '@/lib/security'

describe('mapAuthError', () => {
  it('returns a generic Portuguese message for unknown errors', () => {
    expect(mapAuthError({ message: 'internal boom' })).toBe(
      'Ocorreu um erro. Tente novamente mais tarde.',
    )
  })

  it('maps invalid login credentials without leaking the provider text', () => {
    expect(mapAuthError({ message: 'Invalid login credentials' })).toBe(
      'E-mail ou senha incorretos.',
    )
  })
})

describe('isSafeInternalPath', () => {
  it('rejects protocol-relative and absolute URLs', () => {
    expect(isSafeInternalPath('//evil.example/x')).toBe(false)
    expect(isSafeInternalPath('https://evil.example')).toBe(false)
  })
})
```

**Patterns:**
- `describe` = module or exported function; `it` = one behavior
- Portuguese expected strings must match production copy in `src/lib/security/index.ts`
- `beforeEach` for store/session reset; avoid `beforeAll` for mutable state
- Early-return guards and `throw new Error` are the assertions to lock in
- Assert user-visible Portuguese messages, not English internals

## Mocking

**Framework:**
- Not detected in-repo
- When added: Vitest `vi` (`vi.mock`, `vi.fn`, `vi.mocked`)

**Patterns:**
```typescript
import { vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn(), signInWithPassword: vi.fn() },
    storage: { from: vi.fn() },
  },
}))

vi.mock('@/stores/toast.store', () => ({
  toast: vi.fn(),
}))
```

**What to Mock:**
- `@/lib/supabase/client` (`supabase` Proxy) for every service/hook test
- `@/stores/toast.store` when testing hooks that call `toast` (`src/hooks/kanban.ts`, `src/hooks/queries.ts`)
- `sessionStorage` for `checkRateLimit` / `resetRateLimit` in `src/lib/security/index.ts`
- `URL.createObjectURL` / `createImageBitmap` / `canvas.toBlob` for `src/lib/compress-image.ts`
- `window.location` only if testing `signUpWithEmail` redirect (`src/services/auth.service.ts`)

**What NOT to Mock:**
- Zod schemas (`src/schemas/*.ts`) — run them for real
- `sanitizeText`, `sanitizeEmail`, `mapAuthError`, `mapDbError`, `escapeIlike`, `isSafeInternalPath`, `safeRedirectPath`
- `withAssignee` / `getAssignee` / `getCardLabel` (`src/types/kanban.ts`, `src/config/kanban.ts`)
- Permission predicates in `src/lib/permissions.ts`

## Fixtures and Factories

**Test Data:**
No shared fixtures directory. Build small factories in the test file:

```typescript
import type { Card } from '@/types/kanban'
import type { LoginFormData } from '@/schemas/auth.schema'

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'card-1',
    list_id: 'list-1',
    title: 'REQ-01 — Cadastro',
    description: null,
    position: 0,
    due_date: null,
    labels: ['indispensavel'],
    assigned_to: 'artur',
    note: null,
    note_image_path: null,
    created_by: null,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
    ...overrides,
  }
}

function makeLogin(overrides: Partial<LoginFormData> = {}): LoginFormData {
  return { email: 'user@niztech.com', password: 'secret', ...overrides }
}
```

**Location:**
- Factories live in the test file until a second file needs them
- Then extract to `src/test/factories.ts` (do not invent `tests/fixtures/` unless multiple domains share data)
- Seed/requirement copy lives in `src/data/requirements.ts` — do not import `scripts/requirements.mjs` from tests
- QueryClient defaults for hook tests must match `src/main.tsx`: `staleTime: 60_000`, `retry: 1` (queries), `retry: 0` (mutations), `refetchOnWindowFocus: false`

## Coverage

**Requirements:**
- None enforced — no coverage tool, no CI gate
- Do not add a coverage threshold until a runner exists and the security/schema suites are green

**Configuration:**
- Not detected
- When added, exclude `src/types/database.types.ts`, `src/vite-env.d.ts`, `src/data/requirements.ts`, and `scripts/`

**View Coverage:**
```bash
# Not available. After Vitest:
# npm run test:coverage
```

**Priority targets (highest risk, no tests today):**
- `src/lib/security/index.ts` — sanitization, open-redirect, auth/DB error mapping, client rate limit
- `src/schemas/auth.schema.ts` / `src/schemas/kanban.schema.ts` / `src/schemas/modules.schema.ts`
- `src/lib/compress-image.ts` — size/type guards
- `src/services/auth.service.ts` — rate limit + `mapAuthError`
- `src/services/kanban.service.ts` — `throwDb` setup messages, note upload path
- `src/hooks/kanban.ts` — optimistic reorder/move rollback

## Test Types

**Unit Tests:**
- Not present
- First wave: pure functions in `src/lib/security/index.ts`, `src/lib/permissions.ts`, `src/config/kanban.ts`, Zod schemas, `withAssignee` in `src/types/kanban.ts`
- No network, no DOM except `compress-image`

**Integration Tests:**
- Not present
- Service tests may mock only `supabase` and exercise `throwDb` / sanitize / insert payload shape
- Hook tests wrap `@tanstack/react-query` `QueryClientProvider` and assert `invalidateQueries` keys (`['board', projectId]`, `['projects']`)

**E2E Tests:**
- Not used
- No Playwright/Cypress
- Do not add E2E until unit coverage exists for security and schemas
- Manual verification today: `npm run dev` + browser against configured Supabase

## Common Patterns

**Async Testing:**
```typescript
it('rejects oversized images', async () => {
  await expect(compressNoteImage(hugeFile)).rejects.toThrow(
    'A imagem ainda ficou grande. Tente outra mais simples.',
  )
})
```

**Error Testing:**
```typescript
it('throws a setup message when the notes column is missing', async () => {
  // mock supabase.from('cards').update to return { error: { code: '42703', message: 'note' } }
  await expect(saveCardNote('card-1', { note: 'ok' })).rejects.toThrow(
    'Execute o SQL de notas no Supabase',
  )
})
```

**Query / toast testing:**
- Assert `toast` was called with `('Quadro criado', 'success')` after `useCreateProject` success (`src/hooks/kanban.ts`)
- Assert `toast(..., 'error')` on thrown `Error`
- For optimistic hooks, seed `queryClient.setQueryData(['board', id], board)` then fail the mutation and expect the previous snapshot

**Snapshot Testing:**
- Not used
- Prefer explicit text/class/role assertions (`role="alert"` on `src/components/ui/Input.tsx` and login errors)

**Auth / router tests:**
- Wrap with `MemoryRouter` + `AuthContext.Provider` using a fake `AuthContextValue` from `src/hooks/useAuth.ts`
- `ProtectedRoute` / `GuestRoute` live in `src/components/auth/ProtectedRoute.tsx` — test loading spinner, redirect to `/`, and the “Conta sem perfil ativo” screen

---

*Testing analysis: 2026-10-01*
*Update when test patterns change*
