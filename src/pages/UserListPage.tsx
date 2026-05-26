import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import {
  UserFilterModal,
  type UserFilterValues,
} from "../components/UserFilterModal";
import { useAppPreferences } from "../contexts/AppPreferencesContext";
import {
  useDeleteUserMutation,
  useDeleteUsersMutation,
  useUpdateUserStatusMutation,
  useUsersQuery,
} from "../hooks/useUsersQuery";
import { useDialogActions } from "../store/dialogStore";
import { useUserFilterStore } from "../store/useUserFilterStore";
import type { UserStatus } from "../types/user";
import { downloadCsv } from "../utils/export";

const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;

const roleLabelKey = {
  super: "users.role.super",
  manager: "users.role.manager",
  operator: "users.role.operator",
} as const;

const statusLabelKey = {
  active: "users.status.active",
  pending: "users.status.pending",
  suspended: "users.status.suspended",
} as const;

const nextStatusMap: Record<UserStatus, UserStatus> = {
  active: "suspended",
  pending: "active",
  suspended: "active",
};

export function UserListPage() {
  const navigate = useNavigate();
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
  } = useUserFilterStore();

  const { t } = useAppPreferences();
  const { openAlert, openConfirm } = useDialogActions();

  const [filterOpen, setFilterOpen] = useState(false);

  const searchParams = toSearchParams();
  const usersQuery = useUsersQuery(searchParams);
  const updateStatusMutation = useUpdateUserStatusMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const deleteUsersMutation = useDeleteUsersMutation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const list = usersQuery.data?.data ?? [];
  const totalCount = usersQuery.data?.totalCount ?? 0;
  const isAllSelected =
    list.length > 0 && list.every((user) => selectedIds.includes(user.id));

  useEffect(() => {
    const visibleIds = new Set(list.map((user) => user.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [list]);

  const filterValue = useMemo<UserFilterValues>(
    () => ({
      searchField,
      keyword,
      status,
      role,
    }),
    [keyword, role, searchField, status],
  );

  return (
    <section>
      <PageHeader
        title={t("users.title")}
        description={t("users.description")}
      />

      <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pt-7">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100"
              onClick={() => setFilterOpen(true)}
            >
              <span className="material-symbols-outlined text-base">tune</span>
              {t("users.filter")}
            </button>
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-3 py-2 text-sm text-white"
                disabled={deleteUsersMutation.isPending}
                onClick={() =>
                  openConfirm(t("users.confirmBulkDelete"), () =>
                    deleteUsersMutation.mutate(selectedIds, {
                      onSuccess: () => {
                        setSelectedIds([]);
                        openAlert(t("common.completed"));
                      },
                      onError: () => openAlert(t("common.failed")),
                    }),
                  )
                }
              >
                <span className="material-symbols-outlined text-base">
                  delete
                </span>
                {t("users.action.delete")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-1 rounded-md border border-slate-200 px-3 text-sm text-slate-100 dark:border-dark-border bg-green-500"
                onClick={() =>
                  downloadCsv(
                    "users-export",
                    [
                      "ID",
                      "Name",
                      "Email",
                      "Role",
                      "Status",
                      "Join Date",
                      "Last Login",
                    ],
                    list.map((user) => [
                      user.id,
                      user.name,
                      user.email,
                      t(roleLabelKey[user.role]),
                      t(statusLabelKey[user.status]),
                      dayjs(user.joinDate).format("YYYY-MM-DD"),
                      dayjs(user.lastLoginAt).format("YYYY-MM-DD HH:mm"),
                    ]),
                  )
                }
              >
                <span className="material-symbols-outlined text-base">
                  download
                </span>
                {t("users.excelDownload")}
              </button>

              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white pl-2.5 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100">
                <span className="whitespace-nowrap text-xs">
                  {t("users.listSize")}
                </span>
                <div className="relative">
                  <select
                    className="h-7 min-w-[64px] appearance-none rounded-md bg-white pl-2 pr-6 text-xs text-slate-700 outline-none dark:bg-dark-surface dark:text-slate-100"
                    value={String(pageSize)}
                    onChange={(event) =>
                      setPageSize(Number(event.target.value))
                    }
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
          )}
        </div>

        <div className="overflow-x-auto overflow-y-hidden pb-2">
          <table className="w-full min-w-[1024px]">
            <thead className="border-b border-slate-100 text-center text-xs text-slate-400 dark:border-dark-border dark:text-slate-300">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">
                  <input
                    type="checkbox"
                    // className="size-4 relative h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 checked:border-indigo-500 checked:bg-indigo-500 checked:before:content-[''] checked:before:absolute checked:before:top-[calc(50%-1px)] checked:before:left-1/2 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:rotate-45 checked:before:w-1.5 checked:before:h-2.5 checked:before:border-b-2 checked:before:border-r-2 checked:before:border-white dark:border-dark-border dark:bg-dark-surface dark:checked:border-indigo-500 dark:checked:bg-indigo-500"
                    className="size-4 cursor-pointer appearance-auto dark:bg-dark-surface"
                    checked={isAllSelected}
                    onChange={(event) =>
                      setSelectedIds(
                        event.target.checked ? list.map((user) => user.id) : [],
                      )
                    }
                  />
                </th>
                <th className="whitespace-nowrap px-6 py-3">No</th>
                <th className="whitespace-nowrap px-6 py-3">
                  {t("users.table.status")}
                </th>
                <th className="whitespace-nowrap px-6 py-3">
                  {t("users.table.name")}
                </th>
                <th className="whitespace-nowrap px-6 py-3">
                  {t("users.table.email")}
                </th>
                <th className="whitespace-nowrap px-6 py-3">
                  {t("users.table.role")}
                </th>
                <th className="whitespace-nowrap px-6 py-3">
                  {t("users.table.joinDate")}
                </th>
                <th className="whitespace-nowrap px-6 py-3">
                  {t("users.table.lastLogin")}
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-right">
                  {t("users.table.manage")}
                </th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.isLoading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {t("common.loadingUsers")}
                  </td>
                </tr>
              )}
              {usersQuery.isError && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-10 text-center text-sm text-rose-500 dark:text-rose-300"
                  >
                    {t("common.errorUsers")}
                  </td>
                </tr>
              )}
              {!usersQuery.isLoading &&
                !usersQuery.isError &&
                list.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                    >
                      {t("users.empty")}
                    </td>
                  </tr>
                )}
              {list.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 text-center text-sm text-slate-600 dark:border-dark-border dark:text-slate-100"
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <input
                      type="checkbox"
                      className="size-4 cursor-pointer appearance-auto accent-main-color"
                      checked={selectedIds.includes(user.id)}
                      onChange={(event) =>
                        setSelectedIds((prev) =>
                          event.target.checked
                            ? prev.includes(user.id)
                              ? prev
                              : [...prev, user.id]
                            : prev.filter((id) => id !== user.id),
                        )
                      }
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    {(page - 1) * pageSize + index + 1}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <Link
                      to={`/users/${user.id}`}
                      className="font-semibold text-slate-600 dark:text-slate-100"
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">{user.email}</td>
                  <td className="whitespace-nowrap px-6 py-3">
                    {t(roleLabelKey[user.role])}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    {dayjs(user.joinDate).format("YYYY.MM.DD")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    {dayjs(user.lastLoginAt).format("YYYY.MM.DD HH:mm")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {(() => {
                        const actionLabel =
                          user.status === "active"
                            ? t("users.action.suspend")
                            : user.status === "pending"
                              ? t("users.action.approve")
                              : t("users.action.activate");

                        return (
                          <>
                            <button
                              type="button"
                              className={`inline-flex h-7 items-center justify-center rounded-md px-2 text-[11px] font-medium ${
                                user.status === "active"
                                  ? "bg-rose-500 text-white"
                                  : user.status === "pending"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-indigo-500 text-white"
                              }`}
                              disabled={updateStatusMutation.isPending}
                              onClick={() =>
                                openConfirm(
                                  t("users.confirmChangeStatus", {
                                    action: actionLabel,
                                  }),
                                  () =>
                                    updateStatusMutation.mutate(
                                      {
                                        id: user.id,
                                        status: nextStatusMap[user.status],
                                      },
                                      {
                                        onSuccess: () =>
                                          openAlert(t("common.completed")),
                                        onError: () =>
                                          openAlert(t("common.failed")),
                                      },
                                    ),
                                )
                              }
                            >
                              {actionLabel}
                            </button>
                            <button
                              type="button"
                              className="group relative flex size-7 items-center justify-center rounded-md bg-indigo-500 text-slate-50"
                              onClick={() => navigate(`/users/${user.id}`)}
                            >
                              <span className="material-symbols-outlined text-lg">
                                edit
                              </span>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {t("users.action.edit")}
                              </span>
                            </button>
                            <button
                              type="button"
                              className="group relative flex size-7 items-center justify-center rounded-md bg-slate-400 text-slate-50 dark:bg-slate-500"
                              disabled={deleteUserMutation.isPending}
                              onClick={() =>
                                openConfirm(t("users.confirmDelete"), () =>
                                  deleteUserMutation.mutate(user.id, {
                                    onSuccess: () =>
                                      openAlert(t("common.completed")),
                                    onError: () =>
                                      openAlert(t("common.failed")),
                                  }),
                                )
                              }
                            >
                              <span className="material-symbols-outlined text-lg">
                                delete
                              </span>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {t("users.action.delete")}
                              </span>
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          total={totalCount}
          curr={page}
          limit={pageSize}
          movePage={setPage}
        />
      </div>

      <UserFilterModal
        open={filterOpen}
        loading={usersQuery.isFetching}
        value={filterValue}
        onClose={() => setFilterOpen(false)}
        onApply={(nextValue) => {
          setSearchField(nextValue.searchField);
          setKeyword(nextValue.keyword.trim());
          setStatus(nextValue.status);
          setRole(nextValue.role);
          setFilterOpen(false);
        }}
      />
    </section>
  );
}
