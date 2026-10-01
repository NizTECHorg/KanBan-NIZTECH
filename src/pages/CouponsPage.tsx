import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { couponSchema, type CouponFormData } from '@/schemas/modules.schema'
import { useAuth } from '@/hooks/useAuth'
import { useCoupons, useUpsertCoupon } from '@/hooks/queries'
import { canManageCatalog } from '@/lib/permissions'
import { formatDateTime } from '@/lib/security'
import type { Coupon } from '@/types/database.types'

export function CouponsPage() {
  const { profile } = useAuth()
  const canWrite = canManageCatalog(profile?.role)
  const { data = [], isLoading } = useCoupons()
  const upsert = useUpsertCoupon()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      discount_percent: 10,
      valid_until: '',
      is_active: true,
    },
  })

  useEffect(() => {
    if (editing) {
      form.reset({
        code: editing.code,
        discount_percent: Number(editing.discount_percent),
        valid_until: editing.valid_until.slice(0, 16),
        usage_limit: editing.usage_limit ?? undefined,
        is_active: editing.is_active,
      })
    } else {
      form.reset({
        code: '',
        discount_percent: 10,
        valid_until: '',
        is_active: true,
      })
    }
  }, [editing, form])

  async function onSubmit(values: CouponFormData) {
    await upsert.mutateAsync({ id: editing?.id ?? null, form: values })
    setOpen(false)
    setEditing(null)
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Promoções"
        description="Cupons com validade, desconto e limites de uso."
        action={
          canWrite ? (
            <Button
              onClick={() => {
                setEditing(null)
                setOpen(true)
              }}
            >
              <Plus size={17} /> Novo cupom
            </Button>
          ) : undefined
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(row) => row.id}
        emptyTitle="Nenhum cupom"
        emptyDescription="Crie cupons para campanhas e fidelização."
        columns={[
          {
            key: 'code',
            header: 'Código',
            render: (row) => <span className="font-mono text-caramel">{row.code}</span>,
          },
          {
            key: 'discount',
            header: 'Desconto',
            render: (row) => `${row.discount_percent}%`,
          },
          {
            key: 'valid',
            header: 'Validade',
            render: (row) => formatDateTime(row.valid_until),
          },
          {
            key: 'usage',
            header: 'Uso',
            render: (row) => `${row.usage_count}${row.usage_limit ? ` / ${row.usage_limit}` : ''}`,
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
            render: (row) =>
              canWrite ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(row)
                    setOpen(true)
                  }}
                >
                  Editar
                </Button>
              ) : null,
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar cupom' : 'Novo cupom'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Código"
            error={form.formState.errors.code?.message}
            {...form.register('code')}
            className="uppercase"
          />
          <Input
            label="Desconto (%)"
            type="number"
            step="0.01"
            error={form.formState.errors.discount_percent?.message}
            {...form.register('discount_percent')}
          />
          <Input
            label="Validade"
            type="datetime-local"
            error={form.formState.errors.valid_until?.message}
            {...form.register('valid_until')}
          />
          <Input label="Limite de uso (opcional)" type="number" {...form.register('usage_limit')} />
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
    </section>
  )
}
