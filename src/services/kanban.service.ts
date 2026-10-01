import { supabase } from '@/lib/supabase/client'
import { mapDbError, sanitizeText } from '@/lib/security'
import { DEFAULT_BOARD_COLOR, DEFAULT_LIST_TITLES } from '@/config/kanban'
import { requirements } from '@/data/requirements'
import type { ProjectFormData, CardFormData } from '@/schemas/kanban.schema'
import type {
  BoardData,
  BoardList,
  Card,
  CardWithAssignee,
  Project,
} from '@/types/kanban'
import { withAssignee } from '@/types/kanban'

function throwDb(error: { message?: string; code?: string }): never {
  if (error.code === '42P01' || error.message?.toLowerCase().includes('does not exist')) {
    throw new Error(
      'As tabelas do Kanban ainda não existem. Execute o SQL em supabase/migrations no editor SQL do Supabase.',
    )
  }
  throw new Error(mapDbError(error))
}

async function nextPosition(table: 'projects' | 'board_lists' | 'cards', filter: Record<string, string>) {
  let query = supabase.from(table).select('position').order('position', { ascending: false }).limit(1)
  for (const [key, value] of Object.entries(filter)) {
    query = query.eq(key, value)
  }
  const { data, error } = await query
  if (error) throwDb(error)
  return ((data?.[0] as { position?: number } | undefined)?.position ?? -1) + 1
}

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('archived', false)
    .order('position')
    .order('created_at', { ascending: false })
  if (error) throwDb(error)
  return (data as Project[]) ?? []
}

export async function getBoard(projectId: string): Promise<BoardData> {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle()
  if (projectError) throwDb(projectError)
  if (!project) {
    throw new Error('Quadro não encontrado.')
  }

  const { data: lists, error: listsError } = await supabase
    .from('board_lists')
    .select('*')
    .eq('project_id', projectId)
    .order('position')
  if (listsError) throwDb(listsError)

  const listIds = (lists ?? []).map((list) => list.id)
  let cards: CardWithAssignee[] = []

  if (listIds.length > 0) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .in('list_id', listIds)
      .order('position')
      .order('created_at')
    if (error) throwDb(error)
    cards = ((data as Card[]) ?? []).map(withAssignee)
  }

  return {
    project: project as Project,
    lists: (lists as BoardList[]) ?? [],
    cards,
  }
}

export async function createProject(form: ProjectFormData): Promise<Project> {
  const { data: auth } = await supabase.auth.getUser()
  const position = await nextPosition('projects', {})

  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: sanitizeText(form.name, 120),
      description: form.description ? sanitizeText(form.description, 500) : null,
      color: form.color || DEFAULT_BOARD_COLOR,
      created_by: auth.user?.id ?? null,
      position,
    })
    .select('*')
    .single()
  if (error) throwDb(error)

  const lists = DEFAULT_LIST_TITLES.map((title, index) => ({
    project_id: data.id,
    title,
    position: index,
  }))

  const { error: listsError } = await supabase.from('board_lists').insert(lists)
  if (listsError) throwDb(listsError)

  return data as Project
}

export async function updateProject(id: string, form: ProjectFormData): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .update({
      name: sanitizeText(form.name, 120),
      description: form.description ? sanitizeText(form.description, 500) : null,
      color: form.color || DEFAULT_BOARD_COLOR,
    })
    .eq('id', id)
  if (error) throwDb(error)
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throwDb(error)
}

export async function createList(projectId: string, title: string): Promise<BoardList> {
  const position = await nextPosition('board_lists', { project_id: projectId })
  const { data, error } = await supabase
    .from('board_lists')
    .insert({
      project_id: projectId,
      title: sanitizeText(title, 80),
      position,
    })
    .select('*')
    .single()
  if (error) throwDb(error)
  return data as BoardList
}

export async function renameList(id: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('board_lists')
    .update({ title: sanitizeText(title, 80) })
    .eq('id', id)
  if (error) throwDb(error)
}

export async function deleteList(id: string): Promise<void> {
  const { error } = await supabase.from('board_lists').delete().eq('id', id)
  if (error) throwDb(error)
}

export async function reorderLists(updates: Array<{ id: string; position: number }>): Promise<void> {
  const results = await Promise.all(
    updates.map((item) =>
      supabase.from('board_lists').update({ position: item.position }).eq('id', item.id),
    ),
  )
  const failed = results.find((result) => result.error)
  if (failed?.error) throwDb(failed.error)
}

export async function createCard(listId: string, title: string): Promise<CardWithAssignee> {
  const { data: auth } = await supabase.auth.getUser()
  const position = await nextPosition('cards', { list_id: listId })

  const { data, error } = await supabase
    .from('cards')
    .insert({
      list_id: listId,
      title: sanitizeText(title, 200),
      position,
      created_by: auth.user?.id ?? null,
    })
    .select('*')
    .single()
  if (error) throwDb(error)
  return withAssignee(data as Card)
}

export async function updateCard(id: string, form: CardFormData): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .update({
      title: sanitizeText(form.title, 200),
      description: form.description ? sanitizeText(form.description, 8000) : null,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to || null,
      labels: form.labels ?? [],
    })
    .eq('id', id)
  if (error) throwDb(error)
}

const NOTE_BUCKET = 'card-notes'
const MAX_NOTE_IMAGES = 8

async function removeNoteImages(paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))]
  if (unique.length === 0) return
  await supabase.storage.from(NOTE_BUCKET).remove(unique)
}

export async function getNoteImageUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null
  const { data, error } = await supabase.storage.from(NOTE_BUCKET).createSignedUrl(path, 60 * 60)
  if (error) throwDb(error)
  return data.signedUrl
}

export async function getNoteImageUrls(paths: string[]): Promise<Array<{ path: string; url: string }>> {
  const unique = [...new Set(paths.filter(Boolean))]
  if (unique.length === 0) return []
  const { data, error } = await supabase.storage.from(NOTE_BUCKET).createSignedUrls(unique, 60 * 60)
  if (error) throwDb(error)
  return (data ?? []).flatMap((item) =>
    item.path && item.signedUrl ? [{ path: item.path, url: item.signedUrl }] : [],
  )
}

export async function saveCardNote(
  cardId: string,
  input: { note: string; keepPaths: string[]; addImages?: Blob[] },
): Promise<{ note: string | null; note_image_path: string | null; note_image_paths: string[] }> {
  const note = input.note.trim() ? sanitizeText(input.note, 4000) : null
  const keepPaths = input.keepPaths.filter(Boolean).slice(0, MAX_NOTE_IMAGES)
  const slots = MAX_NOTE_IMAGES - keepPaths.length
  const toUpload = (input.addImages ?? []).slice(0, slots)
  const uploaded: string[] = []

  for (const image of toUpload) {
    const path = `${cardId}/${crypto.randomUUID()}.jpg`
    const { error: uploadError } = await supabase.storage.from(NOTE_BUCKET).upload(path, image, {
      contentType: 'image/jpeg',
      upsert: false,
    })
    if (uploadError) throwDb(uploadError)
    uploaded.push(path)
  }

  const paths = [...keepPaths, ...uploaded]
  const { error } = await supabase
    .from('cards')
    .update({
      note,
      note_image_path: paths[0] ?? null,
      note_image_paths: paths,
    })
    .eq('id', cardId)
  if (error) {
    if (error.message?.toLowerCase().includes('note') || error.code === '42703') {
      throw new Error(
        'Execute o SQL de notas no Supabase (supabase/migrations/20260822190000_card_notes.sql e 20261001120000_card_photos_completed.sql).',
      )
    }
    throwDb(error)
  }

  return { note, note_image_path: paths[0] ?? null, note_image_paths: paths }
}

export async function deleteCardNote(cardId: string, imagePaths: string[] = []): Promise<void> {
  await removeNoteImages(imagePaths)
  const { error } = await supabase
    .from('cards')
    .update({ note: null, note_image_path: null, note_image_paths: [] })
    .eq('id', cardId)
  if (error) throwDb(error)
}

export async function setCardCompleted(
  id: string,
  completed: boolean,
  move?: { list_id: string; position: number },
): Promise<void> {
  const payload: Record<string, unknown> = { completed }
  if (move) {
    payload.list_id = move.list_id
    payload.position = move.position
  }
  const { error } = await supabase.from('cards').update(payload).eq('id', id)
  if (error) {
    if (error.message?.toLowerCase().includes('completed') || error.code === '42703') {
      throw new Error('Execute o SQL em supabase/migrations/20261001120000_card_photos_completed.sql.')
    }
    throwDb(error)
  }
}

export async function deleteCard(id: string): Promise<void> {
  const { data } = await supabase
    .from('cards')
    .select('note_image_path, note_image_paths')
    .eq('id', id)
    .maybeSingle()
  const row = data as { note_image_path?: string | null; note_image_paths?: string[] | null } | null
  const paths = [...(row?.note_image_paths ?? []), row?.note_image_path ?? ''].filter(Boolean)
  await removeNoteImages(paths)
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throwDb(error)
}

export async function persistCardMoves(
  updates: Array<{ id: string; list_id: string; position: number }>,
): Promise<void> {
  const results = await Promise.all(
    updates.map((item) =>
      supabase
        .from('cards')
        .update({ list_id: item.list_id, position: item.position })
        .eq('id', item.id),
    ),
  )
  const failed = results.find((result) => result.error)
  if (failed?.error) throwDb(failed.error)
}

export async function seedRequirementCards(listId: string): Promise<number> {
  const rank = { indispensavel: 0, importante: 1, desejavel: 2 }
  const rows = [...requirements]
    .sort(
      (a, b) =>
        rank[a.priority] - rank[b.priority] || Number(a.id.slice(4)) - Number(b.id.slice(4)),
    )
    .map((req, index) => ({
      list_id: listId,
      title: sanitizeText(`${req.id} — ${req.title}`, 200),
      description: req.description.trim().slice(0, 8000),
      position: index,
      due_date: req.priority === 'indispensavel' ? '2026-09-10' : null,
      labels: [req.priority],
      assigned_to: 'artur',
    }))

  const { error } = await supabase.from('cards').insert(rows)
  if (error) throwDb(error)
  return rows.length
}
