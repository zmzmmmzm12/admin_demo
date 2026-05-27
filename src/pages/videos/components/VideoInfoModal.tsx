import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { AppModal } from "../../../components/modal/AppModal";
import { useVideoDetailQuery } from "../../../hooks/useVideosQuery";

const PREVIEW_VIDEO_URL =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

interface VideoInfoModalProps {
  videoId: string | null;
  numberLocale: string;
  onClose: () => void;
}

export function VideoInfoModal({
  videoId,
  numberLocale,
  onClose,
}: VideoInfoModalProps) {
  const { t } = useTranslation();
  const infoVideoQuery = useVideoDetailQuery(videoId ?? "");

  return (
    <AppModal open={Boolean(videoId)} onClose={onClose} zIndex={95}>
      <div className="mx-auto max-h-[92vh] w-[1200px] max-w-[calc(100vw-20px)] overflow-hidden rounded-md bg-white shadow-xl dark:bg-dark-surface">
        <div className="flex items-center border-b border-slate-200 px-5 py-3 dark:border-dark-border">
          <strong className="text-base text-slate-700 dark:text-slate-100">
            {t("영상 정보")}
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
          {infoVideoQuery.isLoading && (
            <div className="grid animate-pulse gap-4 lg:grid-cols-[380px_1fr]">
              <div className="h-[214px] w-full rounded-md bg-slate-100 dark:bg-slate-700/70" />
              <div className="space-y-3">
                <div className="h-6 w-2/3 rounded bg-slate-100 dark:bg-slate-700/70" />
                <div className="h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-700/70" />
                <div className="h-4 w-4/6 rounded bg-slate-100 dark:bg-slate-700/70" />
              </div>
            </div>
          )}

          {infoVideoQuery.isError && (
            <p className="py-20 text-center text-sm text-rose-500">
              {t("영상 목록을 불러오지 못했습니다.")}
            </p>
          )}

          {!infoVideoQuery.isLoading && !infoVideoQuery.isError && infoVideoQuery.data && (
            <div className="grid gap-4 lg:grid-cols-[540px_1fr]">
              <div className="overflow-hidden rounded-md bg-black">
                <video
                  controls
                  autoPlay
                  className="aspect-video w-full object-cover"
                  poster={infoVideoQuery.data.thumbnailUrl}
                  src={PREVIEW_VIDEO_URL}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {infoVideoQuery.data.title}
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-300">
                  {infoVideoQuery.data.description}
                </p>

                <div className="mt-4 grid grid-cols-1 gap-2 rounded-md bg-slate-50 p-3 text-sm text-slate-600 dark:bg-dark-surface-alt dark:text-slate-200">
                  <div>
                    <b className="mr-1">{t("상태")}:</b>
                    <span>
                      {infoVideoQuery.data.status === "ready"
                        ? t("배포 가능")
                        : infoVideoQuery.data.status === "encoding"
                          ? t("인코딩 중")
                          : t("게시 보류")}
                    </span>
                  </div>
                  <div>
                    <b className="mr-1">{t("카테고리")}:</b>
                    <span>{infoVideoQuery.data.category}</span>
                  </div>
                  <div>
                    <b className="mr-1">{t("길이")}:</b>
                    <span>{infoVideoQuery.data.duration}</span>
                  </div>
                  <div>
                    <b className="mr-1">{t("조회수")}:</b>
                    <span>{infoVideoQuery.data.views.toLocaleString(numberLocale)}</span>
                  </div>
                  <div>
                    <b className="mr-1">{t("수정일")}:</b>
                    <span>
                      {dayjs(infoVideoQuery.data.updatedAt).format("YYYY.MM.DD HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}
