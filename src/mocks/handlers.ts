import { delay, http, HttpResponse } from 'msw'
import { userActivities, users as seededUsers } from '../data/users'
import type { User, UserRole, UserStatus } from '../types/user'

const userDb: User[] = seededUsers.map((user) => ({ ...user }))

function getSummary() {
  const totalUsers = userDb.length
  const activeUsers = userDb.filter((user) => user.status === 'active').length
  const pendingUsers = userDb.filter((user) => user.status === 'pending').length
  const suspendedUsers = userDb.filter((user) => user.status === 'suspended').length
  const monthlySignups = userDb.filter((user) => user.joinDate.startsWith('2026-05')).length

  return {
    totalUsers,
    activeUsers,
    pendingUsers,
    suspendedUsers,
    monthlySignups,
  }
}

function isUserStatus(value: string): value is UserStatus {
  return value === 'active' || value === 'pending' || value === 'suspended'
}

function isUserRole(value: string): value is UserRole {
  return value === 'super' || value === 'manager' || value === 'operator'
}

export const handlers = [
  http.get('/api/dashboard/summary', async () => {
    await delay(250)
    return HttpResponse.json({ data: getSummary() })
  }),

  http.get('/api/users', async ({ request }) => {
    await delay(450)

    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    const searchField = url.searchParams.get('searchField') ?? 'id'
    const keyword = (url.searchParams.get('keyword') ?? '').toLowerCase().trim()
    const status = url.searchParams.get('status') ?? 'all'
    const role = url.searchParams.get('role') ?? 'all'

    let filtered = userDb.filter((user) => {
      if (!keyword) {
        return true
      }

      if (searchField === 'name') {
        return user.name.toLowerCase().includes(keyword)
      }

      if (searchField === 'email') {
        return user.email.toLowerCase().includes(keyword)
      }

      return user.id.toLowerCase().includes(keyword)
    })

    if (status !== 'all' && isUserStatus(status)) {
      filtered = filtered.filter((user) => user.status === status)
    }

    if (role !== 'all' && isUserRole(role)) {
      filtered = filtered.filter((user) => user.role === role)
    }

    const startIndex = (Math.max(1, page) - 1) * pageSize
    const paged = filtered.slice(startIndex, startIndex + Math.max(1, pageSize))

    return HttpResponse.json({
      data: paged,
      totalCount: filtered.length,
    })
  }),

  http.get('/api/users/:id', async ({ params }) => {
    await delay(300)
    const user = userDb.find((item) => item.id === params.id)

    if (!user) {
      return HttpResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    return HttpResponse.json({
      data: user,
      activities: userActivities[user.id] ?? [],
    })
  }),

  http.patch('/api/users/:id/status', async ({ params, request }) => {
    await delay(350)
    const payload = (await request.json()) as { status?: string }
    const user = userDb.find((item) => item.id === params.id)

    if (!user) {
      return HttpResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }

    if (!payload.status || !isUserStatus(payload.status)) {
      return HttpResponse.json({ message: '잘못된 상태값입니다.' }, { status: 400 })
    }

    user.status = payload.status

    return HttpResponse.json({
      data: {
        id: user.id,
        status: user.status,
      },
    })
  }),
]
