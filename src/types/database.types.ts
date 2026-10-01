export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type EmployeeRole =
  | 'administrador'
  | 'gerente'
  | 'atendente'
  | 'confeiteiro'
  | 'entregador'

export type OrderStatus =
  | 'novo'
  | 'producao'
  | 'pronto'
  | 'saiu_para_entrega'
  | 'entregue'
  | 'cancelado'

export type DeliveryStatus = 'aguardando' | 'em_rota' | 'entregue'
export type ProductionStatus = 'pendente' | 'em_producao' | 'concluida' | 'cancelada'
export type DeliveryType = 'retirada' | 'entrega'
export type PaymentMethod = 'dinheiro' | 'pix' | 'credito' | 'debito' | 'outro'
export type StockMovementType = 'entrada' | 'consumo' | 'ajuste' | 'devolucao'
export type LoyaltyTier = 'bronze' | 'prata' | 'ouro' | 'diamante'
export type MeasurementUnit = 'g' | 'kg' | 'ml' | 'l' | 'un'
export type TaskStatus = 'a_fazer' | 'em_andamento' | 'concluida'
export type TaskPriority = 'baixa' | 'media' | 'alta'

type Timestamps = {
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: EmployeeRole
          avatar_url: string | null
          is_active: boolean
        } & Timestamps
        Insert: {
          id: string
          full_name: string
          email: string
          role?: EmployeeRole
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      company_settings: {
        Row: {
          id: number
          name: string
          phone: string | null
          email: string | null
          address: string | null
          business_hours: string | null
          delivery_fee: number
          logo_url: string | null
        } & Timestamps
        Insert: {
          id?: number
          name?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          business_hours?: string | null
          delivery_fee?: number
          logo_url?: string | null
        }
        Update: Partial<Database['public']['Tables']['company_settings']['Insert']>
        Relationships: []
      }
      categories: {
        Row: { id: string; name: string; is_active: boolean } & Timestamps
        Insert: { id?: string; name: string; is_active?: boolean }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
        Relationships: []
      }
      products: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          image_path: string | null
          weight_grams: number | null
          price: number
          production_time_minutes: number
          is_active: boolean
        } & Timestamps
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          image_path?: string | null
          weight_grams?: number | null
          price: number
          production_time_minutes?: number
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['products']['Insert']>
        Relationships: []
      }
      ingredients: {
        Row: {
          id: string
          name: string
          unit: MeasurementUnit
          minimum_quantity: number
          supplier: string | null
          is_active: boolean
        } & Timestamps
        Insert: {
          id?: string
          name: string
          unit: MeasurementUnit
          minimum_quantity?: number
          supplier?: string | null
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['ingredients']['Insert']>
        Relationships: []
      }
      stock: {
        Row: {
          id: string
          ingredient_id: string
          current_quantity: number
        } & Timestamps
        Insert: {
          id?: string
          ingredient_id: string
          current_quantity?: number
        }
        Update: Partial<Database['public']['Tables']['stock']['Insert']>
        Relationships: []
      }
      recipes: {
        Row: {
          id: string
          product_id: string
          yield_quantity: number
          instructions: string | null
        } & Timestamps
        Insert: {
          id?: string
          product_id: string
          yield_quantity?: number
          instructions?: string | null
        }
        Update: Partial<Database['public']['Tables']['recipes']['Insert']>
        Relationships: []
      }
      recipe_items: {
        Row: {
          id: string
          recipe_id: string
          ingredient_id: string
          quantity: number
        } & Timestamps
        Insert: {
          id?: string
          recipe_id: string
          ingredient_id: string
          quantity: number
        }
        Update: Partial<Database['public']['Tables']['recipe_items']['Insert']>
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          full_name: string
          phone: string
          email: string | null
          birth_date: string | null
          address: Json
          loyalty_tier: LoyaltyTier
          is_active: boolean
        } & Timestamps
        Insert: {
          id?: string
          full_name: string
          phone: string
          email?: string | null
          birth_date?: string | null
          address?: Json
          loyalty_tier?: LoyaltyTier
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
        Relationships: []
      }
      coupons: {
        Row: {
          id: string
          code: string
          discount_percent: number
          valid_until: string
          usage_limit: number | null
          usage_count: number
          is_active: boolean
        } & Timestamps
        Insert: {
          id?: string
          code: string
          discount_percent: number
          valid_until: string
          usage_limit?: number | null
          usage_count?: number
          is_active?: boolean
        }
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          client_id: string
          coupon_id: string | null
          created_by: string
          status: OrderStatus
          payment_method: PaymentMethod
          delivery_type: DeliveryType
          scheduled_for: string
          notes: string | null
          subtotal: number
          discount_amount: number
          delivery_fee: number
          total: number
          confirmed_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
        } & Timestamps
        Insert: {
          id?: string
          client_id: string
          coupon_id?: string | null
          created_by?: string
          status?: OrderStatus
          payment_method: PaymentMethod
          delivery_type: DeliveryType
          scheduled_for: string
          notes?: string | null
          subtotal?: number
          discount_amount?: number
          delivery_fee?: number
          total?: number
        }
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total: number
          notes: string | null
        } & Timestamps
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
        Relationships: []
      }
      production: {
        Row: {
          id: string
          order_id: string | null
          status: ProductionStatus
          scheduled_for: string
          started_at: string | null
          completed_at: string | null
          completed_by: string | null
        } & Timestamps
        Insert: {
          id?: string
          order_id?: string | null
          status?: ProductionStatus
          scheduled_for: string
          started_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
        }
        Update: Partial<Database['public']['Tables']['production']['Insert']>
        Relationships: []
      }
      production_items: {
        Row: {
          id: string
          production_id: string
          product_id: string
          planned_quantity: number
          produced_quantity: number
        } & Timestamps
        Insert: {
          id?: string
          production_id: string
          product_id: string
          planned_quantity: number
          produced_quantity?: number
        }
        Update: Partial<Database['public']['Tables']['production_items']['Insert']>
        Relationships: []
      }
      stock_movements: {
        Row: {
          id: string
          ingredient_id: string
          production_id: string | null
          movement_type: StockMovementType
          quantity: number
          reason: string
          created_by: string
        } & Timestamps
        Insert: {
          id?: string
          ingredient_id: string
          production_id?: string | null
          movement_type: StockMovementType
          quantity: number
          reason: string
          created_by?: string
        }
        Update: Partial<Database['public']['Tables']['stock_movements']['Insert']>
        Relationships: []
      }
      deliveries: {
        Row: {
          id: string
          courier_id: string | null
          status: DeliveryStatus
          scheduled_for: string
          started_at: string | null
          completed_at: string | null
          notes: string | null
        } & Timestamps
        Insert: {
          id?: string
          courier_id?: string | null
          status?: DeliveryStatus
          scheduled_for: string
          started_at?: string | null
          completed_at?: string | null
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['deliveries']['Insert']>
        Relationships: []
      }
      delivery_items: {
        Row: {
          id: string
          delivery_id: string
          order_id: string
          stop_order: number
        } & Timestamps
        Insert: {
          id?: string
          delivery_id: string
          order_id: string
          stop_order: number
        }
        Update: Partial<Database['public']['Tables']['delivery_items']['Insert']>
        Relationships: []
      }
      expenses: {
        Row: {
          id: string
          description: string
          category: string
          amount: number
          occurred_on: string
          created_by: string
        } & Timestamps
        Insert: {
          id?: string
          description: string
          category: string
          amount: number
          occurred_on: string
          created_by?: string
        }
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          title: string
          message: string
          kind: string
          read_at: string | null
        } & Timestamps
        Insert: {
          id?: string
          user_id?: string | null
          title: string
          message: string
          kind: string
          read_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
        Relationships: []
      }
    }
    Views: {
      low_stock_view: {
        Row: {
          ingredient_id: string
          name: string
          unit: MeasurementUnit
          minimum_quantity: number
          current_quantity: number
          supplier: string | null
        }
      }
      shopping_list_view: {
        Row: {
          ingredient_id: string
          name: string
          unit: MeasurementUnit
          minimum_quantity: number
          current_quantity: number
          quantity_to_buy: number
          supplier: string | null
        }
      }
    }
    Functions: {
      confirm_order: { Args: { p_order_id: string }; Returns: undefined }
      complete_production: { Args: { p_production_id: string }; Returns: undefined }
      cancel_order: { Args: { p_order_id: string }; Returns: undefined }
      update_order_status: {
        Args: { p_order_id: string; p_status: OrderStatus }
        Returns: undefined
      }
      dashboard_metrics: { Args: Record<string, never>; Returns: Json }
      admin_update_profile: {
        Args: {
          target_user_id: string
          new_role: EmployeeRole
          new_is_active: boolean
        }
        Returns: undefined
      }
      current_user_role: { Args: Record<string, never>; Returns: EmployeeRole }
    }
    Enums: {
      employee_role: EmployeeRole
      order_status: OrderStatus
      delivery_status: DeliveryStatus
      production_status: ProductionStatus
      delivery_type: DeliveryType
      payment_method: PaymentMethod
      stock_movement_type: StockMovementType
      loyalty_tier: LoyaltyTier
      measurement_unit: MeasurementUnit
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Ingredient = Database['public']['Tables']['ingredients']['Row']
export type Stock = Database['public']['Tables']['stock']['Row']
export type Recipe = Database['public']['Tables']['recipes']['Row']
export type RecipeItem = Database['public']['Tables']['recipe_items']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Coupon = Database['public']['Tables']['coupons']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Production = Database['public']['Tables']['production']['Row']
export type ProductionItem = Database['public']['Tables']['production_items']['Row']
export type StockMovement = Database['public']['Tables']['stock_movements']['Row']
export type Delivery = Database['public']['Tables']['deliveries']['Row']
export type DeliveryItem = Database['public']['Tables']['delivery_items']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type CompanySettings = Database['public']['Tables']['company_settings']['Row']
export type LowStockItem = Database['public']['Views']['low_stock_view']['Row']
export type ShoppingListItem = Database['public']['Views']['shopping_list_view']['Row']

export type DashboardPeriod = 'day' | 'week' | 'month' | 'year'

export interface DashboardSalesPoint {
  key: string
  label: string
  total: number
}

export interface DashboardMetrics {
  period: DashboardPeriod
  orders_count: number
  production_pending: number
  cookies_sold: number
  revenue: number
  clients_count: number
  low_stock_count: number
  sales_series: DashboardSalesPoint[]
  production_today: Array<{ product_id: string; product_name: string; quantity: number }>
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  position: number
  created_by: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export type TaskWithAssignee = Task & {
  assignee: Pick<Profile, 'id' | 'full_name'> | null
}

export type ProductWithCategory = Product & { categories: Pick<Category, 'id' | 'name'> | null }
export type IngredientWithStock = Ingredient & { stock: Pick<Stock, 'current_quantity'> | null }
export type OrderWithRelations = Order & {
  clients: Pick<Client, 'id' | 'full_name' | 'phone'> | null
  order_items: Array<OrderItem & { products: Pick<Product, 'id' | 'name'> | null }>
}
