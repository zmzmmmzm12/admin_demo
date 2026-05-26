import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { UserFilterModal, type UserFilterValues } from '../components/UserFilterModal'
import { useAppPreferences } from '../contexts/AppPreferencesContext'
import { useUpdateUserStatusMutation, useUsersQuery } from '../hooks/useUsersQuery'
import { useDialogActions } from '../store/dialogStore'
import { useUserFilterStore } from '../store/useUserFilterStore'
import type { UserStatus } from '../types/user'

const PAGE_SIZE_OPTIONS = [10, 50, 100] as const

const roleLabelKey = {
  super: 'users.role.super',
  manager: 'users.role.manager',
  operator: 'users.role.operator',
} as const

const nextStatusMap: Record<UserStatus, UserStatus> = {
  active: 'suspended',
  pending: 'active',
  suspended: 'active',
}

export function UserListPage() {
  const {
    page,
    pageSize,
    searchField,
    keyword,
    status,
    role,
    setSearchField,
    setKeyword,
    setStatus,
    setRole,
    setPage,
    setPageSize,
    toSearchParams,
  } = useUserFilterStore()

  const { t, locale } = useAppPreferences()
  const { openAlert, openConfirm } = useDialogActions()
  const numberLocale = locale === 'ko' ? 'ko-KR' : 'en-US'

  const [filterOpen, setFilterOpen] = useState(false)

  const searchParams = toSearchParams()
  const usersQuery = useUsersQuery(searchParams)
  const updateStatusMutation = useUpdateUserStatusMutation()

  const list = usersQuery.data?.data ?? []
  const totalCount = usersQuery.data?.totalCount ?? 0

  const filterValue = useMemo<UserFilterValues>(
    () => ({
      searchField,
      keyword,
      status,
      role,
    }),
    [keyword, role, searchField, status],
  )

  return (
    <section>
      <PageHeader title={t('users.title')} description={t('users.description')} />

      <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pt-7">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100"
              onClick={() => setFilterOpen(true)}
            >
              <span className="material-symbols-outlined text-base">tune</span>
              {t('users.filter')}
            </button>
          </div>

          <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white pl-2.5 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100">
            <span className="whitespace-nowrap text-xs">{t('users.listSize')}</span>
            <div className="relative">
              <select
                className="h-7 min-w-[64px] appearance-none rounded-md bg-white pl-2 pr-6 text-xs text-slate-700 outline-none dark:bg-dark-surface dark:text-slate-100"
                value={String(pageSize)}
                onChange={(event) => setPageSize(Number(event.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={String(size)}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                expand_more
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-2 text-xs text-slate-500 dark:text-slate-400">
          {t('users.resultCount', { count: totalCount.toLocaleString(numberLocale) })}
        </div>

        <div className="overflow-x-auto overflow-y-hidden pb-2">
          <table className="w-full min-w-[1024px]">
            <thead className="border-b border-slate-100 text-center text-xs text-slate-400 dark:border-dark-border dark:text-slate-300">
              <tr>
                <th className="whitespace-nowrap px-6 py-3">No</th>
                <th className="whitespace-nowrap px-6 py-3">{t('users.table.status')}</th>
                <th className="whitespace-nowrap px-6 py-3">{t('users.table.name')}</th>
                <th className="whitespace-nowrap px-6 py-3">{t('users.table.email')}</th>
                <th className="whitespace-nowrap px-6 py-3">{t('users.table.role')}</th>
                <th className="whitespace-nowrap px-6 py-3">{t('users.table.joinDate')}</th>
                <th className="whitespace-nowrap px-6 py-3">{t('users.table.lastLogin')}</th>
                <th className="whitespace-nowrap px-6 py-3">{t('users.table.manage')}</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    {t('common.loadingUsers')}
                  </td>
                </tr>
              )}
              {usersQuery.isError && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-rose-500 dark:text-rose-300">
                    {t('common.errorUsers')}
                  </td>
                </tr>
              )}
              {!usersQuery.isLoading && !usersQuery.isError && list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                    {t('users.empty')}
                  </td>
                </tr>
              )}
              {list.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 text-center text-sm text-slate-600 dark:border-dark-border dark:text-slate-100"
                >
                  <td className="whitespace-nowrap px-6 py-3">{(page - 1) * pageSize + index + 1}</td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <Link to={`/users/${user.id}`} className="font-semibold text-slate-600 dark:text-slate-100">
                      {user.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">{user.email}</td>
                  <td className="whitespace-nowrap px-6 py-3">{t(roleLabelKey[user.role])}</td>
                  <td className="whitespace-nowrap px-6 py-3">{dayjs(user.joinDate).format('YYYY.MM.DD')}</td>
                  <td className="whitespace-nowrap px-6 py-3">
                    {dayjs(user.lastLoginAt).format('YYYY.MM.DD HH:mm')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    {(() => {
                      const actionLabel =
                        user.status === 'active'
                          ? t('users.action.suspend')
                          : user.status === 'pending'
                            ? t('users.action.approve')
                            : t('users.action.activate')

                      return (
                        <button
                          type="button"
                          className={`inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs ${
                            user.status === 'active'
                              ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                              : user.status === 'pending'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                                : 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300'
                          }`}
                          disabled={updateStatusMutation.isPending}
                          onClick={() =>
                            openConfirm(
                              t('users.confirmChangeStatus', { action: actionLabel }),
                              () =>
                                updateStatusMutation.mutate({
                                  id: user.id,
                                  status: nextStatusMap[user.status],
                                }, {
                                  onSuccess: () => openAlert(t('common.completed')),
                                  onError: () => openAlert(t('common.failed')),
                                }),
                            )
                          }
                        >
                          {actionLabel}
                        </button>
                      )
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination total={totalCount} curr={page} limit={pageSize} movePage={setPage} />
      </div>

      <UserFilterModal
        open={filterOpen}
        loading={usersQuery.isFetching}
        value={filterValue}
        onClose={() => setFilterOpen(false)}
        onApply={(nextValue) => {
          setSearchField(nextValue.searchField)
          setKeyword(nextValue.keyword.trim())
          setStatus(nextValue.status)
          setRole(nextValue.role)
          setFilterOpen(false)
        }}
      />
    </section>
  )
}
