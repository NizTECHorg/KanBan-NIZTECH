import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { expenseSchema, type ExpenseFormData } from '@/schemas/modules.schema'
import { useAuth } from '@/hooks/useAuth'
import { useCreateExpense, useExpenses, useFinanceSummary } from '@/hooks/queries'
import { canManageFinance } from '@/lib/permissions'
import { formatCurrency, formatDate } from '@/lib/security'

export function FinancePage() {
  const { profile } = useAuth()
  const canWrite = canManageFinance(profile?.role)
  const { data: expenses = [], isLoading } = useExpenses()
  const { data: summary } = useFinanceSummary()
  const create = useCreateExpense()
  const [open, setOpen] = useState(false)

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      category: 'Insumos',
      amount: 0,
      occurred_on: new Date().toISOString().slice(0, 10),
    },
  })

  const maxBar = Math.max(...(summary?.salesLast7Days.map((d) => d.total) ?? [0]), 1)

  async function onSubmit(values: ExpenseFormData) {
    await create.mutateAsync(values)
    setOpen(false)
    form.reset()
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Financeiro"
        description="Receitas, despesas, lucro e ticket médio."
        action={
          canWrite ? (
            <Button onClick={() => setOpen(true)}>
              <Plus size={17} /> Nova despesa
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Receita diária', value: formatCurrency(summary?.revenueToday ?? 0) },
          { label: 'Receita mensal', value: formatCurrency(summary?.revenueMonth ?? 0) },
          { label: 'Despesas', value: formatCurrency(summary?.expensesMonth ?? 0) },
          { label: 'Lucro', value: formatCurrency(summary?.profit ?? 0) },
          { label: 'Ticket médio', value: formatCurrency(summary?.ticket ?? 0) },
        ].map((card) => (
          <article key={card.label} className="rounded-xl border border-dark-border bg-dark-surface p-5">
            <p className="text-xs text-cream/40">{card.label}</p>
            <p className="mt-3 text-xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>

      <article className="mb-6 rounded-xl border border-dark-border bg-dark-surface p-6">
        <h2 className="text-sm font-medium">Receita nos últimos 7 dias</h2>
        <div className="mt-6 flex h-48 items-end gap-3">
          {(summary?.salesLast7Days ?? []).map((day) => (
            <div key={day.day} className="flex h-full flex-1 flex-col justify-end">
              <div
                className="w-full rounded-t-md bg-caramel/70 transition-all hover:bg-caramel"
                style={{ height: `${Math.max((day.total / maxBar) * 100, 4)}%` }}
                title={formatCurrency(day.total)}
              />
              <p className="mt-2 text-center text-[10px] text-cream/30">
                {formatDate(day.day).slice(0, 5)}
              </p>
            </div>
          ))}
        </div>
      </article>

      <DataTable
        isLoading={isLoading}
        data={expenses}
        rowKey={(row) => row.id}
        emptyTitle="Sem despesas"
        emptyDescription="Registre despesas para acompanhar o lucro."
        columns={[
          {
            key: 'desc',
            header: 'Descrição',
            render: (row) => (
              <div>
                <p className="font-medium">{row.description}</p>
                <p className="text-xs text-cream/35">{row.category}</p>
              </div>
            ),
          },
          {
            key: 'amount',
            header: 'Valor',
            render: (row) => formatCurrency(Number(row.amount)),
          },
          {
            key: 'date',
            header: 'Data',
            render: (row) => formatDate(row.occurred_on),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nova despesa">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Descrição" error={form.formState.errors.description?.message} {...form.register('description')} />
          <Input label="Categoria" {...form.register('category')} />
          <Input label="Valor" type="number" step="0.01" {...form.register('amount')} />
          <Input label="Data" type="date" {...form.register('occurred_on')} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={create.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
