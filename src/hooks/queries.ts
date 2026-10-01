import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminUpdateProfile,
  cancelOrder,
  completeProduction,
  confirmOrder,
  createDelivery,
  createExpense,
  createOrder,
  createStockMovement,
  deleteTask,
  dismissNotification,
  getClientHistory,
  getCompanySettings,
  getDashboardMetrics,
  getFinanceSummary,
  getReports,
  globalSearch,
  listClients,
  listCoupons,
  listDeliveries,
  listEmployees,
  listExpenses,
  listIngredients,
  listOrders,
  listProductions,
  listProducts,
  listCategories,
  listRecipes,
  listNotifications,
  listShoppingList,
  listTasks,
  moveTask,
  saveRecipe,
  updateCompanySettings,
  updateDeliveryStatus,
  updateOrderStatus,
  upsertClient,
  upsertCoupon,
  upsertIngredient,
  upsertProduct,
  upsertTask,
  type OrderFilter,
} from '@/services/modules.service'
import type { DashboardPeriod } from '@/types/database.types'
import type {
  ClientFormData,
  CompanyFormData,
  CouponFormData,
  DeliveryFormData,
  IngredientFormData,
  OrderFormData,
  ProductFormData,
  RecipeFormData,
  StockMovementFormData,
  TaskFormData,
} from '@/schemas/modules.schema'
import type {
  Delivery,
  EmployeeRole,
  Notification,
  TaskStatus,
  TaskWithAssignee,
} from '@/types/database.types'
import { toast } from '@/stores/toast.store'

function onError(error: unknown) {
  toast(error instanceof Error ? error.message : 'Erro inesperado', 'error')
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: listCategories })
}

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: listProducts })
}

export function useUpsertProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, form }: { id: string | null; form: ProductFormData }) => upsertProduct(id, form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['products'] })
      toast('Produto salvo', 'success')
    },
    onError,
  })
}

export function useIngredients() {
  return useQuery({ queryKey: ['ingredients'], queryFn: listIngredients })
}

export function useUpsertIngredient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, form }: { id: string | null; form: IngredientFormData }) => upsertIngredient(id, form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['ingredients'] })
      await qc.invalidateQueries({ queryKey: ['shopping'] })
      toast('Ingrediente salvo', 'success')
    },
    onError,
  })
}

export function useStockMovement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: StockMovementFormData) => createStockMovement(form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['ingredients'] })
      await qc.invalidateQueries({ queryKey: ['shopping'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast('Movimentação registrada', 'success')
    },
    onError,
  })
}

export function useRecipes() {
  return useQuery({ queryKey: ['recipes'], queryFn: listRecipes })
}

export function useSaveRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ form, id }: { form: RecipeFormData; id?: string | null }) => saveRecipe(form, id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['recipes'] })
      toast('Receita salva', 'success')
    },
    onError,
  })
}

export function useClients() {
  return useQuery({ queryKey: ['clients'], queryFn: listClients })
}

export function useUpsertClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, form }: { id: string | null; form: ClientFormData }) => upsertClient(id, form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['clients'] })
      toast('Cliente salvo', 'success')
    },
    onError,
  })
}

export function useClientHistory(clientId: string | null) {
  return useQuery({
    queryKey: ['client-history', clientId],
    queryFn: () => getClientHistory(clientId!),
    enabled: !!clientId,
  })
}

export function useCoupons() {
  return useQuery({ queryKey: ['coupons'], queryFn: listCoupons })
}

export function useUpsertCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, form }: { id: string | null; form: CouponFormData }) => upsertCoupon(id, form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['coupons'] })
      toast('Cupom salvo', 'success')
    },
    onError,
  })
}

export function useOrders(filter: OrderFilter) {
  return useQuery({ queryKey: ['orders', filter], queryFn: () => listOrders(filter) })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: OrderFormData) => createOrder(form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['orders'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast('Pedido criado', 'success')
    },
    onError,
  })
}

export function useOrderActions() {
  const qc = useQueryClient()
  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['orders'] })
    await qc.invalidateQueries({ queryKey: ['production'] })
    await qc.invalidateQueries({ queryKey: ['dashboard'] })
  }

  return {
    confirm: useMutation({
      mutationFn: confirmOrder,
      onSuccess: async () => {
        await invalidate()
        toast('Pedido confirmado e enviado à produção', 'success')
      },
      onError,
    }),
    cancel: useMutation({
      mutationFn: cancelOrder,
      onSuccess: async () => {
        await invalidate()
        toast('Pedido cancelado', 'success')
      },
      onError,
    }),
    updateStatus: useMutation({
      mutationFn: ({ id, status }: { id: string; status: 'saiu_para_entrega' | 'entregue' }) =>
        updateOrderStatus(id, status),
      onSuccess: async () => {
        await invalidate()
        toast('Status atualizado', 'success')
      },
      onError,
    }),
  }
}

export function useProductions() {
  return useQuery({ queryKey: ['production'], queryFn: listProductions })
}

export function useCompleteProduction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: completeProduction,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['production'] })
      await qc.invalidateQueries({ queryKey: ['orders'] })
      await qc.invalidateQueries({ queryKey: ['ingredients'] })
      await qc.invalidateQueries({ queryKey: ['dashboard'] })
      toast('Produção concluída', 'success')
    },
    onError,
  })
}

export function useDeliveries() {
  return useQuery({ queryKey: ['deliveries'], queryFn: listDeliveries })
}

export function useCreateDelivery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: DeliveryFormData) => createDelivery(form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['deliveries'] })
      toast('Rota criada', 'success')
    },
    onError,
  })
}

export function useUpdateDeliveryStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Delivery['status'] }) => updateDeliveryStatus(id, status),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['deliveries'] })
      toast('Entrega atualizada', 'success')
    },
    onError,
  })
}

export function useShoppingList() {
  return useQuery({ queryKey: ['shopping'], queryFn: listShoppingList })
}

export function useExpenses() {
  return useQuery({ queryKey: ['expenses'], queryFn: listExpenses })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['expenses'] })
      await qc.invalidateQueries({ queryKey: ['finance'] })
      toast('Despesa registrada', 'success')
    },
    onError,
  })
}

export function useFinanceSummary() {
  return useQuery({ queryKey: ['finance'], queryFn: getFinanceSummary })
}

export function useEmployees() {
  return useQuery({ queryKey: ['employees'], queryFn: listEmployees })
}

export function useAdminUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      role,
      isActive,
    }: {
      userId: string
      role: EmployeeRole
      isActive: boolean
    }) => adminUpdateProfile(userId, role, isActive),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['employees'] })
      toast('Funcionário atualizado', 'success')
    },
    onError,
  })
}

export function useCompanySettings() {
  return useQuery({ queryKey: ['company'], queryFn: getCompanySettings })
}

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: CompanyFormData) => updateCompanySettings(form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['company'] })
      toast('Dados da empresa atualizados', 'success')
    },
    onError,
  })
}

export function useDashboardMetrics(period: DashboardPeriod = 'day') {
  return useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => getDashboardMetrics(period),
    refetchInterval: 60_000,
  })
}

export function useReports() {
  return useQuery({ queryKey: ['reports'], queryFn: getReports })
}

export function useTasks() {
  return useQuery({ queryKey: ['tasks'], queryFn: listTasks })
}

export function useUpsertTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, form, status }: { id: string | null; form: TaskFormData; status?: TaskStatus }) =>
      upsertTask(id, form, status),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tasks'] })
      toast('Tarefa salva', 'success')
    },
    onError,
  })
}

export function useMoveTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, position }: { id: string; status: TaskStatus; position: number }) =>
      moveTask(id, status, position),
    // Atualização otimista: o card muda de coluna na hora, sem esperar o servidor.
    onMutate: async ({ id, status, position }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] })
      const previous = qc.getQueryData<TaskWithAssignee[]>(['tasks'])
      qc.setQueryData<TaskWithAssignee[]>(['tasks'], (old = []) =>
        old.map((task) => (task.id === id ? { ...task, status, position } : task)),
      )
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) qc.setQueryData(['tasks'], context.previous)
      onError(error)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tasks'] })
      toast('Tarefa excluída', 'success')
    },
    onError,
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
    refetchInterval: 60_000,
  })
}

export function useDismissNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => dismissNotification(id),
    // Remove da lista na hora; reverte se o servidor recusar.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['notifications'] })
      const previous = qc.getQueryData<Notification[]>(['notifications'])
      qc.setQueryData<Notification[]>(['notifications'], (old = []) =>
        old.filter((n) => n.id !== id),
      )
      return { previous }
    },
    onError: (error, _id, context) => {
      if (context?.previous) qc.setQueryData(['notifications'], context.previous)
      onError(error)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useGlobalSearch(term: string) {
  return useQuery({
    queryKey: ['search', term],
    queryFn: () => globalSearch(term),
    enabled: term.trim().length >= 2,
    staleTime: 10_000,
  })
}
