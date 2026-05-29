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
      <div className="notice-preview-scope relative w-[920px] max-w-[calc(100vw-20px)] max-h-[calc(100dvh-24px)] flex flex-col rounded-md bg-white shadow-lg dark:bg-dark-surface">
        <div className="shrink-0 px-1 flex items-center justify-between text-base font-semibold text-slate-700 dark:text-slate-100 border-b border-slate-200 dark:border-dark-border">
          <div className="px-3 py-3 flex items-center gap-2">
            {previewQuery.data?.category ? (
              <span className="rounded-full bg-slate-200 text-slate-700 px-2 py-0.5 text-xs dark:bg-slate-700 dark:text-slate-300">
                {previewQuery.data.category}
              </span>
            ) : null}
            <span>{previewQuery.data?.title ?? t("미리보기")}</span>
          </div>
          <button
            type="button"
            className="flex items-center justify-center size-10 cursor-pointer"
            onClick={onClose}
            aria-label="close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="scroll-custom-container min-h-0 flex-1 p-5 flex flex-col gap-4 text-sm text-slate-700 dark:text-slate-100 overflow-y-auto">
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
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  {t("작성자")}:
                  <span className="ml-1 text-slate-700 dark:text-slate-200">
                    {previewQuery.data.author}
                  </span>
                </div>
                <div>
                  {t("수정일")}:
                  <span className="ml-1 text-slate-700 dark:text-slate-200">
                    {dayjs(previewQuery.data.updatedAt).format("YYYY.MM.DD HH:mm")}
                  </span>
                </div>
              </div>

              <div className="py-2">
                <div
                  className="wmde-markdown-var"
                  data-color-mode={theme === "dark" ? "dark" : "light"}
                >
                  <MDEditor.Markdown source={previewQuery.data.content} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppModal>
  );
}
