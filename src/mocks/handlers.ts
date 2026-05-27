import { delay, http, HttpResponse } from 'msw'
import { dashboardAlertsSeed, dashboardTasksSeed, dashboardTrendSeed, noticesSeed, videosSeed } from '../data/admin'
import { userActivities, users as seededUsers } from '../data/users'
import type { Notice, NoticeStatus, SubtitleTrack, VideoDetail, VideoStatus } from '../types/admin'
import type { User as UserEntity, UserRole, UserStatus } from '../types/user'

const userDb: UserEntity[] = seededUsers.map((user) => ({ ...user }))
const noticeDb: Notice[] = noticesSeed.map((notice) => ({ ...notice }))
const videoDb: VideoDetail[] = videosSeed.map((video) => ({
  ...video,
  subtitles: video.subtitles.map((subtitle) => ({ ...subtitle })),
}))

function getUserSummary() {
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

function getDashboardData() {
  const summary = getUserSummary()
  const channels = [
    { channel: 'Organic', count: 2134 },
    { channel: 'Ads', count: 1450 },
    { channel: 'SNS', count: 980 },
    { channel: 'Partner', count: 624 },
  ]

  return {
    summary,
    trend: dashboardTrendSeed,
    channels,
    statusBreakdown: [
      { status: 'active' as UserStatus, count: summary.activeUsers },
      { status: 'pending' as UserStatus, count: summary.pendingUsers },
      { status: 'suspended' as UserStatus, count: summary.suspendedUsers },
    ],
    tasks: dashboardTasksSeed,
    alerts: dashboardAlertsSeed,
  }
}

function isUserStatus(value: string): value is UserStatus {
  return value === 'active' || value === 'pending' || value === 'suspended'
}

function isUserRole(value: string): value is UserRole {
  return value === 'super' || value === 'manager' || value === 'operator'
}

function isNoticeStatus(value: string): value is NoticeStatus {
  return value === 'published' || value === 'draft'
}

function isVideoStatus(value: string): value is VideoStatus {
  return value === 'ready' || value === 'encoding' || value === 'blocked'
}

function paginate<T>(list: T[], page: number, pageSize: number) {
  const normalizedPage = Math.max(1, page)
  const normalizedSize = Math.max(1, pageSize)
  const startIndex = (normalizedPage - 1) * normalizedSize
  return list.slice(startIndex, startIndex + normalizedSize)
}

export const handlers = [
  http.get('/api/dashboard/summary', async () => {
    await delay(250)
    return HttpResponse.json({ data: getDashboardData() })
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

    return HttpResponse.json({
      data: paginate(filtered, page, pageSize),
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
    return HttpResponse.json({ data: { id: user.id, status: user.status } })
  }),

  http.post('/api/users/bulk-delete', async ({ request }) => {
    await delay(280)
    const payload = (await request.json()) as { ids?: string[] }
    const ids = Array.isArray(payload.ids) ? payload.ids : []
    const idSet = new Set(ids)
    for (let index = userDb.length - 1; index >= 0; index -= 1) {
      if (idSet.has(userDb[index].id)) {
        userDb.splice(index, 1)
      }
    }
    return HttpResponse.json({ data: { ids } })
  }),

  http.delete('/api/users/:id', async ({ params }) => {
    await delay(260)
    const index = userDb.findIndex((item) => item.id === params.id)
    if (index < 0) {
      return HttpResponse.json({ message: '사용자를 찾을 수 없습니다.' }, { status: 404 })
    }
    const [removed] = userDb.splice(index, 1)
    return HttpResponse.json({ data: { id: removed.id } })
  }),

  http.get('/api/notices', async ({ request }) => {
    await delay(250)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    const keyword = (url.searchParams.get('keyword') ?? '').toLowerCase().trim()
    const status = url.searchParams.get('status') ?? 'all'

    let filtered = noticeDb
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    if (keyword) {
      filtered = filtered.filter(
        (notice) =>
          notice.title.toLowerCase().includes(keyword) ||
          notice.category.toLowerCase().includes(keyword) ||
          notice.author.toLowerCase().includes(keyword),
      )
    }

    if (status !== 'all' && isNoticeStatus(status)) {
      filtered = filtered.filter((notice) => notice.status === status)
    }

    return HttpResponse.json({
      data: paginate(filtered, page, pageSize),
      totalCount: filtered.length,
    })
  }),

  http.get('/api/notices/:id', async ({ params }) => {
    await delay(220)
    const notice = noticeDb.find((item) => item.id === params.id)
    if (!notice) {
      return HttpResponse.json({ message: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
    }
    return HttpResponse.json({ data: notice })
  }),

  http.post('/api/notices', async ({ request }) => {
    await delay(260)
    const payload = (await request.json()) as {
      title?: string
      category?: string
      status?: string
      content?: string
    }

    if (!payload.title || !payload.category || !payload.content || !payload.status || !isNoticeStatus(payload.status)) {
      return HttpResponse.json({ message: '입력값이 올바르지 않습니다.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const newNotice: Notice = {
      id: `NT-${1000 + noticeDb.length + 1}`,
      title: payload.title.trim(),
      category: payload.category.trim(),
      status: payload.status,
      author: '현재 관리자',
      createdAt: now,
      updatedAt: now,
      content: payload.content,
    }
    noticeDb.unshift(newNotice)
    return HttpResponse.json({ data: newNotice }, { status: 201 })
  }),

  http.put('/api/notices/:id', async ({ params, request }) => {
    await delay(260)
    const notice = noticeDb.find((item) => item.id === params.id)
    if (!notice) {
      return HttpResponse.json({ message: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
    }

    const payload = (await request.json()) as {
      title?: string
      category?: string
      status?: string
      content?: string
    }

    if (!payload.title || !payload.category || !payload.content || !payload.status || !isNoticeStatus(payload.status)) {
      return HttpResponse.json({ message: '입력값이 올바르지 않습니다.' }, { status: 400 })
    }

    notice.title = payload.title.trim()
    notice.category = payload.category.trim()
    notice.status = payload.status
    notice.content = payload.content
    notice.updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: notice })
  }),

  http.post('/api/notices/bulk-delete', async ({ request }) => {
    await delay(240)
    const payload = (await request.json()) as { ids?: string[] }
    const ids = Array.isArray(payload.ids) ? payload.ids : []
    const idSet = new Set(ids)
    for (let index = noticeDb.length - 1; index >= 0; index -= 1) {
      if (idSet.has(noticeDb[index].id)) {
        noticeDb.splice(index, 1)
      }
    }
    return HttpResponse.json({ data: { ids } })
  }),

  http.delete('/api/notices/:id', async ({ params }) => {
    await delay(220)
    const index = noticeDb.findIndex((item) => item.id === params.id)
    if (index < 0) {
      return HttpResponse.json({ message: '공지사항을 찾을 수 없습니다.' }, { status: 404 })
    }
    const [removed] = noticeDb.splice(index, 1)
    return HttpResponse.json({ data: { id: removed.id } })
  }),

  http.get('/api/videos', async ({ request }) => {
    await delay(320)
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    const keyword = (url.searchParams.get('keyword') ?? '').toLowerCase().trim()
    const status = url.searchParams.get('status') ?? 'all'

    let filtered = videoDb
      .map((video) => ({
        id: video.id,
        title: video.title,
        category: video.category,
        status: video.status,
        duration: video.duration,
        views: video.views,
        updatedAt: video.updatedAt,
        thumbnailUrl: video.thumbnailUrl,
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    if (keyword) {
      filtered = filtered.filter((video) => video.title.toLowerCase().includes(keyword))
    }

    if (status !== 'all' && isVideoStatus(status)) {
      filtered = filtered.filter((video) => video.status === status)
    }

    return HttpResponse.json({
      data: paginate(filtered, page, pageSize),
      totalCount: filtered.length,
    })
  }),

  http.get('/api/videos/:id', async ({ params }) => {
    await delay(280)
    const video = videoDb.find((item) => item.id === params.id)
    if (!video) {
      return HttpResponse.json({ message: '영상을 찾을 수 없습니다.' }, { status: 404 })
    }

    return HttpResponse.json({ data: video })
  }),

  http.post('/api/videos/bulk-delete', async ({ request }) => {
    await delay(280)
    const payload = (await request.json()) as { ids?: string[] }
    const ids = Array.isArray(payload.ids) ? payload.ids : []
    const idSet = new Set(ids)
    for (let index = videoDb.length - 1; index >= 0; index -= 1) {
      if (idSet.has(videoDb[index].id)) {
        videoDb.splice(index, 1)
      }
    }
    return HttpResponse.json({ data: { ids } })
  }),

  http.post('/api/videos/:id/subtitles', async ({ params, request }) => {
    await delay(280)
    const video = videoDb.find((item) => item.id === params.id)
    if (!video) {
      return HttpResponse.json({ message: '영상을 찾을 수 없습니다.' }, { status: 404 })
    }

    const payload = (await request.json()) as Partial<SubtitleTrack>
    if (!payload.language || !payload.label || !payload.startTime || !payload.endTime || !payload.text) {
      return HttpResponse.json({ message: '자막 입력값이 올바르지 않습니다.' }, { status: 400 })
    }

    const subtitle: SubtitleTrack = {
      id: `SB-${video.subtitles.length + 1}-${Date.now()}`,
      language: payload.language,
      label: payload.label,
      startTime: payload.startTime,
      endTime: payload.endTime,
      text: payload.text,
      createdAt: new Date().toISOString(),
    }

    video.subtitles.unshift(subtitle)
    video.updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: video }, { status: 201 })
  }),

  http.post('/api/videos/:id/subtitles/extract', async ({ params }) => {
    await delay(400)
    const video = videoDb.find((item) => item.id === params.id)
    if (!video) {
      return HttpResponse.json({ message: '영상을 찾을 수 없습니다.' }, { status: 404 })
    }

    const now = new Date().toISOString()
    video.subtitles = [
      {
        id: `SB-${Date.now()}-1`,
        language: 'ko',
        label: '한국어 자동추출',
        startTime: '00:00:01',
        endTime: '00:00:05',
        text: `${video.title} 자동 추출 자막 1`,
        createdAt: now,
      },
      {
        id: `SB-${Date.now()}-2`,
        language: 'ko',
        label: '한국어 자동추출',
        startTime: '00:00:06',
        endTime: '00:00:11',
        text: `${video.title} 자동 추출 자막 2`,
        createdAt: now,
      },
      {
        id: `SB-${Date.now()}-3`,
        language: 'ko',
        label: '한국어 자동추출',
        startTime: '00:00:12',
        endTime: '00:00:17',
        text: `${video.title} 자동 추출 자막 3`,
        createdAt: now,
      },
    ]
    video.updatedAt = now
    return HttpResponse.json({ data: video })
  }),

  http.post('/api/videos/:id/subtitles/translate', async ({ params, request }) => {
    await delay(380)
    const video = videoDb.find((item) => item.id === params.id)
    if (!video) {
      return HttpResponse.json({ message: '영상을 찾을 수 없습니다.' }, { status: 404 })
    }

    const payload = (await request.json()) as { toLanguage?: string }
    const toLanguage = payload.toLanguage?.trim() || ''
    if (!toLanguage) {
      return HttpResponse.json({ message: '대상 언어가 필요합니다.' }, { status: 400 })
    }

    const baseTracks = video.subtitles.filter((item) => item.language !== toLanguage)
    const translated = baseTracks.map((item, index) => ({
      ...item,
      id: `SB-TR-${Date.now()}-${index + 1}`,
      language: toLanguage,
      label: `${toLanguage.toUpperCase()} Auto`,
      text: `[${toLanguage}] ${item.text}`,
      createdAt: new Date().toISOString(),
    }))

    video.subtitles = [...video.subtitles.filter((item) => item.language !== toLanguage), ...translated]
    video.updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: video })
  }),

  http.put('/api/videos/:id/subtitles/:subtitleId', async ({ params, request }) => {
    await delay(240)
    const video = videoDb.find((item) => item.id === params.id)
    if (!video) {
      return HttpResponse.json({ message: '영상을 찾을 수 없습니다.' }, { status: 404 })
    }

    const subtitle = video.subtitles.find((item) => item.id === params.subtitleId)
    if (!subtitle) {
      return HttpResponse.json({ message: '자막을 찾을 수 없습니다.' }, { status: 404 })
    }

    const payload = (await request.json()) as Partial<SubtitleTrack>
    if (!payload.language || !payload.label || !payload.startTime || !payload.endTime || !payload.text) {
      return HttpResponse.json({ message: '자막 입력값이 올바르지 않습니다.' }, { status: 400 })
    }

    subtitle.language = payload.language
    subtitle.label = payload.label
    subtitle.startTime = payload.startTime
    subtitle.endTime = payload.endTime
    subtitle.text = payload.text
    video.updatedAt = new Date().toISOString()

    return HttpResponse.json({ data: video })
  }),

  http.delete('/api/videos/:id/subtitles/:subtitleId', async ({ params }) => {
    await delay(220)
    const video = videoDb.find((item) => item.id === params.id)
    if (!video) {
      return HttpResponse.json({ message: '영상을 찾을 수 없습니다.' }, { status: 404 })
    }

    video.subtitles = video.subtitles.filter((item) => item.id !== params.subtitleId)
    video.updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: video })
  }),

  http.post('/api/videos/:id/subtitles/bulk-delete', async ({ params, request }) => {
    await delay(260)
    const video = videoDb.find((item) => item.id === params.id)
    if (!video) {
      return HttpResponse.json({ message: '영상을 찾을 수 없습니다.' }, { status: 404 })
    }

    const payload = (await request.json()) as { subtitleIds?: string[] }
    const ids = Array.isArray(payload.subtitleIds) ? payload.subtitleIds : []
    const idSet = new Set(ids)
    video.subtitles = video.subtitles.filter((item) => !idSet.has(item.id))
    video.updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: video })
  }),

  http.delete('/api/videos/:id', async ({ params }) => {
    await delay(240)
    const index = videoDb.findIndex((item) => item.id === params.id)
    if (index < 0) {
      return HttpResponse.json({ message: '영상을 찾을 수 없습니다.' }, { status: 404 })
    }
    const [removed] = videoDb.splice(index, 1)
    return HttpResponse.json({ data: { id: removed.id } })
  }),
]
