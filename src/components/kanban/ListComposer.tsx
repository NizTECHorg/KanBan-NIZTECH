import { useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'

interface ListComposerProps {
  isSaving?: boolean
  onSubmit: (title: string) => Promise<void>
}

export function ListComposer({ isSaving, onSubmit }: ListComposerProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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
        className="flex h-fit min-w-[272px] items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-medium text-white/90 backdrop-blur-xl backdrop-saturate-150 transition hover:bg-black/35"
      >
        <Plus size={16} />
        Adicionar outra lista
      </button>
    )
  }

  return (
    <div className="h-fit min-w-[272px] rounded-xl border border-white/10 bg-black/30 p-2 backdrop-blur-xl backdrop-saturate-150">
      <input
        ref={inputRef}
        value={title}
        placeholder="Nome da lista"
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            void submit()
          }
          if (event.key === 'Escape') {
            setOpen(false)
            setTitle('')
          }
        }}
        className="mb-2 w-full rounded-lg border border-dark-border bg-dark px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-caramel focus:outline-none focus:ring-1 focus:ring-caramel/40"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isSaving || !title.trim()}
          onClick={() => void submit()}
          className="rounded-md bg-caramel px-3 py-1.5 text-sm font-medium text-dark hover:bg-caramel/90 disabled:opacity-50"
        >
          Adicionar lista
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
