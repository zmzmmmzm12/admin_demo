import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppModal } from "./modal/AppModal";
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
  { value: "id", labelKey: "ID" },
  { value: "name", labelKey: "이름" },
  { value: "email", labelKey: "이메일" },
] as const;

const statusOptions = [
  { value: "all", labelKey: "전체 상태" },
  { value: "active", labelKey: "활성" },
  { value: "pending", labelKey: "대기" },
  { value: "suspended", labelKey: "정지" },
] as const;

const roleOptions = [
  { value: "all", labelKey: "전체 권한" },
  { value: "super", labelKey: "슈퍼관리자" },
  { value: "manager", labelKey: "매니저" },
  { value: "operator", labelKey: "운영자" },
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
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState<UserFilterValues>(value);
  const searchFieldLabel = useMemo(
    () =>
      localValue.searchField === "id"
        ? "ID"
        : localValue.searchField === "name"
          ? "이름"
          : "이메일",
    [localValue.searchField],
  );

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
    <AppModal open={open} onClose={onClose} zIndex={95}>
      <div className="relative flex max-h-[calc(100dvh-24px)] w-[520px] max-w-[calc(100vw-20px)] flex-col overflow-hidden rounded-md bg-white shadow-lg dark:bg-dark-surface">
        <div className="shrink-0 border-b border-slate-100 px-1 text-base font-semibold text-slate-700 dark:border-dark-border dark:text-slate-100">
          <div className="flex items-center justify-between">
            <div className="px-3 py-3">{t("필터")}</div>
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

        <div className="scroll-custom-container min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4 text-sm text-slate-700 dark:text-slate-100">
            <div className="grid grid-cols-1 gap-4 sm:[grid-template-columns:140px_minmax(0,1fr)]">
              <div>
                <div className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  {t("검색 타입")}
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
                  {t("검색 값")}
                </div>
                <input
                  type="text"
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-border dark:bg-dark-surface dark:text-slate-100"
                  disabled={loading}
                  placeholder={t(searchFieldLabel)}
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
                {t("상태")}
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
                {t("권한")}
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
        </div>

        <div className="shrink-0 flex justify-end gap-3 px-5 py-4">
          <button
            type="button"
            className="cursor-pointer rounded-md bg-slate-200 px-3 py-2 text-xs text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:text-slate-100"
            disabled={loading}
            onClick={() => setLocalValue(initialFilterState)}
          >
            {t("초기화")}
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md bg-indigo-500 px-3 py-2 text-xs text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={() => onApply(localValue)}
          >
            {t("확인")}
          </button>
        </div>
      </div>
    </AppModal>
  );
}
