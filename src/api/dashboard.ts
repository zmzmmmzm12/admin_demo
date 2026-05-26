import type { DashboardSummary } from '../types/user'
import { apiClient } from './client'

interface DashboardSummaryResponse {
  data: DashboardSummary
}

export async function getDashboardSummary() {
  const response = await apiClient.get<DashboardSummaryResponse>('/dashboard/summary')
  return response.data.data
}
