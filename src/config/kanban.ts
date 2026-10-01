export const BOARD_COLORS = [
  { id: 'teal', value: '#0f766e', name: 'Teal' },
  { id: 'cyan', value: '#0e7490', name: 'Ciano' },
  { id: 'blue', value: '#1d4ed8', name: 'Azul' },
  { id: 'indigo', value: '#4338ca', name: 'Índigo' },
  { id: 'purple', value: '#7c3aed', name: 'Roxo' },
  { id: 'rose', value: '#be123c', name: 'Rosa' },
  { id: 'orange', value: '#c2410c', name: 'Laranja' },
  { id: 'olive', value: '#3f6212', name: 'Oliva' },
  { id: 'slate', value: '#334155', name: 'Ardósia' },
] as const

export const DEFAULT_BOARD_COLOR = BOARD_COLORS[1].value

export const DEFAULT_LIST_TITLES = ['A fazer', 'Em andamento', 'Concluído'] as const

export const CARD_LABELS = [
  { id: 'indispensavel', name: 'Indispensável', className: 'bg-red-500 text-white' },
  { id: 'importante', name: 'Importante', className: 'bg-yellow-400 text-black' },
  { id: 'desejavel', name: 'Desejável', className: 'bg-emerald-500 text-white' },
] as const

export const BOARD_ASSIGNEES = [
  { id: 'artur', name: 'Artur' },
  { id: 'fabricio', name: 'Fabricio' },
] as const

export type CardLabelId = (typeof CARD_LABELS)[number]['id']
export type BoardAssigneeId = (typeof BOARD_ASSIGNEES)[number]['id']

export const LABEL_RANK: Record<string, number> = {
  indispensavel: 0,
  importante: 1,
  desejavel: 2,
}

export function getCardLabel(id: string) {
  return CARD_LABELS.find((label) => label.id === id)
}

export function getAssignee(id: string | null | undefined) {
  if (!id) return null
  return BOARD_ASSIGNEES.find((member) => member.id === id) ?? null
}

export function getBoardColor(value: string) {
  return BOARD_COLORS.find((color) => color.value === value) ?? BOARD_COLORS[1]
}

export function isDoneListTitle(title: string) {
  return title.trim().toLowerCase() === 'concluído' || title.trim().toLowerCase() === 'concluido'
}

export function isDoingListTitle(title: string) {
  return title.trim().toLowerCase() === 'em andamento'
}

export type DueUrgency = 'none' | 'ok' | 'soon' | 'overdue'

export function dueUrgency(dueDate: string | null | undefined): DueUrgency {
  if (!dueDate) return 'none'
  const [year, month, day] = dueDate.split('-').map(Number)
  if (!year || !month || !day) return 'none'
  const due = new Date(year, month - 1, day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  if (diff < 0) return 'overdue'
  if (diff <= 2) return 'soon'
  return 'ok'
}
