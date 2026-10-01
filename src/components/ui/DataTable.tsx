import { Inbox } from 'lucide-react'

interface Column<T> {
  key: string
  header: string
  className?: string
  render: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  emptyTitle = 'Nenhum registro',
  emptyDescription = 'Os dados aparecerão aqui quando houver registros.',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-xl border border-dark-border bg-dark-surface">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dark-border bg-dark-surface px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.03] text-cream/25">
          <Inbox size={22} />
        </div>
        <h3 className="mt-4 text-sm font-medium text-cream">{emptyTitle}</h3>
        <p className="mt-1 max-w-sm text-xs leading-5 text-cream/40">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-dark-border bg-dark-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-dark-border bg-white/[0.02] text-xs uppercase tracking-wide text-cream/35">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={['px-4 py-3 font-medium', col.className].join(' ')}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={rowKey(row)} className="border-b border-dark-border/70 last:border-0 hover:bg-white/[0.02]">
                {columns.map((col) => (
                  <td key={col.key} className={['px-4 py-3.5 text-cream/85', col.className].join(' ')}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
