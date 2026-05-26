import { PageHeader } from '../components/PageHeader'
import { useAppPreferences } from '../contexts/AppPreferencesContext'
import { useDashboardSummaryQuery } from '../hooks/useDashboardSummaryQuery'

const labels = [
  { key: 'totalUsers', labelKey: 'dashboard.totalUsers' },
  { key: 'activeUsers', labelKey: 'dashboard.activeUsers' },
  { key: 'pendingUsers', labelKey: 'dashboard.pendingUsers' },
  { key: 'suspendedUsers', labelKey: 'dashboard.suspendedUsers' },
] as const

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

  return (
    <section>
      <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} />

      <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="grid gap-0 border-b border-slate-100 dark:border-dark-border sm:grid-cols-2 2xl:grid-cols-4">
          {labels.map((item) => (
            <article
              key={item.key}
              className="border-r border-slate-100 px-6 py-5 last:border-r-0 dark:border-dark-border"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">{t(item.labelKey)}</p>
              <strong className="mt-2 block text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {summaryQuery.data[item.key].toLocaleString(numberLocale)}
              </strong>
            </article>
          ))}
        </div>

        <section className="p-6">
          <div className="rounded-md bg-gradient-to-r from-main-color to-rose-500 px-5 py-4 text-white">
            <h2 className="text-base font-semibold">{t('dashboard.monthlyTitle')}</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              +{summaryQuery.data.monthlySignups.toLocaleString(numberLocale)}
            </p>
            <p className="mt-1 text-sm text-white/90">{t('dashboard.monthlyGrowth')}</p>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-4 dark:bg-dark-surface-alt">
              <p className="font-medium text-slate-900 dark:text-slate-100">{t('dashboard.riskTitle')}</p>
              <p className="mt-1">{t('dashboard.riskDesc')}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4 dark:bg-dark-surface-alt">
              <p className="font-medium text-slate-900 dark:text-slate-100">{t('dashboard.pendingTitle')}</p>
              <p className="mt-1">{t('dashboard.pendingDesc')}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4 dark:bg-dark-surface-alt">
              <p className="font-medium text-slate-900 dark:text-slate-100">{t('dashboard.alertTitle')}</p>
              <p className="mt-1">{t('dashboard.alertDesc')}</p>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}
