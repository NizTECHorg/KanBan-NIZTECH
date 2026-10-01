import { useEffect, useRef, useState } from 'react'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import { CardComposer } from '@/components/kanban/CardComposer'
import { KanbanCard } from '@/components/kanban/KanbanCard'
import type { BoardList, CardWithAssignee, DragState } from '@/types/kanban'

interface KanbanListProps {
  list: BoardList
  cards: CardWithAssignee[]
  drag: DragState
  dropListId: string | null
  dropCardId: string | null
  isCreatingCard?: boolean
  onDragStart: (state: DragState) => void
  onDragEnd: () => void
  onListDragOver: () => void
  onDropOnList: () => void
  onDropOnCard: (cardId: string) => void
  onCardDragOver: (cardId: string) => void
  onRename: (title: string) => Promise<void>
  onDelete: () => void
  onAddCard: (title: string) => Promise<void>
  onOpenCard: (card: CardWithAssignee) => void
  onToggleComplete: (card: CardWithAssignee) => void
}

export function KanbanList({
  list,
  cards,
  drag,
  dropListId,
  dropCardId,
  isCreatingCard,
  onDragStart,
  onDragEnd,
  onListDragOver,
  onDropOnList,
  onDropOnCard,
  onCardDragOver,
  onRename,
  onDelete,
  onAddCard,
  onOpenCard,
  onToggleComplete,
}: KanbanListProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(list.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTitle(list.title)
  }, [list.title])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

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

  async function commitTitle() {
    const value = title.trim()
    setEditing(false)
    if (!value || value === list.title) {
      setTitle(list.title)
      return
    }
    await onRename(value)
  }

  const isListDrop = dropListId === list.id && drag?.kind === 'list'

  return (
    <section
      draggable={!editing}
      onDragStart={(event) => {
        if ((event.target as HTMLElement).closest('[data-card], button, input, textarea')) {
          event.preventDefault()
          return
        }
        event.dataTransfer.effectAllowed = 'move'
        onDragStart({ kind: 'list', id: list.id })
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault()
        onListDragOver()
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDropOnList()
      }}
      className={[
        'flex max-h-full w-[272px] shrink-0 flex-col rounded-xl',
        'border border-white/10 bg-black/30 shadow-lg backdrop-blur-xl backdrop-saturate-150',
        isListDrop ? 'ring-2 ring-caramel/40' : '',
      ].join(' ')}
    >
      <header className="flex items-start gap-1 px-2 py-2">
        {editing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => void commitTitle()}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void commitTitle()
              }
              if (event.key === 'Escape') {
                setTitle(list.title)
                setEditing(false)
              }
            }}
            className="w-full rounded-md border border-caramel bg-dark px-2 py-1 text-sm font-semibold text-cream focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex min-w-0 flex-1 cursor-text items-center gap-2 rounded-md px-2 py-1 text-left text-sm font-semibold text-cream/90 hover:bg-white/5"
          >
            <span className="truncate">{list.title}</span>
            <span className="shrink-0 text-xs font-medium text-cream/40">{cards.length}</span>
          </button>
        )}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Ações da lista"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-md p-1.5 text-cream/40 hover:bg-white/5 hover:text-cream"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-dark-border bg-dark-surface shadow-xl">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete()
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error hover:bg-error/10"
              >
                <Trash2 size={14} />
                Excluir lista
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-1">
        {cards.map((card) => (
          <div key={card.id} data-card>
            <KanbanCard
              card={card}
              dragging={drag?.kind === 'card' && drag.id === card.id}
              dropTarget={dropCardId === card.id}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragOverCard={() => onCardDragOver(card.id)}
              onDropBefore={() => onDropOnCard(card.id)}
              onOpen={() => {
                if (drag) return
                onOpenCard(card)
              }}
              onToggleComplete={() => onToggleComplete(card)}
            />
          </div>
        ))}
      </div>

      <div className="p-2">
        <CardComposer isSaving={isCreatingCard} onSubmit={onAddCard} />
      </div>
    </section>
  )
}
