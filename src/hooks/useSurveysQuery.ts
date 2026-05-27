import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSurvey,
  deleteSurvey,
  deleteSurveys,
  getSurveyDetail,
  getSurveys,
  updateSurvey,
} from '../api/surveys'
import type { SurveySavePayload, SurveySearchParams } from '../types/admin'

export function useSurveysQuery(params: SurveySearchParams) {
  return useQuery({
    queryKey: ['surveys', params],
    queryFn: () => getSurveys(params),
    placeholderData: (prev) => prev,
  })
}

export function useSurveyDetailQuery(id: string) {
  return useQuery({
    queryKey: ['survey', id],
    queryFn: () => getSurveyDetail(id),
    enabled: Boolean(id),
  })
}

export function useSaveSurveyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: SurveySavePayload }) =>
      id ? updateSurvey(id, payload) : createSurvey(payload),
    onSuccess: (survey) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
      queryClient.invalidateQueries({ queryKey: ['survey', survey.id] })
    },
  })
}

export function useDeleteSurveyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteSurvey(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
      queryClient.invalidateQueries({ queryKey: ['survey', id] })
    },
  })
}

export function useDeleteSurveysMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => deleteSurveys(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
    },
  })
}
