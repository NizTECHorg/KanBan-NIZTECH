import { NavLink, Outlet } from 'react-router-dom'
import { LayoutGrid, LogOut } from 'lucide-react'
import { BrandWordmark } from '@/components/brand/BrandWordmark'
import { useAuth } from '@/hooks/useAuth'

export function AppShell() {
  const { profile, user, signOut } = useAuth()
  const displayName = profile?.full_name ?? user?.user_metadata.full_name ?? 'Usuário'
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-dark text-cream">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-dark-border bg-dark/90 px-3 backdrop-blur-md sm:px-5">
        <div className="flex min-w-0 items-center gap-4">
          <BrandWordmark size="sm" asLink to="/projetos" />
          <NavLink
            to="/projetos"
            end={false}
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition',
                isActive
                  ? 'bg-white/10 text-cream'
                  : 'text-cream/55 hover:bg-white/5 hover:text-cream',
              ].join(' ')
            }
          >
            <LayoutGrid size={16} />
            Quadros
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-medium leading-tight">{displayName}</p>
            <p className="truncate text-[11px] text-cream/40">{user?.email}</p>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-caramel/15 text-[11px] font-semibold text-caramel">
            {initials || 'U'}
          </div>
          <button
            type="button"
            aria-label="Sair"
            title="Sair"
            onClick={() => void signOut()}
            className="rounded-lg p-2 text-cream/40 transition-colors hover:bg-white/5 hover:text-error"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
