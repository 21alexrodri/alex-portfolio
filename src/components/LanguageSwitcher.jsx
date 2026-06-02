import { useTranslation } from 'react-i18next'
import './LanguageSwitcher.css'

const LANGS = ['es', 'ca', 'en']

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="ls-wrap">
      {LANGS.map(lang => (
        <button
          key={lang}
          className={`ls-btn ${i18n.language === lang ? 'active' : ''}`}
          onClick={() => i18n.changeLanguage(lang)}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
