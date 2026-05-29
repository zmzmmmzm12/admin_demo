import dayjs from "dayjs";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppModal } from "../../../components/modal/AppModal";
import { useVideoDetailQuery } from "../../../hooks/useVideosQuery";

const PREVIEW_VIDEO_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const INFO_MODAL_SUBTITLE_SOURCES: PlayerSubtitleSource[] = [
  {
    label: "한국어",
    language: "ko",
    url: "/subtitles/sample-ko.vtt",
    primary: true,
  },
  { label: "English", language: "en", url: "/subtitles/sample-en.vtt" },
  { label: "日本語", language: "ja", url: "/subtitles/sample-ja.vtt" },
];

interface VideoInfoModalProps {
  videoId: string | null;
  numberLocale: string;
  onClose: () => void;
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

export function VideoInfoModal({
  videoId,
  numberLocale,
  onClose,
}: VideoInfoModalProps) {
  const { t } = useTranslation();
  const infoVideoQuery = useVideoDetailQuery(videoId ?? "");

  const playerRef = useRef<PlayerInstance | null>(null);
  const playerId = useId();
  const playerContainerId = `admin-video-info-player-${playerId.replace(
    /:/g,
    "",
  )}`;

  const [playerError, setPlayerError] = useState<string | null>(null);

  const canRenderPlayer =
    Boolean(videoId) &&
    Boolean(infoVideoQuery.data) &&
    !infoVideoQuery.isLoading &&
    !infoVideoQuery.isError;

  const sdkMissingError =
    canRenderPlayer && !window.Player
      ? t("플레이어 SDK를 찾을 수 없습니다.")
      : null;

  const visiblePlayerError = sdkMissingError ?? playerError;

  useEffect(() => {
    if (!canRenderPlayer || !infoVideoQuery.data || !window.Player) {
      return;
    }

    let cancelled = false;

    destroyPlayer(playerRef);

    try {
      const Player = window.Player;

      playerRef.current = new Player({
        url: PREVIEW_VIDEO_URL,
        container: `#${playerContainerId}`,
        wrapper: `${playerContainerId}-root`,
        thumbnailSrc: infoVideoQuery.data.thumbnailUrl,
        subtitle: INFO_MODAL_SUBTITLE_SOURCES,
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
    };
  }, [canRenderPlayer, infoVideoQuery.data, playerContainerId, t]);

  return (
    <AppModal open={Boolean(videoId)} onClose={onClose} zIndex={95}>
      <div className="relative flex max-h-[calc(100dvh-20px)] w-[1400px] max-w-[calc(100vw-20px)] flex-col overflow-hidden rounded-md bg-white shadow-lg dark:bg-dark-surface">
        <div className="shrink-0 border-b border-slate-200 px-1 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
          <div className="flex items-center justify-between">
            <div className="px-3 py-3">{t("영상 정보")}</div>
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
          {infoVideoQuery.isLoading && (
            <div className="grid animate-pulse gap-5 xl:grid-cols-4">
              <div className="xl:col-span-3">
                <div className="aspect-video w-full rounded-md bg-slate-100 dark:bg-slate-700/70" />
              </div>

              <div className="space-y-3 rounded-md border border-slate-200 p-3 dark:border-dark-border">
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

          {!infoVideoQuery.isLoading &&
            !infoVideoQuery.isError &&
            infoVideoQuery.data && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                <div className="xl:col-span-3 flex">
                  <div className="relative my-auto aspect-video w-full overflow-hidden rounded-md bg-black">
                    <div
                      id={playerContainerId}
                      className="h-full w-full rounded-md bg-black"
                    />

                    {visiblePlayerError && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70 px-4 text-center text-sm text-white">
                        {visiblePlayerError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="xl:col-span-1 flex flex-col gap-2 rounded-md border border-slate-200 p-3 dark:border-dark-border">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {infoVideoQuery.data.title}
                  </h3>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-300">
                    {infoVideoQuery.data.description}
                  </p>

                  <div className="mt-1 grid grid-cols-1 gap-2 text-sm text-slate-600 dark:text-slate-200">
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
                      <span>
                        {infoVideoQuery.data.views.toLocaleString(numberLocale)}
                      </span>
                    </div>

                    <div>
                      <b className="mr-1">{t("수정일")}:</b>
                      <span>
                        {dayjs(infoVideoQuery.data.updatedAt).format(
                          "YYYY.MM.DD HH:mm",
                        )}
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
