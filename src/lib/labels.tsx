import { Badge } from '@/components/ui/Badge'
import type { OrderStatus, ProductionStatus, DeliveryStatus, LoyaltyTier } from '@/types/database.types'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; tone: 'muted' | 'caramel' | 'info' | 'success' | 'error' }> = {
    novo: { label: 'Novo', tone: 'info' },
    producao: { label: 'Produção', tone: 'caramel' },
    pronto: { label: 'Pronto', tone: 'success' },
    saiu_para_entrega: { label: 'Saiu p/ entrega', tone: 'info' },
    entregue: { label: 'Entregue', tone: 'success' },
    cancelado: { label: 'Cancelado', tone: 'error' },
  }
  const item = map[status]
  return <Badge tone={item.tone}>{item.label}</Badge>
}

export function ProductionStatusBadge({ status }: { status: ProductionStatus }) {
  const map: Record<ProductionStatus, { label: string; tone: 'muted' | 'caramel' | 'success' | 'error' }> = {
    pendente: { label: 'Pendente', tone: 'caramel' },
    em_producao: { label: 'Em produção', tone: 'caramel' },
    concluida: { label: 'Concluída', tone: 'success' },
    cancelada: { label: 'Cancelada', tone: 'error' },
  }
  const item = map[status]
  return <Badge tone={item.tone}>{item.label}</Badge>
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const map: Record<DeliveryStatus, { label: string; tone: 'muted' | 'caramel' | 'success' }> = {
    aguardando: { label: 'Aguardando', tone: 'muted' },
    em_rota: { label: 'Em rota', tone: 'caramel' },
    entregue: { label: 'Entregue', tone: 'success' },
  }
  const item = map[status]
  return <Badge tone={item.tone}>{item.label}</Badge>
}

export function LoyaltyBadge({ tier }: { tier: LoyaltyTier }) {
  const labels: Record<LoyaltyTier, string> = {
    bronze: 'Bronze',
    prata: 'Prata',
    ouro: 'Ouro',
    diamante: 'Diamante',
  }
  return <Badge tone="caramel">{labels[tier]}</Badge>
}
