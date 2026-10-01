import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { deliverySchema, type DeliveryFormData } from '@/schemas/modules.schema'
import { useAuth } from '@/hooks/useAuth'
import {
  useCreateDelivery,
  useDeliveries,
  useEmployees,
  useOrders,
  useUpdateDeliveryStatus,
} from '@/hooks/queries'
import { DeliveryStatusBadge } from '@/lib/labels'
import { canManageCatalog } from '@/lib/permissions'
import { formatDateTime } from '@/lib/security'

export function DeliveriesPage() {
  const { profile } = useAuth()
  const canWrite = canManageCatalog(profile?.role)
  const { data = [], isLoading } = useDeliveries()
  const { data: orders = [] } = useOrders('todos')
  const { data: employees = [] } = useEmployees()
  const create = useCreateDelivery()
  const updateStatus = useUpdateDeliveryStatus()
  const [open, setOpen] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === 'pronto' && o.delivery_type === 'entrega'),
    [orders],
  )

  const couriers = employees.filter((e) => e.role === 'entregador' && e.is_active)

  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      courier_id: '',
      scheduled_for: new Date().toISOString().slice(0, 16),
      notes: '',
      order_ids: [],
    },
  })

  async function onSubmit(values: DeliveryFormData) {
    await create.mutateAsync({ ...values, order_ids: selectedOrders })
    setOpen(false)
    setSelectedOrders([])
  }

  function toggleOrder(id: string) {
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Entregas"
        description="Agrupe pedidos prontos em rotas e acompanhe status."
        action={
          canWrite ? (
            <Button
              onClick={() => {
                form.reset({
                  courier_id: couriers[0]?.id ?? '',
                  scheduled_for: new Date().toISOString().slice(0, 16),
                  notes: '',
                  order_ids: [],
                })
                setSelectedOrders([])
                setOpen(true)
              }}
            >
              <Plus size={17} /> Nova rota
            </Button>
          ) : undefined
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(row) => row.id}
        emptyTitle="Nenhuma rota"
        emptyDescription="Crie rotas agrupando pedidos prontos para entrega."
        columns={[
          {
            key: 'when',
            header: 'Horário',
            render: (row) => formatDateTime(row.scheduled_for),
          },
          {
            key: 'courier',
            header: 'Entregador',
            render: (row) =>
              (row.courier as { full_name?: string } | null)?.full_name ?? 'Não atribuído',
          },
          {
            key: 'orders',
            header: 'Pedidos',
            render: (row) =>
              (row.delivery_items as Array<{ orders?: { clients?: { full_name?: string } } }> | null)
                ?.map((i) => i.orders?.clients?.full_name ?? '?')
                .join(', ') || '—',
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <DeliveryStatusBadge status={row.status} />,
          },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex gap-1">
                {row.status === 'aguardando' && (
                  <Button
                    variant="ghost"
                    onClick={() => updateStatus.mutate({ id: row.id, status: 'em_rota' })}
                  >
                    Em rota
                  </Button>
                )}
                {row.status === 'em_rota' && (
                  <Button
                    variant="ghost"
                    onClick={() => updateStatus.mutate({ id: row.id, status: 'entregue' })}
                  >
                    Entregue
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Nova rota de entrega" wide>
        <form
          onSubmit={form.handleSubmit((values) => onSubmit({ ...values, order_ids: selectedOrders }))}
          className="space-y-4"
          noValidate
        >
          <Select
            label="Entregador"
            options={[
              { value: '', label: 'Sem entregador' },
              ...couriers.map((c) => ({ value: c.id, label: c.full_name })),
            ]}
            {...form.register('courier_id')}
          />
          <Input label="Horário" type="datetime-local" {...form.register('scheduled_for')} />
          <Textarea label="Observações" {...form.register('notes')} />

          <div>
            <p className="mb-2 text-sm font-medium">Pedidos prontos para entrega</p>
            {readyOrders.length === 0 ? (
              <p className="text-sm text-cream/40">Nenhum pedido pronto com tipo entrega.</p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-dark-border p-3">
                {readyOrders.map((order) => (
                  <label key={order.id} className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      className="accent-caramel"
                    />
                    <span>
                      {order.clients?.full_name} · {order.id.slice(0, 8)}
                    </span>
                  </label>
                ))}
              </div>
            )}
            {selectedOrders.length === 0 && (
              <p className="mt-2 text-xs text-error">Selecione ao menos um pedido</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={create.isPending} disabled={selectedOrders.length === 0}>
              Criar rota
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
