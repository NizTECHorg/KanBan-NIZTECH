import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, GripVertical, Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { taskSchema, type TaskFormData } from '@/schemas/modules.schema'
import {
  useDeleteTask,
  useEmployees,
  useMoveTask,
  useTasks,
  useUpsertTask,
} from '@/hooks/queries'
import { formatDate } from '@/lib/security'
import type { TaskPriority, TaskStatus, TaskWithAssignee } from '@/types/database.types'

const COLUMNS: Array<{ id: TaskStatus; title: string; accent: string }> = [
  { id: 'a_fazer', title: 'A fazer', accent: 'border-t-cream/30' },
  { id: 'em_andamento', title: 'Em andamento', accent: 'border-t-caramel' },
  { id: 'concluida', title: 'Concluída', accent: 'border-t-success' },
]

const PRIORITY_TONE: Record<TaskPriority, 'muted' | 'info' | 'error'> = {
  baixa: 'muted',
  media: 'info',
  alta: 'error',
}

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}

export function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks()
  const { data: employees = [] } = useEmployees()
  const upsert = useUpsertTask()
  const move = useMoveTask()
  const remove = useDeleteTask()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TaskWithAssignee | null>(null)
  const [createStatus, setCreateStatus] = useState<TaskStatus>('a_fazer')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null)

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'media',
      due_date: '',
      assigned_to: '',
    },
  })

  useEffect(() => {
    if (editing) {
      form.reset({
        title: editing.title,
        description: editing.description ?? '',
        priority: editing.priority,
        due_date: editing.due_date ?? '',
        assigned_to: editing.assigned_to ?? '',
      })
    } else {
      form.reset({
        title: '',
        description: '',
        priority: 'media',
        due_date: '',
        assigned_to: '',
      })
    }
  }, [editing, form])

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, TaskWithAssignee[]> = {
      a_fazer: [],
      em_andamento: [],
      concluida: [],
    }
    for (const task of tasks) {
      map[task.status].push(task)
    }
    for (const key of Object.keys(map) as TaskStatus[]) {
      map[key].sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at))
    }
    return map
  }, [tasks])

  function openCreate(status: TaskStatus) {
    setEditing(null)
    setCreateStatus(status)
    setOpen(true)
  }

  function openEdit(task: TaskWithAssignee) {
    setEditing(task)
    setCreateStatus(task.status)
    setOpen(true)
  }

  async function onSubmit(values: TaskFormData) {
    await upsert.mutateAsync({
      id: editing?.id ?? null,
      form: values,
      status: editing ? undefined : createStatus,
    })
    setOpen(false)
    setEditing(null)
  }

  async function handleDrop(status: TaskStatus) {
    setDropTarget(null)
    if (!draggingId) return
    const task = tasks.find((t) => t.id === draggingId)
    setDraggingId(null)
    if (!task || task.status === status) return
    const position = byStatus[status].length
    await move.mutateAsync({ id: task.id, status, position })
  }

  return (
    <section className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Tarefas"
        description="Quadro interno para organizar demandas futuras da equipe — como um Trello."
        action={
          <Button onClick={() => openCreate('a_fazer')}>
            <Plus size={17} /> Nova tarefa
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((column) => (
            <div
              key={column.id}
              onDragOver={(e) => {
                e.preventDefault()
                setDropTarget(column.id)
              }}
              onDragLeave={() => setDropTarget((cur) => (cur === column.id ? null : cur))}
              onDrop={(e) => {
                e.preventDefault()
                void handleDrop(column.id)
              }}
              className={[
                'flex min-h-[28rem] flex-col rounded-xl border border-dark-border bg-dark-surface/80',
                'border-t-2',
                column.accent,
                dropTarget === column.id ? 'ring-1 ring-caramel/40' : '',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2 border-b border-dark-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium text-cream/90">{column.title}</h2>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-cream/40">
                    {byStatus[column.id].length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openCreate(column.id)}
                  className="rounded-md p-1.5 text-cream/40 transition hover:bg-white/5 hover:text-caramel"
                  aria-label={`Adicionar em ${column.title}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {byStatus[column.id].length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-cream/30">
                    Arraste uma tarefa ou clique em +
                  </p>
                ) : (
                  byStatus[column.id].map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggingId(task.id)}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setDropTarget(null)
                      }}
                      className={[
                        'group cursor-grab rounded-lg border border-dark-border bg-dark p-3',
                        'active:cursor-grabbing',
                        'transition hover:border-caramel/30',
                        draggingId === task.id ? 'opacity-50' : '',
                      ].join(' ')}
                    >
                      <div className="mb-2 flex items-start gap-2">
                        <GripVertical
                          size={14}
                          className="mt-0.5 shrink-0 text-cream/20 group-hover:text-cream/40"
                        />
                        <p className="flex-1 text-sm font-medium leading-snug text-cream/90">
                          {task.title}
                        </p>
                      </div>

                      {task.description && (
                        <p className="mb-3 line-clamp-2 pl-5 text-xs text-cream/40">
                          {task.description}
                        </p>
                      )}

                      <div className="mb-3 flex flex-wrap items-center gap-2 pl-5">
                        <Badge tone={PRIORITY_TONE[task.priority]}>
                          {PRIORITY_LABEL[task.priority]}
                        </Badge>
                        {task.due_date && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-cream/40">
                            <Calendar size={11} />
                            {formatDate(task.due_date)}
                          </span>
                        )}
                        {task.assignee && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-cream/40">
                            <UserRound size={11} />
                            {task.assignee.full_name.split(' ')[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEdit(task)}
                          className="rounded-md p-1.5 text-cream/40 hover:bg-white/5 hover:text-caramel"
                          aria-label="Editar tarefa"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(task.id)}
                          className="rounded-md p-1.5 text-cream/40 hover:bg-white/5 hover:text-error"
                          aria-label="Excluir tarefa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false)
          setEditing(null)
        }}
        title={editing ? 'Editar tarefa' : 'Nova tarefa'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Título"
            error={form.formState.errors.title?.message}
            {...form.register('title')}
          />
          <Textarea
            label="Descrição"
            error={form.formState.errors.description?.message}
            {...form.register('description')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Prioridade"
              options={[
                { value: 'baixa', label: 'Baixa' },
                { value: 'media', label: 'Média' },
                { value: 'alta', label: 'Alta' },
              ]}
              error={form.formState.errors.priority?.message}
              {...form.register('priority')}
            />
            <Input label="Prazo" type="date" {...form.register('due_date')} />
          </div>
          <Select
            label="Responsável"
            options={[
              { value: '', label: 'Ninguém' },
              ...employees
                .filter((e) => e.is_active)
                .map((e) => ({ value: e.id, label: e.full_name })),
            ]}
            {...form.register('assigned_to')}
          />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpen(false)
                setEditing(null)
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={upsert.isPending}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir tarefa"
        description="Esta ação remove a tarefa do quadro. Não pode ser desfeita."
        confirmLabel="Excluir"
        tone="danger"
        isLoading={remove.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return
          await remove.mutateAsync(deleteId)
          setDeleteId(null)
        }}
      />
    </section>
  )
}
