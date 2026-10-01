export function canManageCatalog(role?: string | null) {
  return role === 'administrador' || role === 'gerente'
}

export function canManageOrders(role?: string | null) {
  return role === 'administrador' || role === 'gerente' || role === 'atendente'
}

export function canManageProduction(role?: string | null) {
  return role === 'administrador' || role === 'gerente' || role === 'confeiteiro'
}

export function canManageFinance(role?: string | null) {
  return role === 'administrador' || role === 'gerente'
}

export function isAdmin(role?: string | null) {
  return role === 'administrador'
}
