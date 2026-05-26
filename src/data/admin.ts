import type { DashboardAlert, DashboardTask, DashboardTrendPoint, Notice, VideoDetail } from '../types/admin'

export const dashboardTrendSeed: DashboardTrendPoint[] = [
  { date: '2026-05-01', signups: 28, visitors: 512 },
  { date: '2026-05-02', signups: 36, visitors: 544 },
  { date: '2026-05-03', signups: 22, visitors: 480 },
  { date: '2026-05-04', signups: 40, visitors: 601 },
  { date: '2026-05-05', signups: 47, visitors: 640 },
  { date: '2026-05-06', signups: 31, visitors: 564 },
  { date: '2026-05-07', signups: 51, visitors: 701 },
  { date: '2026-05-08', signups: 43, visitors: 673 },
  { date: '2026-05-09', signups: 38, visitors: 622 },
  { date: '2026-05-10', signups: 55, visitors: 754 },
  { date: '2026-05-11', signups: 61, visitors: 812 },
  { date: '2026-05-12', signups: 49, visitors: 729 },
  { date: '2026-05-13', signups: 45, visitors: 690 },
  { date: '2026-05-14', signups: 58, visitors: 781 },
]

export const dashboardTasksSeed: DashboardTask[] = [
  { id: 'TK-1001', title: '신규 회원 승인 정책 정리', assignee: '김민지', dueDate: '2026-05-28', status: 'progress' },
  { id: 'TK-1002', title: '비정상 로그인 모니터링 룰 보강', assignee: '박서준', dueDate: '2026-05-29', status: 'todo' },
  { id: 'TK-1003', title: '정지 해제 요청 처리', assignee: '윤다은', dueDate: '2026-05-27', status: 'done' },
  { id: 'TK-1004', title: '이탈 위험군 캠페인 세그먼트 확정', assignee: '임수빈', dueDate: '2026-05-30', status: 'progress' },
]

export const dashboardAlertsSeed: DashboardAlert[] = [
  {
    id: 'AL-201',
    title: '비정상 로그인 시도 증가',
    message: '최근 24시간 동안 특정 IP 대역에서 로그인 실패가 급증했습니다.',
    createdAt: '2026-05-26T10:13:00+09:00',
    level: 'critical',
  },
  {
    id: 'AL-202',
    title: '신규 승인 대기 누적',
    message: '승인 대기 회원이 목표치(30명)를 초과했습니다.',
    createdAt: '2026-05-26T08:46:00+09:00',
    level: 'warning',
  },
  {
    id: 'AL-203',
    title: '백오피스 정기 점검 예정',
    message: '2026-05-28 02:00(KST) 정기 점검이 진행됩니다.',
    createdAt: '2026-05-25T17:20:00+09:00',
    level: 'info',
  },
]

export const noticesSeed: Notice[] = [
  {
    id: 'NT-1001',
    title: '5월 운영 정책 변경 안내',
    category: '운영',
    status: 'published',
    author: '김민지',
    createdAt: '2026-05-10T09:20:00+09:00',
    updatedAt: '2026-05-10T09:20:00+09:00',
    content:
      '### 변경 내용\n회원 승인 SLA 기준이 **48시간**에서 **24시간**으로 조정됩니다.\n- 적용일: 2026-05-15\n- 대상: 전체 운영자',
  },
  {
    id: 'NT-1002',
    title: '서비스 점검 공지',
    category: '점검',
    status: 'published',
    author: '박서준',
    createdAt: '2026-05-16T14:03:00+09:00',
    updatedAt: '2026-05-17T11:31:00+09:00',
    content:
      '# 서비스 점검 공지\n2026-05-28 02:00~04:00(KST) 서비스 점검이 진행됩니다.\n점검 중 일부 관리 기능이 일시 중단될 수 있습니다.',
  },
  {
    id: 'NT-1003',
    title: '영상 업로드 가이드 업데이트',
    category: '콘텐츠',
    status: 'draft',
    author: '윤다은',
    createdAt: '2026-05-21T13:44:00+09:00',
    updatedAt: '2026-05-21T13:44:00+09:00',
    content: '초안 작성 중입니다.\n- 인코딩 실패 대응 섹션 보강 예정\n- FAQ 섹션 추가 예정',
  },
]

export const videosSeed: VideoDetail[] = [
  {
    id: 'VD-501',
    title: '2026 브랜드 캠페인 하이라이트',
    category: '캠페인',
    status: 'ready',
    duration: '03:42',
    views: 12840,
    updatedAt: '2026-05-26T09:11:00+09:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=640&q=80',
    description: '주요 이벤트 컷을 편집한 하이라이트 영상입니다.',
    subtitles: [
      {
        id: 'SB-1',
        language: 'ko',
        label: '한국어 기본',
        startTime: '00:00:01',
        endTime: '00:00:05',
        text: '2026 브랜드 캠페인 하이라이트를 시작합니다.',
        createdAt: '2026-05-25T16:20:00+09:00',
      },
    ],
  },
  {
    id: 'VD-502',
    title: '신규 기능 튜토리얼',
    category: '가이드',
    status: 'encoding',
    duration: '07:15',
    views: 8940,
    updatedAt: '2026-05-26T07:34:00+09:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=640&q=80',
    description: '신규 대시보드 기능 설명을 위한 튜토리얼 영상입니다.',
    subtitles: [],
  },
  {
    id: 'VD-503',
    title: '제품 리뷰 요약',
    category: '리뷰',
    status: 'blocked',
    duration: '05:10',
    views: 5120,
    updatedAt: '2026-05-24T18:01:00+09:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=640&q=80',
    description: '저작권 검수 이슈로 게시가 보류된 상태입니다.',
    subtitles: [
      {
        id: 'SB-2',
        language: 'en',
        label: 'English',
        startTime: '00:00:02',
        endTime: '00:00:08',
        text: 'Welcome to this product review summary.',
        createdAt: '2026-05-23T12:11:00+09:00',
      },
    ],
  },
  {
    id: 'VD-504',
    title: '파트너 인터뷰 풀버전',
    category: '인터뷰',
    status: 'ready',
    duration: '14:28',
    views: 20133,
    updatedAt: '2026-05-22T10:47:00+09:00',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?auto=format&fit=crop&w=640&q=80',
    description: '파트너사 리더 인터뷰 풀버전 콘텐츠입니다.',
    subtitles: [],
  },
]
