import type {
  SurveyItem,
  SurveyListResponse,
  SurveySavePayload,
  SurveySearchParams,
} from '../types/admin'
import { apiClient } from './client'

export async function getSurveys(params: SurveySearchParams) {
  const response = await apiClient.get<SurveyListResponse>('/surveys', { params })
  return response.data
}

export async function getSurveyDetail(id: string) {
  const response = await apiClient.get<{ data: SurveyItem }>(`/surveys/${id}`)
  return response.data.data
}

export async function createSurvey(payload: SurveySavePayload) {
  const response = await apiClient.post<{ data: SurveyItem }>('/surveys', payload)
  return response.data.data
}

export async function updateSurvey(id: string, payload: SurveySavePayload) {
  const response = await apiClient.put<{ data: SurveyItem }>(`/surveys/${id}`, payload)
  return response.data.data
}

export async function deleteSurvey(id: string) {
  const response = await apiClient.delete<{ data: { id: string } }>(`/surveys/${id}`)
  return response.data.data
}

export async function deleteSurveys(ids: string[]) {
  const response = await apiClient.post<{ data: { ids: string[] } }>('/surveys/bulk-delete', { ids })
  return response.data.data
}
