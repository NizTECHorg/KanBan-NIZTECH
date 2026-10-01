import { z } from 'zod'
import { BOARD_ASSIGNEES, BOARD_COLORS, CARD_LABELS } from '@/config/kanban'

const colorValues = BOARD_COLORS.map((color) => color.value) as [string, ...string[]]
const labelIds = CARD_LABELS.map((label) => label.id) as [string, ...string[]]
const assigneeIds = BOARD_ASSIGNEES.map((member) => member.id) as [string, ...string[]]

export const projectSchema = z.object({
  name: z.string().trim().min(2, 'Nome obrigatório').max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  color: z.enum(colorValues),
})

export const cardSchema = z.object({
  title: z.string().trim().min(1, 'Título obrigatório').max(200),
  description: z.string().max(8000).optional().or(z.literal('')),
  due_date: z.string().optional().or(z.literal('')),
  assigned_to: z.enum(assigneeIds).optional().or(z.literal('')),
  labels: z.array(z.enum(labelIds)),
})

export type ProjectFormData = z.infer<typeof projectSchema>
export type CardFormData = z.infer<typeof cardSchema>
