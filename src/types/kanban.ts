import { getAssignee } from '@/config/kanban'

export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  created_by: string | null
  archived: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface BoardList {
  id: string
  project_id: string
  title: string
  position: number
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  list_id: string
  title: string
  description: string | null
  position: number
  due_date: string | null
  labels: string[]
  assigned_to: string | null
  note: string | null
  note_image_path: string | null
  note_image_paths: string[]
  completed: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type CardWithAssignee = Card & {
  assignee: { id: string; name: string } | null
}

export function noteImagePathsOf(card: Pick<Card, 'note_image_path' | 'note_image_paths'>): string[] {
  if (Array.isArray(card.note_image_paths) && card.note_image_paths.length > 0) {
    return card.note_image_paths.filter(Boolean)
  }
  return card.note_image_path ? [card.note_image_path] : []
}

export function withAssignee(card: Card): CardWithAssignee {
  const member = getAssignee(card.assigned_to)
  const paths = noteImagePathsOf(card)
  return {
    ...card,
    note: card.note ?? null,
    note_image_path: paths[0] ?? null,
    note_image_paths: paths,
    completed: Boolean(card.completed),
    assignee: member ? { id: member.id, name: member.name } : null,
  }
}

export interface BoardData {
  project: Project
  lists: BoardList[]
  cards: CardWithAssignee[]
}

export type DragState =
  | { kind: 'card'; id: string; listId: string }
  | { kind: 'list'; id: string }
  | null
