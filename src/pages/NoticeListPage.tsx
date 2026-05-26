import dayjs from "dayjs";
import MDEditor from "@uiw/react-md-editor";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { Pagination } from "../components/Pagination";
import { useAppPreferences } from "../contexts/AppPreferencesContext";
import {
  useDeleteNoticeMutation,
  useDeleteNoticesMutation,
  useNoticeDetailQuery,
  useNoticesQuery,
} from "../hooks/useNoticesQuery";
import { useDialogActions } from "../store/dialogStore";
import type { NoticeSearchParams } from "../types/admin";

const PAGE_SIZE = 10;

export function NoticeListPage() {
  const { t, theme } = useAppPreferences();
  const navigate = useNavigate();
  const { openAlert, openConfirm } = useDialogActions();
  const [params, setParams] = useState<NoticeSearchParams>({
    page: 1,
    pageSize: PAGE_SIZE,
    keyword: "",
    status: "all",
  });
  const [draftKeyword, setDraftKeyword] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const noticesQuery = useNoticesQuery(params);
  const deleteMutation = useDeleteNoticeMutation();
  const deleteManyMutation = useDeleteNoticesMutation();
  const previewQuery = useNoticeDetailQuery(previewId ?? "");
  const list = noticesQuery.data?.data ?? [];
  const totalCount = noticesQuery.data?.totalCount ?? 0;
  const isAllSelected =
    list.length > 0 && list.every((notice) => selectedIds.includes(notice.id));
  const title = useMemo(() => t("notices.title"), [t]);

  const closePreview = () => setPreviewId(null);

  useEffect(() => {
    const visibleIds = new Set(list.map((notice) => notice.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds((prev) => prev.filter((id) => visibleIds.has(id)));
  }, [list]);

  return (
    <section>
      <PageHeader title={title} description={t("notices.description")} />
      <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="flex flex-wrap items-center justify-between gap-2 p-5">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                className="h-9 appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                value={params.status}
                onChange={(event) =>
                  setParams((prev) => ({
                    ...prev,
                    page: 1,
                    status: event.target.value as NoticeSearchParams["status"],
                  }))
                }
              >
                <option value="all">{t("notices.status.all")}</option>
                <option value="published">
                  {t("notices.status.published")}
                </option>
                <option value="draft">{t("notices.status.draft")}</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                expand_more
              </span>
            </div>
            <input
              value={draftKeyword}
              onChange={(event) => setDraftKeyword(event.target.value)}
              placeholder={t("notices.searchPlaceholder")}
              className="h-9 w-[240px] rounded-md border border-slate-200 px-3 text-sm text-slate-700 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
            />
            <button
              type="button"
              className="rounded-md bg-main-color px-3 py-2 text-sm font-medium text-white"
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  page: 1,
                  keyword: draftKeyword.trim(),
                }))
              }
            >
              {t("notices.search")}
            </button>
          </div>

          {selectedIds.length > 0 ? (
            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-3 py-2 text-sm text-white"
                disabled={deleteManyMutation.isPending}
                onClick={() =>
                  openConfirm(t("notices.confirmDelete"), () =>
                    deleteManyMutation.mutate(selectedIds, {
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
                {t("notices.delete")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white"
              onClick={() => navigate("/notices/new")}
            >
              {t("notices.create")}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="border-y border-slate-100 text-center text-xs text-slate-400 dark:border-dark-border dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    className="size-4 cursor-pointer appearance-auto accent-main-color"
                    checked={isAllSelected}
                    onChange={(event) =>
                      setSelectedIds(
                        event.target.checked
                          ? list.map((notice) => notice.id)
                          : [],
                      )
                    }
                  />
                </th>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">{t("notices.table.status")}</th>
                <th className="px-4 py-3">{t("notices.table.category")}</th>
                <th className="px-4 py-3 text-left">
                  {t("notices.table.title")}
                </th>
                <th className="px-4 py-3">{t("notices.table.author")}</th>
                <th className="px-4 py-3">{t("notices.table.updatedAt")}</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {noticesQuery.isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {t("notices.loading")}
                  </td>
                </tr>
              )}
              {noticesQuery.isError && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-sm text-rose-500 dark:text-rose-300"
                  >
                    {t("notices.error")}
                  </td>
                </tr>
              )}
              {!noticesQuery.isLoading &&
                !noticesQuery.isError &&
                list.map((notice, index) => (
                  <tr
                    key={notice.id}
                    className="border-b border-slate-100 text-center text-sm text-slate-600 dark:border-dark-border dark:text-slate-100"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer appearance-auto accent-main-color"
                        checked={selectedIds.includes(notice.id)}
                        onChange={(event) =>
                          setSelectedIds((prev) =>
                            event.target.checked
                              ? prev.includes(notice.id)
                                ? prev
                                : [...prev, notice.id]
                              : prev.filter((id) => id !== notice.id),
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      {(params.page - 1) * params.pageSize + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          notice.status === "published"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-dark-surface-alt dark:text-slate-300"
                        }`}
                      >
                        {notice.status === "published"
                          ? t("notices.status.published")
                          : t("notices.status.draft")}
                      </span>
                    </td>
                    <td className="px-4 py-3">{notice.category}</td>
                    <td className="px-4 py-3 text-left">
                      <button
                        type="button"
                        className="font-medium text-sky-500"
                        onClick={() => setPreviewId(notice.id)}
                      >
                        {notice.title}
                      </button>
                    </td>
                    <td className="px-4 py-3">{notice.author}</td>
                    <td className="px-4 py-3">
                      {dayjs(notice.updatedAt).format("YYYY.MM.DD HH:mm")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="group relative flex size-7 items-center justify-center rounded-md bg-indigo-500 text-slate-50"
                          onClick={() => navigate(`/notices/${notice.id}/edit`)}
                        >
                          <span className="material-symbols-outlined text-lg">
                            edit
                          </span>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {t("notices.edit")}
                          </span>
                        </button>
                        <button
                          type="button"
                          className="group relative flex size-7 items-center justify-center rounded-md bg-slate-400 text-slate-50 dark:bg-slate-500"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            openConfirm(t("notices.confirmDelete"), () =>
                              deleteMutation.mutate(notice.id, {
                                onSuccess: () =>
                                  openAlert(t("common.completed")),
                                onError: () => openAlert(t("common.failed")),
                              }),
                            )
                          }
                        >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {t("notices.delete")}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Pagination
          total={totalCount}
          curr={params.page}
          limit={params.pageSize}
          movePage={(page) => setParams((prev) => ({ ...prev, page }))}
        />
      </div>

      {previewId && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4"
          onClick={closePreview}
        >
          <div
            className="max-h-[85vh] w-[760px] overflow-hidden rounded-md bg-white shadow-xl dark:bg-dark-surface"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center border-b border-slate-200 px-5 py-3 dark:border-dark-border">
              <strong className="text-base text-slate-700 dark:text-slate-100">
                {previewQuery.data?.title ?? "-"}
              </strong>
              <button
                type="button"
                className="ml-auto inline-flex size-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-hover"
                onClick={closePreview}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="max-h-[calc(85vh-56px)] overflow-y-auto p-5">
              {previewQuery.isLoading && (
                <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  {t("notices.loading")}
                </p>
              )}
              {previewQuery.isError && (
                <p className="py-10 text-center text-sm text-rose-500 dark:text-rose-300">
                  {t("notices.error")}
                </p>
              )}
              {!previewQuery.isLoading &&
                !previewQuery.isError &&
                previewQuery.data && (
                  <>
                    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3 dark:border-dark-border">
                      <strong className="text-lg text-slate-800 dark:text-slate-100">
                        {previewQuery.data.title}
                      </strong>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          previewQuery.data.status === "published"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-dark-surface-alt dark:text-slate-300"
                        }`}
                      >
                        {previewQuery.data.status === "published"
                          ? t("notices.status.published")
                          : t("notices.status.draft")}
                      </span>
                      <span className="ml-auto text-xs text-slate-400">
                        {previewQuery.data.author} ·{" "}
                        {dayjs(previewQuery.data.updatedAt).format(
                          "YYYY.MM.DD HH:mm",
                        )}
                      </span>
                    </div>
                    <div
                      className="mt-4"
                      data-color-mode={theme === "dark" ? "dark" : "light"}
                    >
                      <MDEditor.Markdown source={previewQuery.data.content} />
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
