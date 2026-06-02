import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './VasePanel.css'

function timeAgo(iso, t) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60)    return t('ui.vase.justNow')
  if (diff < 3600)  return t('ui.vase.mAgo', { n: Math.floor(diff / 60) })
  if (diff < 86400) return t('ui.vase.hAgo', { n: Math.floor(diff / 3600) })
  return t('ui.vase.dAgo', { n: Math.floor(diff / 86400) })
}

export default function VasePanel({ onClose }) {
  const { t } = useTranslation()
  const [flowers, setFlowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    fetch('/api/flowers')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => setFlowers(data))
      .catch(() => setError(t('ui.vase.error')))
      .finally(() => setLoading(false))
  }, [])

  const countLabel = flowers.length === 0
    ? t('ui.vase.countZero')
    : t('ui.vase.count', { count: flowers.length })

  return (
    <div className="vp-overlay" onClick={onClose}>
      <div className="vp-panel" onClick={e => e.stopPropagation()}>

        <header className="vp-header">
          <span className="vp-header-icon">🌸</span>
          <div className="vp-header-text">
            <span className="vp-header-title">{t('ui.vase.title')}</span>
            {!loading && !error && (
              <span className="vp-header-count">{countLabel}</span>
            )}
          </div>
          <button className="vp-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        <div className="vp-body">
          {loading && (
            <div className="vp-state">
              <span className="vp-spinner" />
              <p>{t('ui.vase.loading')}</p>
            </div>
          )}

          {error && (
            <div className="vp-state vp-state--error">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && flowers.length === 0 && (
            <div className="vp-state">
              <span className="vp-empty-icon">🌱</span>
              <p>{t('ui.vase.emptyTitle')}</p>
              <p className="vp-empty-sub">{t('ui.vase.emptySub')}</p>
            </div>
          )}

          {!loading && !error && flowers.length > 0 && (
            <ul className="vp-list">
              {flowers.map(f => (
                <li key={f.id} className="vp-entry">
                  <span className="vp-entry-emoji">{f.emoji}</span>
                  <div className="vp-entry-info">
                    <span className="vp-entry-flower">{f.flower_name}</span>
                    <span className="vp-entry-buyer">{t('ui.vase.by')} {f.buyer_name}</span>
                  </div>
                  <span className="vp-entry-time">{timeAgo(f.bought_at, t)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
