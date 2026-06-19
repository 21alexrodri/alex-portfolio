import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import './BooksPanel.css'

function spineYear(period) {
  const years = [...period.matchAll(/\d{4}/g)].map(m => m[0])
  const ongoing = period.match(/nowadays|now|hoy|avui/i)
  if (years.length === 0) return period
  if (ongoing) return `${years[0]}–${ongoing[0]}`
  if (years.length === 1 || years[0] === years[1]) return years[0]
  return `${years[0]}–${years[1]}`
}

const COLORS = ['#7BAED4', '#E08C8C', '#E0C46A', '#85BFA0', '#B8A4D4', '#E0A878', '#7ABABA', '#D4979A']
const SIZES  = [
  { width: 44, height: 200 },
  { width: 32, height: 178 },
  { width: 22, height: 155 },
  { width: 38, height: 190 },
  { width: 28, height: 165 },
  { width: 36, height: 182 },
]

function BookSpine({ book, onClick }) {
  const wrapRef = useRef()
  const [tipPos, setTipPos] = useState(null)

  function handleMouseEnter() {
    const r = wrapRef.current?.getBoundingClientRect()
    if (r) setTipPos({ x: r.left + r.width / 2, y: r.top })
  }

  return (
    <>
      <div
        ref={wrapRef}
        className="bp-book-wrap"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setTipPos(null)}
      >
        <button
          type="button"
          className="bp-book"
          style={{
            width: book.width,
            height: book.height,
            '--book-color': book.color,
            '--book-h': `${book.height}px`,
          }}
          onClick={onClick}
        >
          <div className="bp-book-text">
            <span className="bp-book-name">{book.spine}</span>
            <span className="bp-book-sep"> · </span>
            <span className="bp-book-year">{spineYear(book.period)}</span>
          </div>
        </button>
      </div>

      {tipPos && createPortal(
        <div className="bp-book-tooltip" style={{ left: tipPos.x, top: tipPos.y }}>
          {book.title}
        </div>,
        document.body
      )}
    </>
  )
}

export default function BooksPanel({ onClose }) {
  const { t } = useTranslation()
  const [section, setSection] = useState('education')
  const [openBookIndex, setOpenBookIndex] = useState(null)

  // Leer datos desde las traducciones
  const rawBooks = t(`data.${section}`, { returnObjects: true }) ?? []
  const shelfBooks = rawBooks.map((b, i) => ({
    id: `book-${section}-${i}`,
    color:  COLORS[i % COLORS.length],
    width:  SIZES[i % SIZES.length].width,
    height: SIZES[i % SIZES.length].height,
    ...b,
    certificates: Array.isArray(b.certificates)
      ? b.certificates
      : b.certificate
        ? [{ label: t('ui.books.certBtn'), url: b.certificate }]
        : [],
  }))

  const openBook = openBookIndex !== null ? shelfBooks[openBookIndex] ?? null : null

  return (
    <div className="bp-overlay" onClick={onClose}>
      <div className="bp-panel" onClick={e => e.stopPropagation()}>

        <header className="bp-header">
          {openBook ? (
            <button className="bp-back" onClick={() => setOpenBookIndex(null)}>
              {t('ui.books.back')}
            </button>
          ) : (
            <>
              <span className="bp-logo">📚</span>
              <span className="bp-header-title">{t('ui.books.header')}</span>
            </>
          )}
          <button className="bp-close" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        {!openBook && (
          <>
            <nav className="bp-tabs">
              <button
                className={`bp-tab ${section === 'education' ? 'active' : ''}`}
                onClick={() => { setSection('education'); setOpenBookIndex(null) }}
              >
                {t('ui.books.tabEducation')}
              </button>
              <button
                className={`bp-tab ${section === 'experience' ? 'active' : ''}`}
                onClick={() => { setSection('experience'); setOpenBookIndex(null) }}
              >
                {t('ui.books.tabExperience')}
              </button>
            </nav>

            <div className="bp-shelf-area">
              <div className="bp-shelf-row">
                {shelfBooks.map((book, i) => (
                  <BookSpine key={book.id} book={book} onClick={() => setOpenBookIndex(i)} />
                ))}
              </div>
              <div className="bp-shelf-plank" />
            </div>

            <p className="bp-hint">{t('ui.books.hint')}</p>
          </>
        )}

        {openBook && (
          <div className="bp-page" key={openBook.id}>
            <div className="bp-page-strip" style={{ background: openBook.color }} />
            <div className="bp-page-body">
              <p className="bp-page-label">
                {section === 'education' ? t('ui.books.labelEducation') : t('ui.books.labelExperience')}
              </p>
              <h2 className="bp-page-title">{openBook.title}</h2>
              <p className="bp-page-inst">{openBook.institution}</p>
              <p className="bp-page-period">{openBook.period}</p>
              <hr className="bp-page-rule" />
              <p className="bp-page-desc">{openBook.description}</p>

              {openBook.tags && openBook.tags.length > 0 && (
                <div className="bp-page-tags">
                  {openBook.tags.map(tag => (
                    <span key={tag} className="bp-page-tag">{tag}</span>
                  ))}
                </div>
              )}

              {openBook.certificates.length > 0 && (
                <div className="bp-cert-row">
                  {openBook.certificates.map(c => (
                    <a key={c.url} href={c.url} target="_blank" rel="noopener noreferrer" className="bp-cert-btn">
                      {c.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
