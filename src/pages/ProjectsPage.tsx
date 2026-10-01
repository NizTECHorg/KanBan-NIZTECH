import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { ProjectModal } from '@/components/kanban/ProjectModal'
import { ProjectTile } from '@/components/kanban/ProjectTile'
import { useCreateProject, useProjects } from '@/hooks/kanban'
import type { ProjectFormData } from '@/schemas/kanban.schema'

export function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useProjects()
  const createProject = useCreateProject()

  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return projects
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        (project.description ?? '').toLowerCase().includes(term),
    )
  }, [projects, query])

  async function handleCreate(values: ProjectFormData) {
    await createProject.mutateAsync(values)
    setModalOpen(false)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <PageHeader
        title="Quadros"
        description="Cada quadro é um projeto da NIZ TECH. Abra um quadro para organizar as tarefas como no Trello."
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={17} />
            Criar quadro
          </Button>
        }
      />

      <div className="relative mb-8 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream/35" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar quadros"
          className="w-full rounded-lg border border-dark-border bg-dark py-2.5 pl-9 pr-4 text-sm text-cream placeholder:text-cream/30 focus:border-caramel focus:outline-none focus:ring-1 focus:ring-caramel/40"
        />
      </div>

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-caramel border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-error/30 bg-error/10 px-5 py-4 text-sm text-error">
          {error instanceof Error ? error.message : 'Não foi possível carregar os quadros.'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-dark-border bg-dark-surface/50 px-6 py-16 text-center">
          <p className="text-lg font-medium text-cream/80">
            {query ? 'Nenhum quadro encontrado' : 'Nenhum projeto ainda'}
          </p>
          <p className="mt-2 text-sm text-cream/40">
            {query
              ? 'Tente outro termo de busca.'
              : 'Crie o primeiro quadro para começar a organizar as tarefas da equipe.'}
          </p>
          {!query && (
            <Button className="mt-6" onClick={() => setModalOpen(true)}>
              <Plus size={17} />
              Criar quadro
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((project) => (
            <ProjectTile key={project.id} project={project} />
          ))}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-dark-border bg-white/[0.03] text-sm font-medium text-cream/50 transition hover:border-caramel/40 hover:bg-white/[0.05] hover:text-cream"
          >
            <Plus size={16} className="mr-2" />
            Criar novo quadro
          </button>
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        isSaving={createProject.isPending}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </section>
  )
}
