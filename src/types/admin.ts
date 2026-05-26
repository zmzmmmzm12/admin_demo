import type { UserStatus } from './user'

export interface DashboardTrendPoint {
  date: string
  signups: number
  visitors: number
}

export interface DashboardChannel {
  channel: string
  count: number
}

export type DashboardTaskStatus = 'todo' | 'progress' | 'done'

export interface DashboardTask {
  id: string
  title: string
  assignee: string
  dueDate: string
  status: DashboardTaskStatus
}

export type DashboardAlertLevel = 'info' | 'warning' | 'critical'

export interface DashboardAlert {
  id: string
  title: string
  message: string
  createdAt: string
  level: DashboardAlertLevel
}

export interface DashboardSummary {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  suspendedUsers: number
  monthlySignups: number
}

export interface DashboardData {
  summary: DashboardSummary
  trend: DashboardTrendPoint[]
  channels: DashboardChannel[]
  statusBreakdown: Array<{ status: UserStatus; count: number }>
  tasks: DashboardTask[]
  alerts: DashboardAlert[]
}

export type NoticeStatus = 'published' | 'draft'

export interface Notice {
  id: string
  title: string
  category: string
  status: NoticeStatus
  author: string
  createdAt: string
  updatedAt: string
  content: string
}

export interface NoticeSearchParams {
  page: number
  pageSize: number
  keyword: string
  status: 'all' | NoticeStatus
}

export interface NoticeListResponse {
  data: Notice[]
  totalCount: number
}

export interface NoticeSavePayload {
  title: string
  category: string
  status: NoticeStatus
  content: string
}

export type VideoStatus = 'ready' | 'encoding' | 'blocked'

export interface SubtitleTrack {
  id: string
  language: string
  label: string
  startTime: string
  endTime: string
  text: string
  createdAt: string
}

export interface VideoItem {
  id: string
  title: string
  category: string
  status: VideoStatus
  duration: string
  views: number
  updatedAt: string
  thumbnailUrl: string
}

export interface VideoDetail extends VideoItem {
  description: string
  subtitles: SubtitleTrack[]
}

export interface VideoSearchParams {
  page: number
  pageSize: number
  keyword: string
  status: 'all' | VideoStatus
}

export interface VideoListResponse {
  data: VideoItem[]
  totalCount: number
}

export interface SubtitlePayload {
  language: string
  label: string
  startTime: string
  endTime: string
  text: string
}
