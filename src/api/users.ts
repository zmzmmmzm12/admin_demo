import type {
  UserDetailResponse,
  UserListResponse,
  UserSearchParams,
  UserStatus,
} from '../types/user'
import { apiClient } from './client'

export async function getUsers(params: UserSearchParams) {
  const response = await apiClient.get<UserListResponse>('/users', { params })
  return response.data
}

export async function getUserDetail(id: string) {
  const response = await apiClient.get<UserDetailResponse>(`/users/${id}`)
  return response.data
}

export async function updateUserStatus(id: string, status: UserStatus) {
  const response = await apiClient.patch<{ data: { id: string; status: UserStatus } }>(
    `/users/${id}/status`,
    { status },
  )
  return response.data.data
}

export async function deleteUser(id: string) {
  const response = await apiClient.delete<{ data: { id: string } }>(`/users/${id}`)
  return response.data.data
}

export async function deleteUsers(ids: string[]) {
  const response = await apiClient.post<{ data: { ids: string[] } }>('/users/bulk-delete', { ids })
  return response.data.data
}
