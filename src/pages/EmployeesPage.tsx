import { useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { useAdminUpdateProfile, useEmployees } from '@/hooks/queries'
import { isAdmin } from '@/lib/permissions'
import type { EmployeeRole, Profile } from '@/types/database.types'

const roleOptions = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'atendente', label: 'Atendente' },
  { value: 'confeiteiro', label: 'Confeiteiro' },
  { value: 'entregador', label: 'Entregador' },
]

export function EmployeesPage() {
  const { profile } = useAuth()
  const admin = isAdmin(profile?.role)
  const { data = [], isLoading } = useEmployees()
  const update = useAdminUpdateProfile()
  const [editing, setEditing] = useState<Pick<Profile, 'id' | 'full_name' | 'role' | 'is_active'> | null>(null)
  const [role, setRole] = useState<EmployeeRole>('atendente')
  const [isActive, setIsActive] = useState(true)

  function openEdit(row: (typeof data)[number]) {
    setEditing(row)
    setRole(row.role)
    setIsActive(row.is_active)
  }

  async function save() {
    if (!editing) return
    await update.mutateAsync({ userId: editing.id, role, isActive })
    setEditing(null)
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        title="Funcionários"
        description="Papéis e permissões seguindo o princípio do menor privilégio."
      />

      {!admin && (
        <p className="mb-4 rounded-lg border border-caramel/20 bg-caramel/10 px-4 py-3 text-sm text-caramel">
          Apenas administradores podem alterar papéis. Você pode visualizar a equipe.
        </p>
      )}

      <DataTable
        isLoading={isLoading}
        data={data}
        rowKey={(row) => row.id}
        emptyTitle="Nenhum funcionário"
        emptyDescription="Usuários cadastrados aparecerão aqui."
        columns={[
          {
            key: 'name',
            header: 'Nome',
            render: (row) => (
              <div>
                <p className="font-medium">{row.full_name}</p>
                <p className="text-xs text-cream/35">{row.email}</p>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Papel',
            render: (row) => roleOptions.find((r) => r.value === row.role)?.label ?? row.role,
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <Badge tone={row.is_active ? 'success' : 'error'}>
                {row.is_active ? 'Ativo' : 'Inativo'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (row) =>
              admin ? (
                <Button variant="ghost" onClick={() => openEdit(row)}>
                  Gerenciar
                </Button>
              ) : null,
          },
        ]}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Gerenciar ${editing?.full_name ?? ''}`}>
        <div className="space-y-4">
          <Select
            label="Papel"
            options={roleOptions}
            value={role}
            onChange={(e) => setRole(e.target.value as EmployeeRole)}
          />
          <label className="flex items-center gap-2 text-sm text-cream/70">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-caramel"
            />
            Conta ativa
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={() => void save()} isLoading={update.isPending}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}
