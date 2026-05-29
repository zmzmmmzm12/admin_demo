import dayjs from "dayjs";
import { type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppCheckbox } from "../../components/AppCheckbox";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { TableContainer } from "../../components/TableContainer";
import {
  useDeleteSurveyMutation,
  useDeleteSurveysMutation,
  useSurveysQuery,
} from "../../hooks/useSurveysQuery";
import { useDialogActions } from "../../store/dialogStore";
import type { SurveySearchParams, SurveyStatus } from "../../types/admin";

const DEFAULT_SURVEY_PARAMS: SurveySearchParams = {
  page: 1,
  pageSize: 10,
  keyword: "",
  status: "all",
};

function parseSurveySearchParams(
  searchParams: URLSearchParams,
): SurveySearchParams {
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const keyword = searchParams.get("keyword") ?? "";
  const statusRaw = searchParams.get("status") ?? "all";

  const status: SurveySearchParams["status"] =
    statusRaw === "draft" || statusRaw === "published" || statusRaw === "closed"
      ? statusRaw
      : "all";

  return {
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    pageSize:
      Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10,
    keyword,
    status,
  };
}

function buildSurveySearchParams(params: SurveySearchParams) {
  const next = new URLSearchParams();

  next.set("page", String(params.page));
  next.set("pageSize", String(params.pageSize));
  next.set("keyword", params.keyword);
  next.set("status", params.status);

  return next;
}

function areSurveySearchParamsEqual(
  left: SurveySearchParams,
  right: SurveySearchParams,
) {
  return (
    left.page === right.page &&
    left.pageSize === right.pageSize &&
    left.keyword === right.keyword &&
    left.status === right.status
  );
}

function getSurveyStatusClasses(status: SurveyStatus) {
  if (status === "published") {
    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
  }

  if (status === "closed") {
    return "bg-slate-500/15 text-slate-600 dark:text-slate-300";
  }

  return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
}

export function SurveyManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { openAlert, openConfirm } = useDialogActions();

  const [urlSearchParams, setUrlSearchParams] = useSearchParams();

  const params = useMemo(
    () => parseSurveySearchParams(urlSearchParams),
    [urlSearchParams],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const surveysQuery = useSurveysQuery(params);
  const deleteSurveyMutation = useDeleteSurveyMutation();
  const deleteSurveysMutation = useDeleteSurveysMutation();

  const list = surveysQuery.data?.data ?? [];
  const totalCount = surveysQuery.data?.totalCount ?? 0;

  const visibleSurveyIds = useMemo(() => {
    return new Set(list.map((survey) => survey.id));
  }, [list]);

  const validSelectedIds = useMemo(() => {
    return selectedIds.filter((id) => visibleSurveyIds.has(id));
  }, [selectedIds, visibleSurveyIds]);

  const isAllSelected =
    list.length > 0 &&
    list.every((survey) => validSelectedIds.includes(survey.id));

  const updateSearchParams = (nextParams: SurveySearchParams) => {
    if (areSurveySearchParamsEqual(params, nextParams)) {
      return;
    }

    setUrlSearchParams(buildSurveySearchParams(nextParams), { replace: true });
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
    updateSearchParams(DEFAULT_SURVEY_PARAMS);
  };

  return (
    <section>
      <PageHeader
        title={t("설문 관리")}
        description={t(
          "설문 생성, 문항 편집, 상태 관리가 가능한 운영 화면입니다.",
        )}
      />

      <div className="mx-3 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={onSubmitSearch}
          >
            <div className="relative">
              <select
                value={params.status}
                className="h-9 cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                onChange={(event) =>
                  updateSearchParams({
                    ...params,
                    page: 1,
                    status: event.target.value as SurveySearchParams["status"],
                  })
                }
              >
                <option value="all">{t("전체 상태")}</option>
                <option value="draft">{t("임시저장")}</option>
                <option value="published">{t("게시")}</option>
                <option value="closed">{t("종료")}</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                expand_more
              </span>
            </div>

            <input
              key={params.keyword}
              name="keyword"
              defaultValue={params.keyword}
              placeholder={t("설문명 검색")}
              className="h-9 w-[240px] rounded-md border border-slate-200 px-3 text-sm text-slate-700 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
            />

            <button type="submit" className="hidden" aria-hidden>
              submit
            </button>

            <button
              type="button"
              className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
              onClick={onResetFilters}
            >
              {t("초기화")}
            </button>
          </form>

          {validSelectedIds.length > 0 ? (
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-rose-500 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={deleteSurveysMutation.isPending}
              onClick={() =>
                openConfirm(t("선택한 설문을 모두 삭제하시겠습니까?"), () =>
                  deleteSurveysMutation.mutate(validSelectedIds, {
                    onSuccess: () => {
                      setSelectedIds([]);
                      openAlert(t("처리되었습니다."));
                    },
                    onError: () => openAlert(t("처리 중 오류가 발생했습니다.")),
                  }),
                )
              }
            >
              <span className="material-symbols-outlined text-base">
                delete
              </span>
              {t("삭제")}
            </button>
          ) : (
            <button
              type="button"
              className="cursor-pointer rounded-md bg-main-color px-3 py-2 text-sm text-white"
              onClick={() => navigate("/surveys/edit")}
            >
              {t("설문 등록")}
            </button>
          )}
        </div>

        <TableContainer tableClassName="w-full min-w-[1080px]">
          <colgroup>
            <col className="w-[68px]" />
            <col className="w-[80px]" />
            <col className="w-[130px]" />
            <col className="w-auto min-w-[260px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[160px]" />
            <col className="w-[220px]" />
            <col className="w-[130px]" />
          </colgroup>

          <thead className="border-b border-slate-100 text-center text-xs text-slate-400 dark:border-dark-border dark:text-slate-300">
            <tr>
              <th className="align-middle px-4 py-3">
                <AppCheckbox
                  checked={isAllSelected}
                  ariaLabel="select all surveys"
                  onChange={(checked) =>
                    setSelectedIds(
                      checked ? list.map((survey) => survey.id) : [],
                    )
                  }
                />
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">No</th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("상태")}
              </th>
              <th className="align-middle px-6 py-3 text-left">
                {t("설문명")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("문항 수")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("응답 수")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("수정일")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("설문 기간")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("관리")}
              </th>
            </tr>
          </thead>

          <tbody>
            {surveysQuery.isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <tr
                  key={`survey-skeleton-${index}`}
                  className="border-b border-slate-100 dark:border-dark-border"
                >
                  <td className="px-4 py-3">
                    <div className="mx-auto h-5 w-5 animate-pulse rounded border border-slate-200 bg-slate-100 dark:border-dark-border dark:bg-slate-700/70" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="mx-auto h-4 w-8 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="mx-auto h-6 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-700/70" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="mx-auto h-4 w-10 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="mx-auto h-4 w-10 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="mx-auto h-4 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="mx-auto h-4 w-32 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                  </td>
                  <td className="px-6 py-3">
                    <div className="ml-auto flex w-fit items-center gap-1">
                      <div className="h-7 w-7 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700/70" />
                      <div className="h-7 w-7 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700/70" />
                    </div>
                  </td>
                </tr>
              ))}

            {surveysQuery.isError && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-20 text-center text-sm text-rose-500"
                >
                  {t("설문 목록을 불러오지 못했습니다.")}
                </td>
              </tr>
            )}

            {!surveysQuery.isLoading &&
              !surveysQuery.isError &&
              list.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-20 text-center text-sm text-slate-500 dark:text-slate-300"
                  >
                    {t("조회된 데이터가 없습니다.")}
                  </td>
                </tr>
              )}

            {!surveysQuery.isLoading &&
              !surveysQuery.isError &&
              list.map((survey, index) => (
                <tr
                  key={survey.id}
                  className="border-b border-slate-100 dark:border-dark-border"
                >
                  <td className="align-middle px-4 py-3">
                    <div className="flex items-center justify-center">
                      <AppCheckbox
                        checked={validSelectedIds.includes(survey.id)}
                        ariaLabel={`select survey ${survey.id}`}
                        onChange={(checked) =>
                          setSelectedIds((prev) =>
                            checked
                              ? prev.includes(survey.id)
                                ? prev
                                : [...prev, survey.id]
                              : prev.filter((id) => id !== survey.id),
                          )
                        }
                      />
                    </div>
                  </td>
                  <td className="align-middle px-6 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {(params.page - 1) * params.pageSize + index + 1}
                    </div>
                  </td>
                  <td className="align-middle px-6 py-3">
                    <div className="flex items-center justify-center">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getSurveyStatusClasses(
                          survey.status,
                        )}`}
                      >
                        {survey.status === "draft"
                          ? t("임시저장")
                          : survey.status === "published"
                            ? t("게시")
                            : t("종료")}
                      </span>
                    </div>
                  </td>
                  <td className="align-middle px-6 py-3">
                    <div className="line-clamp-1 text-left text-sm text-slate-700 dark:text-white">
                      {survey.title}
                    </div>
                  </td>
                  <td className="align-middle px-6 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {survey.questions.length}
                    </div>
                  </td>
                  <td className="align-middle px-6 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {survey.responseCount}
                    </div>
                  </td>
                  <td className="align-middle px-6 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {dayjs(survey.updatedAt).format("YYYY.MM.DD HH:mm")}
                    </div>
                  </td>
                  <td className="align-middle px-6 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {survey.startDate} ~ {survey.endDate}
                    </div>
                  </td>
                  <td className="align-middle px-6 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-indigo-500 text-slate-50"
                        onClick={() =>
                          navigate(`/surveys/edit?surveyKey=${survey.id}`)
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
                        className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-slate-500 text-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={deleteSurveyMutation.isPending}
                        onClick={() =>
                          openConfirm(t("해당 설문을 삭제하시겠습니까?"), () =>
                            deleteSurveyMutation.mutate(survey.id, {
                              onSuccess: () => {
                                setSelectedIds((prev) =>
                                  prev.filter((id) => id !== survey.id),
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
                  </td>
                </tr>
              ))}
          </tbody>
        </TableContainer>

        <div className="px-5 py-4">
          <Pagination
            total={totalCount}
            curr={params.page}
            limit={params.pageSize}
            movePage={(nextPage: number) =>
              updateSearchParams({ ...params, page: nextPage })
            }
          />
        </div>
      </div>
    </section>
  );
}
