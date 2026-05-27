import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import type { UserStatus } from '../types/user'

const statusClassMap: Record<UserStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
  suspended: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300',
}

const statusLabelKey: Record<UserStatus, '활성' | '대기' | '정지'> = {
  active: '활성',
  pending: '대기',
  suspended: '정지',
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const { t } = useTranslation()

  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        statusClassMap[status],
      )}
    >
      {t(statusLabelKey[status])}
    </span>
  )
}
