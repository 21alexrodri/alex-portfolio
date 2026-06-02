import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import './MonitorPanel.css'

const APPS = [
  { id: 'browser',  labelKey: 'Bloom',      icon: '🌸', bg: 'linear-gradient(135deg,#1a4a30,#2d7a50)' },
  { id: 'projects', labelKey: 'Projects',   icon: '💻', bg: 'linear-gradient(135deg,#1e2238,#2d3558)' },
  { id: 'about',    labelKey: 'About.pdf',  icon: '📄', bg: 'linear-gradient(135deg,#3a2e1e,#5a4828)' },
]

const VALID_NAME_RE = /^[\p{L}\s'\-.]{2,40}$/u

// ──────────────────────────────────────────────────────────
// Flower Shop Browser
// ──────────────────────────────────────────────────────────
function BrowserApp() {
  const { t } = useTranslation()
  const flowers = t('data.flowers', { returnObjects: true }) ?? []

  const [pending, setPending]     = useState(null)
  const [buyerName, setBuyerName] = useState('')
  const [nameError, setNameError] = useState(null)
  const [buying, setBuying]       = useState(false)
  const [recentBuy, setRecentBuy] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (pending) inputRef.current?.focus({ preventScroll: true })
  }, [pending])

  async function confirmPurchase() {
    if (buying) return
    const trimmed = buyerName.trim()
    if (trimmed.length < 2)           { setNameError(t('ui.errors.nameMin'));   return }
    if (!VALID_NAME_RE.test(trimmed)) { setNameError(t('ui.errors.nameChars')); return }
    setNameError(null)
    setBuying(true)

    try {
      const res = await fetch('/api/flowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_name:  trimmed,
          flower_name: pending.name,
          emoji:       pending.emoji,
          price:       pending.price,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setNameError(typeof data.error === 'string' ? data.error : t('ui.errors.nameServer'))
        return
      }
      setRecentBuy(pending.id)
      setTimeout(() => setRecentBuy(null), 2500)
      setPending(null)
      setBuyerName('')
      setNameError(null)
    } catch {
      setNameError(t('ui.errors.nameNetwork'))
    } finally {
      setBuying(false)
    }
  }

  function cancelPurchase() {
    setPending(null)
    setBuyerName('')
    setNameError(null)
  }

  return (
    <div className="mp-browser">
      <div className="mp-addr-bar">
        <span className="mp-addr-lock">🔒</span>
        <span className="mp-addr-text">bloom.local / shop</span>
      </div>

      <div className="mp-shop">
        <div className="mp-shop-hero">
          <h1 className="mp-shop-name">BLOOM</h1>
          <p className="mp-shop-sub">handcrafted · low poly · flowers</p>
          <span className="mp-shop-free">{t('ui.monitor.browser.freeNote')}</span>
        </div>
        <div className="mp-product-grid">
          {flowers.map(f => (
            <div key={f.id} className={`mp-product ${pending?.id === f.id ? 'mp-product--active' : ''}`}>
              <span className="mp-product-emoji">{f.emoji}</span>
              <span className="mp-product-name">{f.name}</span>
              <span className="mp-product-desc">{f.desc}</span>
              <div className="mp-product-row">
                <span className="mp-product-price">${f.price}</span>
                <button
                  className={`mp-product-btn ${recentBuy === f.id ? 'done' : ''}`}
                  onClick={() => { if (recentBuy !== f.id && !pending) setPending(f) }}
                  disabled={!!pending || recentBuy === f.id}
                >
                  {recentBuy === f.id ? '✓' : '+ Buy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {pending && (
        <div className="mp-buy-drawer">
          <div className="mp-buy-flower-row">
            <span className="mp-buy-flower-label">
              {pending.emoji} <strong>{pending.name}</strong>
            </span>
            <span className="mp-buy-flower-price">${pending.price}</span>
          </div>
          <p className="mp-buy-free-note">{t('ui.monitor.browser.noPayment')}</p>
          <input
            ref={inputRef}
            className={`mp-buy-input ${nameError ? 'mp-buy-input--error' : ''}`}
            placeholder={t('ui.monitor.browser.placeholder')}
            value={buyerName}
            onChange={e => { setBuyerName(e.target.value); setNameError(null) }}
            onKeyDown={e => {
              if (e.key === 'Enter')  confirmPurchase()
              if (e.key === 'Escape') cancelPurchase()
            }}
            maxLength={40}
          />
          {nameError && <p className="mp-buy-error">{nameError}</p>}
          <div className="mp-buy-actions">
            <button className="mp-buy-cancel"  onClick={cancelPurchase}>
              {t('ui.monitor.browser.cancelBtn')}
            </button>
            <button
              className="mp-buy-confirm"
              onClick={confirmPurchase}
              disabled={!buyerName.trim() || buying}
            >
              {buying ? t('ui.monitor.browser.buying') : t('ui.monitor.browser.buyBtn')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Projects (VS Code style)
// ──────────────────────────────────────────────────────────
function renderMd(desc) {
  return desc.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <p key={i} className="mp-code-h2">{line}</p>
    if (line.startsWith('# '))  return <p key={i} className="mp-code-h1">{line}</p>
    if (line === '')             return <br key={i} />
    if (line.startsWith('· ') || line.startsWith('- '))
                                 return <p key={i} className="mp-code-bullet">{line}</p>
    return <p key={i} className="mp-code-p">{line}</p>
  })
}

function ProjectsApp() {
  const { t } = useTranslation()
  const projects = t('data.projects', { returnObjects: true }) ?? []
  const [sel, setSel] = useState(null)
  const project = projects.find(p => p.id === sel)

  return (
    <div className={`mp-code${project ? ' mp-code--open' : ''}`}>
      <div className="mp-code-left">
        <div className="mp-code-explorer">{t('ui.monitor.code.explorer')}</div>
        <div className="mp-code-folder">▾ Projects</div>
        {projects.map(p => (
          <button
            type="button"
            key={p.id}
            className={`mp-code-item ${sel === p.id ? 'active' : ''}`}
            onClick={() => setSel(p.id)}
          >
            <span>{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}
        <a
          href="https://github.com/21alexrodri"
          target="_blank"
          rel="noopener noreferrer"
          className="mp-code-github-link"
        >
          🐙 github.com/21alexrodri
        </a>
      </div>

      <div className="mp-code-right">
        {project ? (
          <div className="mp-code-readme">
            <div className="mp-code-tabbar">
              <div className="mp-code-tab">
                <span>{project.icon}</span>
                <span>{project.name}.md</span>
                <button type="button" className="mp-code-tab-x" onClick={() => setSel(null)} aria-label="Cerrar archivo">×</button>
              </div>
            </div>
            <div className="mp-code-body">
              <p className="mp-code-h1"># {project.name}</p>
              {renderMd(project.description)}
              {project.tags?.length > 0 && (
                <>
                  <p className="mp-code-h2">## Stack</p>
                  <div className="mp-code-tags">
                    {project.tags.map(tag => (
                      <span key={tag} className="mp-code-tag">`{tag}`</span>
                    ))}
                  </div>
                </>
              )}
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="mp-code-link">
                  ↗ {project.url}
                </a>
              )}
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="mp-code-link">
                  ⎇ {project.github}
                </a>
              )}
              {project.certificate && (
                <a href={project.certificate} target="_blank" rel="noopener noreferrer" className="mp-code-link mp-code-cert-link">
                  {t('ui.books.certBtn')}
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="mp-code-empty">
            <div className="mp-code-logo">{'{ }'}</div>
            <p>{t('ui.monitor.code.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// About Me (PDF viewer)
// ──────────────────────────────────────────────────────────
function AboutApp() {
  const { t } = useTranslation()

  return (
    <div className="mp-pdf">
      <div className="mp-pdf-topbar">
        <span>📄 About_Me.pdf</span>
        <a
          href="/img/rodriguez_benitez_alex_cv.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mp-pdf-download-btn"
          aria-label="Download CV"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
            <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/>
          </svg>
          {t('ui.monitor.about.downloadCV')}
        </a>
      </div>
      <div className="mp-pdf-bg">
        <div className="mp-pdf-paper">
          <div className="mp-cv-header">
            <img className="mp-cv-avatar" src="/img/portfolio_img.jpg" alt="Àlex Rodríguez Benítez" />
            <div className="mp-cv-title">
              <h1>Àlex Rodríguez Benítez</h1>
              <p>{t('ui.monitor.about.role')}</p>
            </div>
          </div>
          <hr className="mp-cv-rule" />
          <div className="mp-cv-section">
            <h3>{t('ui.monitor.about.aboutTitle')}</h3>
            <p>{t('ui.monitor.about.aboutText')}</p>
          </div>
          <div className="mp-cv-section">
            <h3>{t('ui.monitor.about.skillsTitle')}</h3>
            <div className="mp-cv-skills">
              {['Python', 'JavaScript', 'PHP', 'React', 'Node.js', 'SQL', 'Java', 'Git', 'Docker', 'AWS', 'Azure', 'TensorFlow', 'Keras', 'scikit-learn', 'NumPy', 'Pandas', 'NLTK', 'Spark', 'Hadoop', 'XGBoost', 'Deep Learning', 'Neural Networks', 'NLP'].map(s => (
                <span key={s} className="mp-cv-skill">{s}</span>
              ))}
            </div>
          </div>
          <div className="mp-cv-section">
            <h3>{t('ui.monitor.about.contactTitle')}</h3>
            <p>📧 <a href="mailto:21alexrodri@gmail.com" className="mp-cv-link">21alexrodri@gmail.com</a></p>
            <p>💼 <a href="https://www.linkedin.com/in/alex-rodriguez-benitez" target="_blank" rel="noopener noreferrer" className="mp-cv-link">linkedin.com/in/alex-rodriguez-benitez</a></p>
            <p>🐙 <a href="https://github.com/21alexrodri" target="_blank" rel="noopener noreferrer" className="mp-cv-link">github.com/21alexrodri</a></p>
            <p>📍 {t('ui.monitor.about.location')}</p>
          </div>
          <a
            href="/img/rodriguez_benitez_alex_cv.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="mp-cv-download-cta"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
              <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/>
            </svg>
            {t('ui.monitor.about.downloadCV')}
          </a>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────
// Main MonitorPanel
// ──────────────────────────────────────────────────────────
export default function MonitorPanel({ onClose }) {
  const { t } = useTranslation()
  const [openApp, setOpenApp] = useState(null)
  const activeApp = APPS.find(a => a.id === openApp)
  const [now, setNow] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
  useEffect(() => {
    const id = setInterval(
      () => setNow(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
      1000
    )
    return () => clearInterval(id)
  }, [])

  return (
    <div className="mp-overlay" onClick={onClose}>
      <div className="mp-monitor" onClick={e => e.stopPropagation()}>

        {openApp ? (
          <div className="mp-window">
            <div className="mp-titlebar">
              <div className="mp-traffic">
                <button type="button" className="mp-dot red" onClick={() => setOpenApp(null)} aria-label="Cerrar app" />
                <span className="mp-dot yellow" />
                <span className="mp-dot green" />
              </div>
              <span className="mp-win-title">{activeApp.labelKey}</span>
              <div style={{ width: 52 }} />
            </div>
            <div className="mp-win-body">
              {openApp === 'browser'  && <BrowserApp />}
              {openApp === 'projects' && <ProjectsApp />}
              {openApp === 'about'    && <AboutApp />}
            </div>
          </div>
        ) : (
          <div className="mp-desktop">
            <div className="mp-icons-row">
              {APPS.map(app => (
                <button type="button" key={app.id} className="mp-icon" onClick={() => setOpenApp(app.id)}>
                  <div className="mp-icon-box" style={{ background: app.bg }}>{app.icon}</div>
                  <span className="mp-icon-lbl">{app.labelKey}</span>
                </button>
              ))}
            </div>
            <p className="mp-desktop-hint">{t('ui.monitor.hint')}</p>
          </div>
        )}

        <div className="mp-taskbar">
          <div className="mp-tb-left">
            {openApp && (
              <button className="mp-home-btn" onClick={() => setOpenApp(null)} title="Desktop">⌂</button>
            )}
          </div>
          <div className="mp-tb-dock">
            {APPS.map(app => (
              <button
                key={app.id}
                className={`mp-tb-app ${openApp === app.id ? 'active' : ''}`}
                onClick={() => setOpenApp(app.id)}
                title={app.labelKey}
              >
                {app.icon}
              </button>
            ))}
          </div>
          <div className="mp-tb-right">
            <span className="mp-clock">{now}</span>
            <button className="mp-x-btn" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
        </div>

      </div>
    </div>
  )
}
