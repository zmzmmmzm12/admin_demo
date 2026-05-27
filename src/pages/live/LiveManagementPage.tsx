import dayjs from "dayjs";
import { type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../components/PageHeader";

type LiveStatus = "online" | "offline" | "issue";
interface StreamItem {
  id: string;
  title: string;
  camera: string;
  location: string;
  thumbnailUrl: string;
  status: LiveStatus;
  bitrate: string;
  resolution: string;
  viewers?: number;
  duration?: string;
  recordedAt: string;
}

const streamSeed: StreamItem[] = [
  {
    id: "CAM-1001",
    title: "정문 출입구 실시간",
    camera: "Gate A-01",
    location: "서울 여의도 캠퍼스",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
    status: "online",
    bitrate: "4.2 Mbps",
    resolution: "1920x1080",
    viewers: 36,
    recordedAt: "2026-05-27T10:31:00+09:00",
  },
  {
    id: "CAM-1002",
    title: "로비 안내데스크",
    camera: "Lobby-03",
    location: "서울 여의도 캠퍼스",
    thumbnailUrl: "https://images.unsplash.com/photo-1558002038-1055907df827",
    status: "online",
    bitrate: "3.6 Mbps",
    resolution: "1280x720",
    viewers: 21,
    recordedAt: "2026-05-27T10:31:00+09:00",
  },
  {
    id: "CAM-1003",
    title: "주차장 입구",
    camera: "Parking-02",
    location: "서울 여의도 캠퍼스",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    status: "issue",
    bitrate: "1.1 Mbps",
    resolution: "1280x720",
    viewers: 4,
    recordedAt: "2026-05-27T10:29:00+09:00",
  },
];

function buildOptimizedImageUrl(
  sourceUrl: string,
  width: number,
  quality = 72,
) {
  try {
    const parsed = new URL(sourceUrl);
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    parsed.searchParams.set("q", String(quality));
    parsed.searchParams.set("w", String(width));
    return parsed.toString();
  } catch {
    return sourceUrl;
  }
}

function getStatusBadgeClasses(status: LiveStatus) {
  if (status === "online") {
    return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300";
  }

  if (status === "issue") {
    return "bg-amber-500/15 text-amber-600 dark:text-amber-300";
  }

  return "bg-slate-500/15 text-slate-600 dark:text-slate-300";
}

export function LiveManagementPage() {
  const { t } = useTranslation();

  const [keyword, setKeyword] = useState("");
  const [draftKeyword, setDraftKeyword] = useState("");
  const [status, setStatus] = useState<"all" | LiveStatus>("all");
  const [quality, setQuality] = useState(72);

  const list = useMemo(() => {
    const base =
      status === "all"
        ? streamSeed
        : streamSeed.filter((item) => item.status === status);
    const search = keyword.trim().toLowerCase();

    if (!search) {
      return base;
    }

    return base.filter(
      (item) =>
        item.title.toLowerCase().includes(search) ||
        item.camera.toLowerCase().includes(search) ||
        item.location.toLowerCase().includes(search),
    );
  }, [keyword, status]);

  const onSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setKeyword(draftKeyword);
  };

  const onResetFilters = () => {
    setDraftKeyword("");
    setKeyword("");
    setStatus("all");
  };

  return (
    <section>
      <PageHeader
        title={t("실시간 관리")}
        description={t("실시간 영상 썸네일 최적화 상태를 모니터링합니다.")}
      />

      <div className="mx-3 space-y-4 pb-8">
        <div className="rounded-md bg-white p-4 shadow-md dark:bg-dark-surface">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <form className="flex flex-wrap items-center gap-2" onSubmit={onSubmitSearch}>
              <div className="relative">
                <select
                  value={status}
                  className="h-9 cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                  onChange={(event) => setStatus(event.target.value as "all" | LiveStatus)}
                >
                  <option value="all">{t("전체 상태")}</option>
                  <option value="online">{t("온라인")}</option>
                  <option value="issue">{t("장애")}</option>
                  <option value="offline">{t("오프라인")}</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                  expand_more
                </span>
              </div>

              <div className="relative">
                <select
                  value={quality}
                  className="h-9 cursor-pointer appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                  onChange={(event) => setQuality(Number(event.target.value))}
                >
                  <option value={60}>Q60</option>
                  <option value={72}>Q72</option>
                  <option value={80}>Q80</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                  expand_more
                </span>
              </div>

              <input
                value={draftKeyword}
                onChange={(event) => setDraftKeyword(event.target.value)}
                placeholder={t("카메라/위치 검색")}
                className="h-9 w-[230px] rounded-md border border-slate-200 px-3 text-sm text-slate-700 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
              />

              <button type="submit" className="hidden" aria-hidden>
                submit
              </button>

              <button
                type="button"
                className="cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
                onClick={onResetFilters}
              >
                {t("필터 초기화")}
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((item) => {
            const src320 = buildOptimizedImageUrl(
              item.thumbnailUrl,
              320,
              quality,
            );
            const src640 = buildOptimizedImageUrl(
              item.thumbnailUrl,
              640,
              quality,
            );
            const src960 = buildOptimizedImageUrl(
              item.thumbnailUrl,
              960,
              quality,
            );

            return (
              <article
                key={item.id}
                className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-dark-border dark:bg-dark-surface"
              >
                <div className="relative">
                  <img
                    src={src640}
                    srcSet={`${src320} 320w, ${src640} 640w, ${src960} 960w`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full object-cover"
                  />

                  <span
                    className={`absolute left-3 top-3 inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${getStatusBadgeClasses(
                      item.status,
                    )}`}
                  >
                    {item.status === "online"
                      ? t("온라인")
                      : item.status === "issue"
                        ? t("장애")
                        : t("오프라인")}
                  </span>
                </div>

                <div className="space-y-2 p-3">
                  <h3 className="line-clamp-1 text-sm font-semibold text-slate-700 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-300">
                    {item.camera} · {item.location}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-300">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-dark-surface-alt">
                      {item.resolution}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-dark-surface-alt">
                      {item.bitrate}
                    </span>
                    {item.viewers !== undefined && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-dark-surface-alt">
                        {t("시청자 {count}명", { count: item.viewers })}
                      </span>
                    )}
                    {item.duration && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-dark-surface-alt">
                        {item.duration}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 dark:text-slate-400">
                    {dayjs(item.recordedAt).format("YYYY.MM.DD HH:mm")}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {list.length === 0 && (
          <div className="rounded-md bg-white p-16 text-center text-sm text-slate-500 shadow-md dark:bg-dark-surface dark:text-slate-300">
            {t("조회된 데이터가 없습니다.")}
          </div>
        )}
      </div>
    </section>
  );
}
