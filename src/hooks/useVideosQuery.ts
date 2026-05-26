import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSubtitle,
  deleteSubtitle,
  deleteSubtitles,
  deleteVideo,
  deleteVideos,
  extractSubtitles,
  getVideoDetail,
  getVideos,
  translateSubtitles,
} from '../api/videos'
import type { SubtitlePayload, VideoSearchParams } from '../types/admin'

export function useVideosQuery(params: VideoSearchParams) {
  return useQuery({
    queryKey: ['videos', params],
    queryFn: () => getVideos(params),
    placeholderData: (prev) => prev,
  })
}

export function useVideoDetailQuery(id: string) {
  return useQuery({
    queryKey: ['video', id],
    queryFn: () => getVideoDetail(id),
    enabled: Boolean(id),
  })
}

export function useCreateSubtitleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubtitlePayload }) => createSubtitle(id, payload),
    onSuccess: (video) => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
      queryClient.invalidateQueries({ queryKey: ['video', video.id] })
    },
  })
}

export function useDeleteSubtitleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ videoId, subtitleId }: { videoId: string; subtitleId: string }) => deleteSubtitle(videoId, subtitleId),
    onSuccess: (video) => {
      queryClient.invalidateQueries({ queryKey: ['video', video.id] })
    },
  })
}

export function useDeleteSubtitlesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ videoId, subtitleIds }: { videoId: string; subtitleIds: string[] }) =>
      deleteSubtitles(videoId, subtitleIds),
    onSuccess: (video) => {
      queryClient.invalidateQueries({ queryKey: ['video', video.id] })
    },
  })
}

export function useExtractSubtitlesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (videoId: string) => extractSubtitles(videoId),
    onSuccess: (video) => {
      queryClient.invalidateQueries({ queryKey: ['video', video.id] })
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}

export function useTranslateSubtitlesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ videoId, toLanguage }: { videoId: string; toLanguage: string }) =>
      translateSubtitles(videoId, toLanguage),
    onSuccess: (video) => {
      queryClient.invalidateQueries({ queryKey: ['video', video.id] })
    },
  })
}

export function useDeleteVideoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteVideo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}

export function useDeleteVideosMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => deleteVideos(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    },
  })
}
