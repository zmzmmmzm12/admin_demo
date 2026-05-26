import { Link } from 'react-router-dom'
import { useAppPreferences } from '../contexts/AppPreferencesContext'

export function NotFoundPage() {
  const { t } = useAppPreferences()

  return (
    <section className="mx-3 mb-8 rounded-md bg-white p-8 text-center shadow-md dark:bg-dark-surface">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {t('notFound.title')}
      </h1>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('notFound.description')}</p>
      <Link
        to="/"
        className="mt-5 inline-flex h-9 items-center justify-center rounded-md border border-main-color bg-main-color px-4 text-sm text-white"
      >
        {t('common.goDashboard')}
      </Link>
    </section>
  )
}
