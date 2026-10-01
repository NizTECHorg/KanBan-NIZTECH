import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Filter, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CardModal } from '@/components/kanban/CardModal'
import { KanbanList } from '@/components/kanban/KanbanList'
import { ListComposer } from '@/components/kanban/ListComposer'
import { ProjectModal } from '@/components/kanban/ProjectModal'
import {
  useBoard,
  useCreateCard,
  useCreateList,
  useDeleteCard,
  useDeleteList,
  useDeleteProject,
  useMoveCards,
  useRenameList,
  useReorderLists,
  useSetCardCompleted,
  useUpdateCard,
  useUpdateProject,
} from '@/hooks/kanban'
import type { CardFormData, ProjectFormData } from '@/schemas/kanban.schema'
import type { CardWithAssignee, DragState } from '@/types/kanban'
import {
  BOARD_ASSIGNEES,
  CARD_LABELS,
  LABEL_RANK,
  dueUrgency,
  getAssignee,
  isDoingListTitle,
  isDoneListTitle,
} from '@/config/kanban'

export function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useBoard(projectId)

  const createList = useCreateList(projectId ?? '')
  const renameList = useRenameList(projectId ?? '')
  const deleteList = useDeleteList(projectId ?? '')
  const reorderLists = useReorderLists(projectId ?? '')
  const createCard = useCreateCard(projectId ?? '')
  const updateCard = useUpdateCard(projectId ?? '')
  const deleteCard = useDeleteCard(projectId ?? '')
  const moveCards = useMoveCards(projectId ?? '')
  const updateProject = useUpdateProject(projectId ?? '')
  const removeProject = useDeleteProject()
  const setCompleted = useSetCardCompleted(projectId ?? '')

  const [drag, setDrag] = useState<DragState>(null)
  const [dropListId, setDropListId] = useState<string | null>(null)
  const [dropCardId, setDropCardId] = useState<string | null>(null)
  const [openCard, setOpenCard] = useState<CardWithAssignee | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editProject, setEditProject] = useState(false)
  const [deleteListId, setDeleteListId] = useState<string | null>(null)
  const [deleteProjectOpen, setDeleteProjectOpen] = useState(false)
  const [confirmDeleteCard, setConfirmDeleteCard] = useState(false)
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [labelFilter, setLabelFilter] = useState('')
  const ignoreClick = useRef(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onPointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [menuOpen])

  const lists = useMemo(
    () => [...(data?.lists ?? [])].sort((a, b) => a.position - b.position),
    [data?.lists],
  )
  const cards = data?.cards ?? []

  useEffect(() => {
    setAssigneeFilter('')
    setLabelFilter('')
    setMenuOpen(false)
    setOpenCard(null)
    setEditProject(false)
    setDeleteProjectOpen(false)
  }, [projectId])

  function cardsOf(listId: string) {
    return cards
      .filter((card) => card.list_id === listId)
      .sort((a, b) => {
        const rankA = LABEL_RANK[a.labels[0] ?? ''] ?? 99
        const rankB = LABEL_RANK[b.labels[0] ?? ''] ?? 99
        if (rankA !== rankB) return rankA - rankB
        const reqA = Number(a.title.match(/^REQ-(\d+)/)?.[1] ?? 999)
        const reqB = Number(b.title.match(/^REQ-(\d+)/)?.[1] ?? 999)
        return reqA - reqB || a.position - b.position || a.created_at.localeCompare(b.created_at)
      })
  }

  function visibleCardsOf(listId: string) {
    return cardsOf(listId).filter((card) => {
      if (assigneeFilter === 'none' && card.assigned_to) return false
      if (assigneeFilter && assigneeFilter !== 'none' && card.assigned_to !== assigneeFilter) return false
      if (labelFilter && !card.labels.includes(labelFilter)) return false
      return true
    })
  }

  const filtersActive = Boolean(assigneeFilter || labelFilter)

  function clearDrag() {
    setDrag(null)
    setDropListId(null)
    setDropCardId(null)
  }

  function applyCardMove(cardId: string, targetListId: string, targetIndex: number) {
    const card = cards.find((item) => item.id === cardId)
    if (!card) return

    const sourceListId = card.list_id
    const sourceCardsAll = cardsOf(sourceListId)
    const fromIndex = sourceCardsAll.findIndex((item) => item.id === cardId)
    const sourceCards = sourceCardsAll.filter((item) => item.id !== cardId)
    const destCards =
      sourceListId === targetListId ? [...sourceCards] : cardsOf(targetListId).filter((item) => item.id !== cardId)

    let index = Math.max(0, Math.min(targetIndex, destCards.length))
    if (sourceListId === targetListId && fromIndex >= 0 && fromIndex < targetIndex) {
      index = Math.max(0, targetIndex - 1)
      index = Math.min(index, destCards.length)
    }
    destCards.splice(index, 0, { ...card, list_id: targetListId })

    const samePlace =
      sourceListId === targetListId && cardsOf(sourceListId).findIndex((item) => item.id === cardId) === index
    if (samePlace) return

    const updates = destCards.map((item, position) => ({
      id: item.id,
      list_id: targetListId,
      position,
    }))
    if (sourceListId !== targetListId) {
      updates.push(
        ...sourceCards.map((item, position) => ({
          id: item.id,
          list_id: sourceListId,
          position,
        })),
      )
    }
    moveCards.mutate(updates)
  }

  function applyListMove(listId: string, targetIndex: number) {
    const from = lists.findIndex((list) => list.id === listId)
    if (from < 0 || from === targetIndex) return
    const next = [...lists]
    const moved = next.splice(from, 1)[0]
    if (!moved) return
    next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, moved)
    reorderLists.mutate(next.map((list, position) => ({ id: list.id, position })))
  }

  async function handleSaveCard(form: CardFormData) {
    if (!openCard) return
    await updateCard.mutateAsync({ id: openCard.id, form })
    const assignee = getAssignee(form.assigned_to)
    setOpenCard({
      ...openCard,
      title: form.title,
      description: form.description || null,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to || null,
      labels: form.labels,
      assignee: assignee ? { id: assignee.id, name: assignee.name } : null,
    })
  }

  async function handleSaveProject(form: ProjectFormData) {
    await updateProject.mutateAsync(form)
    setEditProject(false)
  }

  async function handleToggleComplete(card: CardWithAssignee) {
    const nextCompleted = !card.completed
    const urgency = dueUrgency(card.due_date)
    const deadlineClose = urgency === 'soon' || urgency === 'overdue'
    const doneList = lists.find((list) => isDoneListTitle(list.title))
    const doingList = lists.find((list) => isDoingListTitle(list.title))

    let move: { list_id: string; position: number } | undefined
    if (nextCompleted && deadlineClose && doneList && card.list_id !== doneList.id) {
      move = { list_id: doneList.id, position: cardsOf(doneList.id).length }
    }
    if (!nextCompleted && doneList && card.list_id === doneList.id && doingList) {
      move = { list_id: doingList.id, position: cardsOf(doingList.id).length }
    }

    await setCompleted.mutateAsync({ id: card.id, completed: nextCompleted, move })
    setOpenCard((current) =>
      current?.id === card.id
        ? {
            ...current,
            completed: nextCompleted,
            list_id: move?.list_id ?? current.list_id,
            position: move?.position ?? current.position,
          }
        : current,
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="text-xl font-semibold">Quadro não encontrado</h1>
        <p className="mt-2 text-sm text-cream/45">
          {error instanceof Error ? error.message : 'Este projeto não existe ou foi removido.'}
        </p>
        <Link to="/projetos" className="mt-6 inline-flex items-center gap-2 text-sm text-caramel hover:text-caramel/80">
          <ArrowLeft size={16} />
          Voltar aos quadros
        </Link>
      </div>
    )
  }

  return (
    <div
      className="board-scene relative flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden"
      style={{ ['--board-color' as string]: data.project.color }}
    >
      <div className="board-scene__wash pointer-events-none absolute inset-0" />
      <div className="board-scene__glow board-scene__glow--a pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full" />
      <div className="board-scene__glow board-scene__glow--b pointer-events-none absolute -right-16 top-10 h-80 w-80 rounded-full" />
      <div className="board-scene__grain pointer-events-none absolute inset-0" />
      <div className="relative z-30 flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/projetos"
            className="rounded-lg p-2 text-white/80 transition hover:bg-black/20 hover:text-white lg:hidden"
            aria-label="Voltar aos quadros"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="board-title-glow truncate text-lg font-semibold text-white">
            {data.project.name}
          </h1>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Filter size={14} className="shrink-0 text-white/55" />
            <label className="sr-only" htmlFor="filter-assignee">
              Responsável
            </label>
            <select
              id="filter-assignee"
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
              className="board-filter-select max-w-[9.5rem] rounded-lg border border-white/15 py-1.5 pl-2.5 pr-8 text-xs text-white backdrop-blur-md outline-none hover:border-white/30"
            >
              <option value="">Todos os responsáveis</option>
              {BOARD_ASSIGNEES.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
              <option value="none">Sem responsável</option>
            </select>
            <label className="sr-only" htmlFor="filter-label">
              Prioridade
            </label>
            <select
              id="filter-label"
              value={labelFilter}
              onChange={(event) => setLabelFilter(event.target.value)}
              className="board-filter-select max-w-[9.5rem] rounded-lg border border-white/15 py-1.5 pl-2.5 pr-8 text-xs text-white backdrop-blur-md outline-none hover:border-white/30"
            >
              <option value="">Todas as prioridades</option>
              {CARD_LABELS.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>
            {filtersActive && (
              <button
                type="button"
                onClick={() => {
                  setAssigneeFilter('')
                  setLabelFilter('')
                }}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-white/70 hover:bg-black/20 hover:text-white"
                title="Limpar filtros"
              >
                <X size={12} />
                Limpar
              </button>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Menu do quadro"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg bg-black/20 p-2 text-white/85 hover:bg-black/30"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-dark-border bg-dark-surface shadow-xl"
                onPointerDown={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setEditProject(true)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-cream/80 hover:bg-white/5"
                >
                  <Pencil size={14} />
                  Editar quadro
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setDeleteProjectOpen(true)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-error hover:bg-error/10"
                >
                  <Trash2 size={14} />
                  Excluir quadro
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 gap-3 overflow-x-auto px-4 pb-4">
        {lists.map((list, listIndex) => (
          <KanbanList
            key={list.id}
            list={list}
            cards={visibleCardsOf(list.id)}
            drag={drag}
            dropListId={dropListId}
            dropCardId={dropCardId}
            isCreatingCard={createCard.isPending}
            onDragStart={(state) => {
              setDrag(state)
            }}
            onDragEnd={() => {
              ignoreClick.current = true
              clearDrag()
              requestAnimationFrame(() => {
                ignoreClick.current = false
              })
            }}
            onListDragOver={() => {
              setDropListId(list.id)
              setDropCardId(null)
            }}
            onDropOnList={() => {
              if (!drag) return
              if (drag.kind === 'card') {
                applyCardMove(drag.id, list.id, cardsOf(list.id).length)
              } else {
                applyListMove(drag.id, listIndex)
              }
              clearDrag()
            }}
            onDropOnCard={(cardId) => {
              if (drag?.kind !== 'card') return
              const target = cards.find((item) => item.id === cardId)
              if (!target) return
              const index = cardsOf(target.list_id).findIndex((item) => item.id === cardId)
              applyCardMove(drag.id, target.list_id, index)
              clearDrag()
            }}
            onCardDragOver={(cardId) => {
              setDropListId(null)
              setDropCardId(cardId)
            }}
            onRename={async (title) => {
              await renameList.mutateAsync({ id: list.id, title })
            }}
            onDelete={() => setDeleteListId(list.id)}
            onAddCard={async (title) => {
              await createCard.mutateAsync({ listId: list.id, title })
            }}
            onOpenCard={(card) => {
              if (ignoreClick.current) {
                ignoreClick.current = false
                return
              }
              setOpenCard(card)
            }}
            onToggleComplete={(card) => {
              void handleToggleComplete(card)
            }}
          />
        ))}
        <ListComposer
          isSaving={createList.isPending}
          onSubmit={async (title) => {
            await createList.mutateAsync(title)
          }}
        />
      </div>

      <CardModal
        open={!!openCard}
        card={openCard}
        projectId={data.project.id}
        isSaving={updateCard.isPending}
        isDeleting={deleteCard.isPending}
        onClose={() => setOpenCard(null)}
        onSave={handleSaveCard}
        onDelete={() => setConfirmDeleteCard(true)}
        onNoteChanged={(next) => {
          setOpenCard((current) => (current ? { ...current, ...next } : current))
        }}
      />

      <ProjectModal
        open={editProject}
        project={data.project}
        isSaving={updateProject.isPending}
        onClose={() => setEditProject(false)}
        onSubmit={handleSaveProject}
      />

      <ConfirmDialog
        open={!!deleteListId}
        title="Excluir lista"
        description="Todos os cartões desta lista serão removidos."
        confirmLabel="Excluir"
        tone="danger"
        isLoading={deleteList.isPending}
        onClose={() => setDeleteListId(null)}
        onConfirm={async () => {
          if (!deleteListId) return
          await deleteList.mutateAsync(deleteListId)
          setDeleteListId(null)
        }}
      />

      <ConfirmDialog
        open={confirmDeleteCard}
        title="Excluir cartão"
        description="Este cartão será removido do quadro."
        confirmLabel="Excluir"
        tone="danger"
        isLoading={deleteCard.isPending}
        onClose={() => setConfirmDeleteCard(false)}
        onConfirm={async () => {
          if (!openCard) return
          await deleteCard.mutateAsync(openCard.id)
          setConfirmDeleteCard(false)
          setOpenCard(null)
        }}
      />

      <ConfirmDialog
        open={deleteProjectOpen}
        title="Excluir quadro"
        description="O projeto, as listas e os cartões serão removidos. Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        tone="danger"
        isLoading={removeProject.isPending}
        onClose={() => setDeleteProjectOpen(false)}
        onConfirm={async () => {
          await removeProject.mutateAsync(data.project.id)
          navigate('/projetos', { replace: true })
        }}
      />
    </div>
  )
}
