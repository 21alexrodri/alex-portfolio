import { useState, useEffect, useCallback } from 'react'
import { useProgress } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import './App.css'
import Scene from './components/Scene.jsx'
import BooksPanel from './components/BooksPanel.jsx'
import MonitorPanel from './components/MonitorPanel.jsx'
import VasePanel from './components/VasePanel.jsx'
import CustomCursor from './components/CustomCursor.jsx'
import LanguageSwitcher from './components/LanguageSwitcher.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function LoadingScreen() {
  const { progress } = useProgress()
  const done = progress >= 100
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setGone(true), 500)
    return () => clearTimeout(t)
  }, [done])

  if (gone) return null

  return (
    <div className={`loading-screen${done ? ' loading-screen--out' : ''}`}>
      <span className="loading-name">Àlex Rodríguez Benítez</span>
    </div>
  )
}

function SceneHint({ activePanel }) {
  const { t } = useTranslation()
  const [fading, setFading] = useState(false)
  const [gone, setGone] = useState(false)

  const dismiss = useCallback(() => {
    setFading(true)
    setTimeout(() => setGone(true), 700)
  }, [])

  useEffect(() => {
    if (activePanel !== null) dismiss()
  }, [activePanel, dismiss])

  useEffect(() => {
    const timer = setTimeout(dismiss, 5500)
    return () => clearTimeout(timer)
  }, [dismiss])

  if (gone) return null

  return (
    <div className={`scene-hint${fading ? ' scene-hint--out' : ''}`}>
      <span className="hint-pointer">{t('ui.sceneHint')}</span>
      <span className="hint-touch">{t('ui.sceneHint')}</span>
    </div>
  )
}

function PanelErrorFallback({ onClose }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', zIndex: 100 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#1c1c1c', color: '#ccc', padding: '2rem', borderRadius: '8px', textAlign: 'center', minWidth: '220px' }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ marginBottom: '1rem' }}>⚠️ Could not load this panel.</p>
        <button
          onClick={onClose}
          style={{ padding: '0.4rem 1.2rem', cursor: 'pointer', background: '#333', color: '#ddd', border: '1px solid #555', borderRadius: '4px' }}
        >
          Close
        </button>
      </div>
    </div>
  )
}

function SceneFallback() {
  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: '#111', color: '#888', fontFamily: 'monospace', gap: '1rem',
    }}>
      <span style={{ fontSize: '2rem' }}>⚠️</span>
      <p>Could not load the 3D scene.</p>
      <p style={{ fontSize: '0.75rem' }}>Try refreshing the page.</p>
    </div>
  )
}

function App() {
  const [activePanel, setActivePanel] = useState(null)

  return (
    <>
      <LoadingScreen />
      <SceneHint activePanel={activePanel} />
      <header className="site-header">
        <h1 className="site-name">Àlex Rodríguez Benítez</h1>
      </header>

      <footer className="site-footer">
        <a href="https://github.com/21alexrodri" target="_blank" rel="noopener noreferrer" className="site-footer-link" aria-label="GitHub">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
        </a>
        <a href="https://www.linkedin.com/in/alex-rodriguez-benitez" target="_blank" rel="noopener noreferrer" className="site-footer-link" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a href="mailto:21alexrodri@gmail.com" className="site-footer-link" aria-label="Email">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>
        </a>
        <a
          href="/img/rodriguez_benitez_alex_cv.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download
          className="site-footer-link cv-download-link"
          aria-label="Download CV"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v13M7 11l5 5 5-5"/>
            <path d="M5 21h14"/>
          </svg>
          <span className="cv-label">CV</span>
        </a>
      </footer>
      <CustomCursor />
      <LanguageSwitcher />
      <ErrorBoundary fallback={<SceneFallback />}>
        <Scene activePanel={activePanel} onObjectClick={setActivePanel} />
      </ErrorBoundary>
      {activePanel === 'books' && (
        <ErrorBoundary fallback={<PanelErrorFallback onClose={() => setActivePanel(null)} />}>
          <BooksPanel onClose={() => setActivePanel(null)} />
        </ErrorBoundary>
      )}
      {activePanel === 'monitor' && (
        <ErrorBoundary fallback={<PanelErrorFallback onClose={() => setActivePanel(null)} />}>
          <MonitorPanel onClose={() => setActivePanel(null)} />
        </ErrorBoundary>
      )}
      {activePanel === 'vase' && (
        <ErrorBoundary fallback={<PanelErrorFallback onClose={() => setActivePanel(null)} />}>
          <VasePanel onClose={() => setActivePanel(null)} />
        </ErrorBoundary>
      )}
    </>
  )
}

export default App
