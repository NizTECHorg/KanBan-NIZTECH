import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PackagePlus, Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import {
  ingredientSchema,
  stockMovementSchema,
  type IngredientFormData,
  type StockMovementFormData,
} from '@/schemas/modules.schema'
import { useAuth } from '@/hooks/useAuth'
import { useIngredients, useStockMovement, useUpsertIngredient } from '@/hooks/queries'
import { canManageCatalog, canManageProduction } from '@/lib/permissions'
import type { IngredientWithStock } from '@/types/database.types'

export function StockPage() {
  const { profile } = useAuth()
  const canWrite = canManageCatalog(profile?.role)
  const canMove = canManageProduction(profile?.role) || canWrite
  const { data = [], isLoading } = useIngredients()
  const upsert = useUpsertIngredient()
  const move = useStockMovement()
  const [open, setOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [editing, setEditing] = useState<IngredientWithStock | null>(null)

  const form = useForm<IngredientFormData>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      unit: 'g',
      minimum_quantity: 0,
      supplier: '',
      is_active: true,
    },
  })

  const moveForm = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      ingredient_id: '',
      movement_type: 'entrada',
      quantity: 1,
      reason: '',
    },
  })

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        unit: editing.unit,
        minimum_quantity: Number(editing.minimum_quantity),
        supplier: editing.supplier ?? '',
        is_active: editing.is_active,
      })
    } else {
      form.reset({
        name: '',
        unit: 'g',
        minimum_quantity: 0,
        supplier: '',
        is_active: true,
      })
    }
  }, [editing, form])

  async function onSubmit(values: IngredientFormData) {
    await upsert.mutateAsync({ id: editing?.id ?? null, form: values })
    setOpen(false)
    setEditing(null)
  }

  async function onMove(values: StockMovementFormData) {
    await move.mutateAsync(values)
    setMoveOpen(false)
    moveForm.reset({ ingredient_id: '', movement_type: 'entrada', quantity: 1, reason: '' })
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Estoque"
        description="Controle de ingredientes, mínimos, fornecedores e movimentações."
        action={
          <div className="flex gap-2">
            {canMove && (
              <Button variant="secondary" onClick={() => setMoveOpen(true)}>
                <PackagePlus size={17} /> Movimentar
              </Button>
            )}
            {canWrite && (
              <Button
                onClick={() => {
                  setEditing(null)
                  setOpen(true)
                }}
              >
                <Plus size={17} /> Novo ingrediente
              </Button>
            )}
          </div>
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(row) => row.id}
        emptyTitle="Estoque vazio"
        emptyDescription="Cadastre ingredientes para começar o controle."
        columns={[
          {
            key: 'name',
            header: 'Ingrediente',
            render: (row) => (
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-cream/35">{row.supplier || 'Sem fornecedor'}</p>
              </div>
            ),
          },
          {
            key: 'qty',
            header: 'Atual',
            render: (row) => {
              const current = Number(row.stock?.current_quantity ?? 0)
              const low = current <= Number(row.minimum_quantity)
              return (
                <span className={low ? 'text-error' : ''}>
                  {current} {row.unit}
                </span>
              )
            },
          },
          {
            key: 'min',
            header: 'Mínimo',
            render: (row) => `${row.minimum_quantity} ${row.unit}`,
          },
          {
            key: 'status',
            header: 'Alerta',
            render: (row) => {
              const current = Number(row.stock?.current_quantity ?? 0)
              const low = current <= Number(row.minimum_quantity)
              return low ? <Badge tone="error">Crítico</Badge> : <Badge tone="success">OK</Badge>
            },
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

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar ingrediente' : 'Novo ingrediente'}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="Nome" error={form.formState.errors.name?.message} {...form.register('name')} />
          <Select
            label="Unidade"
            options={[
              { value: 'g', label: 'Gramas (g)' },
              { value: 'kg', label: 'Quilos (kg)' },
              { value: 'ml', label: 'Mililitros (ml)' },
              { value: 'l', label: 'Litros (l)' },
              { value: 'un', label: 'Unidades' },
            ]}
            {...form.register('unit')}
          />
          <Input
            label="Quantidade mínima"
            type="number"
            step="0.001"
            error={form.formState.errors.minimum_quantity?.message}
            {...form.register('minimum_quantity')}
          />
          <Input label="Fornecedor" {...form.register('supplier')} />
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

      <Modal open={moveOpen} onClose={() => setMoveOpen(false)} title="Movimentar estoque">
        <form onSubmit={moveForm.handleSubmit(onMove)} className="space-y-4" noValidate>
          <Select
            label="Ingrediente"
            options={[
              { value: '', label: 'Selecione' },
              ...data.map((i) => ({ value: i.id, label: i.name })),
            ]}
            error={moveForm.formState.errors.ingredient_id?.message}
            {...moveForm.register('ingredient_id')}
          />
          <Select
            label="Tipo"
            options={[
              { value: 'entrada', label: 'Entrada (compra)' },
              { value: 'ajuste', label: 'Ajuste (baixa)' },
            ]}
            {...moveForm.register('movement_type')}
          />
          <Input
            label="Quantidade"
            type="number"
            step="0.001"
            error={moveForm.formState.errors.quantity?.message}
            {...moveForm.register('quantity')}
          />
          <Input
            label="Motivo"
            error={moveForm.formState.errors.reason?.message}
            {...moveForm.register('reason')}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setMoveOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={move.isPending}>
              Registrar
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
