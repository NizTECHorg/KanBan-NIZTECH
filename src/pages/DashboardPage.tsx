import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  ChefHat,
  CircleDollarSign,
  ClipboardList,
  Cookie,
  PackageX,
  Users,
} from 'lucide-react'
import { SalesChart } from '@/components/dashboard/SalesChart'
import { useDashboardMetrics } from '@/hooks/queries'
import { formatCurrency } from '@/lib/security'
import type { DashboardPeriod } from '@/types/database.types'

const PERIODS: Array<{ id: DashboardPeriod; label: string }> = [
  { id: 'day', label: 'Hoje' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
  { id: 'year', label: 'Ano' },
]

const PERIOD_DETAIL: Record<DashboardPeriod, string> = {
  day: 'Hoje',
  week: 'Últimos 7 dias',
  month: 'Este mês',
  year: 'Este ano',
}

const CHART_COPY: Record<DashboardPeriod, { title: string; subtitle: string }> = {
  day: { title: 'Vendas nos últimos 7 dias', subtitle: 'Tendência recente de faturamento' },
  week: { title: 'Vendas da semana', subtitle: 'Faturamento diário dos últimos 7 dias' },
  month: { title: 'Vendas do mês', subtitle: 'Faturamento diário neste mês' },
  year: { title: 'Vendas do ano', subtitle: 'Faturamento mensal neste ano' },
}

export function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('day')
  const { data, isLoading, isFetching } = useDashboardMetrics(period)
  const currentDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date())

  const detail = PERIOD_DETAIL[period]
  const chartCopy = CHART_COPY[period]

  const metrics = [
    {
      label: period === 'day' ? 'Pedidos do dia' : 'Pedidos',
      value: String(data?.orders_count ?? 0),
      detail,
      icon: ClipboardList,
    },
    {
      label: 'Produção pendente',
      value: String(data?.production_pending ?? 0),
      detail: 'Agendadas para hoje',
      icon: ChefHat,
    },
    {
      label: 'Cookies vendidos',
      value: String(data?.cookies_sold ?? 0),
      detail,
      icon: Cookie,
    },
    {
      label: period === 'day' ? 'Faturamento diário' : 'Faturamento',
      value: formatCurrency(Number(data?.revenue ?? 0)),
      detail,
      icon: CircleDollarSign,
    },
    {
      label: 'Clientes atendidos',
      value: String(data?.clients_count ?? 0),
      detail,
      icon: Users,
    },
  ]

  const sales = data?.sales_series ?? []
  const productionToday = data?.production_today ?? []

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-caramel">
            {currentDate}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Visão geral</h1>
          <p className="mt-2 text-sm text-cream/45">
            Acompanhe a operação da sua confeitaria em tempo real.
          </p>
        </div>
        <Link
          to="/pedidos"
          className="inline-flex items-center gap-2 rounded-lg bg-caramel px-5 py-3 text-sm font-semibold text-dark transition hover:bg-caramel/90"
        >
          Novo pedido
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-xl border border-dark-border bg-dark-surface p-1"
          role="tablist"
          aria-label="Período da visão geral"
        >
          {PERIODS.map(({ id, label }) => {
            const active = period === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(id)}
                className={[
                  'rounded-lg px-3.5 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-caramel text-dark shadow-sm'
                    : 'text-cream/45 hover:text-cream/80',
                ].join(' ')}
              >
                {label}
              </button>
            )
          })}
        </div>
        {isFetching && !isLoading ? (
          <span className="text-xs text-cream/30">Atualizando…</span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-8 flex min-h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map(({ label, value, detail: metricDetail, icon: Icon }) => (
              <article key={label} className="rounded-xl border border-dark-border bg-dark-surface p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-cream/40">{label}</p>
                  <Icon size={17} className="text-caramel/70" />
                </div>
                <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
                <p className="mt-1 text-xs text-cream/30">{metricDetail}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
            <article className="rounded-xl border border-dark-border bg-dark-surface p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-medium">{chartCopy.title}</h2>
                  <p className="mt-1 text-xs text-cream/35">{chartCopy.subtitle}</p>
                </div>
                <Link to="/financeiro" className="shrink-0 text-xs font-medium text-caramel hover:text-caramel/80">
                  Ver financeiro
                </Link>
              </div>
              <SalesChart key={period} data={sales} dense={period === 'month'} />
            </article>

            <article className="rounded-xl border border-dark-border bg-dark-surface p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium">Produção de hoje</h2>
                  <p className="mt-1 text-xs text-cream/35">Itens pendentes</p>
                </div>
                <ChefHat size={19} className="text-caramel/70" />
              </div>
              {productionToday.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium">Nenhuma produção pendente</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-cream/30">
                    Pedidos confirmados aparecerão automaticamente aqui.
                  </p>
                </div>
              ) : (
                <ul className="mt-5 max-h-64 space-y-2 overflow-y-auto">
                  {productionToday.map((item) => (
                    <li
                      key={item.product_id}
                      className="flex items-center justify-between rounded-lg border border-dark-border px-3 py-2 text-sm"
                    >
                      <span className="text-cream/80">{item.product_name}</span>
                      <span className="font-semibold text-caramel">{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                to="/producao"
                className="mt-4 flex items-center justify-center gap-2 border-t border-dark-border pt-4 text-xs text-caramel"
              >
                Abrir produção <ArrowRight size={14} />
              </Link>
            </article>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-dark-border bg-dark-surface p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-error/10 p-2 text-error">
                  <PackageX size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-medium">Ingredientes críticos</h2>
                  <p className="text-xs text-cream/35">Abaixo do estoque mínimo</p>
                </div>
                <span
                  className={[
                    'ml-auto rounded-full px-2.5 py-1 text-xs',
                    (data?.low_stock_count ?? 0) > 0
                      ? 'bg-error/10 text-error'
                      : 'bg-success/10 text-success',
                  ].join(' ')}
                >
                  {data?.low_stock_count ?? 0} itens
                </span>
              </div>
            </article>

            <article className="rounded-xl border border-dark-border bg-dark-surface p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-caramel/10 p-2 text-caramel">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-medium">Alertas operacionais</h2>
                  <p className="text-xs text-cream/35">Estoque, pedidos e produção</p>
                </div>
                <span className="ml-auto rounded-full bg-success/10 px-2.5 py-1 text-xs text-success">
                  {(data?.low_stock_count ?? 0) > 0 ? 'Atenção' : 'Tudo certo'}
                </span>
              </div>
            </article>
          </div>
        </>
      )}
    </section>
  )
}
