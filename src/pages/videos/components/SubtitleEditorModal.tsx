import { useEffect, useId, useMemo, useRef, useState } from "react";
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

interface PreviewCue {
  id: string;
  language: string;
  label: string;
  startTime: string;
  endTime: string;
  text: string;
}

function normalizeCueTime(value: string) {
  const trimmed = value.trim();

  const hourMatch = trimmed.match(/^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);

  if (hourMatch) {
    const [, hh, mm, ss, msRaw] = hourMatch;
    const ms = (msRaw ?? "000").padEnd(3, "0");
    return `${hh}:${mm}:${ss}.${ms}`;
  }

  const minuteMatch = trimmed.match(/^(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);

  if (minuteMatch) {
    const [, mm, ss, msRaw] = minuteMatch;
    const ms = (msRaw ?? "000").padEnd(3, "0");
    return `00:${mm}:${ss}.${ms}`;
  }

  return null;
}

function cueTimeToMilliseconds(value: string) {
  const match = value.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);

  if (!match) {
    return null;
  }

  const [, hh, mm, ss, ms] = match;
  const hours = Number(hh);
  const minutes = Number(mm);
  const seconds = Number(ss);
  const milliseconds = Number(ms);

  if (
    [hours, minutes, seconds, milliseconds].some((part) => Number.isNaN(part))
  ) {
    return null;
  }

  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
}

function toSecondsFromCueTime(value: string) {
  const normalized = normalizeCueTime(value);

  if (!normalized) {
    return null;
  }

  const milliseconds = cueTimeToMilliseconds(normalized);

  if (milliseconds === null) {
    return null;
  }

  return milliseconds / 1000;
}

function buildFormPreviewCue(args: {
  editingDraftLocalId: string | null;
  language: string;
  label: string;
  startTime: string;
  endTime: string;
  text: string;
}) {
  const start = normalizeCueTime(args.startTime);
  const end = normalizeCueTime(args.endTime);
  const previewText = args.text.trim();

  if (!start || !end || previewText.length === 0) {
    return null;
  }

  const startMs = cueTimeToMilliseconds(start);
  const endMs = cueTimeToMilliseconds(end);

  if (startMs === null || endMs === null || startMs >= endMs) {
    return null;
  }

  return {
    id: args.editingDraftLocalId ?? "draft-live-preview",
    language: args.language.trim() || "ko",
    label: args.label.trim() || args.language.trim() || "ko",
    startTime: start,
    endTime: end,
    text: previewText,
  } satisfies PreviewCue;
}

function buildPreviewCues(args: {
  draftItems: DraftSubtitleItem[];
  editingDraftLocalId: string | null;
  language: string;
  label: string;
  startTime: string;
  endTime: string;
  text: string;
}) {
  const draftCues: PreviewCue[] = args.draftItems
    .map((item) => {
      const start = normalizeCueTime(item.startTime);
      const end = normalizeCueTime(item.endTime);
      const cueText = item.text.trim();

      if (!start || !end || cueText.length === 0) {
        return null;
      }

      const startMs = cueTimeToMilliseconds(start);
      const endMs = cueTimeToMilliseconds(end);

      if (startMs === null || endMs === null || startMs >= endMs) {
        return null;
      }

      return {
        id: item.localId,
        language: item.language.trim() || "ko",
        label: item.label.trim() || item.language.trim() || "ko",
        startTime: start,
        endTime: end,
        text: cueText,
      } satisfies PreviewCue;
    })
    .filter((item): item is PreviewCue => Boolean(item));

  const formCue = buildFormPreviewCue({
    editingDraftLocalId: args.editingDraftLocalId,
    language: args.language,
    label: args.label,
    startTime: args.startTime,
    endTime: args.endTime,
    text: args.text,
  });

  if (!formCue) {
    return draftCues;
  }

  if (args.editingDraftLocalId) {
    return draftCues.map((item) =>
      item.id === args.editingDraftLocalId ? formCue : item,
    );
  }

  return [...draftCues, formCue];
}

function buildVttFromCues(cues: PreviewCue[]) {
  const sorted = [...cues].sort((left, right) => {
    const leftMs = cueTimeToMilliseconds(left.startTime) ?? 0;
    const rightMs = cueTimeToMilliseconds(right.startTime) ?? 0;

    return leftMs - rightMs;
  });

  const blocks = sorted.map((cue, index) => {
    return `${index + 1}\n${cue.startTime} --> ${cue.endTime}\n${cue.text}`;
  });

  return `WEBVTT\n\n${blocks.join("\n\n")}`;
}

function destroyPlayer(
  playerRef: React.MutableRefObject<PlayerInstance | null>,
) {
  if (!playerRef.current) {
    return;
  }

  playerRef.current.destroy();
  playerRef.current = null;
}

function revokePreviewUrls(previewUrlsRef: React.MutableRefObject<string[]>) {
  previewUrlsRef.current.forEach((url) => {
    window.URL.revokeObjectURL(url);
  });

  previewUrlsRef.current = [];
}

export function SubtitleEditorModal({
  open,
  title,
  videoThumbnailUrl,
  previewVideoUrl,
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

  const playerRef = useRef<PlayerInstance | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const playerId = useId();
  const playerContainerId = `admin-subtitle-player-${playerId.replace(
    /:/g,
    "",
  )}`;

  const [playerError, setPlayerError] = useState<string | null>(null);

  const sdkMissingError =
    open && !window.Player ? t("플레이어 SDK를 찾을 수 없습니다.") : null;

  const visiblePlayerError = sdkMissingError ?? playerError;

  const previewCues = useMemo(
    () =>
      buildPreviewCues({
        draftItems,
        editingDraftLocalId,
        language,
        label,
        startTime,
        endTime,
        text,
      }),
    [
      draftItems,
      editingDraftLocalId,
      endTime,
      label,
      language,
      startTime,
      text,
    ],
  );

  const onClickEditDraftItem = (item: DraftSubtitleItem) => {
    onStartEditDraftItem(item);

    const seekTime = toSecondsFromCueTime(item.startTime);

    if (seekTime === null || !playerRef.current?.getVideoElement) {
      return;
    }

    const videoElement = playerRef.current.getVideoElement();

    if (!videoElement) {
      return;
    }

    videoElement.currentTime = seekTime + 0.0001;
  };

  useEffect(() => {
    if (!open || !window.Player) {
      return;
    }

    let cancelled = false;

    destroyPlayer(playerRef);

    try {
      const Player = window.Player;

      playerRef.current = new Player({
        url: previewVideoUrl,
        container: `#${playerContainerId}`,
        wrapper: `${playerContainerId}-root`,
        thumbnailSrc: videoThumbnailUrl,
        subtitle: null,
        events: {
          error: () => {
            if (!cancelled) {
              setPlayerError(t("영상 재생 중 오류가 발생했습니다."));
            }
          },
        },
      });

      queueMicrotask(() => {
        if (!cancelled) {
          setPlayerError(null);
        }
      });
    } catch {
      queueMicrotask(() => {
        if (!cancelled) {
          setPlayerError(t("플레이어를 초기화하지 못했습니다."));
        }
      });
    }

    return () => {
      cancelled = true;
      destroyPlayer(playerRef);
      revokePreviewUrls(previewUrlsRef);
    };
  }, [open, playerContainerId, previewVideoUrl, t, videoThumbnailUrl]);

  useEffect(() => {
    if (!open || !playerRef.current) {
      return;
    }

    revokePreviewUrls(previewUrlsRef);

    if (previewCues.length === 0) {
      playerRef.current.setSubtitle(null);
      return;
    }

    const cueByLanguage = new Map<string, PreviewCue[]>();

    previewCues.forEach((cue) => {
      if (!cueByLanguage.has(cue.language)) {
        cueByLanguage.set(cue.language, []);
      }

      cueByLanguage.get(cue.language)?.push(cue);
    });

    const tracks: PlayerSubtitleSource[] = [];

    cueByLanguage.forEach((cues, lang) => {
      const trackBlob = new Blob([buildVttFromCues(cues)], {
        type: "text/vtt;charset=utf-8",
      });
      const trackUrl = window.URL.createObjectURL(trackBlob);

      previewUrlsRef.current.push(trackUrl);

      tracks.push({
        language: lang,
        label: cues[0]?.label || lang,
        url: trackUrl,
        primary: lang === language,
      });
    });

    playerRef.current.setSubtitle(tracks, language);
    playerRef.current.setCaptionLanguage(language);
  }, [language, open, previewCues]);

  return (
    <AppModal open={open} onClose={onClose} zIndex={95}>
      <div className="relative flex max-h-[calc(100dvh-20px)] w-[1400px] max-w-[calc(100vw-20px)] flex-col overflow-hidden rounded-md bg-white shadow-lg dark:bg-dark-surface">
        <div className="shrink-0 border-b border-slate-200 px-1 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
          <div className="flex items-center justify-between">
            <div className="px-3 py-3">{title}</div>
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
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
            <div className="xl:col-span-3 flex">
              <div className="my-auto w-full">
                <div className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-200">
                  {t("미리보기")}
                </div>

                <div className="relative overflow-hidden rounded-md bg-black">
                  <div id={playerContainerId} className="aspect-video w-full" />

                  {visiblePlayerError && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70 px-4 text-center text-sm text-white">
                      {visiblePlayerError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-1 flex flex-col gap-3 rounded-md border border-slate-200 p-3 dark:border-dark-border">
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
                {t(
                  "숫자만 입력해도 자동으로 시:분:초.밀리초 형식이 적용됩니다.",
                )}
              </p>

              {liveTimeError && (
                <p className="text-xs text-rose-500">{liveTimeError}</p>
              )}

              {draftItems.length > 0 && (
                <div className="scroll-custom-container max-h-56 overflow-y-auto rounded-md border border-slate-200 dark:border-dark-border">
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
                        <th className="px-2 py-1 text-left">
                          {t("시작 시간")}
                        </th>
                        <th className="px-2 py-1 text-left">
                          {t("종료 시간")}
                        </th>
                        <th className="px-2 py-1 text-left">
                          {t("자막 문구")}
                        </th>
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
                                onClick={() => onClickEditDraftItem(item)}
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
