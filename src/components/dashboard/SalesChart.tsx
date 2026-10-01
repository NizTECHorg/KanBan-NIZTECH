import { useState } from 'react'
import { formatCurrency } from '@/lib/security'
import type { DashboardSalesPoint } from '@/types/database.types'

type SalesChartProps = {
  data: DashboardSalesPoint[]
  dense?: boolean
}

export function SalesChart({ data, dense = false }: SalesChartProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const maxSale = Math.max(...data.map((s) => Number(s.total)), 1)
  const active = data.find((d) => d.key === activeKey) ?? null

  return (
    <div className="sales-chart relative mt-6">
      {active && (
        <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-lg border border-dark-border bg-dark px-3 py-1.5 text-xs shadow-lg">
          <span className="text-cream/50">{active.label}</span>
          <span className="ml-2 font-semibold text-caramel">{formatCurrency(Number(active.total))}</span>
        </div>
      )}

      <div className="sales-chart__grid absolute inset-x-0 bottom-7 top-8 flex flex-col justify-between">
        {[0, 1, 2, 3].map((line) => (
          <div key={line} className="border-t border-dark-border/60" />
        ))}
      </div>

      <div
        className={[
          'relative flex h-56 items-end px-1',
          dense ? 'gap-1' : 'gap-2.5',
        ].join(' ')}
      >
        {data.map((point, index) => {
          const height = Math.max((Number(point.total) / maxSale) * 100, point.total > 0 ? 6 : 2)
          const isActive = activeKey === point.key

          return (
            <button
              key={point.key}
              type="button"
              className="sales-chart__bar group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
              style={{ ['--bar-delay' as string]: `${index * 45}ms` }}
              onMouseEnter={() => setActiveKey(point.key)}
              onMouseLeave={() => setActiveKey(null)}
              onFocus={() => setActiveKey(point.key)}
              onBlur={() => setActiveKey(null)}
              aria-label={`${point.label}: ${formatCurrency(Number(point.total))}`}
            >
              <span
                className={[
                  'sales-chart__fill relative w-full origin-bottom rounded-t-md transition-[filter,transform] duration-200',
                  dense ? 'max-w-full' : 'max-w-10 mx-auto',
                  isActive ? 'brightness-110 scale-x-105' : 'group-hover:brightness-110',
                ].join(' ')}
                style={{ height: `${height}%` }}
              >
                <span className="sales-chart__shine absolute inset-x-0 top-0 h-1/3 rounded-t-md" />
              </span>
            </button>
          )
        })}
      </div>

      <div
        className={[
          'mt-3 grid text-center text-[10px] text-cream/30',
          dense ? 'gap-0.5' : '',
        ].join(' ')}
        style={{ gridTemplateColumns: `repeat(${Math.max(data.length, 1)}, minmax(0, 1fr))` }}
      >
        {data.map((point, index) => {
          const showLabel = !dense || index === 0 || index === data.length - 1 || index % 5 === 0
          return (
            <span key={point.key} className={showLabel ? 'truncate capitalize' : 'invisible'}>
              {point.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
