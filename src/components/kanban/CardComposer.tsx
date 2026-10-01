import { useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'

interface CardComposerProps {
  isSaving?: boolean
  onSubmit: (title: string) => Promise<void>
}

export function CardComposer({ isSaving, onSubmit }: CardComposerProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  async function submit() {
    const value = title.trim()
    if (!value || isSaving) return
    await onSubmit(value)
    setTitle('')
    inputRef.current?.focus()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-cream/50 transition hover:bg-white/5 hover:text-cream"
      >
        <Plus size={15} />
        Adicionar um cartão
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={inputRef}
        rows={3}
        value={title}
        placeholder="Título do cartão"
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            void submit()
          }
          if (event.key === 'Escape') {
            setOpen(false)
            setTitle('')
          }
        }}
        className="w-full resize-none rounded-lg border border-dark-border bg-dark px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-caramel focus:outline-none focus:ring-1 focus:ring-caramel/40"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isSaving || !title.trim()}
          onClick={() => void submit()}
          className="rounded-md bg-caramel px-3 py-1.5 text-sm font-medium text-dark hover:bg-caramel/90 disabled:opacity-50"
        >
          Adicionar cartão
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setTitle('')
          }}
          className="rounded-md p-1.5 text-cream/50 hover:bg-white/5 hover:text-cream"
          aria-label="Cancelar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
