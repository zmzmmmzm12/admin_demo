import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { useAppPreferences } from "../contexts/AppPreferencesContext";
import { useUserDetailQuery } from "../hooks/useUsersQuery";

const roleLabelKey = {
  super: "users.role.super",
  manager: "users.role.manager",
  operator: "users.role.operator",
} as const;

export function UserDetailPage() {
  const params = useParams();
  const userId = params.userId;
  const { t, locale } = useAppPreferences();
  const numberLocale = locale === "ko" ? "ko-KR" : "en-US";

  if (!userId) {
    return (
      <p className="mx-3 rounded-md border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        {t("common.invalidAccess")}
      </p>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const detailQuery = useUserDetailQuery(userId);

  if (detailQuery.isLoading) {
    return (
      <p className="mx-3 rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-dark-border dark:bg-dark-surface dark:text-slate-400">
        {t("common.loadingUserDetail")}
      </p>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <p className="mx-3 rounded-md border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
        {t("common.errorUserDetail")}
      </p>
    );
  }

  const { data: user, activities } = detailQuery.data;

  return (
    <section>
      <div className="flex flex-wrap px-3 pb-5">
        <div className="text-lg font-semibold text-slate-600 dark:text-slate-300">
          {user.name}
        </div>
        <div className="ml-3 self-end text-sm text-slate-500 dark:text-slate-400">
          {user.email}
        </div>
        <Link
          to="/users"
          className="ml-auto inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 dark:border-dark-border dark:bg-dark-surface-alt dark:text-slate-100"
        >
          {t("common.backToList")}
        </Link>
      </div>

      <div className="mx-3 mb-8 grid gap-4 xl:grid-cols-2">
        <article className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("users.detail.basicInfo")}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("users.detail.userId")}
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {user.id}
              </dd>
            </div>
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("users.detail.role")}
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {t(roleLabelKey[user.role])}
              </dd>
            </div>
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("users.detail.status")}
              </dt>
              <dd>
                <StatusBadge status={user.status} />
              </dd>
            </div>
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("users.detail.joinDate")}
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {dayjs(user.joinDate).format("YYYY.MM.DD")}
              </dd>
            </div>
            <div className="grid grid-cols-[90px_minmax(0,1fr)] items-center gap-2">
              <dt className="text-slate-500 dark:text-slate-400">
                {t("users.detail.loginCount")}
              </dt>
              <dd className="font-medium text-slate-800 dark:text-slate-100">
                {t("users.detail.loginCountValue", {
                  count: user.loginCount.toLocaleString(numberLocale),
                })}
              </dd>
            </div>
          </dl>
        </article>

        <article className="rounded-md bg-white p-5 shadow-md dark:bg-dark-surface">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("users.detail.recentActivity")}
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
