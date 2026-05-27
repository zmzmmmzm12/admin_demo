import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <section className="mx-3 mb-8 rounded-md bg-white p-8 text-center shadow-md dark:bg-dark-surface">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {t('페이지를 찾을 수 없습니다.')}
      </h1>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('요청한 주소가 잘못되었거나 삭제되었습니다.')}</p>
      <Link
        to="/"
        className="mt-5 inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-main-color bg-main-color px-4 text-sm text-white"
      >
        {t('대시보드로 이동')}
      </Link>
    </section>
  )
}
