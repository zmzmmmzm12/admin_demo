import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserDetail, getUsers, updateUserStatus } from '../api/users'
import type { UserSearchParams, UserStatus } from '../types/user'

export function useUsersQuery(params: UserSearchParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
    placeholderData: (prev) => prev,
  })
}

export function useUserDetailQuery(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserDetail(id),
  })
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
  })
}
