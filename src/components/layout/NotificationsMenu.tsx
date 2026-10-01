import { useEffect, useRef, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { useDismissNotification, useNotifications } from '@/hooks/queries'
import { formatDateTime } from '@/lib/security'

const kindLabels: Record<string, string> = {
  pedido: 'Pedido',
  estoque: 'Estoque',
  producao: 'Produção',
  entrega: 'Entrega',
  cliente: 'Cliente',
}

export function NotificationsMenu() {
  const { data: notifications = [] } = useNotifications()
  const dismiss = useDismissNotification()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notificações"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={[
          'relative rounded-lg p-2.5 transition-colors hover:bg-white/5',
          open ? 'bg-white/5 text-cream' : 'text-cream/50 hover:text-cream',
        ].join(' ')}
      >
        <Bell size={19} />
        {notifications.length > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-caramel px-1 text-[10px] font-semibold text-dark">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-xl border border-dark-border bg-dark-surface shadow-2xl shadow-black/50">
          <div className="border-b border-dark-border px-4 py-3">
            <p className="text-sm font-medium">Notificações</p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-cream/35">
                Nenhuma notificação nova.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="group flex items-start gap-3 border-b border-dark-border/60 px-4 py-3 last:border-b-0 hover:bg-white/[0.03]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-cream/90">{n.title}</p>
                      <span className="shrink-0 rounded-full bg-caramel/10 px-2 py-0.5 text-[10px] text-caramel">
                        {kindLabels[n.kind] ?? n.kind}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-cream/50">{n.message}</p>
                    <p className="mt-1 text-[11px] text-cream/30">{formatDateTime(n.created_at)}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Dispensar notificação"
                    title="Dispensar"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      dismiss.mutate(n.id)
                    }}
                    className="shrink-0 rounded-md p-1.5 text-cream/30 transition-colors hover:bg-white/5 hover:text-error"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
