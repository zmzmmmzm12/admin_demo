import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AppCheckbox } from "../../components/AppCheckbox";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { StatusBadge } from "../../components/StatusBadge";
import { TableContainer } from "../../components/TableContainer";
import {
  UserFilterModal,
  type UserFilterValues,
} from "../../components/UserFilterModal";
import {
  useDeleteUserMutation,
  useDeleteUsersMutation,
  useUpdateUserStatusMutation,
  useUsersQuery,
} from "../../hooks/useUsersQuery";
import { useDialogActions } from "../../store/dialogStore";
import type { UserStatus } from "../../types/user";
import type { UserRole, UserSearchParams } from "../../types/user";
import { downloadCsv } from "../../utils/export";

const PAGE_SIZE_OPTIONS = [10, 50, 100] as const;

const roleLabelKey = {
  super: "슈퍼관리자",
  manager: "매니저",
  operator: "운영자",
} as const;

const statusLabelKey = {
  active: "활성",
  pending: "대기",
  suspended: "정지",
} as const;

const nextStatusMap: Record<UserStatus, UserStatus> = {
  active: "suspended",
  pending: "active",
  suspended: "active",
};

function parseUserSearchParams(
  searchParams: URLSearchParams,
): UserSearchParams {
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const searchFieldRaw = searchParams.get("searchField") ?? "id";
  const statusRaw = searchParams.get("status") ?? "all";
  const roleRaw = searchParams.get("role") ?? "all";
  const keyword = searchParams.get("keyword") ?? "";

  const searchField: UserSearchParams["searchField"] =
    searchFieldRaw === "name" || searchFieldRaw === "email"
      ? searchFieldRaw
      : "id";

  const status: UserSearchParams["status"] =
    statusRaw === "active" ||
    statusRaw === "pending" ||
    statusRaw === "suspended"
      ? statusRaw
      : "all";

  const role: "all" | UserRole =
    roleRaw === "super" || roleRaw === "manager" || roleRaw === "operator"
      ? roleRaw
      : "all";

  return {
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10,
    searchField,
    keyword,
    status,
    role,
  };
}

function buildUserSearchParams(params: UserSearchParams) {
  const next = new URLSearchParams();

  next.set("page", String(params.page));
  next.set("pageSize", String(params.pageSize));
  next.set("searchField", params.searchField);
  next.set("keyword", params.keyword);
  next.set("status", params.status);
  next.set("role", params.role);

  return next;
}

function areUserSearchParamsEqual(
  left: UserSearchParams,
  right: UserSearchParams,
) {
  return (
    left.page === right.page &&
    left.pageSize === right.pageSize &&
    left.searchField === right.searchField &&
    left.keyword === right.keyword &&
    left.status === right.status &&
    left.role === right.role
  );
}

export function UserListPage() {
  const navigate = useNavigate();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const urlParams = useMemo(
    () => parseUserSearchParams(urlSearchParams),
    [urlSearchParams],
  );

  const { t } = useTranslation();
  const { openAlert, openConfirm } = useDialogActions();

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const usersQuery = useUsersQuery(urlParams);
  const updateStatusMutation = useUpdateUserStatusMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const deleteUsersMutation = useDeleteUsersMutation();

  const list = usersQuery.data?.data ?? [];
  const totalCount = usersQuery.data?.totalCount ?? 0;

  const visibleUserIds = useMemo(() => {
    return new Set(list.map((user) => user.id));
  }, [list]);

  const validSelectedIds = useMemo(() => {
    return selectedIds.filter((id) => visibleUserIds.has(id));
  }, [selectedIds, visibleUserIds]);

  const isAllSelected =
    list.length > 0 && list.every((user) => validSelectedIds.includes(user.id));

  const filterValue = useMemo<UserFilterValues>(
    () => ({
      searchField: urlParams.searchField,
      keyword: urlParams.keyword,
      status: urlParams.status,
      role: urlParams.role,
    }),
    [
      urlParams.keyword,
      urlParams.role,
      urlParams.searchField,
      urlParams.status,
    ],
  );

  const updateSearchParams = (nextParams: UserSearchParams) => {
    if (areUserSearchParamsEqual(urlParams, nextParams)) {
      return;
    }

    setUrlSearchParams(buildUserSearchParams(nextParams), { replace: true });
  };

  return (
    <section>
      <PageHeader
        title={t("회원 관리")}
        description={t(
          "검색, 필터, 상태 변경까지 실제 운영 플로우에 맞춘 관리 화면입니다.",
        )}
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
              {t("필터")}
            </button>
          </div>

          {validSelectedIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-300">
                {t("{count}개 선택됨", { count: validSelectedIds.length })}
              </span>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-rose-500 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleteUsersMutation.isPending}
                onClick={() =>
                  openConfirm(t("선택한 회원을 모두 삭제하시겠습니까?"), () =>
                    deleteUsersMutation.mutate(validSelectedIds, {
                      onSuccess: () => {
                        setSelectedIds([]);
                        openAlert(t("처리되었습니다."));
                      },
                      onError: () =>
                        openAlert(t("처리 중 오류가 발생했습니다.")),
                    }),
                  )
                }
              >
                <span className="material-symbols-outlined text-base">
                  delete
                </span>
                {t("삭제")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-green-500 px-3 text-sm text-slate-100 dark:border-dark-border"
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
                {t("엑셀 다운로드")}
              </button>

              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white pl-2.5 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100">
                <span className="whitespace-nowrap text-xs">
                  {t("목록 수")}
                </span>
                <div className="relative">
                  <select
                    className="h-7 min-w-[64px] cursor-pointer appearance-none rounded-md bg-white pl-2 pr-6 text-xs text-slate-700 outline-none dark:bg-dark-surface dark:text-slate-100"
                    value={String(urlParams.pageSize)}
                    onChange={(event) =>
                      updateSearchParams({
                        ...urlParams,
                        page: 1,
                        pageSize: Number(event.target.value),
                      })
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

        <TableContainer tableClassName="w-full min-w-[1024px]">
          <thead className="border-b border-slate-100 text-center text-xs text-slate-400 dark:border-dark-border dark:text-slate-300">
            <tr>
              <th className="align-middle whitespace-nowrap px-4 py-3">
                <AppCheckbox
                  checked={isAllSelected}
                  ariaLabel="select all users"
                  onChange={(checked) =>
                    setSelectedIds(checked ? list.map((user) => user.id) : [])
                  }
                />
              </th>
              <th className="align-middle whitespace-nowrap px-6 py-3">No</th>
              <th className="align-middle whitespace-nowrap px-6 py-3">
                {t("상태")}
              </th>
              <th className="align-middle whitespace-nowrap px-6 py-3">
                {t("이름")}
              </th>
              <th className="align-middle whitespace-nowrap px-6 py-3">
                {t("이메일")}
              </th>
              <th className="align-middle whitespace-nowrap px-6 py-3">
                {t("권한")}
              </th>
              <th className="align-middle whitespace-nowrap px-6 py-3">
                {t("가입일")}
              </th>
              <th className="align-middle whitespace-nowrap px-6 py-3">
                {t("마지막 로그인")}
              </th>
              <th className="align-middle whitespace-nowrap px-6 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.isLoading && (
              <>
                {Array.from({ length: 6 }).map((_, skeletonIndex) => (
                  <tr
                    key={`users-skeleton-${skeletonIndex}`}
                    className="border-b border-slate-100 dark:border-dark-border"
                  >
                    <td className="px-4 py-3">
                      <div className="mx-auto h-5 w-5 animate-pulse rounded border border-slate-200 bg-slate-100 dark:border-dark-border dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-8 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-6 w-16 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-36 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="ml-auto flex w-fit items-center gap-1">
                        <div className="h-7 w-7 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700/70" />
                        <div className="h-7 w-7 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700/70" />
                        <div className="h-7 w-7 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700/70" />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {usersQuery.isError && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-10 text-center text-sm text-rose-500 dark:text-rose-300"
                >
                  <div className="flex items-center justify-center">
                    {t("회원 목록을 불러오지 못했습니다.")}
                  </div>
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
                    <div className="flex items-center justify-center">
                      {t("조건에 맞는 회원이 없습니다.")}
                    </div>
                  </td>
                </tr>
              )}

            {list.map((user, index) => (
              <tr
                key={user.id}
                className="border-b border-slate-100 dark:border-dark-border"
              >
                <td className="align-middle whitespace-nowrap px-4 py-3">
                  <div className="flex items-center justify-center">
                    <AppCheckbox
                      checked={validSelectedIds.includes(user.id)}
                      ariaLabel={`select user ${user.id}`}
                      onChange={(checked) =>
                        setSelectedIds((prev) =>
                          checked
                            ? prev.includes(user.id)
                              ? prev
                              : [...prev, user.id]
                            : prev.filter((id) => id !== user.id),
                        )
                      }
                    />
                  </div>
                </td>
                <td className="align-middle whitespace-nowrap px-6 py-3">
                  <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                    {(urlParams.page - 1) * urlParams.pageSize + index + 1}
                  </div>
                </td>
                <td className="align-middle whitespace-nowrap px-6 py-3">
                  <div className="flex items-center justify-center">
                    <StatusBadge status={user.status} />
                  </div>
                </td>
                <td className="align-middle whitespace-nowrap px-6 py-3">
                  <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                    <Link
                      to={`/users/${user.id}`}
                      className="cursor-pointer text-slate-700 dark:text-white"
                    >
                      {user.name}
                    </Link>
                  </div>
                </td>
                <td className="align-middle whitespace-nowrap px-6 py-3">
                  <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                    {user.email}
                  </div>
                </td>
                <td className="align-middle whitespace-nowrap px-6 py-3">
                  <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                    {t(roleLabelKey[user.role])}
                  </div>
                </td>
                <td className="align-middle whitespace-nowrap px-6 py-3">
                  <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                    {dayjs(user.joinDate).format("YYYY.MM.DD")}
                  </div>
                </td>
                <td className="align-middle whitespace-nowrap px-6 py-3">
                  <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                    {dayjs(user.lastLoginAt).format("YYYY.MM.DD HH:mm")}
                  </div>
                </td>
                <td className="align-middle whitespace-nowrap px-6 py-3">
                  <div className="flex items-center justify-center">
                    <div className="flex w-full items-center justify-end gap-1">
                      {(() => {
                        const actionLabel =
                          user.status === "active"
                            ? t("정지")
                            : user.status === "pending"
                              ? t("승인")
                              : t("활성화");

                        return (
                          <>
                            <button
                              type="button"
                              className={`inline-flex h-7 cursor-pointer items-center justify-center rounded-md px-2 text-[11px] font-medium ${
                                user.status === "active"
                                  ? "bg-rose-500 text-white"
                                  : user.status === "pending"
                                    ? "bg-emerald-500 text-white"
                                    : "bg-indigo-500 text-white"
                              } disabled:cursor-not-allowed disabled:opacity-60`}
                              disabled={updateStatusMutation.isPending}
                              onClick={() =>
                                openConfirm(
                                  t("{action} 하시겠습니까?", {
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
                                          openAlert(t("처리되었습니다.")),
                                        onError: () =>
                                          openAlert(
                                            t("처리 중 오류가 발생했습니다."),
                                          ),
                                      },
                                    ),
                                )
                              }
                            >
                              {actionLabel}
                            </button>

                            <button
                              type="button"
                              className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-indigo-500 text-slate-50"
                              onClick={() => navigate(`/users/${user.id}`)}
                            >
                              <span className="material-symbols-outlined text-lg">
                                edit
                              </span>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {t("수정")}
                              </span>
                            </button>

                            <button
                              type="button"
                              className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-slate-400 text-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-500"
                              disabled={deleteUserMutation.isPending}
                              onClick={() =>
                                openConfirm(
                                  t("해당 회원을 삭제하시겠습니까?"),
                                  () =>
                                    deleteUserMutation.mutate(user.id, {
                                      onSuccess: () => {
                                        setSelectedIds((prev) =>
                                          prev.filter((id) => id !== user.id),
                                        );
                                        openAlert(t("처리되었습니다."));
                                      },
                                      onError: () =>
                                        openAlert(
                                          t("처리 중 오류가 발생했습니다."),
                                        ),
                                    }),
                                )
                              }
                            >
                              <span className="material-symbols-outlined text-lg">
                                delete
                              </span>
                              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                                {t("삭제")}
                              </span>
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableContainer>

        <Pagination
          total={totalCount}
          curr={urlParams.page}
          limit={urlParams.pageSize}
          movePage={(nextPage) =>
            updateSearchParams({ ...urlParams, page: nextPage })
          }
        />
      </div>

      {filterOpen && (
        <UserFilterModal
          key={buildUserSearchParams(urlParams).toString()}
          open={filterOpen}
          loading={usersQuery.isFetching}
          value={filterValue}
          onClose={() => setFilterOpen(false)}
          onApply={(nextValue) => {
            updateSearchParams({
              ...urlParams,
              page: 1,
              searchField: nextValue.searchField,
              keyword: nextValue.keyword.trim(),
              status: nextValue.status,
              role: nextValue.role,
            });
            setFilterOpen(false);
          }}
        />
      )}
    </section>
  );
}
