import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ImagePlus, Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { compressNoteImage } from '@/lib/compress-image'
import { getNoteImageUrls } from '@/services/kanban.service'
import { toast } from '@/stores/toast.store'
import { useDeleteCardNote, useSaveCardNote } from '@/hooks/kanban'

const MAX_NOTE_IMAGES = 8

interface CardNoteProps {
  projectId: string
  cardId: string
  note: string | null
  imagePaths: string[]
  onChanged: (next: {
    note: string | null
    note_image_path: string | null
    note_image_paths: string[]
  }) => void
}

export function CardNote({ projectId, cardId, note, imagePaths, onChanged }: CardNoteProps) {
  const saveNote = useSaveCardNote(projectId)
  const removeNote = useDeleteCardNote(projectId)
  const fileRef = useRef<HTMLInputElement>(null)

  const hasNote = Boolean(note?.trim() || imagePaths.length)
  const [editing, setEditing] = useState(!hasNote)
  const [text, setText] = useState(note ?? '')
  const [keptPaths, setKeptPaths] = useState<string[]>(imagePaths)
  const [added, setAdded] = useState<Array<{ blob: Blob; url: string }>>([])
  const [remoteUrls, setRemoteUrls] = useState<Array<{ path: string; url: string }>>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    setText(note ?? '')
    setKeptPaths(imagePaths)
    setAdded((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.url))
      return []
    })
    setEditing(!hasNote)
  }, [cardId, note, imagePaths, hasNote])

  useEffect(() => {
    let cancelled = false
    if (keptPaths.length === 0) {
      setRemoteUrls([])
      return
    }
    void getNoteImageUrls(keptPaths)
      .then((urls) => {
        if (!cancelled) setRemoteUrls(urls)
      })
      .catch(() => {
        if (!cancelled) setRemoteUrls([])
      })
    return () => {
      cancelled = true
    }
  }, [keptPaths])

  const previews = [
    ...keptPaths.map((path) => ({
      key: path,
      url: remoteUrls.find((item) => item.path === path)?.url ?? '',
      kind: 'remote' as const,
    })),
    ...added.map((item, index) => ({
      key: `new-${index}`,
      url: item.url,
      kind: 'local' as const,
    })),
  ].filter((item) => item.url)

  useEffect(() => {
    if (lightboxIndex === null) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setLightboxIndex(null)
      if (event.key === 'ArrowRight') {
        setLightboxIndex((current) =>
          current === null ? current : Math.min(previews.length - 1, current + 1),
        )
      }
      if (event.key === 'ArrowLeft') {
        setLightboxIndex((current) => (current === null ? current : Math.max(0, current - 1)))
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxIndex, previews.length])

  async function handlePick(files: FileList | null) {
    if (!files?.length) return
    const remaining = MAX_NOTE_IMAGES - keptPaths.length - added.length
    if (remaining <= 0) {
      toast(`Máximo de ${MAX_NOTE_IMAGES} imagens por nota.`, 'error')
      return
    }

    const selected = [...files].slice(0, remaining)
    const compressed: Array<{ blob: Blob; url: string }> = []
    for (const file of selected) {
      try {
        const blob = await compressNoteImage(file)
        compressed.push({ blob, url: URL.createObjectURL(blob) })
      } catch (error) {
        toast(error instanceof Error ? error.message : 'Não foi possível usar esta imagem.', 'error')
      }
    }
    if (compressed.length) setAdded((current) => [...current, ...compressed])
  }

  function removePreview(index: number) {
    const remoteCount = keptPaths.length
    if (index < remoteCount) {
      setKeptPaths((current) => current.filter((_, itemIndex) => itemIndex !== index))
      return
    }
    const localIndex = index - remoteCount
    setAdded((current) => {
      const next = [...current]
      const removed = next.splice(localIndex, 1)[0]
      if (removed) URL.revokeObjectURL(removed.url)
      return next
    })
  }

  async function handleSave() {
    if (!text.trim() && keptPaths.length === 0 && added.length === 0) {
      toast('Escreva a nota ou anexe uma imagem.', 'error')
      return
    }

    const saved = await saveNote.mutateAsync({
      cardId,
      note: text,
      keepPaths: keptPaths,
      addImages: added.map((item) => item.blob),
    })
    added.forEach((item) => URL.revokeObjectURL(item.url))
    setAdded([])
    setEditing(false)
    onChanged(saved)
  }

  async function handleDelete() {
    await removeNote.mutateAsync({ cardId, imagePaths: [...imagePaths, ...keptPaths] })
    added.forEach((item) => URL.revokeObjectURL(item.url))
    setAdded([])
    setText('')
    setKeptPaths([])
    setEditing(true)
    onChanged({ note: null, note_image_path: null, note_image_paths: [] })
  }

  const lightbox = lightboxIndex !== null ? previews[lightboxIndex] : null

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-cream/80">Nota</h3>

      {editing ? (
        <div className="space-y-3">
          <Textarea
            label="Como resolveu"
            placeholder="Descreva como o problema foi resolvido..."
            className="min-h-28"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(event) => {
              void handlePick(event.target.files)
              event.target.value = ''
            }}
          />

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previews.map((item, index) => (
                <div key={item.key} className="relative">
                  <button type="button" onClick={() => setLightboxIndex(index)} className="block">
                    <img
                      src={item.url}
                      alt={`Anexo ${index + 1}`}
                      className="h-20 w-20 rounded-lg border border-white/10 object-cover"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => removePreview(index)}
                    className="absolute right-1 top-1 rounded-md bg-black/70 p-0.5 text-white/80 hover:text-white"
                    aria-label="Remover imagem"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {keptPaths.length + added.length < MAX_NOTE_IMAGES && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs text-cream/55 hover:border-white/30 hover:text-cream/80"
            >
              <ImagePlus size={14} />
              Anexar imagens
            </button>
          )}

          <div className="flex justify-end gap-2 pt-1">
            {hasNote && (
              <Button
                type="button"
                variant="secondary"
                className="!px-3 !py-2"
                onClick={() => {
                  setText(note ?? '')
                  setKeptPaths(imagePaths)
                  added.forEach((item) => URL.revokeObjectURL(item.url))
                  setAdded([])
                  setEditing(false)
                }}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              className="!px-3 !py-2"
              isLoading={saveNote.isPending}
              onClick={() => void handleSave()}
            >
              Salvar nota
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {note?.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-7 text-cream/65">{note}</p>
          ) : (
            <p className="text-sm text-cream/35">Sem texto nesta nota.</p>
          )}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previews.map((item, index) => (
                <button key={item.key} type="button" onClick={() => setLightboxIndex(index)}>
                  <img
                    src={item.url}
                    alt={`Anexo ${index + 1}`}
                    className="h-20 w-20 rounded-lg border border-white/10 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="secondary" className="!px-3 !py-2" onClick={() => setEditing(true)}>
              <Pencil size={13} />
              Editar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="!px-3 !py-2 text-error hover:bg-error/10 hover:text-error"
              isLoading={removeNote.isPending}
              onClick={() => void handleDelete()}
            >
              <Trash2 size={13} />
              Excluir
            </Button>
          </div>
        </div>
      )}

      {lightbox && lightboxIndex !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar imagem"
            className="absolute inset-0 bg-black/80"
            onClick={() => setLightboxIndex(null)}
          />
          <div className="relative z-10 flex max-h-[88vh] max-w-[92vw] items-center gap-3">
            {lightboxIndex > 0 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(lightboxIndex - 1)}
                className="rounded-full bg-dark-surface p-2 text-cream/70 hover:text-cream"
                aria-label="Imagem anterior"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute -right-2 -top-2 rounded-full bg-dark-surface p-1.5 text-cream/70 shadow-lg hover:text-cream"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
              <img
                src={lightbox.url}
                alt="Anexo da nota"
                className="max-h-[88vh] max-w-[80vw] rounded-lg object-contain shadow-2xl"
              />
            </div>
            {lightboxIndex < previews.length - 1 && (
              <button
                type="button"
                onClick={() => setLightboxIndex(lightboxIndex + 1)}
                className="rounded-full bg-dark-surface p-2 text-cream/70 hover:text-cream"
                aria-label="Próxima imagem"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
