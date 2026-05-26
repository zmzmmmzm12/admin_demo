export type UserStatus = 'active' | 'pending' | 'suspended'
export type UserRole = 'super' | 'manager' | 'operator'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  joinDate: string
  lastLoginAt: string
  loginCount: number
}

export interface UserActivity {
  id: string
  action: string
  createdAt: string
}

export interface UserSearchParams {
  page: number
  pageSize: number
  searchField: 'id' | 'name' | 'email'
  keyword: string
  status: 'all' | UserStatus
  role: 'all' | UserRole
}

export interface UserListResponse {
  data: User[]
  totalCount: number
}

export interface UserDetailResponse {
  data: User
  activities: UserActivity[]
}

export interface DashboardSummary {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
  monthlySignups: number
}
