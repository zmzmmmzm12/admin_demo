import type { SubtitlePayload, VideoDetail, VideoListResponse, VideoSearchParams } from '../types/admin'
import { apiClient } from './client'

export async function getVideos(params: VideoSearchParams) {
  const response = await apiClient.get<VideoListResponse>('/videos', { params })
  return response.data
}

export async function getVideoDetail(id: string) {
  const response = await apiClient.get<{ data: VideoDetail }>(`/videos/${id}`)
  return response.data.data
}

export async function createSubtitle(videoId: string, payload: SubtitlePayload) {
  const response = await apiClient.post<{ data: VideoDetail }>(`/videos/${videoId}/subtitles`, payload)
  return response.data.data
}

export async function extractSubtitles(videoId: string) {
  const response = await apiClient.post<{ data: VideoDetail }>(`/videos/${videoId}/subtitles/extract`)
  return response.data.data
}

export async function translateSubtitles(videoId: string, toLanguage: string) {
  const response = await apiClient.post<{ data: VideoDetail }>(`/videos/${videoId}/subtitles/translate`, { toLanguage })
  return response.data.data
}

export async function deleteSubtitle(videoId: string, subtitleId: string) {
  const response = await apiClient.delete<{ data: VideoDetail }>(`/videos/${videoId}/subtitles/${subtitleId}`)
  return response.data.data
}

export async function deleteSubtitles(videoId: string, subtitleIds: string[]) {
  const response = await apiClient.post<{ data: VideoDetail }>(`/videos/${videoId}/subtitles/bulk-delete`, { subtitleIds })
  return response.data.data
}

export async function deleteVideo(id: string) {
  const response = await apiClient.delete<{ data: { id: string } }>(`/videos/${id}`)
  return response.data.data
}

export async function deleteVideos(ids: string[]) {
  const response = await apiClient.post<{ data: { ids: string[] } }>('/videos/bulk-delete', { ids })
  return response.data.data
}
