import type { Notice, NoticeListResponse, NoticeSavePayload, NoticeSearchParams } from '../types/admin'
import { apiClient } from './client'

export async function getNotices(params: NoticeSearchParams) {
  const response = await apiClient.get<NoticeListResponse>('/notices', { params })
  return response.data
}

export async function getNoticeDetail(id: string) {
  const response = await apiClient.get<{ data: Notice }>(`/notices/${id}`)
  return response.data.data
}

export async function createNotice(payload: NoticeSavePayload) {
  const response = await apiClient.post<{ data: Notice }>('/notices', payload)
  return response.data.data
}

export async function updateNotice(id: string, payload: NoticeSavePayload) {
  const response = await apiClient.put<{ data: Notice }>(`/notices/${id}`, payload)
  return response.data.data
}

export async function deleteNotice(id: string) {
  const response = await apiClient.delete<{ data: { id: string } }>(`/notices/${id}`)
  return response.data.data
}

export async function deleteNotices(ids: string[]) {
  const response = await apiClient.post<{ data: { ids: string[] } }>('/notices/bulk-delete', { ids })
  return response.data.data
}
