import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { i18n, type Locale } from '../i18n'

export type ThemeMode = 'light' | 'dark'

interface PreferencesContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'admin-demo-theme'
const LOCALE_STORAGE_KEY = 'admin-demo-locale'

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

function detectInitialTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function detectInitialLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'ko' || stored === 'en') {
    return stored
  }

  return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(detectInitialTheme)
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale)
  const themeSwitchTimerRef = useRef<number | null>(null)

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    document.documentElement.lang = locale
    void i18n.changeLanguage(locale)
  }, [locale])

  useEffect(() => {
    return () => {
      if (themeSwitchTimerRef.current !== null) {
        window.clearTimeout(themeSwitchTimerRef.current)
      }
    }
  }, [])

  const value = useMemo<PreferencesContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      theme,
      setTheme: (nextTheme) => {
        const rootElement = document.documentElement
        rootElement.classList.add('theme-switching')

        setThemeState(nextTheme)

        if (themeSwitchTimerRef.current !== null) {
          window.clearTimeout(themeSwitchTimerRef.current)
        }

        themeSwitchTimerRef.current = window.setTimeout(() => {
          rootElement.classList.remove('theme-switching')
        }, 140)
      },
      toggleTheme: () => {
        const rootElement = document.documentElement
        rootElement.classList.add('theme-switching')

        setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))

        if (themeSwitchTimerRef.current !== null) {
          window.clearTimeout(themeSwitchTimerRef.current)
        }

        themeSwitchTimerRef.current = window.setTimeout(() => {
          rootElement.classList.remove('theme-switching')
        }, 140)
      },
    }),
    [locale, theme],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function useAppPreferences() {
  const context = useContext(PreferencesContext)

  if (!context) {
    throw new Error('useAppPreferences must be used within AppPreferencesProvider')
  }

  return context
}
