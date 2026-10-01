import { useMemo, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { useCompleteProduction, useProductions } from '@/hooks/queries'
import { ProductionStatusBadge } from '@/lib/labels'
import { canManageProduction } from '@/lib/permissions'
import { formatDate } from '@/lib/security'

export function ProductionPage() {
  const { profile } = useAuth()
  const canWrite = canManageProduction(profile?.role)
  const { data = [], isLoading } = useProductions()
  const complete = useCompleteProduction()
  const [completeId, setCompleteId] = useState<string | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  const agenda = useMemo(() => {
    const map = new Map<string, { name: string; qty: number }>()
    for (const prod of data) {
      if (prod.scheduled_for !== today) continue
      if (!['pendente', 'em_producao'].includes(prod.status)) continue
      for (const item of prod.production_items ?? []) {
        const name = (item.products as { name?: string } | null)?.name ?? 'Produto'
        const cur = map.get(item.product_id) ?? { name, qty: 0 }
        cur.qty += item.planned_quantity
        map.set(item.product_id, cur)
      }
    }
    return [...map.values()].sort((a, b) => b.qty - a.qty)
  }, [data, today])

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Produção"
        description="Planejamento automático gerado pelos pedidos confirmados."
      />

      <div className="mb-6 rounded-xl border border-dark-border bg-dark-surface p-6">
        <h2 className="text-sm font-medium text-cream">Produzir hoje</h2>
        {agenda.length === 0 ? (
          <p className="mt-3 text-sm text-cream/40">Nenhuma produção pendente para hoje.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {agenda.map((item) => (
              <li
                key={item.name}
                className="rounded-lg border border-dark-border bg-dark px-4 py-3 text-sm"
              >
                <span className="text-caramel font-semibold">{item.qty}</span>{' '}
                <span className="text-cream/80">{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(row) => row.id}
        emptyTitle="Sem produções"
        emptyDescription="Confirme pedidos para gerar produções automaticamente."
        columns={[
          {
            key: 'date',
            header: 'Data',
            render: (row) => formatDate(row.scheduled_for),
          },
          {
            key: 'items',
            header: 'Itens',
            render: (row) =>
              (row.production_items as Array<{ planned_quantity: number; products?: { name?: string } }> | null)
                ?.map((i) => `${i.planned_quantity}x ${i.products?.name ?? '?'}`)
                .join(', ') || '—',
          },
          {
            key: 'order',
            header: 'Pedido',
            render: (row) => (row.order_id ? row.order_id.slice(0, 8) : '—'),
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <ProductionStatusBadge status={row.status} />,
          },
          {
            key: 'actions',
            header: '',
            render: (row) =>
              canWrite && ['pendente', 'em_producao'].includes(row.status) ? (
                <Button variant="ghost" onClick={() => setCompleteId(row.id)}>
                  Concluir
                </Button>
              ) : null,
          },
        ]}
      />

      <ConfirmDialog
        open={!!completeId}
        title="Concluir produção?"
        description="Os ingredientes serão descontados do estoque conforme as receitas."
        confirmLabel="Concluir"
        isLoading={complete.isPending}
        onClose={() => setCompleteId(null)}
        onConfirm={() => {
          if (!completeId) return
          complete.mutate(completeId, { onSuccess: () => setCompleteId(null) })
        }}
      />
    </section>
  )
}
