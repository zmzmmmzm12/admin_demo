import dayjs from 'dayjs'
import MDEditor from '@uiw/react-md-editor'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useAppPreferences } from '../contexts/AppPreferencesContext'
import { useNoticeDetailQuery } from '../hooks/useNoticesQuery'

export function NoticeDetailPage() {
  const { noticeId } = useParams<{ noticeId: string }>()
  const { theme } = useAppPreferences()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const noticeQuery = useNoticeDetailQuery(noticeId ?? '')
  const notice = noticeQuery.data
  const headerTitle = useMemo(() => t('공지사항 상세'), [t])

  if (!noticeId) {
    return null
  }

  return (
    <section>
      <PageHeader title={headerTitle} description={t('공지사항 내용 확인 및 수정')} />
      <div className="mx-3 rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
        {noticeQuery.isLoading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-7 w-2/3 rounded bg-slate-100 dark:bg-slate-700/70" />
            <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-700/70" />
            <div className="h-64 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-9 w-20 rounded bg-slate-100 dark:bg-slate-700/70" />
            </div>
          </div>
        )}
        {noticeQuery.isError && <p className="py-16 text-center text-sm text-rose-500">{t('공지사항을 불러오지 못했습니다.')}</p>}
        {!noticeQuery.isLoading && !noticeQuery.isError && notice && (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3 dark:border-dark-border">
              <strong className="text-lg text-slate-800 dark:text-slate-100">{notice.title}</strong>
              <span
                className={`rounded-full px-2.5 py-1 text-xs ${
                  notice.status === 'published'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-dark-surface-alt dark:text-slate-300'
                }`}
              >
                {notice.status === 'published' ? t('게시') : t('임시저장')}
              </span>
              <span className="ml-auto text-xs text-slate-400">
                {notice.author} · {dayjs(notice.updatedAt).format('YYYY.MM.DD HH:mm')}
              </span>
            </div>

            <div className="mt-4" data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
              <MDEditor.Markdown source={notice.content} />
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                className="cursor-pointer rounded-md bg-main-color px-3 py-2 text-sm text-white"
                onClick={() => navigate(`/notices/${notice.id}/edit`)}
              >
                {t('수정')}
              </button>
              <Link
                to="/notices"
                className="cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-dark-border dark:text-slate-200"
              >
                {t('목록으로')}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
