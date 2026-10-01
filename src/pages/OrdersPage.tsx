import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { orderSchema, type OrderFormData } from '@/schemas/modules.schema'
import { useAuth } from '@/hooks/useAuth'
import {
  useClients,
  useCreateOrder,
  useOrderActions,
  useOrders,
  useProducts,
} from '@/hooks/queries'
import { OrderStatusBadge } from '@/lib/labels'
import { canManageOrders } from '@/lib/permissions'
import { formatCurrency, formatDateTime } from '@/lib/security'
import type { OrderFilter } from '@/services/modules.service'

const filters: Array<{ id: OrderFilter; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'hoje', label: 'Hoje' },
  { id: 'amanha', label: 'Amanhã' },
  { id: 'semana', label: 'Semana' },
  { id: 'producao', label: 'Produção' },
  { id: 'entregues', label: 'Entregues' },
]

export function OrdersPage() {
  const { profile } = useAuth()
  const canWrite = canManageOrders(profile?.role)
  const [filter, setFilter] = useState<OrderFilter>('todos')
  const { data = [], isLoading } = useOrders(filter)
  const { data: clients = [] } = useClients()
  const { data: products = [] } = useProducts()
  const create = useCreateOrder()
  const actions = useOrderActions()
  const [open, setOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [params] = useSearchParams()
  const highlight = params.get('q')

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      client_id: '',
      payment_method: 'pix',
      delivery_type: 'retirada',
      scheduled_for: '',
      notes: '',
      coupon_code: '',
      items: [{ product_id: '', quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  const rows = useMemo(() => {
    if (!highlight) return data
    return [...data].sort((a, b) => Number(b.id === highlight) - Number(a.id === highlight))
  }, [data, highlight])

  async function onSubmit(values: OrderFormData) {
    await create.mutateAsync(values)
    setOpen(false)
    form.reset()
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Pedidos"
        description="Cadastre, filtre e acompanhe pedidos do início à entrega."
        action={
          canWrite ? (
            <Button
              onClick={() => {
                form.reset({
                  client_id: clients.find((c) => c.is_active)?.id ?? '',
                  payment_method: 'pix',
                  delivery_type: 'retirada',
                  scheduled_for: new Date().toISOString().slice(0, 16),
                  notes: '',
                  coupon_code: '',
                  items: [{ product_id: products.find((p) => p.is_active)?.id ?? '', quantity: 1 }],
                })
                setOpen(true)
              }}
            >
              <Plus size={17} /> Novo pedido
            </Button>
          ) : undefined
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={[
              'rounded-full border px-3 py-1.5 text-xs transition-colors',
              filter === f.id
                ? 'border-caramel/40 bg-caramel/15 text-caramel'
                : 'border-dark-border text-cream/45 hover:text-cream',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        isLoading={isLoading}
        data={rows}
        rowKey={(row) => row.id}
        emptyTitle="Nenhum pedido"
        emptyDescription="Crie o primeiro pedido da operação."
        columns={[
          {
            key: 'client',
            header: 'Cliente',
            render: (row) => (
              <div className={row.id === highlight ? 'text-caramel' : ''}>
                <p className="font-medium">{row.clients?.full_name ?? '—'}</p>
                <p className="text-xs text-cream/35">{row.clients?.phone}</p>
              </div>
            ),
          },
          {
            key: 'items',
            header: 'Itens',
            render: (row) =>
              row.order_items
                ?.map((i) => `${i.quantity}x ${i.products?.name ?? '?'}`)
                .join(', ') || '—',
          },
          {
            key: 'when',
            header: 'Horário',
            render: (row) => formatDateTime(row.scheduled_for),
          },
          {
            key: 'total',
            header: 'Total',
            render: (row) => formatCurrency(Number(row.total)),
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <OrderStatusBadge status={row.status} />,
          },
          {
            key: 'actions',
            header: '',
            className: 'min-w-48',
            render: (row) => (
              <div className="flex flex-wrap gap-1">
                {canWrite && row.status === 'novo' && (
                  <Button variant="ghost" onClick={() => setConfirmId(row.id)}>
                    Confirmar
                  </Button>
                )}
                {canWrite && row.status === 'pronto' && (
                  <Button
                    variant="ghost"
                    onClick={() => actions.updateStatus.mutate({ id: row.id, status: 'saiu_para_entrega' })}
                  >
                    Saiu
                  </Button>
                )}
                {canWrite && ['pronto', 'saiu_para_entrega'].includes(row.status) && (
                  <Button
                    variant="ghost"
                    onClick={() => actions.updateStatus.mutate({ id: row.id, status: 'entregue' })}
                  >
                    Entregar
                  </Button>
                )}
                {canWrite && !['entregue', 'cancelado'].includes(row.status) && (
                  <Button variant="ghost" onClick={() => setCancelId(row.id)}>
                    Cancelar
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Novo pedido" wide>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Select
            label="Cliente"
            options={clients.filter((c) => c.is_active).map((c) => ({ value: c.id, label: `${c.full_name} · ${c.phone}` }))}
            error={form.formState.errors.client_id?.message}
            {...form.register('client_id')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Pagamento"
              options={[
                { value: 'pix', label: 'PIX' },
                { value: 'dinheiro', label: 'Dinheiro' },
                { value: 'credito', label: 'Crédito' },
                { value: 'debito', label: 'Débito' },
                { value: 'outro', label: 'Outro' },
              ]}
              {...form.register('payment_method')}
            />
            <Select
              label="Entrega"
              options={[
                { value: 'retirada', label: 'Retirada' },
                { value: 'entrega', label: 'Entrega' },
              ]}
              {...form.register('delivery_type')}
            />
          </div>
          <Input label="Horário" type="datetime-local" {...form.register('scheduled_for')} />
          <Input label="Cupom (opcional)" {...form.register('coupon_code')} />
          <Textarea label="Observações" {...form.register('notes')} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Produtos</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  append({ product_id: products.find((p) => p.is_active)?.id ?? '', quantity: 1 })
                }
              >
                Adicionar
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_100px_40px]">
                <Select
                  label={index === 0 ? 'Produto' : ''}
                  options={products.filter((p) => p.is_active).map((p) => ({
                    value: p.id,
                    label: `${p.name} · ${formatCurrency(Number(p.price))}`,
                  }))}
                  {...form.register(`items.${index}.product_id`)}
                />
                <Input
                  label={index === 0 ? 'Qtd' : ''}
                  type="number"
                  {...form.register(`items.${index}.quantity`)}
                />
                <button
                  type="button"
                  className="mt-7 text-cream/40 hover:text-error"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={create.isPending}>
              Criar pedido
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        title="Confirmar pedido?"
        description="Isso enviará o pedido para produção automaticamente."
        confirmLabel="Confirmar"
        isLoading={actions.confirm.isPending}
        onClose={() => setConfirmId(null)}
        onConfirm={() => {
          if (!confirmId) return
          actions.confirm.mutate(confirmId, { onSuccess: () => setConfirmId(null) })
        }}
      />

      <ConfirmDialog
        open={!!cancelId}
        title="Cancelar pedido?"
        description="O histórico será preservado. Estoque só é devolvido se a produção ainda não iniciou."
        confirmLabel="Cancelar pedido"
        tone="danger"
        isLoading={actions.cancel.isPending}
        onClose={() => setCancelId(null)}
        onConfirm={() => {
          if (!cancelId) return
          actions.cancel.mutate(cancelId, { onSuccess: () => setCancelId(null) })
        }}
      />
    </section>
  )
}
