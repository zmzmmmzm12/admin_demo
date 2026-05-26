import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createNotice, deleteNotice, deleteNotices, getNoticeDetail, getNotices, updateNotice } from '../api/notices'
import type { NoticeSavePayload, NoticeSearchParams } from '../types/admin'

export function useNoticesQuery(params: NoticeSearchParams) {
  return useQuery({
    queryKey: ['notices', params],
    queryFn: () => getNotices(params),
    placeholderData: (prev) => prev,
  })
}

export function useNoticeDetailQuery(id: string) {
  return useQuery({
    queryKey: ['notice', id],
    queryFn: () => getNoticeDetail(id),
    enabled: Boolean(id),
  })
}

export function useSaveNoticeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: NoticeSavePayload }) =>
      id ? updateNotice(id, payload) : createNotice(payload),
    onSuccess: (notice) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      queryClient.invalidateQueries({ queryKey: ['notice', notice.id] })
    },
  })
}

export function useDeleteNoticeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteNotice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
      queryClient.invalidateQueries({ queryKey: ['notice', id] })
    },
  })
}

export function useDeleteNoticesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => deleteNotices(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] })
    },
  })
}
