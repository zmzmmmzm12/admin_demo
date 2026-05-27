import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  IconDarkMode,
  IconLanguage,
  IconLightMode,
} from "../components/AppIcons";
import { useAppPreferences } from "../contexts/AppPreferencesContext";

const menus: Array<{
  to: string;
  key: "대시보드" | "회원 관리" | "공지사항 관리" | "영상 관리";
  icon: string;
  end?: boolean;
}> = [
  { to: "/", key: "대시보드", icon: "space_dashboard", end: true },
  { to: "/users", key: "회원 관리", icon: "group" },
  { to: "/notices", key: "공지사항 관리", icon: "campaign" },
  { to: "/videos", key: "영상 관리", icon: "movie" },
];

export function AdminLayout() {
  const { theme, setTheme, locale, setLocale } = useAppPreferences();
  const { t } = useTranslation();

  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [showMenuText, setShowMenuText] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const languageRef = useRef<HTMLDivElement>(null);
  const shouldShowTextOnTransitionEndRef = useRef(false);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!languageRef.current) {
        return;
      }

      if (!languageRef.current.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleMenu = () => {
    if (window.innerWidth < 1280) {
      setMobileMenuOpen((prev) => !prev);
      setShowMenuText(true);
      shouldShowTextOnTransitionEndRef.current = false;
      return;
    }

    if (menuCollapsed) {
      setShowMenuText(false);
      shouldShowTextOnTransitionEndRef.current = true;
      setMenuCollapsed(false);
      return;
    }

    setShowMenuText(false);
    shouldShowTextOnTransitionEndRef.current = false;
    setMenuCollapsed(true);
  };

  return (
    <div className="min-h-screen dark:bg-dark-canvas">
      {mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 cursor-pointer bg-black/35 xl:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="close menu"
        />
      )}

      <aside
        onTransitionEnd={(event) => {
          if (window.innerWidth < 1280 || menuCollapsed) return;
          if (event.target !== event.currentTarget) return;
          if (event.propertyName !== "width") return;
          if (!shouldShowTextOnTransitionEndRef.current) return;

          shouldShowTextOnTransitionEndRef.current = false;
          setShowMenuText(true);
        }}
        className={clsx(
          "fixed inset-y-0 left-0 z-40 border-r border-slate-200 bg-white transition-all duration-200 dark:border-dark-border dark:bg-dark-surface",
          menuCollapsed ? "w-[75px]" : "w-[250px]",
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full xl:translate-x-0",
        )}
      >
        <div className="flex h-[60px] items-center justify-center border-b border-slate-200 px-3 dark:border-dark-border">
          <Link
            to="/"
            className="inline-flex cursor-pointer items-center gap-2 text-slate-800 dark:text-slate-100"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-main-color text-sm font-bold text-white">
              A
            </span>
            {showMenuText && (
              <span className="text-sm font-semibold">{t("Admin Pilot")}</span>
            )}
          </Link>
        </div>

        <nav
          className={clsx("space-y-1.5 pt-2", menuCollapsed ? "px-2" : "px-3")}
        >
          {menus.map((menu) => (
            <NavLink
              key={menu.to}
              to={menu.to}
              end={menu.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex h-10 items-center rounded-md text-sm font-semibold transition",
                  "cursor-pointer",
                  menuCollapsed ? "justify-center gap-0 px-2" : "gap-2 px-3",
                  isActive
                    ? "bg-main-color text-white"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-dark-hover",
                )
              }
              title={menuCollapsed ? t(menu.key) : undefined}
            >
              <span className="material-symbols-outlined text-[20px]">
                {menu.icon}
              </span>
              {showMenuText && t(menu.key)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div
        className={clsx(
          "transition-all duration-200 xl:ml-[250px]",
          menuCollapsed && "xl:ml-[75px]",
        )}
      >
        <header className="sticky top-0 z-20 h-[60px] border-b border-slate-200 bg-white dark:border-dark-border dark:bg-dark-surface">
          <div className="mx-auto flex h-full items-center justify-between px-4">
            <button
              type="button"
              className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-dark-hover"
              onClick={toggleMenu}
              aria-label="toggle menu"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            <div className="flex items-center gap-2">
              <div ref={languageRef} className="relative">
                <button
                  type="button"
                  className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[#9ca3af]"
                  onClick={() => setLanguageOpen((prev) => !prev)}
                  aria-label="language"
                >
                  <IconLanguage className="size-5" />
                </button>

                {languageOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-36 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg dark:border-dark-border dark:bg-dark-surface">
                    <button
                      type="button"
                      className={clsx(
                        "flex w-full items-center justify-between whitespace-nowrap px-3 py-2 text-left text-sm",
                        "cursor-pointer",
                        locale === "ko"
                          ? "bg-slate-100 text-slate-700 dark:bg-dark-hover dark:text-white"
                          : "text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-hover",
                      )}
                      onClick={() => {
                        setLocale("ko");
                        setLanguageOpen(false);
                      }}
                    >
                      <span>{t("한국어")}</span>
                      {locale === "ko" && (
                        <span className="material-symbols-outlined text-[18px]">
                          check
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      className={clsx(
                        "flex w-full items-center justify-between whitespace-nowrap px-3 py-2 text-left text-sm",
                        "cursor-pointer",
                        locale === "en"
                          ? "bg-slate-100 text-slate-700 dark:bg-dark-hover dark:text-white"
                          : "text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-hover",
                      )}
                      onClick={() => {
                        setLocale("en");
                        setLanguageOpen(false);
                      }}
                    >
                      <span>{t("English")}</span>
                      {locale === "en" && (
                        <span className="material-symbols-outlined text-[18px]">
                          check
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={theme === "light"}
                aria-label="theme"
                className="relative inline-flex h-[30px] w-[60px] cursor-pointer items-center rounded-full border border-[#e2e4e9] bg-[#eeeef1] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)] dark:border-[#666a73] dark:bg-[#1e1e2d]"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <span
                  className={clsx(
                    "pointer-events-none absolute text-[22px] leading-none transition-all",
                    theme === "light"
                      ? "left-[6px] text-[#464c5a]"
                      : "right-[6px] text-[#8b8f98]",
                  )}
                >
                  {theme === "light" ? <IconLightMode /> : <IconDarkMode />}
                </span>
                <span
                  className={clsx(
                    "absolute left-0 inline-flex size-[22px] rounded-full bg-white shadow-[-1px_2px_4px_rgba(0,0,0,0.1)] transition-transform dark:bg-[#c7ccd6] dark:shadow-[-1px_2px_4px_rgba(77,77,77,0.3)]",
                    theme === "light"
                      ? "translate-x-[32px]"
                      : "translate-x-[4px]",
                  )}
                />
              </button>
            </div>
          </div>
        </header>

        <main className="relative min-h-[calc(100vh-60px)] px-2 py-5 md:px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
