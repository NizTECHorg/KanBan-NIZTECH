import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { BOARD_COLORS, DEFAULT_BOARD_COLOR } from '@/config/kanban'
import { projectSchema, type ProjectFormData } from '@/schemas/kanban.schema'
import type { Project } from '@/types/kanban'

interface ProjectModalProps {
  open: boolean
  project?: Project | null
  isSaving?: boolean
  onClose: () => void
  onSubmit: (values: ProjectFormData) => Promise<void>
}

export function ProjectModal({ open, project, isSaving, onClose, onSubmit }: ProjectModalProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      color: DEFAULT_BOARD_COLOR,
    },
  })

  const selectedColor = form.watch('color')

  useEffect(() => {
    if (!open) return
    form.reset({
      name: project?.name ?? '',
      description: project?.description ?? '',
      color: project?.color ?? DEFAULT_BOARD_COLOR,
    })
  }, [open, project, form])

  return (
    <Modal
      open={open}
      title={project ? 'Editar quadro' : 'Criar quadro'}
      description={
        project
          ? 'Atualize o nome, a descrição e a cor deste projeto.'
          : 'Cada quadro representa um projeto da NIZ TECH.'
      }
      onClose={onClose}
    >
      <form
        onSubmit={form.handleSubmit(async (values) => {
          await onSubmit(values)
        })}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Nome do projeto"
          placeholder="Ex.: Site institucional"
          error={form.formState.errors.name?.message}
          {...form.register('name')}
        />
        <Textarea
          label="Descrição"
          placeholder="Opcional"
          error={form.formState.errors.description?.message}
          {...form.register('description')}
        />
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-cream/90">Cor do quadro</legend>
          <div className="flex flex-wrap gap-2">
            {BOARD_COLORS.map((color) => (
              <button
                key={color.id}
                type="button"
                title={color.name}
                aria-label={color.name}
                aria-pressed={selectedColor === color.value}
                onClick={() => form.setValue('color', color.value, { shouldValidate: true })}
                className={[
                  'h-8 w-8 rounded-md transition',
                  selectedColor === color.value ? 'ring-2 ring-cream ring-offset-2 ring-offset-dark-surface' : '',
                ].join(' ')}
                style={{ backgroundColor: color.value }}
              />
            ))}
          </div>
          {form.formState.errors.color && (
            <p role="alert" className="mt-2 text-xs text-error">
              {form.formState.errors.color.message}
            </p>
          )}
        </fieldset>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {project ? 'Salvar' : 'Criar quadro'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
