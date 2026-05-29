import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { HeaderListLink } from "../../components/HeaderListLink";
import { PageHeader } from "../../components/PageHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { useAppPreferences } from "../../contexts/AppPreferencesContext";
import { useUserDetailQuery } from "../../hooks/useUsersQuery";

const roleLabelKey = {
  super: "슈퍼관리자",
  manager: "매니저",
  operator: "운영자",
} as const;

export function UserDetailPage() {
  const params = useParams();
  const userId = params.userId;
  const { locale } = useAppPreferences();
  const { t } = useTranslation();
  const numberLocale = locale === "ko" ? "ko-KR" : "en-US";
  const listPath = "/users";

  if (!userId) {
    return (
      <section>
        <PageHeader
          title={t("회원 상세")}
          description={t("회원 정보와 최근 활동을 확인합니다.")}
          titleAction={<HeaderListLink to={listPath} />}
        />
        <p className="mx-3 rounded-md border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {t("잘못된 접근입니다.")}
        </p>
      </section>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const detailQuery = useUserDetailQuery(userId);

  if (detailQuery.isLoading) {
    return (
      <section>
        <PageHeader
          title={t("회원 상세")}
          description={t("회원 정보와 최근 활동을 확인합니다.")}
          titleAction={<HeaderListLink to={listPath} />}
        />
        <div className="mx-3 mb-8 grid animate-pulse gap-4 xl:grid-cols-2">
          <div className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
            <div className="h-6 w-32 rounded bg-slate-100 dark:bg-slate-700/70" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`user-detail-skeleton-${index}`}
                  className="h-5 w-full rounded bg-slate-100 dark:bg-slate-700/70"
                />
              ))}
            </div>
          </div>
          <div className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
            <div className="h-6 w-36 rounded bg-slate-100 dark:bg-slate-700/70" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`user-activity-skeleton-${index}`}
                  className="h-14 w-full rounded bg-slate-100 dark:bg-slate-700/70"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <section>
        <PageHeader
          title={t("회원 상세")}
          description={t("회원 정보와 최근 활동을 확인합니다.")}
          titleAction={<HeaderListLink to={listPath} />}
        />
        <p className="mx-3 rounded-md border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {t("회원 상세 정보를 불러오지 못했습니다.")}
        </p>
      </section>
    );
  }

  const { data: user, activities } = detailQuery.data;

  return (
    <section>
      <PageHeader
        title={user.name}
        description={user.email}
        titleAction={<HeaderListLink to={listPath} />}
      />

      <div className="mx-3 mb-8 grid gap-4 xl:grid-cols-2">
        <article className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("기본 정보")}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("회원 ID")}
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {user.id}
              </dd>
            </div>
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("권한")}
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {t(roleLabelKey[user.role])}
              </dd>
            </div>
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("상태")}
              </dt>
              <dd>
                <StatusBadge status={user.status} />
              </dd>
            </div>
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("가입일")}
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {dayjs(user.joinDate).format("YYYY.MM.DD")}
              </dd>
            </div>
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("로그인 횟수")}
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {t("{count}회", {
                  count: user.loginCount.toLocaleString(numberLocale),
                })}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("최근 활동")}
          </h2>
          <ul className="mt-4 space-y-2">
            {activities.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-dark-border dark:bg-dark-surface-alt"
              >
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {item.action}
                </p>
                <time className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                  {dayjs(item.createdAt).format("YYYY.MM.DD HH:mm")}
                </time>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
