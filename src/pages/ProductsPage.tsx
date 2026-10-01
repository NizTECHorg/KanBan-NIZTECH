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
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { productSchema, type ProductFormData } from '@/schemas/modules.schema'
import { useAuth } from '@/hooks/useAuth'
import { useCategories, useProducts, useUpsertProduct } from '@/hooks/queries'
import { canManageCatalog } from '@/lib/permissions'
import { formatCurrency } from '@/lib/security'
import type { ProductWithCategory } from '@/types/database.types'

export function ProductsPage() {
  const { profile } = useAuth()
  const canWrite = canManageCatalog(profile?.role)
  const { data = [], isLoading } = useProducts()
  const { data: categories = [] } = useCategories()
  const upsert = useUpsertProduct()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProductWithCategory | null>(null)
  const [params] = useSearchParams()
  const highlight = params.get('q')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category_id: '',
      description: '',
      price: 0,
      production_time_minutes: 0,
      is_active: true,
    },
  })

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        category_id: editing.category_id,
        description: editing.description ?? '',
        price: Number(editing.price),
        weight_grams: editing.weight_grams ? Number(editing.weight_grams) : undefined,
        production_time_minutes: editing.production_time_minutes,
        is_active: editing.is_active,
      })
    } else {
      reset({
        name: '',
        category_id: categories[0]?.id ?? '',
        description: '',
        price: 0,
        production_time_minutes: 0,
        is_active: true,
      })
    }
  }, [editing, categories, reset])

  const rows = useMemo(() => {
    if (!highlight) return data
    return [...data].sort((a, b) => Number(b.id === highlight) - Number(a.id === highlight))
  }, [data, highlight])

  async function onSubmit(form: ProductFormData) {
    await upsert.mutateAsync({ id: editing?.id ?? null, form })
    setOpen(false)
    setEditing(null)
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Produtos"
        description="Catálogo de cookies, brownies, bebidas, cafés e combos."
        action={
          canWrite ? (
            <Button
              onClick={() => {
                setEditing(null)
                setOpen(true)
              }}
            >
              <Plus size={17} /> Novo produto
            </Button>
          ) : undefined
        }
      />

      <DataTable
        isLoading={isLoading}
        data={rows}
        rowKey={(row) => row.id}
        emptyTitle="Nenhum produto cadastrado"
        emptyDescription="Cadastre o primeiro produto do catálogo."
        columns={[
          {
            key: 'name',
            header: 'Produto',
            render: (row) => (
              <div className={row.id === highlight ? 'text-caramel' : ''}>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-cream/35">{row.categories?.name ?? '—'}</p>
              </div>
            ),
          },
          {
            key: 'price',
            header: 'Preço',
            render: (row) => formatCurrency(Number(row.price)),
          },
          {
            key: 'time',
            header: 'Produção',
            render: (row) => `${row.production_time_minutes} min`,
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <Badge tone={row.is_active ? 'success' : 'muted'}>
                {row.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar produto' : 'Novo produto'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Nome" error={errors.name?.message} {...register('name')} />
          <Select
            label="Categoria"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            error={errors.category_id?.message}
            {...register('category_id')}
          />
          <Textarea label="Descrição" error={errors.description?.message} {...register('description')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Preço" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
            <Input
              label="Peso (g)"
              type="number"
              step="0.01"
              error={errors.weight_grams?.message}
              {...register('weight_grams')}
            />
          </div>
          <Input
            label="Tempo de produção (min)"
            type="number"
            error={errors.production_time_minutes?.message}
            {...register('production_time_minutes')}
          />
          <label className="flex items-center gap-2 text-sm text-cream/70">
            <input type="checkbox" {...register('is_active')} className="accent-caramel" />
            Produto ativo
          </label>
          <div className="flex justify-end gap-3 pt-2">
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
