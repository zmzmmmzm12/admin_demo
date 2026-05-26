import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { useAppPreferences } from '../contexts/AppPreferencesContext'
import { useDeleteVideoMutation, useDeleteVideosMutation, useVideosQuery } from '../hooks/useVideosQuery'
import { useDialogActions } from '../store/dialogStore'
import type { VideoSearchParams } from '../types/admin'

export function VideoListPage() {
  const { t, locale } = useAppPreferences()
  const { openAlert, openConfirm } = useDialogActions()
  const [params, setParams] = useState<VideoSearchParams>({
    page: 1,
    pageSize: 10,
    keyword: '',
    status: 'all',
  })
  const [draftKeyword, setDraftKeyword] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const numberLocale = locale === 'ko' ? 'ko-KR' : 'en-US'

  const videosQuery = useVideosQuery(params)
  const deleteVideoMutation = useDeleteVideoMutation()
  const deleteVideosMutation = useDeleteVideosMutation()
  const list = videosQuery.data?.data ?? []
  const totalCount = videosQuery.data?.totalCount ?? 0
  const isAllSelected = list.length > 0 && list.every((video) => selectedIds.includes(video.id))

  useEffect(() => {
    const visibleIds = new Set(list.map((video) => video.id))
    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)))
  }, [list])

  return (
    <section>
      <PageHeader title={t('videos.title')} description={t('videos.description')} />
      <div className="mx-3 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-2">
            <input
              value={draftKeyword}
              onChange={(event) => setDraftKeyword(event.target.value)}
              placeholder={t('videos.searchPlaceholder')}
              className="h-9 w-[220px] rounded-md border border-slate-200 px-3 text-sm text-slate-700 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
            />
            <select
              value={params.status}
              className="h-9 rounded-md border border-slate-200 px-3 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
              onChange={(event) =>
                setParams((prev) => ({ ...prev, page: 1, status: event.target.value as VideoSearchParams['status'] }))
              }
            >
              <option value="all">{t('videos.status.all')}</option>
              <option value="ready">{t('videos.status.ready')}</option>
              <option value="encoding">{t('videos.status.encoding')}</option>
              <option value="blocked">{t('videos.status.blocked')}</option>
            </select>
            <button
              type="button"
              className="rounded-md bg-main-color px-3 py-2 text-sm text-white"
              onClick={() => setParams((prev) => ({ ...prev, page: 1, keyword: draftKeyword.trim() }))}
            >
              {t('videos.search')}
            </button>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-3 py-2 text-sm text-white"
                disabled={deleteVideosMutation.isPending}
                onClick={() =>
                  openConfirm(t('videos.confirmBulkDelete'), () =>
                    deleteVideosMutation.mutate(selectedIds, {
                      onSuccess: () => {
                        setSelectedIds([])
                        openAlert(t('common.completed'))
                      },
                      onError: () => openAlert(t('common.failed')),
                    }),
                  )
                }
              >
                <span className="material-symbols-outlined text-base">delete</span>
                {t('videos.delete')}
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-y border-slate-100 text-center text-xs text-slate-400 dark:border-dark-border dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="size-4 cursor-pointer appearance-auto accent-main-color"
                    checked={isAllSelected}
                    onChange={(event) =>
                      setSelectedIds(event.target.checked ? list.map((video) => video.id) : [])
                    }
                  />
                </th>
                <th className="px-6 py-3">No</th>
                <th className="px-6 py-3">{t('videos.table.status')}</th>
                <th className="px-6 py-3">{t('videos.table.video')}</th>
                <th className="px-6 py-3">{t('videos.table.category')}</th>
                <th className="px-6 py-3">{t('videos.table.duration')}</th>
                <th className="px-6 py-3">{t('videos.table.views')}</th>
                <th className="px-6 py-3">{t('videos.table.updatedAt')}</th>
                <th className="px-6 py-3 text-right">{t('videos.table.manage')}</th>
              </tr>
            </thead>
            <tbody>
              {videosQuery.isLoading && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    {t('videos.loading')}
                  </td>
                </tr>
              )}
              {videosQuery.isError && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-sm text-rose-500 dark:text-rose-300">
                    {t('videos.error')}
                  </td>
                </tr>
              )}
              {!videosQuery.isLoading &&
                !videosQuery.isError &&
                list.map((video, index) => (
                  <tr
                    key={video.id}
                    className="border-b border-slate-100 text-center text-sm text-slate-600 dark:border-dark-border dark:text-slate-100"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer appearance-auto accent-main-color"
                        checked={selectedIds.includes(video.id)}
                        onChange={(event) =>
                          setSelectedIds((prev) =>
                            event.target.checked
                              ? prev.includes(video.id)
                                ? prev
                                : [...prev, video.id]
                              : prev.filter((id) => id !== video.id),
                          )
                        }
                      />
                    </td>
                    <td className="px-6 py-3">{(params.page - 1) * params.pageSize + index + 1}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          video.status === 'ready'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                            : video.status === 'encoding'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                        }`}
                      >
                        {video.status === 'ready'
                          ? t('videos.status.ready')
                          : video.status === 'encoding'
                            ? t('videos.status.encoding')
                            : t('videos.status.blocked')}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 text-left">
                        <img src={video.thumbnailUrl} alt={video.title} className="h-10 w-16 rounded object-cover" />
                        <Link to={`/videos/${video.id}`} className="font-medium text-slate-700 dark:text-slate-100">
                          {video.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-3">{video.category}</td>
                    <td className="px-6 py-3">{video.duration}</td>
                    <td className="px-6 py-3">{video.views.toLocaleString(numberLocale)}</td>
                    <td className="px-6 py-3">{dayjs(video.updatedAt).format('YYYY.MM.DD HH:mm')}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/videos/${video.id}`} className="rounded-md bg-main-color px-3 py-1.5 text-xs text-white">
                          {t('videos.manageSubtitle')}
                        </Link>
                        <button
                          type="button"
                          className="group relative flex size-7 items-center justify-center rounded-md bg-slate-400 text-slate-50 dark:bg-slate-500"
                          disabled={deleteVideoMutation.isPending}
                          onClick={() =>
                            openConfirm(t('videos.confirmDelete'), () =>
                              deleteVideoMutation.mutate(video.id, {
                                onSuccess: () => openAlert(t('common.completed')),
                                onError: () => openAlert(t('common.failed')),
                              }),
                            )
                          }
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {t('videos.delete')}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Pagination total={totalCount} curr={params.page} limit={params.pageSize} movePage={(page) => setParams((prev) => ({ ...prev, page }))} />
      </div>
    </section>
  )
}
