import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/stores/toast.store'
import {
  createCard,
  createList,
  createProject,
  deleteCard,
  deleteList,
  deleteProject,
  getBoard,
  listProjects,
  persistCardMoves,
  renameList,
  reorderLists,
  saveCardNote,
  setCardCompleted,
  updateCard,
  updateProject,
  deleteCardNote,
} from '@/services/kanban.service'
import type { CardFormData, ProjectFormData } from '@/schemas/kanban.schema'
import type { BoardData } from '@/types/kanban'

function onError(error: unknown) {
  toast(error instanceof Error ? error.message : 'Erro inesperado', 'error')
}

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: listProjects })
}

export function useBoard(projectId: string | undefined) {
  return useQuery({
    queryKey: ['board', projectId],
    queryFn: () => getBoard(projectId!),
    enabled: Boolean(projectId),
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: ProjectFormData) => createProject(form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['projects'] })
      toast('Quadro criado', 'success')
    },
    onError,
  })
}

export function useUpdateProject(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (form: ProjectFormData) => updateProject(projectId, form),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['projects'] }),
        qc.invalidateQueries({ queryKey: ['board', projectId] }),
      ])
      toast('Quadro atualizado', 'success')
    },
    onError,
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['projects'] })
      toast('Quadro excluído', 'success')
    },
    onError,
  })
}

export function useCreateList(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => createList(projectId, title),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
    },
    onError,
  })
}

export function useRenameList(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameList(id, title),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
    },
    onError,
  })
}

export function useDeleteList(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteList(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
      toast('Lista excluída', 'success')
    },
    onError,
  })
}

export function useReorderLists(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Array<{ id: string; position: number }>) => reorderLists(updates),
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ['board', projectId] })
      const previous = qc.getQueryData<BoardData>(['board', projectId])
      qc.setQueryData<BoardData>(['board', projectId], (old) => {
        if (!old) return old
        const positionById = new Map(updates.map((item) => [item.id, item.position]))
        return {
          ...old,
          lists: [...old.lists]
            .map((list) => ({
              ...list,
              position: positionById.get(list.id) ?? list.position,
            }))
            .sort((a, b) => a.position - b.position),
        }
      })
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) qc.setQueryData(['board', projectId], context.previous)
      onError(error)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
    },
  })
}

export function useCreateCard(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, title }: { listId: string; title: string }) => createCard(listId, title),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
    },
    onError,
  })
}

export function useUpdateCard(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: CardFormData }) => updateCard(id, form),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
      toast('Cartão salvo', 'success')
    },
    onError,
  })
}

export function useDeleteCard(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCard(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
      toast('Cartão excluído', 'success')
    },
    onError,
  })
}

export function useMoveCards(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Array<{ id: string; list_id: string; position: number }>) =>
      persistCardMoves(updates),
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: ['board', projectId] })
      const previous = qc.getQueryData<BoardData>(['board', projectId])
      qc.setQueryData<BoardData>(['board', projectId], (old) => {
        if (!old) return old
        const byId = new Map(updates.map((item) => [item.id, item]))
        return {
          ...old,
          cards: old.cards.map((card) => {
            const next = byId.get(card.id)
            return next ? { ...card, list_id: next.list_id, position: next.position } : card
          }),
        }
      })
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) qc.setQueryData(['board', projectId], context.previous)
      onError(error)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
    },
  })
}

export function useSaveCardNote(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { cardId: string; note: string; keepPaths: string[]; addImages?: Blob[] }) =>
      saveCardNote(input.cardId, {
        note: input.note,
        keepPaths: input.keepPaths,
        addImages: input.addImages,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
      toast('Nota salva', 'success')
    },
    onError,
  })
}

export function useDeleteCardNote(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, imagePaths }: { cardId: string; imagePaths?: string[] }) =>
      deleteCardNote(cardId, imagePaths ?? []),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
      toast('Nota excluída', 'success')
    },
    onError,
  })
}

export function useSetCardCompleted(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      completed: boolean
      move?: { list_id: string; position: number }
    }) => setCardCompleted(input.id, input.completed, input.move),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: ['board', projectId] })
      const previous = qc.getQueryData<BoardData>(['board', projectId])
      qc.setQueryData<BoardData>(['board', projectId], (old) => {
        if (!old) return old
        return {
          ...old,
          cards: old.cards.map((card) =>
            card.id === input.id
              ? {
                  ...card,
                  completed: input.completed,
                  list_id: input.move?.list_id ?? card.list_id,
                  position: input.move?.position ?? card.position,
                }
              : card,
          ),
        }
      })
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) qc.setQueryData(['board', projectId], context.previous)
      onError(error)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['board', projectId] })
    },
  })
}
