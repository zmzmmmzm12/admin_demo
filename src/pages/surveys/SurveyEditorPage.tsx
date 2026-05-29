import dayjs from "dayjs";
import { useMemo, useState } from "react";
import DatePickerModule from "react-multi-date-picker";
import DateObject from "react-date-object";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppCheckbox } from "../../components/AppCheckbox";
import { HeaderListLink } from "../../components/HeaderListLink";
import { PageHeader } from "../../components/PageHeader";
import {
  useSaveSurveyMutation,
  useSurveyDetailQuery,
} from "../../hooks/useSurveysQuery";
import { useDialogActions } from "../../store/dialogStore";
import type {
  SurveyQuestion,
  SurveyQuestionType,
  SurveySavePayload,
  SurveyStatus,
} from "../../types/admin";
import { getDatePickerLocale } from "../../utils/datePickerLocale";

const DatePicker =
  (DatePickerModule as unknown as { default?: typeof DatePickerModule })
    .default ?? DatePickerModule;

interface SurveyEditorFormValue {
  title: string;
  status: SurveyStatus;
  startDate: string;
  endDate: string;
  description: string;
  questions: SurveyQuestion[];
}

const defaultQuestion: SurveyQuestion = {
  id: "",
  title: "",
  type: "single",
  required: true,
  options: ["", ""],
};

const defaultSurveyFormValue: SurveyEditorFormValue = {
  title: "",
  status: "draft",
  startDate: dayjs().format("YYYY-MM-DD"),
  endDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
  description: "",
  questions: [{ ...defaultQuestion }],
};

const LINEAR_SCALE_LABELS = [
  "매우 나쁨",
  "나쁨",
  "보통",
  "좋음",
  "매우 좋음",
] as const;
const SCORE_RANGE_VALUES = [3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

function getScoreRangeOptionValue(options: string[]) {
  if (
    options.length >= 3 &&
    options.every((option, index) => option === String(index))
  ) {
    return Math.min(11, Math.max(3, options.length));
  }
  return 3;
}

function getScoreOptionsByRange(rangeValue: number) {
  return Array.from({ length: rangeValue }, (_, index) => String(index));
}

function toDateString(
  value: DateObject | DateObject[] | string | number | Date | null | undefined,
) {
  if (Array.isArray(value)) {
    return toDateString(value[0]);
  }

  if (!value) {
    return "";
  }

  if (value instanceof DateObject) {
    return value.format("YYYY-MM-DD");
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return "";
  }

  return parsed.format("YYYY-MM-DD");
}

function getFixedOptionsByType(
  type: SurveyQuestionType,
  currentOptions: string[] = [],
) {
  if (type === "ox") {
    return ["O", "X"];
  }

  if (type === "linearScale") {
    return [...LINEAR_SCALE_LABELS];
  }

  if (type === "score") {
    return getScoreOptionsByRange(getScoreRangeOptionValue(currentOptions));
  }

  return currentOptions;
}

function getDefaultOptionsByType(type: SurveyQuestionType) {
  const fixedOptions = getFixedOptionsByType(type);
  if (fixedOptions.length > 0) {
    return fixedOptions;
  }

  if (type === "shortText" || type === "longText") {
    return [];
  }

  return ["", ""];
}

function isOptionBasedType(type: SurveyQuestionType) {
  return type === "single" || type === "multiple" || type === "dropdown";
}

function isFixedOptionType(type: SurveyQuestionType) {
  return type === "ox" || type === "linearScale" || type === "score";
}

export function SurveyEditorPage() {
  const [searchParams] = useSearchParams();
  const surveyKey = searchParams.get("surveyKey") ?? "";
  const isEdit = Boolean(surveyKey);
  const { t } = useTranslation();
  const listPath = "/surveys";

  const surveyQuery = useSurveyDetailQuery(surveyKey);

  if (isEdit && surveyQuery.isLoading) {
    return (
      <section>
        <PageHeader
          title={t("설문 수정")}
          description={t("설문 정보와 문항을 편집합니다.")}
          titleAction={<HeaderListLink to={listPath} />}
        />

        <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
          <div className="border-b border-slate-200 px-5 py-4 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
            {t("설문 정보")}
          </div>

          <div className="space-y-5 px-5 py-6 animate-pulse">
            <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
            <div className="h-10 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
            <div className="h-20 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
            <div className="h-64 w-full rounded bg-slate-100 dark:bg-slate-700/70" />
          </div>
        </div>
      </section>
    );
  }

  if (isEdit && surveyQuery.isError) {
    return (
      <section>
        <PageHeader
          title={t("설문 수정")}
          description={t("설문 정보와 문항을 편집합니다.")}
          titleAction={<HeaderListLink to={listPath} />}
        />

        <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
          <div className="border-b border-slate-200 px-5 py-4 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
            {t("설문 정보")}
          </div>

          <p className="py-16 text-center text-sm text-rose-500">
            {t("설문 목록을 불러오지 못했습니다.")}
          </p>
        </div>
      </section>
    );
  }

  if (isEdit && !surveyQuery.data) {
    return null;
  }

  const initialValue: SurveyEditorFormValue =
    isEdit && surveyQuery.data
      ? {
          title: surveyQuery.data.title,
          status: surveyQuery.data.status,
          startDate: surveyQuery.data.startDate,
          endDate: surveyQuery.data.endDate,
          description: surveyQuery.data.description,
          questions:
            surveyQuery.data.questions.length > 0
              ? surveyQuery.data.questions.map((question) => ({
                  ...question,
                  options:
                    question.options.length > 0
                      ? [...question.options]
                      : getDefaultOptionsByType(question.type),
                }))
              : [{ ...defaultQuestion }],
        }
      : defaultSurveyFormValue;

  return (
    <SurveyEditorForm
      key={surveyKey || "create"}
      surveyId={surveyKey || undefined}
      initialValue={initialValue}
      listPath={listPath}
    />
  );
}

interface SurveyEditorFormProps {
  surveyId?: string;
  initialValue: SurveyEditorFormValue;
  listPath: string;
}

function SurveyEditorForm({
  surveyId,
  initialValue,
  listPath,
}: SurveyEditorFormProps) {
  const isEdit = Boolean(surveyId);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { openAlert, openConfirm } = useDialogActions();
  const saveMutation = useSaveSurveyMutation();
  const datePickerLocale = useMemo(
    () => getDatePickerLocale(i18n.language),
    [i18n.language],
  );

  const [title, setTitle] = useState(initialValue.title);
  const [status, setStatus] = useState<SurveyStatus>(initialValue.status);
  const [startDate, setStartDate] = useState(initialValue.startDate);
  const [endDate, setEndDate] = useState(initialValue.endDate);
  const [description, setDescription] = useState(initialValue.description);
  const [questions, setQuestions] = useState<SurveyQuestion[]>(
    initialValue.questions,
  );

  const onChangeQuestion = (index: number, patch: Partial<SurveyQuestion>) => {
    setQuestions((prev) =>
      prev.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    );
  };

  const onChangeOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options: question.options.map((option, innerIndex) =>
            innerIndex === optionIndex ? value : option,
          ),
        };
      }),
    );
  };

  const onAddQuestion = () => {
    setQuestions((prev) => [...prev, { ...defaultQuestion }]);
  };

  const onDeleteQuestion = (index: number) => {
    setQuestions((prev) =>
      prev.length <= 1
        ? prev
        : prev.filter((_, questionIndex) => questionIndex !== index),
    );
  };

  const onChangeQuestionType = (index: number, type: SurveyQuestionType) => {
    setQuestions((prev) =>
      prev.map((question, questionIndex) => {
        if (questionIndex !== index) {
          return question;
        }

        return {
          ...question,
          type,
          options: getDefaultOptionsByType(type),
        };
      }),
    );
  };

  const onAddOption = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? { ...question, options: [...question.options, ""] }
          : question,
      ),
    );
  };

  const onDeleteOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        return {
          ...question,
          options:
            question.options.length <= 2
              ? question.options
              : question.options.filter(
                  (_, innerIndex) => innerIndex !== optionIndex,
                ),
        };
      }),
    );
  };

  const onSave = () => {
    if (!title.trim()) {
      openAlert(t("설문 제목을 입력해주세요."));
      return;
    }

    if (!startDate || !endDate || startDate > endDate) {
      openAlert(t("설문 기간을 확인해주세요."));
      return;
    }

    const normalizedQuestions = questions.map((question, index) => {
      const normalizedTitle = question.title.trim();
      const normalizedOptions = question.options
        .map((option) => option.trim())
        .filter((option) => option.length > 0);

      return {
        ...question,
        id: question.id || `SVQ-${Date.now()}-${index + 1}`,
        title: normalizedTitle,
        options:
          question.type === "shortText" || question.type === "longText"
            ? []
            : isFixedOptionType(question.type)
              ? getFixedOptionsByType(question.type, question.options)
              : normalizedOptions,
      };
    });

    if (normalizedQuestions.some((question) => !question.title)) {
      openAlert(t("문항 제목을 모두 입력해주세요."));
      return;
    }

    if (
      normalizedQuestions.some(
        (question) =>
          isOptionBasedType(question.type) && question.options.length < 2,
      )
    ) {
      openAlert(t("객관식 문항은 최소 2개 선택지가 필요합니다."));
      return;
    }

    const payload: SurveySavePayload = {
      title: title.trim(),
      status,
      startDate,
      endDate,
      description: description.trim(),
      questions: normalizedQuestions,
    };

    openConfirm(t("설문을 저장하시겠습니까?"), () => {
      saveMutation.mutate(
        { id: surveyId, payload },
        {
          onSuccess: () => {
            openAlert(t("처리되었습니다."));
            navigate(listPath);
          },
          onError: () => openAlert(t("처리 중 오류가 발생했습니다.")),
        },
      );
    });
  };

  return (
    <section>
      <PageHeader
        title={isEdit ? t("설문 수정") : t("설문 등록")}
        description={t("설문 정보와 문항을 편집합니다.")}
        titleAction={<HeaderListLink to={listPath} />}
      />

      <div className="mx-3 mb-8 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="border-b border-slate-200 px-5 py-4 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
          {t("설문 정보")}
        </div>

        <div className="space-y-5 px-5 py-6">
          <div>
            <div className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
              {t("설문명")} <span className="text-rose-500">*</span>
            </div>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
            />
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
              {t("상태")}
            </div>
            <div className="relative w-full">
              <select
                value={status}
                className="h-9 w-full cursor-pointer appearance-none rounded-md border border-slate-200 px-3 pr-8 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                onChange={(event) =>
                  setStatus(event.target.value as SurveyStatus)
                }
              >
                <option value="draft">{t("임시저장")}</option>
                <option value="published">{t("게시")}</option>
                <option value="closed">{t("종료")}</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
              {t("기간")}
            </div>
            <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="date-picker-custom">
                <DatePicker
                  locale={datePickerLocale}
                  format="YYYY-MM-DD"
                  value={startDate}
                  onOpenPickNewDate={false}
                  editable={false}
                  className="rmdp-calendar"
                  containerClassName="date-picker-custom"
                  onChange={(value) => setStartDate(toDateString(value))}
                  inputClass="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                />
              </div>
              <span className="text-xs text-slate-400">~</span>
              <div className="date-picker-custom">
                <DatePicker
                  locale={datePickerLocale}
                  format="YYYY-MM-DD"
                  value={endDate}
                  onOpenPickNewDate={false}
                  editable={false}
                  className="rmdp-calendar"
                  containerClassName="date-picker-custom"
                  onChange={(value) => setEndDate(toDateString(value))}
                  inputClass="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs text-slate-500 dark:text-slate-300">
              {t("설명")}
            </div>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-[84px] w-full rounded-md border border-slate-200 p-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
            />
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50/40 p-4 dark:border-dark-border dark:bg-dark-surface-alt/40">
            <div className="mb-3 flex items-center justify-between">
              <strong className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                {t("문항")}
              </strong>
              <button
                type="button"
                className="h-8 cursor-pointer rounded-md bg-main-color px-3 text-xs text-white"
                onClick={onAddQuestion}
              >
                {t("문항 추가")}
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((question, questionIndex) => (
                <div
                  key={`${question.id || "new"}-${questionIndex}`}
                  className="rounded-md border border-slate-200 bg-white p-3 shadow-sm dark:border-dark-border dark:bg-dark-surface"
                >
                  <div className="mb-2 flex items-center gap-2 border-b border-slate-100 pb-2 dark:border-dark-border">
                    <span className="inline-flex h-6 items-center rounded bg-slate-100 px-2 text-[11px] font-semibold text-slate-600 dark:bg-dark-hover dark:text-slate-200">
                      Q{questionIndex + 1}
                    </span>

                    <div className="relative w-[170px]">
                      <select
                        value={question.type}
                        className="h-8 w-full cursor-pointer appearance-none rounded-md border border-slate-200 px-2 pr-8 text-xs dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                        onChange={(event) =>
                          onChangeQuestionType(
                            questionIndex,
                            event.target.value as SurveyQuestionType,
                          )
                        }
                      >
                        <option value="single">{t("객관식(단일)")}</option>
                        <option value="multiple">{t("객관식(복수)")}</option>
                        <option value="dropdown">{t("드롭다운")}</option>
                        <option value="shortText">{t("단답형")}</option>
                        <option value="longText">{t("장문형")}</option>
                        <option value="ox">{t("OX")}</option>
                        <option value="linearScale">{t("선형배율")}</option>
                        <option value="score">{t("점수")}</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                        expand_more
                      </span>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-300">
                      <AppCheckbox
                        checked={question.required}
                        onChange={(checked) =>
                          onChangeQuestion(questionIndex, { required: checked })
                        }
                        className="relative size-4 cursor-pointer appearance-none rounded border border-slate-300 bg-white checked:border-indigo-500 checked:bg-indigo-500 checked:before:absolute checked:before:left-1/2 checked:before:top-[calc(50%-1px)] checked:before:h-2 checked:before:w-1 checked:before:-translate-x-1/2 checked:before:-translate-y-1/2 checked:before:rotate-45 checked:before:border-b-2 checked:before:border-r-2 checked:before:border-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border dark:bg-dark-surface"
                      />
                      {t("필수")}
                    </label>

                    <button
                      type="button"
                      className="ml-auto inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-slate-500 text-white"
                      onClick={() => onDeleteQuestion(questionIndex)}
                    >
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                    </button>
                  </div>

                  <input
                    value={question.title}
                    onChange={(event) =>
                      onChangeQuestion(questionIndex, {
                        title: event.target.value,
                      })
                    }
                    placeholder={t("문항 제목")}
                    className="mb-2 h-9 w-full rounded-md border border-slate-200 px-3 text-sm dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                  />

                  {isOptionBasedType(question.type) && (
                    <div className="space-y-1.5">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={`question-option-${optionIndex}`}
                          className="flex items-center gap-1.5"
                        >
                          <input
                            value={option}
                            onChange={(event) =>
                              onChangeOption(
                                questionIndex,
                                optionIndex,
                                event.target.value,
                              )
                            }
                            placeholder={t("선택지")}
                            className="h-8 w-full rounded-md border border-slate-200 px-2 text-xs dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                          />
                          <button
                            type="button"
                            disabled={question.options.length <= 2}
                            className={`inline-flex size-7 items-center justify-center rounded-md ${
                              question.options.length <= 2
                                ? "cursor-default bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                                : "cursor-pointer bg-slate-500 text-white dark:bg-slate-500"
                            }`}
                            onClick={() =>
                              onDeleteOption(questionIndex, optionIndex)
                            }
                          >
                            <span className="material-symbols-outlined text-base">
                              remove
                            </span>
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="h-8 cursor-pointer rounded-md border border-slate-200 px-3 text-xs text-slate-600 dark:border-dark-border dark:text-slate-200"
                        onClick={() => onAddOption(questionIndex)}
                      >
                        {t("선택지 추가")}
                      </button>
                    </div>
                  )}

                  {isFixedOptionType(question.type) && (
                    <div className="rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-500 dark:bg-dark-surface-alt dark:text-slate-300">
                      {question.type === "ox"
                        ? t("자동 선택지: O/X")
                        : question.type === "linearScale"
                          ? t("자동 선택지: 1~5 (매우 나쁨 ~ 매우 좋음)")
                          : t("점수 범위")}
                    </div>
                  )}

                  {question.type === "score" && (
                    <div className="mt-2 rounded-md border border-slate-200 bg-white p-2 dark:border-dark-border dark:bg-dark-surface-alt">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                          {t("점수 범위")}
                        </span>
                        <select
                          value={String(
                            getScoreRangeOptionValue(question.options),
                          )}
                          className="h-7 w-[130px] cursor-pointer appearance-none rounded border border-slate-200 px-2 text-[11px] dark:border-dark-border dark:bg-dark-surface dark:text-slate-100"
                          onChange={(event) =>
                            onChangeQuestion(questionIndex, {
                              options: getScoreOptionsByRange(
                                Number(event.target.value),
                              ),
                            })
                          }
                        >
                          {SCORE_RANGE_VALUES.map((value) => (
                            <option key={value} value={value}>
                              {value === 11
                                ? t("0 ~ 10(NPS)")
                                : `0 ~ ${value - 1}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-wrap items-center gap-1">
                        {getScoreOptionsByRange(
                          getScoreRangeOptionValue(question.options),
                        ).map((scoreText) => (
                          <span
                            key={`score-preview-${scoreText}`}
                            className="inline-flex min-w-6 items-center justify-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 dark:bg-dark-hover dark:text-slate-200"
                          >
                            {scoreText}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.type === "linearScale" && (
                    <div className="mt-2 rounded-md border border-slate-200 bg-white p-2 dark:border-dark-border dark:bg-dark-surface-alt">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {LINEAR_SCALE_LABELS.map((label, index) => (
                          <span
                            key={`linear-scale-${label}`}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-dark-hover dark:text-slate-200"
                          >
                            <b className="font-semibold">{index + 1}</b>
                            <span>{t(label)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(question.type === "shortText" ||
                    question.type === "longText") && (
                    <div className="rounded-md bg-slate-50 px-2 py-1.5 text-xs text-slate-500 dark:bg-dark-surface-alt dark:text-slate-300">
                      {t("응답자가 자유롭게 텍스트를 입력하는 문항입니다.")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 dark:border-dark-border dark:text-slate-200"
              onClick={() => navigate(listPath)}
            >
              {t("취소")}
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-md bg-main-color px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saveMutation.isPending}
              onClick={onSave}
            >
              {t("저장")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
