import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Pencil, UserRound } from 'lucide-react'
import { CardNote } from '@/components/kanban/CardNote'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { BOARD_ASSIGNEES, CARD_LABELS, getCardLabel } from '@/config/kanban'
import { cardSchema, type CardFormData } from '@/schemas/kanban.schema'
import type { CardWithAssignee } from '@/types/kanban'

const SECTION_HEADING = /(Como funciona|Importância|Observações)(?=\s|[A-ZÀ-Ú]|$)/g

function formatDueDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day))
}

function parseCardSections(text: string) {
  const source = text.replace(/\r\n?/g, '\n')
  const matches = [...source.matchAll(SECTION_HEADING)]

  if (matches.length === 0) {
    const body = source.trim()
    return body ? [{ body }] : []
  }

  const sections: Array<{ title?: string; body: string }> = []
  const first = matches[0]
  if (first && first.index > 0) {
    const intro = source.slice(0, first.index).trim()
    if (intro) sections.push({ body: intro })
  }

  matches.forEach((match, index) => {
    const title = match[1]
    if (!title) return
    const start = (match.index ?? 0) + title.length
    const end = matches[index + 1]?.index ?? source.length
    sections.push({ title, body: source.slice(start, end).trim() })
  })

  return sections.filter((section) => section.title || section.body)
}

function CardDescription({ text }: { text: string }) {
  const sections = parseCardSections(text)

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <section key={`${section.title ?? 'body'}-${index}`}>
          {section.title && (
            <h3 className="mb-2 text-sm font-semibold text-cream/80">{section.title}</h3>
          )}
          {section.body ? (
            <p className="text-sm leading-7 text-cream/65">{section.body}</p>
          ) : null}
        </section>
      ))}
    </div>
  )
}

interface CardModalProps {
  open: boolean
  card: CardWithAssignee | null
  projectId: string
  isSaving?: boolean
  isDeleting?: boolean
  onClose: () => void
  onSave: (form: CardFormData) => Promise<void>
  onDelete: () => void
  onNoteChanged: (next: {
    note: string | null
    note_image_path: string | null
    note_image_paths: string[]
  }) => void
}

export function CardModal({
  open,
  card,
  projectId,
  isSaving,
  isDeleting,
  onClose,
  onSave,
  onDelete,
  onNoteChanged,
}: CardModalProps) {
  const [editing, setEditing] = useState(false)
  const form = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      title: '',
      description: '',
      due_date: '',
      assigned_to: '',
      labels: [],
    },
  })

  const selectedLabels = form.watch('labels') ?? []

  useEffect(() => {
    if (!open) {
      setEditing(false)
      return
    }
    if (!card) return
    form.reset({
      title: card.title,
      description: parseCardSections(card.description ?? '')
        .map((section) =>
          section.title ? `${section.title}\n${section.body}`.trim() : section.body,
        )
        .join('\n\n'),
      due_date: card.due_date ?? '',
      assigned_to: card.assigned_to ?? '',
      labels: card.labels ?? [],
    })
  }, [open, card, form])

  function toggleLabel(id: CardFormData['labels'][number]) {
    const current = form.getValues('labels') ?? []
    form.setValue(
      'labels',
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  if (!card) return null

  const visibleLabels = card.labels.map((id) => getCardLabel(id)).filter(Boolean)

  return (
    <Modal
      open={open}
      title={editing ? 'Editar cartão' : card.title}
      description={editing ? 'Atualize as informações deste requisito.' : undefined}
      titleClassName={
        editing
          ? undefined
          : 'text-xl font-semibold leading-snug text-cream/70'
      }
      wide={!editing}
      onClose={onClose}
      headerAction={
        !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg p-2 text-cream/40 hover:bg-white/5 hover:text-caramel"
            aria-label="Editar cartão"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
        ) : null
      }
    >
      {editing ? (
        <form
          onSubmit={form.handleSubmit(async (values) => {
            await onSave(values)
            setEditing(false)
          })}
          className="space-y-4"
          noValidate
        >
          <Input
            label="Título"
            error={form.formState.errors.title?.message}
            {...form.register('title')}
          />
          <Textarea
            label="Descrição"
            placeholder="Adicione uma descrição mais detalhada..."
            className="min-h-32"
            error={form.formState.errors.description?.message}
            {...form.register('description')}
          />
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-cream/90">Etiquetas</legend>
            <div className="flex flex-wrap gap-2">
              {CARD_LABELS.map((label) => {
                const active = selectedLabels.includes(label.id)
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    className={[
                      'rounded-md px-3 py-1.5 text-xs font-medium transition',
                      label.className,
                      active ? 'ring-2 ring-cream ring-offset-2 ring-offset-dark-surface' : 'opacity-55',
                    ].join(' ')}
                  >
                    {label.name}
                  </button>
                )
              })}
            </div>
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Prazo" type="date" {...form.register('due_date')} />
            <Select
              label="Responsável"
              options={[
                { value: '', label: 'Ninguém' },
                ...BOARD_ASSIGNEES.map((member) => ({ value: member.id, label: member.name })),
              ]}
              {...form.register('assigned_to')}
            />
          </div>
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="text-error hover:bg-error/10 hover:text-error"
              onClick={onDelete}
              disabled={isDeleting}
            >
              Excluir
            </Button>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Salvar
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {(visibleLabels.length > 0 || card.due_date || card.assignee) && (
            <div className="flex flex-wrap items-center gap-2">
              {visibleLabels.map((label) =>
                label ? (
                  <span
                    key={label.id}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${label.className}`}
                  >
                    {label.name}
                  </span>
                ) : null,
              )}
              {card.due_date && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-dark-border bg-dark px-2.5 py-1 text-[11px] text-cream/60">
                  <Calendar size={12} />
                  {formatDueDate(card.due_date)}
                </span>
              )}
              {card.assignee && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-dark-border bg-dark px-2.5 py-1 text-[11px] text-cream/60">
                  <UserRound size={12} />
                  {card.assignee.name}
                </span>
              )}
            </div>
          )}

          {card.description ? (
            <CardDescription text={card.description} />
          ) : (
            <p className="text-sm text-cream/35">Sem descrição neste cartão.</p>
          )}

          <CardNote
            key={card.id}
            projectId={projectId}
            cardId={card.id}
            note={card.note}
            imagePaths={card.note_image_paths ?? []}
            onChanged={onNoteChanged}
          />
        </div>
      )}
    </Modal>
  )
}
