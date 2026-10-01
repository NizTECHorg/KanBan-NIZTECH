import { Link } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import type { Project } from '@/types/kanban'

interface ProjectTileProps {
  project: Project
  cardCount?: number
}

export function ProjectTile({ project, cardCount }: ProjectTileProps) {
  return (
    <Link
      to={`/projetos/${project.id}`}
      className="group relative flex min-h-[120px] flex-col justify-between overflow-hidden rounded-xl p-4 text-left shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
      style={{ backgroundColor: project.color }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/10 to-black/35" />
      <div className="relative">
        <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-white drop-shadow">
          {project.name}
        </h2>
        {project.description && (
          <p className="mt-1 line-clamp-2 text-xs text-white/75">{project.description}</p>
        )}
      </div>
      <div className="relative mt-4 flex items-center gap-1.5 text-[11px] text-white/70">
        <LayoutGrid size={12} />
        {typeof cardCount === 'number' ? `${cardCount} cartões` : 'Abrir quadro'}
      </div>
    </Link>
  )
}
