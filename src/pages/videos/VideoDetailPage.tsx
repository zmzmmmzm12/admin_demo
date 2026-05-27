import dayjs from "dayjs";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { AppCheckbox } from "../../components/AppCheckbox";
import { PageHeader } from "../../components/PageHeader";
import { TableContainer } from "../../components/TableContainer";
import {
  useCreateSubtitleMutation,
  useDeleteSubtitleMutation,
  useDeleteSubtitlesMutation,
  useUpdateSubtitleMutation,
  useVideoDetailQuery,
} from "../../hooks/useVideosQuery";
import { useDialogActions } from "../../store/dialogStore";
import type { SubtitlePayload, SubtitleTrack } from "../../types/admin";
import { SubtitleEditorModal } from "./components/SubtitleEditorModal";

const PREVIEW_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const DEFAULT_SUBTITLE_FORM = {
  language: "ko",
  label: "",
  startTime: "",
  endTime: "",
  text: "",
};

interface DraftSubtitleItem extends SubtitlePayload {
  localId: string;
}

interface CompareTimeItem {
  language: string;
  startTime: string;
  endTime: string;
}

interface SubtitleModalSnapshot {
  language: string;
  label: string;
  startTime: string;
  endTime: string;
  text: string;
  draftItems: SubtitlePayload[];
}

function isValidTimeFormat(value: string, useHourInput: boolean) {
  return useHourInput
    ? /^\d{2}:\d{2}:\d{2}\.\d{3}$/.test(value)
    : /^\d{2}:\d{2}\.\d{3}$/.test(value);
}

function formatTimeInput(value: string, useHourInput: boolean) {
  const maxDigits = useHourInput ? 9 : 7;
  const digits = value.replace(/\D/g, "").slice(0, maxDigits);

  if (useHourInput) {
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}:${digits.slice(2)}`;
    }
    if (digits.length <= 6) {
      return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`;
    }

    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(
      4,
      6,
    )}.${digits.slice(6)}`;
  }

  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function parseTimeToMilliseconds(value: string) {
  const hourMatch = value.match(/^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (hourMatch) {
    const [, hh, mm, ss, mmmRaw] = hourMatch;
    const hours = Number(hh);
    const minutes = Number(mm);
    const seconds = Number(ss);
    const milliseconds = Number((mmmRaw ?? "0").padEnd(3, "0"));
    if (
      [hours, minutes, seconds, milliseconds].some((part) => Number.isNaN(part))
    ) {
      return null;
    }
    return ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
  }

  const minuteMatch = value.match(/^(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (minuteMatch) {
    const [, mm, ss, mmmRaw] = minuteMatch;
    const minutes = Number(mm);
    const seconds = Number(ss);
    const milliseconds = Number((mmmRaw ?? "0").padEnd(3, "0"));
    if ([minutes, seconds, milliseconds].some((part) => Number.isNaN(part))) {
      return null;
    }
    return (minutes * 60 + seconds) * 1000 + milliseconds;
  }

  return null;
}

function parseVideoDurationToSeconds(duration: string) {
  const milliseconds = parseTimeToMilliseconds(duration);
  if (milliseconds === null) {
    return 0;
  }
  return Math.floor(milliseconds / 1000);
}

function normalizeMillisecondsTime(value: string, useHourInput: boolean) {
  if (!value) {
    return value;
  }

  if (useHourInput) {
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return `${value}.000`;
    }
    if (/^\d{2}:\d{2}:\d{2}\.\d{1,2}$/.test(value)) {
      const [base, ms] = value.split(".");
      return `${base}.${(ms ?? "").padEnd(3, "0")}`;
    }
    return value;
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}.000`;
  }
  if (/^\d{2}:\d{2}\.\d{1,2}$/.test(value)) {
    const [base, ms] = value.split(".");
    return `${base}.${(ms ?? "").padEnd(3, "0")}`;
  }
  return value;
}

function normalizeTimeForApi(value: string, useHourInput: boolean) {
  const normalized = normalizeMillisecondsTime(value, useHourInput);
  return useHourInput ? normalized : `00:${normalized}`;
}

function formatTimeForInput(value: string, useHourInput: boolean) {
  if (!value) {
    return value;
  }

  if (useHourInput) {
    if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return `${value}.000`;
    }
    if (/^\d{2}:\d{2}:\d{2}\.\d{1,2}$/.test(value)) {
      const [base, ms] = value.split(".");
      return `${base}.${(ms ?? "").padEnd(3, "0")}`;
    }
    return value;
  }

  const hourMatch = value.match(/^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);
  if (hourMatch) {
    const [, , mm, ss, mmmRaw] = hourMatch;
    const ms = (mmmRaw ?? "000").padEnd(3, "0");
    return `${mm}:${ss}.${ms}`;
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${value}.000`;
  }
  if (/^\d{2}:\d{2}\.\d{1,2}$/.test(value)) {
    const [base, ms] = value.split(".");
    return `${base}.${(ms ?? "").padEnd(3, "0")}`;
  }

  return value;
}

function toDisplayTime(value: string, useHourInput: boolean) {
  return formatTimeForInput(value, useHourInput);
}

function isTimeRangeOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
) {
  return startA < endB && endA > startB;
}

export function VideoDetailPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const { t } = useTranslation();
  const { openAlert, openConfirm } = useDialogActions();

  const detailQuery = useVideoDetailQuery(videoId ?? "");
  const createSubtitleMutation = useCreateSubtitleMutation();
  const updateSubtitleMutation = useUpdateSubtitleMutation();
  const deleteSubtitleMutation = useDeleteSubtitleMutation();
  const deleteSubtitlesMutation = useDeleteSubtitlesMutation();

  const [selectedSubtitleIds, setSelectedSubtitleIds] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubtitleId, setEditingSubtitleId] = useState<string | null>(
    null,
  );
  const [editingDraftLocalId, setEditingDraftLocalId] = useState<string | null>(
    null,
  );

  const [language, setLanguage] = useState(DEFAULT_SUBTITLE_FORM.language);
  const [label, setLabel] = useState(DEFAULT_SUBTITLE_FORM.label);
  const [startTime, setStartTime] = useState(DEFAULT_SUBTITLE_FORM.startTime);
  const [endTime, setEndTime] = useState(DEFAULT_SUBTITLE_FORM.endTime);
  const [text, setText] = useState(DEFAULT_SUBTITLE_FORM.text);
  const [draftItems, setDraftItems] = useState<DraftSubtitleItem[]>([]);

  const [currentTime, setCurrentTime] = useState(0);
  const modalInitialSnapshotRef = useRef<SubtitleModalSnapshot | null>(null);

  const video = detailQuery.data;
  const useHourInput = useMemo(
    () => parseVideoDurationToSeconds(video?.duration ?? "") >= 3600,
    [video?.duration],
  );
  const timePlaceholder = useHourInput ? "00:00:00.000" : "00:00.000";

  const visibleSubtitleIds = useMemo(() => {
    return new Set(video?.subtitles.map((subtitle) => subtitle.id) ?? []);
  }, [video]);

  const validSelectedSubtitleIds = useMemo(() => {
    return selectedSubtitleIds.filter((id) => visibleSubtitleIds.has(id));
  }, [selectedSubtitleIds, visibleSubtitleIds]);

  const isAllSelected =
    (video?.subtitles.length ?? 0) > 0 &&
    video?.subtitles.every((subtitle) =>
      validSelectedSubtitleIds.includes(subtitle.id),
    );

  const isSaving =
    createSubtitleMutation.isPending || updateSubtitleMutation.isPending;

  const startMilliseconds = parseTimeToMilliseconds(
    normalizeTimeForApi(startTime, useHourInput),
  );
  const endMilliseconds = parseTimeToMilliseconds(
    normalizeTimeForApi(endTime, useHourInput),
  );

  const showPreviewSubtitle =
    text.trim().length > 0 &&
    startMilliseconds !== null &&
    endMilliseconds !== null &&
    startMilliseconds < endMilliseconds &&
    currentTime * 1000 >= startMilliseconds &&
    currentTime * 1000 <= endMilliseconds;

  const activePreviewTexts = useMemo(() => {
    if (draftItems.length > 0) {
      return draftItems
        .filter((item) => {
          const start = parseTimeToMilliseconds(item.startTime);
          const end = parseTimeToMilliseconds(item.endTime);
          if (start === null || end === null) return false;
          return currentTime * 1000 >= start && currentTime * 1000 <= end;
        })
        .map((item) => item.text)
        .filter((item) => item.trim().length > 0);
    }

    if (showPreviewSubtitle) {
      return [text];
    }

    return [];
  }, [currentTime, draftItems, showPreviewSubtitle, text]);

  const resetModalForm = () => {
    setEditingSubtitleId(null);
    setEditingDraftLocalId(null);
    setLanguage(DEFAULT_SUBTITLE_FORM.language);
    setLabel(DEFAULT_SUBTITLE_FORM.label);
    setStartTime(DEFAULT_SUBTITLE_FORM.startTime);
    setEndTime(DEFAULT_SUBTITLE_FORM.endTime);
    setText(DEFAULT_SUBTITLE_FORM.text);
    setDraftItems([]);
  };

  const normalizeDraftItemsForSnapshot = (items: DraftSubtitleItem[]) =>
    items.map(
      ({
        language: lang,
        label: lb,
        startTime: start,
        endTime: end,
        text: tx,
      }) => ({
        language: lang,
        label: lb,
        startTime: start,
        endTime: end,
        text: tx,
      }),
    );

  const buildModalSnapshot = (args: {
    languageValue: string;
    labelValue: string;
    startTimeValue: string;
    endTimeValue: string;
    textValue: string;
    draftItemValues: DraftSubtitleItem[];
  }): SubtitleModalSnapshot => ({
    language: args.languageValue,
    label: args.labelValue,
    startTime: args.startTimeValue,
    endTime: args.endTimeValue,
    text: args.textValue,
    draftItems: normalizeDraftItemsForSnapshot(args.draftItemValues),
  });

  const hasSubtitleModalChanges = () => {
    if (!modalInitialSnapshotRef.current) {
      return false;
    }

    const currentSnapshot = buildModalSnapshot({
      languageValue: language,
      labelValue: label,
      startTimeValue: startTime,
      endTimeValue: endTime,
      textValue: text,
      draftItemValues: draftItems,
    });

    return (
      JSON.stringify(modalInitialSnapshotRef.current) !==
      JSON.stringify(currentSnapshot)
    );
  };

  const clearInputForm = () => {
    setEditingDraftLocalId(null);
    setStartTime("");
    setEndTime("");
    setText("");
  };

  const buildPayloadFromForm = (): SubtitlePayload => {
    const normalizedStart = normalizeTimeForApi(startTime.trim(), useHourInput);
    const normalizedEnd = normalizeTimeForApi(endTime.trim(), useHourInput);

    return {
      language: language.trim(),
      label: label.trim(),
      startTime: normalizedStart,
      endTime: normalizedEnd,
      text: text.trim(),
    };
  };

  const getTimeErrorMessage = (
    payload: Pick<SubtitlePayload, "startTime" | "endTime">,
  ) => {
    const displayStart = toDisplayTime(payload.startTime, useHourInput);
    const displayEnd = toDisplayTime(payload.endTime, useHourInput);

    if (!displayStart || !displayEnd) {
      return t("시작 시간과 종료 시간을 입력해주세요.");
    }

    if (
      !isValidTimeFormat(displayStart, useHourInput) ||
      !isValidTimeFormat(displayEnd, useHourInput)
    ) {
      return t("시간 형식을 확인해주세요. (예: 00:00:03)");
    }

    const start = parseTimeToMilliseconds(
      normalizeTimeForApi(displayStart, useHourInput),
    );
    const end = parseTimeToMilliseconds(
      normalizeTimeForApi(displayEnd, useHourInput),
    );

    if (start === null || end === null || start >= end) {
      return t("시작 시간은 종료 시간보다 빨라야 합니다.");
    }

    return null;
  };

  const hasOverlapWithItems = (
    payload: SubtitlePayload,
    compareItems: CompareTimeItem[],
  ) => {
    const start = parseTimeToMilliseconds(payload.startTime);
    const end = parseTimeToMilliseconds(payload.endTime);
    if (start === null || end === null) {
      return false;
    }

    return compareItems.some((item) => {
      if (item.language !== payload.language) {
        return false;
      }

      const compareStart = parseTimeToMilliseconds(item.startTime);
      const compareEnd = parseTimeToMilliseconds(item.endTime);
      if (compareStart === null || compareEnd === null) {
        return false;
      }

      return isTimeRangeOverlap(start, end, compareStart, compareEnd);
    });
  };

  const existingCompareItems = useMemo(() => {
    return (video?.subtitles ?? [])
      .filter((subtitle) => subtitle.id !== editingSubtitleId)
      .map((subtitle) => ({
        language: subtitle.language,
        startTime: subtitle.startTime,
        endTime: subtitle.endTime,
      }));
  }, [editingSubtitleId, video]);

  const liveTimeError = useMemo(() => {
    if (!startTime && !endTime) {
      return null;
    }

    const payload = buildPayloadFromForm();
    const baseError = getTimeErrorMessage(payload);
    if (baseError) {
      return baseError;
    }

    const draftCompareItems = draftItems
      .filter((item) => item.localId !== editingDraftLocalId)
      .map((item) => ({
        language: item.language,
        startTime: item.startTime,
        endTime: item.endTime,
      }));

    if (
      hasOverlapWithItems(payload, [
        ...draftCompareItems,
        ...existingCompareItems,
      ])
    ) {
      return t("자막 시간이 기존 항목과 겹칩니다.");
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    draftItems,
    editingDraftLocalId,
    endTime,
    existingCompareItems,
    language,
    label,
    startTime,
    text,
  ]);

  const validatePayload = (payload: SubtitlePayload) => {
    if (!payload.label || !payload.text) {
      openAlert(t("자막 라벨과 문구를 입력해주세요."));
      return false;
    }

    const timeError = getTimeErrorMessage(payload);
    if (timeError) {
      openAlert(timeError);
      return false;
    }

    return true;
  };

  const validateNoOverlap = (saveItems: SubtitlePayload[]) => {
    for (let i = 0; i < saveItems.length; i += 1) {
      const current = saveItems[i];
      if (!current) continue;

      const othersInDraft = saveItems
        .filter((_, index) => index !== i)
        .map((item) => ({
          language: item.language,
          startTime: item.startTime,
          endTime: item.endTime,
        }));

      if (hasOverlapWithItems(current, othersInDraft)) {
        openAlert(t("입력된 자막 시간끼리 겹치는 구간이 있습니다."));
        return false;
      }

      if (hasOverlapWithItems(current, existingCompareItems)) {
        openAlert(t("자막 시간이 기존 항목과 겹칩니다."));
        return false;
      }
    }

    return true;
  };

  const openCreateModal = () => {
    const initialDraftItems: DraftSubtitleItem[] = [];

    resetModalForm();
    setCurrentTime(0);
    modalInitialSnapshotRef.current = buildModalSnapshot({
      languageValue: DEFAULT_SUBTITLE_FORM.language,
      labelValue: DEFAULT_SUBTITLE_FORM.label,
      startTimeValue: DEFAULT_SUBTITLE_FORM.startTime,
      endTimeValue: DEFAULT_SUBTITLE_FORM.endTime,
      textValue: DEFAULT_SUBTITLE_FORM.text,
      draftItemValues: initialDraftItems,
    });
    setModalOpen(true);
  };

  const openEditModal = (subtitle: SubtitleTrack) => {
    const initialDraftItems: DraftSubtitleItem[] = [
      {
        localId: `draft-${new Date()}`,
        language: subtitle.language,
        label: subtitle.label,
        startTime: subtitle.startTime,
        endTime: subtitle.endTime,
        text: subtitle.text,
      },
    ];

    setEditingSubtitleId(subtitle.id);
    setLanguage(subtitle.language);
    setLabel(subtitle.label);
    setStartTime("");
    setEndTime("");
    setText("");
    setDraftItems(initialDraftItems);
    setEditingDraftLocalId(null);
    setCurrentTime(0);
    modalInitialSnapshotRef.current = buildModalSnapshot({
      languageValue: subtitle.language,
      labelValue: subtitle.label,
      startTimeValue: "",
      endTimeValue: "",
      textValue: "",
      draftItemValues: initialDraftItems,
    });
    setModalOpen(true);
  };

  const forceCloseModal = () => {
    setModalOpen(false);
    setCurrentTime(0);
    modalInitialSnapshotRef.current = null;
    resetModalForm();
  };

  const closeModal = () => {
    if (!hasSubtitleModalChanges()) {
      forceCloseModal();
      return;
    }

    openConfirm(
      t("정말 종료하시겠습니까?\n종료하시면 작성중이던 내용이 사라집니다."),
      forceCloseModal,
    );
  };

  const onStartEditDraftItem = (item: DraftSubtitleItem) => {
    setEditingDraftLocalId(item.localId);
    setLanguage(item.language);
    setLabel(item.label);
    setStartTime(formatTimeForInput(item.startTime, useHourInput));
    setEndTime(formatTimeForInput(item.endTime, useHourInput));
    setText(item.text);
  };

  const onUpsertDraftItem = () => {
    const payload = buildPayloadFromForm();

    if (!validatePayload(payload)) {
      return;
    }

    const compareItems = [
      ...draftItems
        .filter((item) => item.localId !== editingDraftLocalId)
        .map((item) => ({
          language: item.language,
          startTime: item.startTime,
          endTime: item.endTime,
        })),
      ...existingCompareItems,
    ];

    if (hasOverlapWithItems(payload, compareItems)) {
      openAlert(t("자막 시간이 기존 항목과 겹칩니다."));
      return;
    }

    if (editingDraftLocalId) {
      setDraftItems((prev) =>
        prev.map((item) =>
          item.localId === editingDraftLocalId ? { ...item, ...payload } : item,
        ),
      );
      clearInputForm();
      return;
    }

    setDraftItems((prev) => [
      ...prev,
      {
        localId: `draft-${Date.now()}-${prev.length + 1}`,
        ...payload,
      },
    ]);

    clearInputForm();
  };

  const onDeleteDraftItem = (localId: string) => {
    setDraftItems((prev) => prev.filter((item) => item.localId !== localId));

    if (editingDraftLocalId === localId) {
      clearInputForm();
    }
  };

  const onSaveSubtitle = async () => {
    if (!videoId) {
      return;
    }

    const payloadFromForm = buildPayloadFromForm();
    const saveItems: SubtitlePayload[] =
      draftItems.length > 0
        ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
          draftItems.map(({ localId: _localId, ...rest }) => rest)
        : [payloadFromForm];

    if (saveItems.length === 1) {
      const only = saveItems[0];
      if (
        only &&
        !only.label &&
        !only.text &&
        !only.startTime &&
        !only.endTime
      ) {
        openAlert(t("저장할 자막이 없습니다."));
        return;
      }
    }

    if (!saveItems.every((item) => validatePayload(item))) {
      return;
    }

    if (!validateNoOverlap(saveItems)) {
      return;
    }

    try {
      if (editingSubtitleId) {
        const [first, ...rest] = saveItems;

        if (!first) {
          openAlert(t("저장할 자막이 없습니다."));
          return;
        }

        await updateSubtitleMutation.mutateAsync({
          videoId,
          subtitleId: editingSubtitleId,
          payload: first,
        });

        for (const payload of rest) {
          await createSubtitleMutation.mutateAsync({
            id: videoId,
            payload,
          });
        }
      } else {
        for (const payload of saveItems) {
          await createSubtitleMutation.mutateAsync({
            id: videoId,
            payload,
          });
        }
      }

      openAlert(t("처리되었습니다."));
      forceCloseModal();
    } catch {
      openAlert(t("처리 중 오류가 발생했습니다."));
    }
  };

  if (!videoId) {
    return null;
  }

  return (
    <section>
      <PageHeader
        title={t("자막 관리")}
        description={t("언어별 자막을 등록하고 관리합니다.")}
      />

      <div className="mx-3 space-y-4 pb-8">
        {detailQuery.isLoading && (
          <div className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
            <div className="space-y-3 animate-pulse">
              <div className="h-5 w-40 rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
              <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
            </div>
          </div>
        )}

        {detailQuery.isError && (
          <div className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
            <p className="py-16 text-center text-sm text-rose-500">
              {t("영상 목록을 불러오지 못했습니다.")}
            </p>
          </div>
        )}

        {!detailQuery.isLoading && !detailQuery.isError && video && (
          <div className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("자막 목록")}
              </h3>

              <div className="flex items-center gap-2">
                {validSelectedSubtitleIds.length > 0 ? (
                  <button
                    type="button"
                    className="cursor-pointer rounded-md bg-rose-500 px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={deleteSubtitlesMutation.isPending}
                    onClick={() =>
                      openConfirm(
                        t("선택한 자막을 모두 삭제하시겠습니까?"),
                        () =>
                          deleteSubtitlesMutation.mutate(
                            {
                              videoId,
                              subtitleIds: validSelectedSubtitleIds,
                            },
                            {
                              onSuccess: () => {
                                setSelectedSubtitleIds([]);
                                openAlert(t("처리되었습니다."));
                              },
                              onError: () =>
                                openAlert(t("처리 중 오류가 발생했습니다.")),
                            },
                          ),
                      )
                    }
                  >
                    {t("삭제")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cursor-pointer rounded-md bg-main-color px-3 py-1.5 text-xs text-white"
                    onClick={openCreateModal}
                  >
                    {t("언어 추가")}
                  </button>
                )}
              </div>
            </div>

            <TableContainer
              tableClassName="w-full min-w-[540px]"
              wrapperClassName="mt-3 px-5"
            >
              <colgroup>
                <col className="w-[56px]" />
                <col className="w-[70px]" />
                <col className="w-auto min-w-[120px]" />
                <col className="w-[160px] min-w-[120px]" />
                <col className="w-[90px]" />
              </colgroup>
              <thead className="border-b border-slate-100 text-center text-xs text-slate-400 dark:border-dark-border dark:text-slate-300">
                <tr>
                  <th className="align-middle px-4 py-2">
                    <AppCheckbox
                      checked={Boolean(isAllSelected)}
                      ariaLabel="select all subtitles"
                      onChange={(checked) =>
                        setSelectedSubtitleIds(
                          checked ? video.subtitles.map((item) => item.id) : [],
                        )
                      }
                    />
                  </th>
                  <th className="align-middle px-4 py-2">No</th>
                  <th className="align-middle px-4 py-2">{t("언어")}</th>
                  <th className="align-middle px-4 py-2">{t("생성일")}</th>
                  <th className="align-middle px-2 py-2 text-right"></th>
                </tr>
              </thead>

              <tbody>
                {video.subtitles.map((subtitle, index) => (
                  <tr
                    key={subtitle.id}
                    className="border-b border-slate-100 dark:border-dark-border"
                  >
                    <td className="align-middle px-4 py-2">
                      <div className="flex items-center justify-center">
                        <AppCheckbox
                          checked={validSelectedSubtitleIds.includes(
                            subtitle.id,
                          )}
                          ariaLabel={`select subtitle ${subtitle.id}`}
                          onChange={(checked) =>
                            setSelectedSubtitleIds((prev) =>
                              checked
                                ? prev.includes(subtitle.id)
                                  ? prev
                                  : [...prev, subtitle.id]
                                : prev.filter((id) => id !== subtitle.id),
                            )
                          }
                        />
                      </div>
                    </td>
                    <td className="align-middle px-4 py-2">
                      <div className="whitespace-nowrap text-center text-sm text-slate-700 dark:text-white">
                        {index + 1}
                      </div>
                    </td>
                    <td className="align-middle px-4 py-2">
                      <div className="whitespace-nowrap text-center text-sm text-slate-700 dark:text-white">
                        {subtitle.language}
                      </div>
                    </td>
                    <td className="align-middle px-4 py-2">
                      <div className="whitespace-nowrap text-center text-sm text-slate-700 dark:text-white">
                        {dayjs(subtitle.createdAt).format("YYYY.MM.DD HH:mm")}
                      </div>
                    </td>
                    <td className="align-middle px-2 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-indigo-500 text-slate-50"
                          onClick={() => openEditModal(subtitle)}
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
                          className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-slate-500 text-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={deleteSubtitleMutation.isPending}
                          onClick={() =>
                            openConfirm(t("자막을 삭제하시겠습니까?"), () =>
                              deleteSubtitleMutation.mutate(
                                { videoId, subtitleId: subtitle.id },
                                {
                                  onSuccess: () => {
                                    setSelectedSubtitleIds((prev) =>
                                      prev.filter((id) => id !== subtitle.id),
                                    );
                                    openAlert(t("처리되었습니다."));
                                  },
                                  onError: () =>
                                    openAlert(
                                      t("처리 중 오류가 발생했습니다."),
                                    ),
                                },
                              ),
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
                    </td>
                  </tr>
                ))}

                {video.subtitles.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-300"
                    >
                      <div className="flex items-center justify-center">
                        {t("등록된 자막이 없습니다.")}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </TableContainer>
          </div>
        )}
      </div>

      <SubtitleEditorModal
        open={modalOpen}
        title={editingSubtitleId ? t("자막 수정") : t("언어 추가")}
        videoThumbnailUrl={video?.thumbnailUrl}
        previewVideoUrl={PREVIEW_VIDEO_URL}
        activePreviewTexts={activePreviewTexts}
        language={language}
        label={label}
        startTime={startTime}
        endTime={endTime}
        text={text}
        timePlaceholder={timePlaceholder}
        liveTimeError={liveTimeError}
        draftItems={draftItems}
        editingDraftLocalId={editingDraftLocalId}
        isSaving={isSaving}
        onClose={closeModal}
        onTimeUpdate={setCurrentTime}
        onLanguageChange={setLanguage}
        onLabelChange={setLabel}
        onStartTimeChange={(value) =>
          setStartTime(formatTimeInput(value, useHourInput))
        }
        onEndTimeChange={(value) => setEndTime(formatTimeInput(value, useHourInput))}
        onTextChange={setText}
        onUpsertDraftItem={onUpsertDraftItem}
        onStartEditDraftItem={onStartEditDraftItem}
        onDeleteDraftItem={onDeleteDraftItem}
        onSave={onSaveSubtitle}
        formatInputTime={(value) => formatTimeForInput(value, useHourInput)}
      />
    </section>
  );
}
