import dayjs from "dayjs";
import { type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { AppCheckbox } from "../../components/AppCheckbox";
import { PageHeader } from "../../components/PageHeader";
import { Pagination } from "../../components/Pagination";
import { TableContainer } from "../../components/TableContainer";
import { useAppPreferences } from "../../contexts/AppPreferencesContext";
import {
  useDeleteVideoMutation,
  useDeleteVideosMutation,
  useVideosQuery,
} from "../../hooks/useVideosQuery";
import { useDialogActions } from "../../store/dialogStore";
import type { VideoSearchParams } from "../../types/admin";
import { VideoInfoModal } from "./components/VideoInfoModal";

const PREVIEW_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const DEFAULT_VIDEO_PARAMS: VideoSearchParams = {
  page: 1,
  pageSize: 10,
  keyword: "",
  status: "all",
};

function parseVideoSearchParams(
  searchParams: URLSearchParams,
): VideoSearchParams {
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const keyword = searchParams.get("keyword") ?? "";
  const statusRaw = searchParams.get("status") ?? "all";

  const status: VideoSearchParams["status"] =
    statusRaw === "ready" || statusRaw === "encoding" || statusRaw === "blocked"
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

function buildVideoSearchParams(params: VideoSearchParams) {
  const next = new URLSearchParams();

  next.set("page", String(params.page));
  next.set("pageSize", String(params.pageSize));
  next.set("keyword", params.keyword);
  next.set("status", params.status);

  return next;
}

function areVideoSearchParamsEqual(
  left: VideoSearchParams,
  right: VideoSearchParams,
) {
  return (
    left.page === right.page &&
    left.pageSize === right.pageSize &&
    left.keyword === right.keyword &&
    left.status === right.status
  );
}

export function VideoListPage() {
  const { locale } = useAppPreferences();
  const { t } = useTranslation();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const { openAlert, openConfirm } = useDialogActions();

  const params = useMemo(
    () => parseVideoSearchParams(urlSearchParams),
    [urlSearchParams],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [infoVideoId, setInfoVideoId] = useState<string | null>(null);

  const numberLocale = locale === "ko" ? "ko-KR" : "en-US";

  const videosQuery = useVideosQuery(params);
  const deleteVideoMutation = useDeleteVideoMutation();
  const deleteVideosMutation = useDeleteVideosMutation();

  const list = videosQuery.data?.data ?? [];
  const totalCount = videosQuery.data?.totalCount ?? 0;

  const visibleVideoIds = useMemo(() => {
    return new Set(list.map((video) => video.id));
  }, [list]);

  const validSelectedIds = useMemo(() => {
    return selectedIds.filter((id) => visibleVideoIds.has(id));
  }, [selectedIds, visibleVideoIds]);

  const isAllSelected =
    list.length > 0 &&
    list.every((video) => validSelectedIds.includes(video.id));

  const updateSearchParams = (nextParams: VideoSearchParams) => {
    if (areVideoSearchParamsEqual(params, nextParams)) {
      return;
    }

    setUrlSearchParams(buildVideoSearchParams(nextParams), { replace: true });
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
    updateSearchParams(DEFAULT_VIDEO_PARAMS);
  };

  return (
    <section>
      <PageHeader
        title={t("영상 관리")}
        description={t("영상 목록 조회와 자막 추가/관리 기능을 제공합니다.")}
      />

      <div className="mx-3 rounded-md bg-white shadow-md dark:bg-dark-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <form className="flex items-center gap-2" onSubmit={onSubmitSearch}>
            <div className="relative">
              <select
                value={params.status}
                className="h-9 cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                onChange={(event) =>
                  updateSearchParams({
                    ...params,
                    page: 1,
                    status: event.target.value as VideoSearchParams["status"],
                  })
                }
              >
                <option value="all">{t("전체 상태")}</option>
                <option value="ready">{t("배포 가능")}</option>
                <option value="encoding">{t("인코딩 중")}</option>
                <option value="blocked">{t("게시 보류")}</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                expand_more
              </span>
            </div>

            <input
              key={params.keyword}
              name="keyword"
              defaultValue={params.keyword}
              placeholder={t("영상 제목")}
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

          {validSelectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-300">
                {t("{count}개 선택됨", { count: validSelectedIds.length })}
              </span>
              <button
                type="button"
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-rose-500 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleteVideosMutation.isPending}
                onClick={() =>
                  openConfirm(t("선택한 영상을 모두 삭제하시겠습니까?"), () =>
                    deleteVideosMutation.mutate(validSelectedIds, {
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
          )}
        </div>

        <TableContainer tableClassName="w-full min-w-[1000px]">
          <colgroup>
            <col className="w-[68px]" />
            <col className="w-[80px]" />
            <col className="w-[120px]" />
            <col className="w-[220px]" />
            <col className="w-[340px] min-w-[220px]" />
            <col className="w-[140px]" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[170px]" />
            <col className="w-[220px]" />
          </colgroup>

          <thead className="text-xs text-slate-400 border-b border-slate-100 dark:border-dark-border dark:text-slate-300 text-center">
            <tr>
              <th className="align-middle px-4 py-3">
                <AppCheckbox
                  checked={isAllSelected}
                  ariaLabel="select all videos"
                  onChange={(checked) =>
                    setSelectedIds(checked ? list.map((video) => video.id) : [])
                  }
                />
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">No</th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("상태")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("썸네일")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap text-left">
                {t("영상")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("카테고리")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("길이")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("조회수")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("수정일")}
              </th>
              <th className="align-middle px-6 py-3 whitespace-nowrap">
                {t("관리")}
              </th>
            </tr>
          </thead>

          <tbody>
            {videosQuery.isLoading && (
              <>
                {Array.from({ length: 6 }).map((_, skeletonIndex) => (
                  <tr
                    key={`videos-skeleton-${skeletonIndex}`}
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
                      <div className="mx-auto h-16 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-12 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-14 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="mx-auto h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-700/70" />
                    </td>
                    <td className="px-6 py-3">
                      <div className="ml-auto flex w-fit items-center gap-1">
                        <div className="h-7 w-16 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700/70" />
                        <div className="h-7 w-7 animate-pulse rounded-md bg-slate-100 dark:bg-slate-700/70" />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            )}

            {videosQuery.isError && (
              <tr>
                <td colSpan={10} className="px-6 py-20">
                  <div className="w-full flex items-center justify-center text-sm text-rose-500 dark:text-rose-300">
                    {t("영상 목록을 불러오지 못했습니다.")}
                  </div>
                </td>
              </tr>
            )}

            {!videosQuery.isLoading &&
              !videosQuery.isError &&
              list.length === 0 && (
                <tr className="border-b border-slate-100 dark:border-dark-border">
                  <td colSpan={10} className="px-6 py-20">
                    <div className="w-full flex items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                      {t("조회된 데이터가 없습니다.")}
                    </div>
                  </td>
                </tr>
              )}

            {!videosQuery.isLoading &&
              !videosQuery.isError &&
              list.map((video, index) => (
                <tr
                  key={video.id}
                  className="border-b border-slate-100 dark:border-dark-border"
                >
                  <td className="align-middle px-4 py-3">
                    <div className="flex items-center justify-center">
                      <AppCheckbox
                        checked={validSelectedIds.includes(video.id)}
                        ariaLabel={`select video ${video.id}`}
                        onChange={(checked) =>
                          setSelectedIds((prev) =>
                            checked
                              ? prev.includes(video.id)
                                ? prev
                                : [...prev, video.id]
                              : prev.filter((id) => id !== video.id),
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
                        className={`inline-flex min-w-[72px] items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${
                          video.status === "ready"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : video.status === "encoding"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
                              : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                        }`}
                      >
                        {video.status === "ready"
                          ? t("배포 가능")
                          : video.status === "encoding"
                            ? t("인코딩 중")
                            : t("게시 보류")}
                      </span>
                    </div>
                  </td>

                  <td className="align-middle px-6 py-3">
                    <div className="flex items-center justify-center">
                      <div className="group relative h-16 w-28 overflow-hidden rounded bg-black">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-0"
                        />
                        <video
                          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          poster={video.thumbnailUrl}
                          muted
                          loop
                          playsInline
                          preload="none"
                          onMouseEnter={(event) => {
                            void event.currentTarget.play();
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.pause();
                            event.currentTarget.currentTime = 0;
                          }}
                        >
                          <source src={PREVIEW_VIDEO_URL} type="video/mp4" />
                        </video>
                      </div>
                    </div>
                  </td>

                  <td className="align-middle px-6 py-3">
                    <div className="flex w-full items-center justify-start">
                      <span className="min-w-[240px] whitespace-normal break-words text-left text-sm leading-5 text-slate-700 dark:text-white">
                        {video.title}
                      </span>
                    </div>
                  </td>

                  <td className="align-middle px-6 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {video.category}
                    </div>
                  </td>

                  <td className="align-middle px-6 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {video.duration}
                    </div>
                  </td>

                  <td className="align-middle px-6 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {video.views.toLocaleString(numberLocale)}
                    </div>
                  </td>

                  <td className="align-middle px-6 py-3">
                    <div className="text-center text-sm text-slate-700 whitespace-nowrap dark:text-white">
                      {dayjs(video.updatedAt).format("YYYY.MM.DD HH:mm")}
                    </div>
                  </td>

                  <td className="align-middle px-6 py-3">
                    <div className="flex items-center justify-center">
                      <div className="flex w-full flex-nowrap items-center justify-end gap-1 whitespace-nowrap">
                        <Link
                          to={`/videos/${video.id}`}
                          className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-blue-500 text-slate-50"
                        >
                          <span className="material-symbols-outlined text-base">
                            subtitles
                          </span>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {t("자막")}
                          </span>
                        </Link>

                        <button
                          type="button"
                          className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-indigo-500 text-slate-50"
                          onClick={() => setInfoVideoId(video.id)}
                        >
                          <span className="material-symbols-outlined text-base">
                            info
                          </span>
                          <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                            {t("정보")}
                          </span>
                        </button>

                        <button
                          type="button"
                          className="group relative flex size-7 cursor-pointer items-center justify-center rounded-md bg-slate-400 text-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-500"
                          disabled={deleteVideoMutation.isPending}
                          onClick={() =>
                            openConfirm(
                              t("해당 영상을 삭제하시겠습니까?"),
                              () =>
                                deleteVideoMutation.mutate(video.id, {
                                  onSuccess: () => {
                                    setSelectedIds((prev) =>
                                      prev.filter((id) => id !== video.id),
                                    );
                                    openAlert(t("처리되었습니다."));
                                  },
                                  onError: () =>
                                    openAlert(
                                      t("처리 중 오류가 발생했습니다."),
                                    ),
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

      <VideoInfoModal
        videoId={infoVideoId}
        numberLocale={numberLocale}
        onClose={() => setInfoVideoId(null)}
      />
    </section>
  );
}
