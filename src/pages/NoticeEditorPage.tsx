import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MarkdownEditor } from "../components/MarkdownEditor";
import { PageHeader } from "../components/PageHeader";
import { useAppPreferences } from "../contexts/AppPreferencesContext";
import {
  useNoticeDetailQuery,
  useSaveNoticeMutation,
} from "../hooks/useNoticesQuery";
import { useDialogActions } from "../store/dialogStore";
import type { NoticeStatus } from "../types/admin";

export function NoticeEditorPage() {
  const { noticeId } = useParams<{ noticeId?: string }>();
  const isEdit = Boolean(noticeId);
  const { t, theme } = useAppPreferences();
  const navigate = useNavigate();
  const { openAlert, openConfirm } = useDialogActions();

  const noticeQuery = useNoticeDetailQuery(noticeId ?? "");
  const saveMutation = useSaveNoticeMutation();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("운영");
  const [status, setStatus] = useState<NoticeStatus>("draft");
  const [content, setContent] = useState("");
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (!isEdit || !noticeQuery.data) {
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(noticeQuery.data.title);
    setCategory(noticeQuery.data.category);
    setStatus(noticeQuery.data.status);
    setContent(noticeQuery.data.content);
  }, [isEdit, noticeQuery.data]);

  const titleError = attempted && !title.trim();
  const categoryError = attempted && !category.trim();
  const contentError = attempted && !content.trim();

  const onSave = () => {
    setAttempted(true);
    if (!title.trim() || !category.trim() || !content.trim()) {
      openAlert(t("notices.validation"));
      return;
    }

    openConfirm(t("notices.confirmSave"), () => {
      saveMutation.mutate(
        {
          id: noticeId,
          payload: {
            title: title.trim(),
            category: category.trim(),
            status,
            content,
          },
        },
        {
          onSuccess: () => {
            openAlert(t("common.completed"));
            navigate("/notices");
          },
          onError: () => {
            openAlert(t("common.failed"));
          },
        },
      );
    });
  };

  return (
    <section>
      <PageHeader
        title={isEdit ? t("notices.editTitle") : t("notices.createTitle")}
        description={t("notices.editorDescription")}
      />
      <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="border-b border-slate-200 px-5 py-4 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
          {t("notices.formSection")}
        </div>

        {isEdit && noticeQuery.isLoading && (
          <p className="py-16 text-center text-sm text-slate-500">
            {t("notices.loading")}
          </p>
        )}
        {isEdit && noticeQuery.isError && (
          <p className="py-16 text-center text-sm text-rose-500">
            {t("notices.error")}
          </p>
        )}

        {(!isEdit || noticeQuery.data) && (
          <div
            className="space-y-5 px-5 py-6"
            data-color-mode={theme === "dark" ? "dark" : "light"}
          >
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                {t("notices.form.title")}{" "}
                <span className="text-rose-500">*</span>
              </div>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className={`h-10 w-full rounded-md border px-3 text-sm text-slate-700 dark:bg-dark-surface-alt dark:text-slate-100 ${
                  titleError
                    ? "border-rose-400 dark:border-rose-500"
                    : "border-slate-200 dark:border-dark-border"
                }`}
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                {t("notices.form.category")}{" "}
                <span className="text-rose-500">*</span>
              </div>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={`h-10 w-full rounded-md border px-3 text-sm text-slate-700 dark:bg-dark-surface-alt dark:text-slate-100 ${
                  categoryError
                    ? "border-rose-400 dark:border-rose-500"
                    : "border-slate-200 dark:border-dark-border"
                }`}
              />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                {t("notices.table.status")}
              </div>
              <div className="relative">
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as NoticeStatus)
                  }
                  className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-700 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                >
                  <option value="draft">{t("notices.status.draft")}</option>
                  <option value="published">
                    {t("notices.status.published")}
                  </option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                  expand_more
                </span>
              </div>
            </label>

            <div>
              <div className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
                {t("notices.form.editor")}{" "}
                <span className="text-rose-500">*</span>
              </div>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                hasError={contentError}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-dark-border dark:text-slate-200"
                onClick={() => navigate("/notices")}
              >
                {t("confirm.cancel")}
              </button>
              <button
                type="button"
                className="rounded-md bg-main-color px-3 py-2 text-sm text-white disabled:opacity-60"
                disabled={saveMutation.isPending}
                onClick={onSave}
              >
                {t("confirm.ok")}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
