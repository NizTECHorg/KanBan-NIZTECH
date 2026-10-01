import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { clientSchema, type ClientFormData } from '@/schemas/modules.schema'
import { useAuth } from '@/hooks/useAuth'
import { useClientHistory, useClients, useUpsertClient } from '@/hooks/queries'
import { LoyaltyBadge } from '@/lib/labels'
import { canManageOrders } from '@/lib/permissions'
import { formatCurrency, formatDateTime } from '@/lib/security'
import { loyaltyFromSpent } from '@/services/modules.service'
import type { Client } from '@/types/database.types'

export function ClientsPage() {
  const { profile } = useAuth()
  const canWrite = canManageOrders(profile?.role)
  const { data = [], isLoading } = useClients()
  const upsert = useUpsertClient()
  const [open, setOpen] = useState(false)
  const [historyId, setHistoryId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Client | null>(null)
  const [params] = useSearchParams()
  const highlight = params.get('q')
  const history = useClientHistory(historyId)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      birth_date: '',
      address_street: '',
      address_city: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (editing) {
      const address = (editing.address ?? {}) as { street?: string; city?: string }
      form.reset({
        full_name: editing.full_name,
        phone: editing.phone,
        email: editing.email ?? '',
        birth_date: editing.birth_date ?? '',
        address_street: address.street ?? '',
        address_city: address.city ?? '',
        is_active: editing.is_active,
      })
    } else {
      form.reset({
        full_name: '',
        phone: '',
        email: '',
        birth_date: '',
        address_street: '',
        address_city: '',
        is_active: true,
      })
    }
  }, [editing, form])

  const rows = useMemo(() => {
    if (!highlight) return data
    return [...data].sort((a, b) => Number(b.id === highlight) - Number(a.id === highlight))
  }, [data, highlight])

  async function onSubmit(values: ClientFormData) {
    await upsert.mutateAsync({ id: editing?.id ?? null, form: values })
    setOpen(false)
    setEditing(null)
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Clientes"
        description="Cadastro, histórico de pedidos e fidelidade."
        action={
          canWrite ? (
            <Button
              onClick={() => {
                setEditing(null)
                setOpen(true)
              }}
            >
              <Plus size={17} /> Novo cliente
            </Button>
          ) : undefined
        }
      />

      <DataTable
        isLoading={isLoading}
        data={rows}
        rowKey={(row) => row.id}
        emptyTitle="Nenhum cliente"
        emptyDescription="Cadastre clientes para iniciar os pedidos."
        columns={[
          {
            key: 'name',
            header: 'Cliente',
            render: (row) => (
              <div className={row.id === highlight ? 'text-caramel' : ''}>
                <p className="font-medium">{row.full_name}</p>
                <p className="text-xs text-cream/35">{row.phone}</p>
              </div>
            ),
          },
          {
            key: 'email',
            header: 'E-mail',
            render: (row) => row.email || '—',
          },
          {
            key: 'tier',
            header: 'Fidelidade',
            render: (row) => <LoyaltyBadge tier={row.loyalty_tier} />,
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <Badge tone={row.is_active ? 'success' : 'muted'}>{row.is_active ? 'Ativo' : 'Inativo'}</Badge>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex gap-1">
                <Button variant="ghost" onClick={() => setHistoryId(row.id)}>
                  Histórico
                </Button>
                {canWrite && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditing(row)
                      setOpen(true)
                    }}
                  >
                    Editar
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar cliente' : 'Novo cliente'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Nome" error={form.formState.errors.full_name?.message} {...form.register('full_name')} />
          <Input label="Telefone" error={form.formState.errors.phone?.message} {...form.register('phone')} />
          <Input label="E-mail" type="email" {...form.register('email')} />
          <Input label="Nascimento" type="date" {...form.register('birth_date')} />
          <Input label="Endereço" {...form.register('address_street')} />
          <Input label="Cidade" {...form.register('address_city')} />
          <label className="flex items-center gap-2 text-sm text-cream/70">
            <input type="checkbox" {...form.register('is_active')} className="accent-caramel" />
            Ativo
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={upsert.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!historyId}
        onClose={() => setHistoryId(null)}
        title="Histórico do cliente"
        description={
          history.data
            ? `Total gasto: ${formatCurrency(history.data.totalSpent)} · Tier sugerido: ${loyaltyFromSpent(history.data.totalSpent)}`
            : undefined
        }
        wide
      >
        <DataTable
          isLoading={history.isLoading}
          data={history.data?.orders ?? []}
          rowKey={(row) => row.id}
          emptyTitle="Sem pedidos"
          emptyDescription="Este cliente ainda não possui pedidos."
          columns={[
            {
              key: 'id',
              header: 'Pedido',
              render: (row) => row.id.slice(0, 8),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => row.status,
            },
            {
              key: 'total',
              header: 'Total',
              render: (row) => formatCurrency(Number(row.total)),
            },
            {
              key: 'date',
              header: 'Data',
              render: (row) => formatDateTime(row.created_at),
            },
          ]}
        />
      </Modal>
    </section>
  )
}
