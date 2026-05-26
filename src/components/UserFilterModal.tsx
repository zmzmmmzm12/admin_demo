import { useEffect, useState } from "react";
import { useAppPreferences } from "../contexts/AppPreferencesContext";
import type { UserRole, UserStatus } from "../types/user";

export interface UserFilterValues {
  searchField: "id" | "name" | "email";
  keyword: string;
  status: "all" | UserStatus;
  role: "all" | UserRole;
}

interface UserFilterModalProps {
  open: boolean;
  loading?: boolean;
  value: UserFilterValues;
  onClose: () => void;
  onApply: (value: UserFilterValues) => void;
}

const searchFieldOptions = [
  { value: "id", labelKey: "users.searchType.id" },
  { value: "name", labelKey: "users.searchType.name" },
  { value: "email", labelKey: "users.searchType.email" },
] as const;

const statusOptions = [
  { value: "all", labelKey: "users.allStatus" },
  { value: "active", labelKey: "users.status.active" },
  { value: "pending", labelKey: "users.status.pending" },
  { value: "suspended", labelKey: "users.status.suspended" },
] as const;

const roleOptions = [
  { value: "all", labelKey: "users.allRole" },
  { value: "super", labelKey: "users.role.super" },
  { value: "manager", labelKey: "users.role.manager" },
  { value: "operator", labelKey: "users.role.operator" },
] as const;

const initialFilterState: UserFilterValues = {
  searchField: "id",
  keyword: "",
  status: "all",
  role: "all",
};

export function UserFilterModal({
  open,
  loading = false,
  value,
  onClose,
  onApply,
}: UserFilterModalProps) {
  const { t } = useAppPreferences();
  const [localValue, setLocalValue] = useState<UserFilterValues>(value);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalValue(value);
    }
  }, [open, value]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-3"
      onClick={onClose}
    >
      <div
        className="relative flex w-[520px] max-w-[calc(100vw-20px)] flex-col rounded-md bg-white shadow-lg dark:bg-dark-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-1 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
          <div className="px-3 py-3">{t("users.filterTitle")}</div>
          <button
            type="button"
            className="flex size-10 items-center justify-center text-slate-500 dark:text-slate-300"
            onClick={onClose}
            aria-label="close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 text-sm text-slate-700 dark:text-slate-100">
          <div className="grid grid-cols-1 gap-4 sm:[grid-template-columns:140px_minmax(0,1fr)]">
            <div>
              <div className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                {t("users.searchType")}
              </div>
              <div className="relative">
                <select
                  className="h-9 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100"
                  disabled={loading}
                  value={localValue.searchField}
                  onChange={(event) =>
                    setLocalValue((prev) => ({
                      ...prev,
                      searchField: event.target.value as
                        | "id"
                        | "name"
                        | "email",
                    }))
                  }
                >
                  {searchFieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                {t("users.searchValue")}
              </div>
              <input
                type="text"
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100"
                disabled={loading}
                placeholder={t(
                  `users.searchType.${localValue.searchField}` as const,
                )}
                value={localValue.keyword}
                onChange={(event) =>
                  setLocalValue((prev) => ({
                    ...prev,
                    keyword: event.target.value,
                  }))
                }
                maxLength={100}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              {t("users.filterStatus")}
            </div>
            <div className="relative">
              <select
                className="h-9 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100"
                disabled={loading}
                value={localValue.status}
                onChange={(event) =>
                  setLocalValue((prev) => ({
                    ...prev,
                    status: event.target.value as "all" | UserStatus,
                  }))
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                expand_more
              </span>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              {t("users.filterRole")}
            </div>
            <div className="relative">
              <select
                className="h-9 w-full cursor-pointer rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100"
                disabled={loading}
                value={localValue.role}
                onChange={(event) =>
                  setLocalValue((prev) => ({
                    ...prev,
                    role: event.target.value as "all" | UserRole,
                  }))
                }
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400">
                expand_more
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4">
          <button
            type="button"
            className="cursor-pointer rounded-md bg-slate-200 px-3 py-2 text-xs text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:text-slate-100"
            disabled={loading}
            onClick={() => setLocalValue(initialFilterState)}
          >
            {t("users.filterReset")}
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md bg-indigo-500 px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={() => onApply(localValue)}
          >
            {t("users.filterApply")}
          </button>
        </div>
      </div>
    </div>
  );
}
