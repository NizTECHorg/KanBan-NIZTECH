import { Calendar, Check, StickyNote, UserRound } from 'lucide-react'
import { dueUrgency, getCardLabel } from '@/config/kanban'
import { noteImagePathsOf } from '@/types/kanban'
import type { CardWithAssignee, DragState } from '@/types/kanban'

function formatDueDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day))
}

interface KanbanCardProps {
  card: CardWithAssignee
  dragging: boolean
  dropTarget: boolean
  onDragStart: (state: DragState) => void
  onDragEnd: () => void
  onDragOverCard: () => void
  onDropBefore: () => void
  onOpen: () => void
  onToggleComplete: () => void
}

export function KanbanCard({
  card,
  dragging,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDragOverCard,
  onDropBefore,
  onOpen,
  onToggleComplete,
}: KanbanCardProps) {
  const urgency = dueUrgency(card.due_date)
  const approaching = !card.completed && (urgency === 'soon' || urgency === 'overdue')
  const hasNote = Boolean(card.note || noteImagePathsOf(card).length)

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.stopPropagation()
        event.dataTransfer.effectAllowed = 'move'
        onDragStart({ kind: 'card', id: card.id, listId: card.list_id })
      }}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDragOverCard()
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDropBefore()
      }}
      onClick={onOpen}
      className={[
        'cursor-grab rounded-lg border bg-black/45 p-3 shadow-sm',
        'transition hover:border-white/20 hover:bg-black/55 active:cursor-grabbing',
        approaching ? 'border-amber-400/50' : 'border-white/10',
        dragging ? 'opacity-40' : '',
        dropTarget ? 'ring-2 ring-caramel/50' : '',
        card.completed ? 'opacity-75' : '',
      ].join(' ')}
    >
      {card.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {card.labels.map((labelId) => {
            const label = getCardLabel(labelId)
            if (!label) return null
            return (
              <span
                key={labelId}
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${label.className}`}
              >
                {label.name}
              </span>
            )
          })}
        </div>
      )}
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-pressed={card.completed}
          aria-label={card.completed ? 'Desmarcar concluído' : 'Marcar concluído'}
          title={card.completed ? 'Concluído' : approaching ? 'Prazo perto — marcar concluído' : 'Marcar concluído'}
          onClick={(event) => {
            event.stopPropagation()
            onToggleComplete()
          }}
          className={[
            'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition',
            card.completed
              ? 'border-emerald-400 bg-emerald-500 text-white'
              : approaching
                ? 'border-amber-300/70 bg-zinc-500/25 text-transparent hover:border-amber-200'
                : 'border-white/15 bg-zinc-500/25 text-transparent hover:border-white/30',
          ].join(' ')}
        >
          <Check size={12} strokeWidth={3} className={card.completed ? 'opacity-100' : 'opacity-0'} />
        </button>
        <p
          className={[
            'text-[15px] leading-snug',
            card.completed ? 'text-cream/45 line-through' : 'text-cream/70',
          ].join(' ')}
        >
          {card.title}
        </p>
      </div>
      {(card.due_date || card.assignee || hasNote) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-cream/45">
          {card.due_date && (
            <span
              className={[
                'inline-flex items-center gap-1',
                approaching ? 'font-medium text-amber-300' : '',
              ].join(' ')}
            >
              <Calendar size={11} />
              {formatDueDate(card.due_date)}
              {urgency === 'overdue' && !card.completed ? ' · atrasado' : ''}
              {urgency === 'soon' && !card.completed ? ' · prazo perto' : ''}
            </span>
          )}
          {card.assignee && (
            <span className="inline-flex items-center gap-1">
              <UserRound size={11} />
              {card.assignee.name}
            </span>
          )}
          {hasNote && (
            <span className="inline-flex items-center gap-1" title="Tem nota">
              <StickyNote size={11} />
              Nota
            </span>
          )}
        </div>
      )}
    </article>
  )
}
