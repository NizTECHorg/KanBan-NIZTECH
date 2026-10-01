import { PageHeader } from '@/components/ui/PageHeader'
import { useReports } from '@/hooks/queries'
import { formatCurrency, formatDate } from '@/lib/security'

export function ReportsPage() {
  const { data, isLoading } = useReports()

  if (isLoading) {
    return (
      <div className="flex min-h-56 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
      </div>
    )
  }

  const topRevenue = data?.topProducts?.[0]
  const topClient = data?.topClients?.[0]

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Relatórios e indicadores"
        description="Visão consolidada do desempenho, vendas, clientes, ingredientes e produção."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Produto líder" value={topRevenue?.name ?? '—'} detail={topRevenue ? formatCurrency(topRevenue.revenue) : ''} />
        <Metric label="Cliente top" value={topClient?.name ?? '—'} detail={topClient ? formatCurrency(topClient.total) : ''} />
        <Metric label="SKUs ativos no ranking" value={String(data?.topProducts?.length ?? 0)} detail="produtos com venda" />
        <Metric label="Produções recentes" value={String(data?.productions?.length ?? 0)} detail="últimos registros" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportCard title="Produtos mais vendidos">
          {(data?.topProducts ?? []).map((p) => (
            <Row key={p.name} label={p.name} value={`${p.qty} un · ${formatCurrency(p.revenue)}`} />
          ))}
        </ReportCard>

        <ReportCard title="Produtos menos vendidos">
          {(data?.bottomProducts ?? []).map((p) => (
            <Row key={p.name} label={p.name} value={`${p.qty} un`} />
          ))}
        </ReportCard>

        <ReportCard title="Clientes que mais compram">
          {(data?.topClients ?? []).map((c) => (
            <Row key={c.name} label={c.name} value={formatCurrency(c.total)} />
          ))}
        </ReportCard>

        <ReportCard title="Ingredientes mais utilizados">
          {(data?.topIngredients ?? []).map((i) => (
            <Row key={i.name} label={i.name} value={`${i.qty}`} />
          ))}
        </ReportCard>

        <ReportCard title="Produção recente" className="lg:col-span-2">
          {(data?.productions ?? []).slice(0, 10).map((p) => {
            const qty = (p.production_items as Array<{ planned_quantity: number }> | null)?.reduce(
              (s, i) => s + i.planned_quantity,
              0,
            ) ?? 0
            return (
              <Row
                key={p.id}
                label={`${formatDate(p.scheduled_for)} · ${p.status}`}
                value={`${qty} itens`}
              />
            )
          })}
        </ReportCard>
      </div>
    </section>
  )
}

function ReportCard({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <article className={['rounded-xl border border-dark-border bg-dark-surface p-5', className].join(' ')}>
      <h2 className="mb-4 text-sm font-medium">{title}</h2>
      <div className="space-y-3">
        {Array.isArray(children) && children.length === 0 ? (
          <p className="text-sm text-cream/35">Sem dados ainda.</p>
        ) : (
          children
        )}
      </div>
    </article>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-cream/70">{label}</span>
      <span className="text-cream/90">{value}</span>
    </div>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-xl border border-dark-border bg-dark-surface p-5">
      <p className="text-xs text-cream/40">{label}</p>
      <p className="mt-3 text-lg font-semibold">{value}</p>
      {detail && <p className="mt-1 text-xs text-cream/30">{detail}</p>}
    </article>
  )
}
