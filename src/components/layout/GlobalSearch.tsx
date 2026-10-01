import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useGlobalSearch } from '@/hooks/queries'

export function GlobalSearch({ className = '' }: { className?: string }) {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const debounced = useDebounced(term, 300)
  const { data = [], isFetching } = useGlobalSearch(debounced)
  const results = useMemo(() => data, [data])

  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function goTo(path: string) {
    setOpen(false)
    setTerm('')
    navigate(path)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter') && results.length) {
      setOpen(true)
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0)))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault()
      goTo(results[activeIndex].path)
    }
  }

  const groups = useMemo(() => {
    return {
      cliente: results.filter((r) => r.type === 'cliente'),
      produto: results.filter((r) => r.type === 'produto'),
      pedido: results.filter((r) => r.type === 'pedido'),
    }
  }, [results])

  return (
    <div ref={containerRef} className={['relative flex-1', className].join(' ')}>
      <div className="flex items-center gap-3 rounded-lg border border-dark-border bg-dark-surface px-3 py-2.5">
        <Search size={17} className="shrink-0 text-cream/30" />
        <input
          type="search"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label="Buscar no sistema"
          placeholder="Buscar pedidos, clientes, produtos..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-cream/25"
          autoComplete="off"
          spellCheck={false}
        />
        {isFetching && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
        )}
      </div>

      {open && term.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-80 overflow-y-auto rounded-xl border border-dark-border bg-dark-surface p-2 shadow-2xl">
          {results.length === 0 && !isFetching ? (
            <p className="px-3 py-4 text-sm text-cream/40">Nenhum resultado encontrado.</p>
          ) : (
            (['cliente', 'produto', 'pedido'] as const).map((type) => {
              const items = groups[type]
              if (!items.length) return null
              return (
                <div key={type} className="mb-2 last:mb-0">
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cream/30">
                    {type === 'cliente' ? 'Clientes' : type === 'produto' ? 'Produtos' : 'Pedidos'}
                  </p>
                  {items.map((item) => {
                    const flatIndex = results.findIndex((r) => r.id === item.id && r.type === item.type)
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        onClick={() => goTo(item.path)}
                        className={[
                          'flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors',
                          flatIndex === activeIndex ? 'bg-caramel/15 text-caramel' : 'hover:bg-white/[0.04]',
                        ].join(' ')}
                      >
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-cream/40">{item.subtitle}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function useDebounced(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(t)
  }, [value, delay])
  return debounced
}
