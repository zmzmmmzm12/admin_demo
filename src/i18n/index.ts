import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ko from './locales/ko.json'

export type Locale = 'ko' | 'en'

const LOCALE_STORAGE_KEY = 'admin-demo-locale'

function detectInitialLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'ko' || stored === 'en') {
    return stored
  }

  return navigator.language.toLowerCase().startsWith('ko') ? 'ko' : 'en'
}

void i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: detectInitialLocale(),
  fallbackLng: 'ko',
  interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}',
  },
  keySeparator: false,
})

export { i18n }
