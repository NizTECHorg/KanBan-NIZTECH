import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório').max(120),
  category_id: z.string().uuid('Categoria inválida'),
  description: z.string().max(2000).optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Preço inválido'),
  weight_grams: z.coerce.number().positive().optional(),
  production_time_minutes: z.coerce.number().int().min(0),
  is_active: z.boolean(),
})

export const ingredientSchema = z.object({
  name: z.string().min(2).max(120),
  unit: z.enum(['g', 'kg', 'ml', 'l', 'un']),
  minimum_quantity: z.coerce.number().min(0),
  supplier: z.string().max(160).optional().or(z.literal('')),
  is_active: z.boolean(),
})

export const stockMovementSchema = z.object({
  ingredient_id: z.string().uuid(),
  movement_type: z.enum(['entrada', 'ajuste']),
  quantity: z.coerce.number().positive('Quantidade deve ser positiva'),
  reason: z.string().min(2).max(500),
})

export const recipeSchema = z.object({
  product_id: z.string().uuid(),
  yield_quantity: z.coerce.number().int().positive(),
  instructions: z.string().max(10000).optional().or(z.literal('')),
  items: z
    .array(
      z.object({
        ingredient_id: z.string().uuid(),
        quantity: z.coerce.number().positive(),
      }),
    )
    .min(1, 'Adicione ao menos um ingrediente'),
})

export const clientSchema = z.object({
  full_name: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  email: z.string().email().max(254).optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  address_street: z.string().max(200).optional().or(z.literal('')),
  address_city: z.string().max(100).optional().or(z.literal('')),
  is_active: z.boolean(),
})

export const couponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[A-Z0-9_-]+$/, 'Use apenas A-Z, 0-9, _ e -')
    .transform((v) => v.toUpperCase()),
  discount_percent: z.coerce.number().positive().max(100),
  valid_until: z.string().min(1, 'Validade obrigatória'),
  usage_limit: z.coerce.number().int().positive().optional(),
  is_active: z.boolean(),
})

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
})

export const orderSchema = z.object({
  client_id: z.string().uuid('Selecione um cliente'),
  payment_method: z.enum(['dinheiro', 'pix', 'credito', 'debito', 'outro']),
  delivery_type: z.enum(['retirada', 'entrega']),
  scheduled_for: z.string().min(1),
  notes: z.string().max(2000).optional().or(z.literal('')),
  coupon_code: z.string().max(32).optional().or(z.literal('')),
  items: z.array(orderItemSchema).min(1, 'Adicione ao menos um produto'),
})

export const expenseSchema = z.object({
  description: z.string().min(2).max(300),
  category: z.string().min(2).max(80),
  amount: z.coerce.number().positive(),
  occurred_on: z.string().min(1),
})

export const companySchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email().max(254).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  business_hours: z.string().max(500).optional().or(z.literal('')),
  delivery_fee: z.coerce.number().min(0),
})

export const taskSchema = z.object({
  title: z.string().min(2, 'Título obrigatório').max(160),
  description: z.string().max(2000).optional().or(z.literal('')),
  priority: z.enum(['baixa', 'media', 'alta']),
  due_date: z.string().optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
})

export const deliverySchema = z.object({
  courier_id: z.string().uuid().optional().or(z.literal('')),
  scheduled_for: z.string().min(1),
  notes: z.string().max(1000).optional().or(z.literal('')),
  order_ids: z.array(z.string().uuid()).min(1, 'Selecione ao menos um pedido'),
})

export type ProductFormData = z.infer<typeof productSchema>
export type IngredientFormData = z.infer<typeof ingredientSchema>
export type StockMovementFormData = z.infer<typeof stockMovementSchema>
export type RecipeFormData = z.infer<typeof recipeSchema>
export type ClientFormData = z.infer<typeof clientSchema>
export type CouponFormData = z.infer<typeof couponSchema>
export type OrderFormData = z.infer<typeof orderSchema>
export type ExpenseFormData = z.infer<typeof expenseSchema>
export type CompanyFormData = z.infer<typeof companySchema>
export type DeliveryFormData = z.infer<typeof deliverySchema>
export type TaskFormData = z.infer<typeof taskSchema>
