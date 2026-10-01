import { useState } from 'react'
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
import { recipeSchema, type RecipeFormData } from '@/schemas/modules.schema'
import { useAuth } from '@/hooks/useAuth'
import { useIngredients, useProducts, useRecipes, useSaveRecipe } from '@/hooks/queries'
import { canManageCatalog } from '@/lib/permissions'

export function RecipesPage() {
  const { profile } = useAuth()
  const canWrite = canManageCatalog(profile?.role)
  const { data = [], isLoading } = useRecipes()
  const { data: products = [] } = useProducts()
  const { data: ingredients = [] } = useIngredients()
  const save = useSaveRecipe()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      product_id: '',
      yield_quantity: 1,
      instructions: '',
      items: [{ ingredient_id: '', quantity: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })

  function openCreate() {
    setEditingId(null)
    form.reset({
      product_id: products.find((p) => p.is_active)?.id ?? '',
      yield_quantity: 1,
      instructions: '',
      items: [{ ingredient_id: ingredients[0]?.id ?? '', quantity: 1 }],
    })
    setOpen(true)
  }

  function openEdit(row: (typeof data)[number]) {
    setEditingId(row.id)
    form.reset({
      product_id: row.product_id,
      yield_quantity: row.yield_quantity,
      instructions: row.instructions ?? '',
      items: (row.recipe_items ?? []).map((item: { ingredient_id: string; quantity: number }) => ({
        ingredient_id: item.ingredient_id,
        quantity: Number(item.quantity),
      })),
    })
    setOpen(true)
  }

  async function onSubmit(values: RecipeFormData) {
    await save.mutateAsync({ form: values, id: editingId })
    setOpen(false)
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Receitas"
        description="Fichas técnicas usadas para produção e baixa automática de estoque."
        action={
          canWrite ? (
            <Button onClick={openCreate}>
              <Plus size={17} /> Nova receita
            </Button>
          ) : undefined
        }
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(row) => row.id}
        emptyTitle="Nenhuma receita"
        emptyDescription="Crie receitas vinculadas aos produtos."
        columns={[
          {
            key: 'product',
            header: 'Produto',
            render: (row) => (row.products as { name?: string } | null)?.name ?? '—',
          },
          {
            key: 'yield',
            header: 'Rendimento',
            render: (row) => `${row.yield_quantity} un`,
          },
          {
            key: 'items',
            header: 'Ingredientes',
            render: (row) =>
              (row.recipe_items as Array<{ ingredients?: { name?: string }; quantity: number }> | null)
                ?.map((i) => `${i.ingredients?.name ?? '?'} (${i.quantity})`)
                .join(', ') || '—',
          },
          {
            key: 'actions',
            header: '',
            render: (row) =>
              canWrite ? (
                <Button variant="ghost" onClick={() => openEdit(row)}>
                  Editar
                </Button>
              ) : null,
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Editar receita' : 'Nova receita'} wide>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Select
            label="Produto"
            options={products.filter((p) => p.is_active).map((p) => ({ value: p.id, label: p.name }))}
            error={form.formState.errors.product_id?.message}
            disabled={!!editingId}
            {...form.register('product_id')}
          />
          <Input
            label="Rendimento (unidades)"
            type="number"
            error={form.formState.errors.yield_quantity?.message}
            {...form.register('yield_quantity')}
          />
          <Textarea label="Instruções" {...form.register('instructions')} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Itens</p>
              <Button
                type="button"
                variant="secondary"
                onClick={() => append({ ingredient_id: ingredients[0]?.id ?? '', quantity: 1 })}
              >
                Adicionar
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_120px_40px]">
                <Select
                  label={index === 0 ? 'Ingrediente' : ''}
                  options={ingredients.map((i) => ({ value: i.id, label: `${i.name} (${i.unit})` }))}
                  {...form.register(`items.${index}.ingredient_id`)}
                />
                <Input
                  label={index === 0 ? 'Qtd' : ''}
                  type="number"
                  step="0.001"
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
            {form.formState.errors.items && (
              <p className="text-xs text-error">{form.formState.errors.items.message as string}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={save.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}
