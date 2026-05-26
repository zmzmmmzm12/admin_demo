import dayjs from 'dayjs'
import { PageHeader } from '../components/PageHeader'
import { useAppPreferences } from '../contexts/AppPreferencesContext'
import { useDashboardSummaryQuery } from '../hooks/useDashboardSummaryQuery'

function TrendChart({ signups }: { signups: Array<{ date: string; signups: number }> }) {
  if (signups.length === 0) {
    return null
  }

  const width = 520
  const height = 160
  const padding = 16
  const max = Math.max(...signups.map((item) => item.signups))
  const stepX = (width - padding * 2) / Math.max(1, signups.length - 1)
  const scaleY = (height - padding * 2) / Math.max(1, max)

  const path = signups
    .map((point, index) => {
      const x = padding + stepX * index
      const y = height - padding - point.signups * scaleY
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <path
        d={`${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
        fill="url(#trendFill)"
      />
      {signups.map((point, index) => {
        const x = padding + stepX * index
        const y = height - padding - point.signups * scaleY
        return <circle key={point.date} cx={x} cy={y} r="3" fill="#4f46e5" />
      })}
    </svg>
  )
}

export function DashboardPage() {
  const summaryQuery = useDashboardSummaryQuery()
  const { t, locale } = useAppPreferences()
  const numberLocale = locale === 'ko' ? 'ko-KR' : 'en-US'

  if (summaryQuery.isLoading) {
    return (
      <p className="mx-3 rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-dark-border dark:bg-dark-surface dark:text-slate-400">
        {t('common.loadingDashboard')}
      </p>
    )
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return (
      <p className="mx-3 rounded-md border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        {t('common.errorDashboard')}
      </p>
    )
  }

  const { summary, trend, channels, statusBreakdown, tasks, alerts } = summaryQuery.data
  const totalChannels = channels.reduce((acc, item) => acc + item.count, 0)
  const donutGradient = channels
    .reduce(
      (acc, item, index) => {
        const ratio = totalChannels > 0 ? item.count / totalChannels : 0
        const next = acc.current + ratio * 100
        const color = ['#4f46e5', '#14b8a6', '#f59e0b', '#ef4444'][index % 4]
        acc.slices.push(`${color} ${acc.current}% ${next}%`)
        acc.current = next
        return acc
      },
      { current: 0, slices: [] as string[] },
    )
    .slices.join(', ')

  return (
    <section>
      <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} />

      <div className="mx-3 space-y-4 pb-8">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.totalUsers')}</p>
            <strong className="mt-2 block text-2xl font-bold text-slate-900 dark:text-slate-100">
              {summary.totalUsers.toLocaleString(numberLocale)}
            </strong>
          </article>
          <article className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.activeUsers')}</p>
            <strong className="mt-2 block text-2xl font-bold text-emerald-600 dark:text-emerald-300">
              {summary.activeUsers.toLocaleString(numberLocale)}
            </strong>
          </article>
          <article className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.pendingUsers')}</p>
            <strong className="mt-2 block text-2xl font-bold text-amber-500 dark:text-amber-300">
              {summary.pendingUsers.toLocaleString(numberLocale)}
            </strong>
          </article>
          <article className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.suspendedUsers')}</p>
            <strong className="mt-2 block text-2xl font-bold text-rose-500 dark:text-rose-300">
              {summary.suspendedUsers.toLocaleString(numberLocale)}
            </strong>
          </article>
          <article className="rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 p-4 text-white shadow-md">
            <p className="text-xs text-white/80">{t('dashboard.monthlyTitle')}</p>
            <strong className="mt-2 block text-2xl font-bold">
              +{summary.monthlySignups.toLocaleString(numberLocale)}
            </strong>
            <p className="mt-1 text-xs text-white/90">{t('dashboard.monthlyGrowth')}</p>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <article className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('dashboard.trendTitle')}</h2>
              <span className="text-xs text-slate-400 dark:text-slate-500">{t('dashboard.last14Days')}</span>
            </div>
            <TrendChart signups={trend} />
            <div className="mt-2 flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>{dayjs(trend[0]?.date).format('MM.DD')}</span>
              <span>{dayjs(trend[trend.length - 1]?.date).format('MM.DD')}</span>
            </div>
          </article>

          <article className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('dashboard.channelTitle')}</h2>
            <div className="mt-4 flex items-center gap-4">
              <div
                className="size-28 rounded-full"
                style={{ background: `conic-gradient(${donutGradient || '#e2e8f0 0% 100%'})` }}
              />
              <div className="space-y-2 text-xs">
                {channels.map((channel, index) => {
                  const color = ['bg-indigo-600', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500'][index % 4]
                  return (
                    <div key={channel.channel} className="flex items-center gap-2 text-slate-600 dark:text-slate-200">
                      <span className={`inline-block size-2.5 rounded-full ${color}`} />
                      <span>{channel.channel}</span>
                      <strong className="ml-auto tabular-nums text-slate-900 dark:text-slate-100">
                        {channel.count.toLocaleString(numberLocale)}
                      </strong>
                    </div>
                  )
                })}
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t('dashboard.statusTitle')}</h2>
            <div className="space-y-3">
              {statusBreakdown.map((item) => {
                const color =
                  item.status === 'active'
                    ? 'bg-emerald-500'
                    : item.status === 'pending'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                const ratio = summary.totalUsers ? Math.round((item.count / summary.totalUsers) * 100) : 0
                return (
                  <div key={item.status}>
                    <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-300">
                      <span>
                        {item.status === 'active'
                          ? t('users.status.active')
                          : item.status === 'pending'
                            ? t('users.status.pending')
                            : t('users.status.suspended')}
                      </span>
                      <strong className="text-slate-700 dark:text-slate-100">{ratio}%</strong>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-dark-surface-alt">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </article>

          <article className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
            <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t('dashboard.tasksTitle')}</h2>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-md border border-slate-100 px-3 py-2 text-xs dark:border-dark-border"
                >
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-700 dark:text-slate-100">{task.title}</strong>
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${
                        task.status === 'done'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : task.status === 'progress'
                            ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-dark-surface-alt dark:text-slate-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-300">
                    {task.assignee} · {dayjs(task.dueDate).format('YYYY.MM.DD')}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
          <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{t('dashboard.alertTitle')}</h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-md border border-slate-100 px-3 py-2 text-xs dark:border-dark-border"
              >
                <div className="flex items-center">
                  <strong className="text-slate-700 dark:text-slate-100">{alert.title}</strong>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${
                      alert.level === 'critical'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                        : alert.level === 'warning'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300'
                          : 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300'
                    }`}
                  >
                    {alert.level}
                  </span>
                </div>
                <p className="mt-1 text-slate-500 dark:text-slate-300">{alert.message}</p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  {dayjs(alert.createdAt).format('YYYY.MM.DD HH:mm')}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
