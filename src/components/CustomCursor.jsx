import { useEffect, useRef } from 'react'
import './CustomCursor.css'

export default function CustomCursor() {
  const dotRef  = useRef()
  const ringRef = useRef()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = window.innerWidth  / 2
    let my = window.innerHeight / 2
    let rx = mx, ry = my
    let visible = false
    let rafId


    function onMove(e) {
      mx = e.clientX
      my = e.clientY
      if (!visible) {
        rx = mx; ry = my   // snap en el primer movimiento
        dot.style.opacity  = '1'
        ring.style.opacity = '1'
        visible = true
      }
    }

    function onLeave() {
      dot.style.opacity  = '0'
      ring.style.opacity = '0'
      visible = false
    }

    function onEnter() {
      dot.style.opacity  = '1'
      ring.style.opacity = '1'
      visible = true
    }

    function tick() {
      rx += (mx - rx) * 0.11
      ry += (my - ry) * 0.11

      dot.style.transform  = `translate(${mx - 3}px, ${my - 3}px)`
      ring.style.transform = `translate(${rx - 14}px, ${ry - 14}px) rotate(45deg)`

      rafId = requestAnimationFrame(tick)
    }

    // Solo ahora ocultamos el cursor nativo: si llegamos aquí, el custom funciona
    document.body.classList.add('cc-active')

    document.addEventListener('mousemove',  onMove)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)
    rafId = requestAnimationFrame(tick)

    return () => {
      document.body.classList.remove('cc-active')
      document.removeEventListener('mousemove',  onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cc-dot"  />
      <div ref={ringRef} className="cc-ring" />
    </>
  )
}
