import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from './locales/es.json'
import ca from './locales/ca.json'
import en from './locales/en.json'

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    ca: { translation: ca },
    en: { translation: en },
  },
  lng: 'en',
  fallbackLng: 'en',
  // Safe because React already escapes JSX output.
  // Never interpolate user-supplied or API data into translation strings.
  interpolation: { escapeValue: false },
})

// Keep <html lang> in sync with the active language (resources are synchronous)
document.documentElement.lang = i18n.language
i18n.on('languageChanged', (lng) => { document.documentElement.lang = lng })

export default i18n
