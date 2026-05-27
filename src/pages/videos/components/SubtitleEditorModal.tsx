import { useTranslation } from "react-i18next";
import { AppModal } from "../../../components/modal/AppModal";
import type { SubtitlePayload } from "../../../types/admin";

interface DraftSubtitleItem extends SubtitlePayload {
  localId: string;
}

interface SubtitleEditorModalProps {
  open: boolean;
  title: string;
  videoThumbnailUrl?: string;
  previewVideoUrl: string;
  activePreviewTexts: string[];
  language: string;
  label: string;
  startTime: string;
  endTime: string;
  text: string;
  timePlaceholder: string;
  liveTimeError: string | null;
  draftItems: DraftSubtitleItem[];
  editingDraftLocalId: string | null;
  isSaving: boolean;
  onClose: () => void;
  onTimeUpdate: (nextTime: number) => void;
  onLanguageChange: (value: string) => void;
  onLabelChange: (value: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onTextChange: (value: string) => void;
  onUpsertDraftItem: () => void;
  onStartEditDraftItem: (item: DraftSubtitleItem) => void;
  onDeleteDraftItem: (localId: string) => void;
  onSave: () => void;
  formatInputTime: (value: string) => string;
}

export function SubtitleEditorModal({
  open,
  title,
  videoThumbnailUrl,
  previewVideoUrl,
  activePreviewTexts,
  language,
  label,
  startTime,
  endTime,
  text,
  timePlaceholder,
  liveTimeError,
  draftItems,
  editingDraftLocalId,
  isSaving,
  onClose,
  onTimeUpdate,
  onLanguageChange,
  onLabelChange,
  onStartTimeChange,
  onEndTimeChange,
  onTextChange,
  onUpsertDraftItem,
  onStartEditDraftItem,
  onDeleteDraftItem,
  onSave,
  formatInputTime,
}: SubtitleEditorModalProps) {
  const { t } = useTranslation();

  return (
    <AppModal open={open} onClose={onClose} zIndex={95}>
      <div className="mx-auto max-h-[92vh] w-[1200px] max-w-[calc(100vw-20px)] overflow-hidden rounded-md bg-white shadow-xl dark:bg-dark-surface">
        <div className="flex items-center border-b border-slate-200 px-5 py-3 dark:border-dark-border">
          <strong className="text-base text-slate-700 dark:text-slate-100">
            {title}
          </strong>
          <button
            type="button"
            className="ml-auto inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-dark-hover"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="scroll-custom-container max-h-[calc(92vh-58px)] overflow-y-auto p-5">
          <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
            <div>
              <div className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-200">
                {t("미리보기")}
              </div>
              <div className="relative overflow-hidden rounded-md bg-black">
                <video
                  controls
                  autoPlay
                  className="aspect-video w-full object-cover"
                  poster={videoThumbnailUrl}
                  src={previewVideoUrl}
                  onTimeUpdate={(event) =>
                    onTimeUpdate(event.currentTarget.currentTime)
                  }
                />
                {activePreviewTexts.length > 0 && (
                  <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded bg-black/60 px-3 py-2 text-center text-sm font-semibold text-white">
                    {activePreviewTexts.join(" / ")}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs text-slate-500 dark:text-slate-300">
                    {t("언어")}
                  </div>
                  <select
                    value={language}
                    className="h-9 w-full cursor-pointer rounded-md border border-slate-200 px-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                    onChange={(event) => onLanguageChange(event.target.value)}
                  >
                    <option value="ko">{t("한국어")}</option>
                    <option value="en">{t("English")}</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>

                <div>
                  <div className="mb-1 text-xs text-slate-500 dark:text-slate-300">
                    {t("자막 라벨")}
                  </div>
                  <input
                    value={label}
                    onChange={(event) => onLabelChange(event.target.value)}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <div className="sm:col-span-3">
                  <div className="mb-1 text-xs text-slate-500 dark:text-slate-300">
                    {t("시작 시간")}
                  </div>
                  <input
                    value={startTime}
                    onChange={(event) => onStartTimeChange(event.target.value)}
                    className={`h-9 w-full rounded-md border px-3 text-sm dark:bg-dark-surface-alt dark:text-slate-100 ${
                      liveTimeError
                        ? "border-rose-400 dark:border-rose-400"
                        : "border-slate-200 dark:border-dark-border"
                    }`}
                    placeholder={timePlaceholder}
                  />
                </div>
                <div className="sm:col-span-3">
                  <div className="mb-1 text-xs text-slate-500 dark:text-slate-300">
                    {t("종료 시간")}
                  </div>
                  <input
                    value={endTime}
                    onChange={(event) => onEndTimeChange(event.target.value)}
                    className={`h-9 w-full rounded-md border px-3 text-sm dark:bg-dark-surface-alt dark:text-slate-100 ${
                      liveTimeError
                        ? "border-rose-400 dark:border-rose-400"
                        : "border-slate-200 dark:border-dark-border"
                    }`}
                    placeholder={timePlaceholder}
                  />
                </div>
                <div className="sm:col-span-5">
                  <div className="mb-1 text-xs text-slate-500 dark:text-slate-300">
                    {t("자막 문구")}
                  </div>
                  <input
                    value={text}
                    onChange={(event) => onTextChange(event.target.value)}
                    className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                  />
                </div>
                <div className="flex items-end sm:col-span-1 sm:justify-end">
                  <button
                    type="button"
                    className="h-9 w-[72px] cursor-pointer rounded-md bg-main-color px-2 text-sm text-white"
                    onClick={onUpsertDraftItem}
                  >
                    {editingDraftLocalId ? t("수정") : t("추가")}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-400">
                {t("숫자만 입력해도 자동으로 시:분:초.밀리초 형식이 적용됩니다.")}
              </p>

              {liveTimeError && <p className="text-xs text-rose-500">{liveTimeError}</p>}

              {draftItems.length > 0 && (
                <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200 dark:border-dark-border">
                  <table className="w-full text-xs">
                    <colgroup>
                      <col className="w-[56px]" />
                      <col className="w-[110px]" />
                      <col className="w-[110px]" />
                      <col className="w-auto" />
                      <col className="w-[88px]" />
                    </colgroup>
                    <thead className="bg-slate-50 text-slate-500 dark:bg-dark-surface-alt dark:text-slate-300">
                      <tr>
                        <th className="px-2 py-1 text-left">#</th>
                        <th className="px-2 py-1 text-left">{t("시작 시간")}</th>
                        <th className="px-2 py-1 text-left">{t("종료 시간")}</th>
                        <th className="px-2 py-1 text-left">{t("자막 문구")}</th>
                        <th className="px-2 py-1 text-right"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftItems.map((item, index) => (
                        <tr
                          key={item.localId}
                          className="border-t border-slate-100 dark:border-dark-border"
                        >
                          <td className="px-2 py-1 text-slate-500 dark:text-slate-200">
                            {index + 1}
                          </td>
                          <td className="px-2 py-1 text-slate-700 dark:text-slate-100">
                            {formatInputTime(item.startTime)}
                          </td>
                          <td className="px-2 py-1 text-slate-700 dark:text-slate-100">
                            {formatInputTime(item.endTime)}
                          </td>
                          <td className="px-2 py-1 text-slate-700 dark:text-slate-100">
                            {item.text}
                          </td>
                          <td className="px-2 py-1 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                className="inline-flex size-6 cursor-pointer items-center justify-center rounded bg-indigo-500 text-white"
                                onClick={() => onStartEditDraftItem(item)}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  edit
                                </span>
                              </button>
                              <button
                                type="button"
                                className="inline-flex size-6 cursor-pointer items-center justify-center rounded bg-slate-500 text-white"
                                onClick={() => onDeleteDraftItem(item.localId)}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  className="cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-dark-border dark:text-slate-200"
                  onClick={onClose}
                >
                  {t("취소")}
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-md bg-main-color px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSaving}
                  onClick={onSave}
                >
                  {t("저장")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppModal>
  );
}
