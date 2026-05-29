import dayjs from "dayjs";
import MDEditor from "@uiw/react-md-editor";
import { useTranslation } from "react-i18next";
import { AppModal } from "../../../components/modal/AppModal";
import { useAppPreferences } from "../../../contexts/AppPreferencesContext";
import { useNoticeDetailQuery } from "../../../hooks/useNoticesQuery";

interface NoticePreviewModalProps {
  noticeId: string | null;
  onClose: () => void;
}

export function NoticePreviewModal({
  noticeId,
  onClose,
}: NoticePreviewModalProps) {
  const { theme } = useAppPreferences();
  const { t } = useTranslation();
  const previewQuery = useNoticeDetailQuery(noticeId ?? "");

  return (
    <AppModal open={Boolean(noticeId)} onClose={onClose} zIndex={95}>
      <div className="relative flex max-h-[calc(100dvh-24px)] w-[920px] max-w-[calc(100vw-20px)] flex-col overflow-hidden rounded-md bg-white shadow-lg dark:bg-dark-surface">
        <div className="shrink-0 border-b border-slate-200 px-1 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
          <div className="flex items-center justify-between">
            <div className="px-3 py-3">{previewQuery.data?.title ?? "-"}</div>
            <button
              type="button"
              className="flex size-10 cursor-pointer items-center justify-center text-slate-500 dark:text-slate-300"
              onClick={onClose}
              aria-label="close"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="scroll-custom-container min-h-0 flex-1 overflow-y-auto p-5">
          {previewQuery.isLoading && (
            <div className="space-y-4 py-2">
              <div className="h-6 w-2/3 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-48 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
            </div>
          )}

          {previewQuery.isError && (
            <p className="py-10 text-center text-sm text-rose-500 dark:text-rose-300">
              {t("공지사항을 불러오지 못했습니다.")}
            </p>
          )}

          {!previewQuery.isLoading && !previewQuery.isError && previewQuery.data && (
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
                    ? t("게시")
                    : t("임시저장")}
                </span>
                <span className="ml-auto text-xs text-slate-400">
                  {previewQuery.data.author} ·{" "}
                  {dayjs(previewQuery.data.updatedAt).format("YYYY.MM.DD HH:mm")}
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
    </AppModal>
  );
}
