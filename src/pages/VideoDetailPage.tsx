import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useAppPreferences } from '../contexts/AppPreferencesContext'
import {
  useCreateSubtitleMutation,
  useDeleteSubtitleMutation,
  useDeleteSubtitlesMutation,
  useExtractSubtitlesMutation,
  useTranslateSubtitlesMutation,
  useVideoDetailQuery,
} from '../hooks/useVideosQuery'
import { useDialogActions } from '../store/dialogStore'

export function VideoDetailPage() {
  const { videoId } = useParams<{ videoId: string }>()
  const { t } = useAppPreferences()
  const { openAlert, openConfirm } = useDialogActions()
  const detailQuery = useVideoDetailQuery(videoId ?? '')
  const createSubtitleMutation = useCreateSubtitleMutation()
  const deleteSubtitleMutation = useDeleteSubtitleMutation()
  const deleteSubtitlesMutation = useDeleteSubtitlesMutation()
  const extractSubtitlesMutation = useExtractSubtitlesMutation()
  const translateSubtitlesMutation = useTranslateSubtitlesMutation()

  const [language, setLanguage] = useState('ko')
  const [label, setLabel] = useState('')
  const [startTime, setStartTime] = useState('00:00:01')
  const [endTime, setEndTime] = useState('00:00:05')
  const [text, setText] = useState('')
  const [translateToLanguage, setTranslateToLanguage] = useState('en')
  const [selectedSubtitleIds, setSelectedSubtitleIds] = useState<string[]>([])
  const labelInputRef = useRef<HTMLInputElement>(null)

  if (!videoId) {
    return null
  }

  const video = detailQuery.data
  const isAllSelected =
    (video?.subtitles.length ?? 0) > 0 &&
    video?.subtitles.every((subtitle) => selectedSubtitleIds.includes(subtitle.id))

  const languageSummary = useMemo(() => {
    if (!video) return []
    const map = new Map<string, number>()
    video.subtitles.forEach((subtitle) => {
      map.set(subtitle.language, (map.get(subtitle.language) ?? 0) + 1)
    })
    return Array.from(map.entries()).map(([lang, count]) => ({ lang, count }))
  }, [video])

  useEffect(() => {
    if (!video) {
      setSelectedSubtitleIds([])
      return
    }
    const visibleIds = new Set(video.subtitles.map((subtitle) => subtitle.id))
    setSelectedSubtitleIds((prev) => prev.filter((id) => visibleIds.has(id)))
  }, [video])

  const onCreateSubtitle = () => {
    if (!label.trim() || !text.trim()) {
      openAlert(t('videos.subtitleValidation'))
      return
    }

    createSubtitleMutation.mutate(
      {
        id: videoId,
        payload: {
          language,
          label: label.trim(),
          startTime,
          endTime,
          text: text.trim(),
        },
      },
      {
        onSuccess: () => {
          openAlert(t('common.completed'))
          setLabel('')
          setText('')
        },
        onError: () => {
          openAlert(t('common.failed'))
        },
      },
    )
  }

  const onExtractSubtitles = () => {
    openConfirm(t('videos.confirmExtract'), () =>
      extractSubtitlesMutation.mutate(videoId, {
        onSuccess: () => openAlert(t('common.completed')),
        onError: () => openAlert(t('common.failed')),
      }),
    )
  }

  const onTranslateSubtitles = () => {
    if (!translateToLanguage) {
      openAlert(t('videos.subtitleValidation'))
      return
    }

    openConfirm(t('videos.confirmTranslate', { lang: translateToLanguage.toUpperCase() }), () =>
      translateSubtitlesMutation.mutate(
        { videoId, toLanguage: translateToLanguage },
        {
          onSuccess: () => openAlert(t('common.completed')),
          onError: () => openAlert(t('common.failed')),
        },
      ),
    )
  }

  const onAddLanguage = () => {
    setLabel(`${language.toUpperCase()} Subtitle`)
    window.requestAnimationFrame(() => {
      labelInputRef.current?.focus()
      labelInputRef.current?.select()
    })
  }

  return (
    <section>
      <PageHeader title={t('videos.detailTitle')} description={t('videos.detailDescription')} />
      <div className="mx-3 space-y-4 pb-8">
        <div className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
          {detailQuery.isLoading && <p className="py-16 text-center text-sm text-slate-500">{t('videos.loading')}</p>}
          {detailQuery.isError && <p className="py-16 text-center text-sm text-rose-500">{t('videos.error')}</p>}
          {!detailQuery.isLoading && !detailQuery.isError && video && (
            <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <img src={video.thumbnailUrl} alt={video.title} className="h-[190px] w-full rounded-md object-cover" />
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{video.title}</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{video.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
                  <span>{video.category}</span>
                  <span>·</span>
                  <span>{video.duration}</span>
                  <span>·</span>
                  <span>{video.views.toLocaleString()} views</span>
                  <span>·</span>
                  <span>{dayjs(video.updatedAt).format('YYYY.MM.DD HH:mm')}</span>
                </div>
                <div className="mt-4">
                  <Link
                    to="/videos"
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-dark-border dark:text-slate-200"
                  >
                    {t('common.backToList')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {video && (
          <>
            <div className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('videos.subtitleFormTitle')}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
                    disabled={extractSubtitlesMutation.isPending}
                    onClick={onExtractSubtitles}
                  >
                    {t('videos.extractSubtitle')}
                  </button>
                  <select
                    value={translateToLanguage}
                    className="h-8 rounded-md border border-slate-200 px-2.5 text-xs dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                    onChange={(event) => setTranslateToLanguage(event.target.value)}
                  >
                    <option value="en">EN</option>
                    <option value="ja">JA</option>
                    <option value="zh">ZH</option>
                  </select>
                  <button
                    type="button"
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                    disabled={translateSubtitlesMutation.isPending}
                    onClick={onTranslateSubtitles}
                  >
                    {t('videos.autoTranslate')}
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs text-sky-600 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300"
                    onClick={onAddLanguage}
                  >
                    {t('videos.addLanguage')}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {languageSummary.length === 0 ? (
                  <span className="text-slate-400 dark:text-slate-500">{t('videos.emptySubtitle')}</span>
                ) : (
                  languageSummary.map((item) => (
                    <span
                      key={item.lang}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-200"
                    >
                      {item.lang.toUpperCase()} · {item.count}
                    </span>
                  ))
                )}
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                >
                  <option value="ko">Korean</option>
                  <option value="en">English</option>
                  <option value="ja">Japanese</option>
                </select>
                <input
                  ref={labelInputRef}
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder={t('videos.subtitleLabel')}
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                />
                <input
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                />
                <input
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                />
                <button
                  type="button"
                  className="rounded-md bg-main-color px-3 py-2 text-sm text-white"
                  disabled={createSubtitleMutation.isPending}
                  onClick={onCreateSubtitle}
                >
                  {t('videos.addSubtitle')}
                </button>
              </div>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={t('videos.subtitleText')}
                className="mt-3 min-h-24 w-full rounded-md border border-slate-200 p-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
              />
            </div>

            <div className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('videos.subtitleListTitle')}</h3>
                {selectedSubtitleIds.length > 0 && (
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="rounded-md bg-rose-500 px-3 py-1.5 text-xs text-white"
                      disabled={deleteSubtitlesMutation.isPending}
                      onClick={() =>
                        openConfirm(t('videos.confirmBulkSubtitleDelete'), () =>
                          deleteSubtitlesMutation.mutate(
                            { videoId, subtitleIds: selectedSubtitleIds },
                            {
                              onSuccess: () => {
                                setSelectedSubtitleIds([])
                                openAlert(t('common.completed'))
                              },
                              onError: () => openAlert(t('common.failed')),
                            },
                          ),
                        )
                      }
                    >
                      {t('videos.delete')}
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead className="border-y border-slate-100 text-center text-xs text-slate-400 dark:border-dark-border dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-2">
                        <input
                          type="checkbox"
                          className="size-4 cursor-pointer appearance-auto accent-main-color"
                          checked={Boolean(isAllSelected)}
                          onChange={(event) =>
                            setSelectedSubtitleIds(event.target.checked ? (video?.subtitles.map((item) => item.id) ?? []) : [])
                          }
                        />
                      </th>
                      <th className="px-4 py-2">No</th>
                      <th className="px-4 py-2">Language</th>
                      <th className="px-4 py-2">Label</th>
                      <th className="px-4 py-2">Start</th>
                      <th className="px-4 py-2">End</th>
                      <th className="px-4 py-2">Text</th>
                      <th className="px-4 py-2">Created</th>
                      <th className="px-4 py-2 text-right" />
                    </tr>
                  </thead>
                  <tbody>
                    {video.subtitles.map((subtitle, index) => (
                      <tr
                        key={subtitle.id}
                        className="border-b border-slate-100 text-sm text-slate-600 dark:border-dark-border dark:text-slate-100"
                      >
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            className="size-4 cursor-pointer appearance-auto accent-main-color"
                            checked={selectedSubtitleIds.includes(subtitle.id)}
                            onChange={(event) =>
                              setSelectedSubtitleIds((prev) =>
                                event.target.checked
                                  ? prev.includes(subtitle.id)
                                    ? prev
                                    : [...prev, subtitle.id]
                                  : prev.filter((id) => id !== subtitle.id),
                              )
                            }
                          />
                        </td>
                        <td className="px-4 py-2 text-center">{index + 1}</td>
                        <td className="px-4 py-2 text-center">{subtitle.language}</td>
                        <td className="px-4 py-2 text-center">{subtitle.label}</td>
                        <td className="px-4 py-2 text-center">{subtitle.startTime}</td>
                        <td className="px-4 py-2 text-center">{subtitle.endTime}</td>
                        <td className="px-4 py-2">{subtitle.text}</td>
                        <td className="px-4 py-2 text-center">{dayjs(subtitle.createdAt).format('YYYY.MM.DD HH:mm')}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            className="group relative ml-auto flex size-7 items-center justify-center rounded-md bg-slate-400 text-slate-50 dark:bg-slate-500"
                            disabled={deleteSubtitleMutation.isPending}
                            onClick={() =>
                              openConfirm(t('videos.confirmSubtitleDelete'), () =>
                                deleteSubtitleMutation.mutate(
                                  { videoId, subtitleId: subtitle.id },
                                  {
                                    onSuccess: () => openAlert(t('common.completed')),
                                    onError: () => openAlert(t('common.failed')),
                                  },
                                ),
                              )
                            }
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                              {t('videos.delete')}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {video.subtitles.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-300">
                          {t('videos.emptySubtitle')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
