import { useQuery } from '@tanstack/react-query'
import { getDashboardData } from '../api/dashboard'

export function useDashboardSummaryQuery() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardData,
  })
}
