import { PageHeader } from '@/components/ui/PageHeader'
import { DataTable } from '@/components/ui/DataTable'
import { useShoppingList } from '@/hooks/queries'

export function ShoppingPage() {
  const { data = [], isLoading } = useShoppingList()

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Lista de compras"
        description="Sugestões automáticas baseadas no estoque mínimo."
      />

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(row) => row.ingredient_id}
        emptyTitle="Nada a comprar"
        emptyDescription="Todos os ingredientes estão acima do mínimo."
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
            key: 'current',
            header: 'Atual',
            render: (row) => `${row.current_quantity} ${row.unit}`,
          },
          {
            key: 'min',
            header: 'Mínimo',
            render: (row) => `${row.minimum_quantity} ${row.unit}`,
          },
          {
            key: 'buy',
            header: 'Comprar',
            render: (row) => (
              <span className="font-semibold text-caramel">
                {row.quantity_to_buy} {row.unit}
              </span>
            ),
          },
        ]}
      />
    </section>
  )
}
