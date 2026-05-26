import type { DashboardData } from '../types/admin'
import { apiClient } from './client'

interface DashboardDataResponse {
  data: DashboardData
}

export async function getDashboardData() {
  const response = await apiClient.get<DashboardDataResponse>('/dashboard/summary')
  return response.data.data
}
