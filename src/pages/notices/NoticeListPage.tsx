import dayjs from "dayjs";
import { type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AppCheckbox } from "../../components/AppCheckbox";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { TableContainer } from "../../components/TableContainer";
import {
  useDeleteNoticeMutation,
  useDeleteNoticesMutation,
  useNoticesQuery,
} from "../../hooks/useNoticesQuery";
import { NoticePreviewModal } from "./components/NoticePreviewModal";
import { useDialogActions } from "../../store/dialogStore";
import type { NoticeSearchParams } from "../../types/admin";

const PAGE_SIZE = 10;

const DEFAULT_NOTICE_PARAMS: NoticeSearchParams = {
  page: 1,
  pageSize: PAGE_SIZE,
  keyword: "",
  status: "all",
};

function parseNoticeSearchParams(
  searchParams: URLSearchParams,
): NoticeSearchParams {
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? String(PAGE_SIZE));
  const keyword = searchParams.get("keyword") ?? "";
  const statusRaw = searchParams.get("status") ?? "all";

  const status: NoticeSearchParams["status"] =
    statusRaw === "published" || statusRaw === "draft" ? statusRaw : "all";

  return {
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0
        ? Math.floor(pageSize)
        : PAGE_SIZE,
    keyword,
    status,
  };
}

function buildNoticeSearchParams(params: NoticeSearchParams) {
  const next = new URLSearchParams();

  next.set("page", String(params.page));
  next.set("pageSize", String(params.pageSize));
  next.set("keyword", params.keyword);
  next.set("status", params.status);

  return next;
}

function areNoticeSearchParamsEqual(
  left: NoticeSearchParams,
  right: NoticeSearchParams,
) {
  return (
    left.page === right.page &&
    left.pageSize === right.pageSize &&
    left.keyword === right.keyword &&
    left.status === right.status
  );
}

export function NoticeListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { openAlert, openConfirm } = useDialogActions();

  const params = useMemo(
    () => parseNoticeSearchParams(urlSearchParams),
    [urlSearchParams],
  );

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const noticesQuery = useNoticesQuery(params);
  const deleteMutation = useDeleteNoticeMutation();
  const deleteManyMutation = useDeleteNoticesMutation();

  const list = noticesQuery.data?.data ?? [];
  const totalCount = noticesQuery.data?.totalCount ?? 0;

  const visibleNoticeIds = useMemo(() => {
    return new Set(list.map((notice) => notice.id));
  }, [list]);

  const validSelectedIds = useMemo(() => {
    return selectedIds.filter((id) => visibleNoticeIds.has(id));
  }, [selectedIds, visibleNoticeIds]);

  const isAllSelected =
    list.length > 0 &&
    list.every((notice) => validSelectedIds.includes(notice.id));

  const title = useMemo(() => t("공지사항 관리"), [t]);

  const updateSearchParams = (nextParams: NoticeSearchParams) => {
    if (areNoticeSearchParamsEqual(params, nextParams)) {
      return;
    }

    setUrlSearchParams(buildNoticeSearchParams(nextParams), { replace: true });
  };

  const onSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const keyword = String(formData.get("keyword") ?? "").trim();

    updateSearchParams({
      ...params,
      page: 1,
      keyword,
    });
  };

  const onResetFilters = () => {
    updateSearchParams(DEFAULT_NOTICE_PARAMS);
  };

  return (
    <section>
      <PageHeader
        title={title}
        description={t("등록/수정/상세 확인이 가능한 공지 관리 화면입니다.")}
      />

      <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 p-5">
          <form className="flex items-center gap-2" onSubmit={onSubmitSearch}>
            <div className="relative">
              <select
                className="h-9 cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                value={params.status}
                onChange={(event) =>
                  updateSearchParams({
                    ...params,
                    page: 1,
                    status: event.target.value as NoticeSearchParams["status"],
                  })
                }
              >
                <option value="all">{t("전체 상태")}</option>
                <option value="published">{t("게시")}</option>
                <option value="draft">{t("임시저장")}</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                expand_more
              </span>
            </div>

            <input
              key={params.keyword}
              name="keyword"
              defaultValue={params.keyword}
              placeholder={t("제목, 카테고리, 작성자")}
              className="h-9 w-[240px] rounded-md border border-slate-200 px-3 text-sm text-slate-700 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
            />

            <button type="submit" className="hidden" aria-hidden>
              submit
            </button>

            <button
              type="button"
              className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
              onClick={onResetFilters}
            >
              {t("초기화")}
            </button>
          </form>

          {validSelectedIds.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-300">
                {t("{count}개 선택됨", { count: validSelectedIds.length })}
              </span>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-rose-500 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleteManyMutation.isPending}
                onClick={() =>
                  openConfirm(t("공지사항을 삭제하시겠습니까?"), () =>
                    deleteManyMutation.mutate(validSelectedIds, {
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
            <button
              type="button"
              className="cursor-pointer rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
              onClick={() =>
                navigate("/notices/new", {
                  state: { from: `${location.pathname}${location.search}` },
                })
              }
            >
              {t("공지사항 등록")}
            </button>
          )}
        </div>

        <TableContainer tableClassName="w-full min-w-[980px]">
          <colgroup>
            <col className="w-[68px]" />
            <col className="w-[80px]" />
            <col className="w-[110px]" />
            <col className="w-[140px]" />
            <col className="w-auto" />
            <col className="w-[160px]" />
            <col className="w-[160px]" />
            <col className="w-[130px]" />
          </colgroup>

          <thead className="text-xs text-slate-400 border-b border-slate-100 dark:border-dark-border dark:text-slate-300 text-center">
            <tr>
              <th className="align-middle px-4 py-3">
                <AppCheckbox
                  checked={isAllSelected}
                  ariaLabel="select all notices"
                  onChange={(checked) =>
                    setSelectedIds(
                      checked ? list.map((notice) => notice.id) : [],
                    )
                  }
                />
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">No</th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("상태")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("카테고리")}
              </th>
              <th className="align-middle px-4 py-3 text-left">{t("제목")}</th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("작성자")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("수정일")}
              </th>
              <th className="align-middle px-4 py-3 text-right" />
            </tr>
          </thead>

          <tbody>
            {noticesQuery.isLoading && (
              <>
                {Array.from({ length: 6 }).map((_, skeletonIndex) => (
                  <tr
                    key={`notices-skeleton-${skeletonIndex}`}
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
                      <div className="mx-auto h-4 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="ml-auto flex w-fit items-center gap-1">
                        <div className="h-7 w-7 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700/70" />
                        <div className="h-7 w-7 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700/70" />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {noticesQuery.isError && (
              <tr>
                <td colSpan={8} className="px-6 py-20">
                  <div className="w-full flex items-center justify-center text-sm text-rose-500 dark:text-rose-300">
                    {t("공지사항을 불러오지 못했습니다.")}
                  </div>
                </td>
              </tr>
            )}

            {!noticesQuery.isLoading &&
              !noticesQuery.isError &&
              list.length === 0 && (
                <tr className="border-b border-slate-100 dark:border-dark-border">
                  <td className="px-6 py-20" colSpan={8}>
                    <div className="w-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                      {t("조회된 데이터가 없습니다.")}
                    </div>
                  </td>
                </tr>
              )}

            {!noticesQuery.isLoading &&
              !noticesQuery.isError &&
              list.map((notice, index) => (
                <tr
                  key={notice.id}
                  className="border-b border-slate-100 dark:border-dark-border"
                >
                  <td className="align-middle px-4 py-3">
                    <div className="flex items-center justify-center">
                      <AppCheckbox
                        checked={validSelectedIds.includes(notice.id)}
                        ariaLabel={`select notice ${notice.id}`}
                        onChange={(checked) =>
                          setSelectedIds((prev) =>
                            checked
                              ? prev.includes(notice.id)
                                ? prev
                                : [...prev, notice.id]
                              : prev.filter((id) => id !== notice.id),
                          )
                        }
                      />
                    </div>
                  </td>

                  <td className="align-middle px-4 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {(params.page - 1) * params.pageSize + index + 1}
                    </div>
                  </td>

                  <td className="align-middle px-4 py-3">
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex min-w-[64px] items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${
                          notice.status === "published"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-dark-surface-alt dark:text-slate-300"
                        }`}
                      >
                        {notice.status === "published"
                          ? t("게시")
                          : t("임시저장")}
                      </span>
                    </div>
                  </td>

                  <td className="align-middle px-4 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {notice.category}
                    </div>
                  </td>

                  <td className="align-middle px-4 py-3 text-left">
                    <div className="min-w-[240px] whitespace-normal break-words text-left text-sm leading-5 text-slate-700 dark:text-white">
                      <button
                        type="button"
                        className="cursor-pointer text-sky-500"
                        onClick={() => setPreviewId(notice.id)}
                      >
                        {notice.title}
                      </button>
                    </div>
                  </td>

                  <td className="align-middle px-4 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {notice.author}
                    </div>
                  </td>

                  <td className="align-middle px-4 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {dayjs(notice.updatedAt).format("YYYY.MM.DD HH:mm")}
                    </div>
                  </td>

                  <td className="align-middle px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="flex w-full flex-nowrap items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          type="button"
                          className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-indigo-500 text-slate-50"
                          onClick={() =>
                            navigate(`/notices/${notice.id}/edit`, {
                              state: {
                                from: `${location.pathname}${location.search}`,
                              },
                            })
                          }
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
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            openConfirm(t("공지사항을 삭제하시겠습니까?"), () =>
                              deleteMutation.mutate(notice.id, {
                                onSuccess: () => {
                                  setSelectedIds((prev) =>
                                    prev.filter((id) => id !== notice.id),
                                  );
                                  openAlert(t("처리되었습니다."));
                                },
                                onError: () =>
                                  openAlert(t("처리 중 오류가 발생했습니다.")),
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
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </TableContainer>

        <Pagination
          total={totalCount}
          curr={params.page}
          limit={params.pageSize}
          movePage={(page) => updateSearchParams({ ...params, page })}
        />
      </div>

      <NoticePreviewModal
        noticeId={previewId}
        onClose={() => setPreviewId(null)}
      />
    </section>
  );
}
