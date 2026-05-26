import { create } from 'zustand'
import type { UserRole, UserSearchParams, UserStatus } from '../types/user'

interface UserFilterState {
  page: number
  pageSize: number
  searchField: 'id' | 'name' | 'email'
  keyword: string
  status: 'all' | UserStatus
  role: 'all' | UserRole
  setSearchField: (searchField: 'id' | 'name' | 'email') => void
  setKeyword: (keyword: string) => void
  setStatus: (status: 'all' | UserStatus) => void
  setRole: (role: 'all' | UserRole) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  resetFilters: () => void
  toSearchParams: () => UserSearchParams
}

const initialState = {
  page: 1,
  pageSize: 10,
  searchField: 'id' as const,
  keyword: '',
  status: 'all' as const,
  role: 'all' as const,
}

export const useUserFilterStore = create<UserFilterState>((set, get) => ({
  ...initialState,
  setSearchField: (searchField) => set({ searchField, page: 1 }),
  setKeyword: (keyword) => set({ keyword, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setRole: (role) => set({ role, page: 1 }),
  setPage: (page) => set({ page: Math.max(1, page) }),
  setPageSize: (pageSize) => set({ pageSize: Math.max(1, pageSize), page: 1 }),
  resetFilters: () => set(initialState),
  toSearchParams: () => {
    const state = get()
    return {
      page: state.page,
      pageSize: state.pageSize,
      searchField: state.searchField,
      keyword: state.keyword,
      status: state.status,
      role: state.role,
    }
  },
}))
