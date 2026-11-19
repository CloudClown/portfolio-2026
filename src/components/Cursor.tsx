import { useEffect, useRef, useState } from 'react'
import { hoverState } from '../lib/pointer'

/**
 * Signature Cursor: CURSOR AS COMPILER
 *
 * 1. Default: Crisp caution-yellow crosshair (+)
 * 2. Over interactive/wireframe items: Expands into a dashed compiler reticle
 *    with "[+] COMPILE" label and spinning scanline.
 */
export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine) return

    document.body.dataset.customCursor = 'true'

    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY
    let frame = 0

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      if (!visible) setVisible(true)
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const interactive = target.closest('a, button, [role="button"], input, textarea, select, [data-interactive]') !== null
      if (interactive) setIsCompiling(true)
    }

    const onOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const interactive = target.closest('a, button, [role="button"], input, textarea, select, [data-interactive]') !== null
      if (interactive) setIsCompiling(hoverState.cursor)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mouseout', onOut, { passive: true })

    const unsubscribe = hoverState.subscribe((h: boolean) => {
      setIsCompiling(h)
    })

    const tick = () => {
      currentX += (targetX - currentX) * 0.25
      currentY += (targetY - currentY) * 0.25

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`
      }

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(frame)
      unsubscribe()
      delete document.body.dataset.customCursor
    }
  }, [visible])

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={`pointer-events-none fixed left-0 top-0 z-50 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ willChange: 'transform' }}
    >
      {/* 1. Default Yellow Crosshair */}
      {!isCompiling && (
        <div className="-translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <span className="font-mono text-sm text-caution font-bold leading-none select-none">
            +
          </span>
        </div>
      )}

      {/* 2. Over Wireframe / Interactive Elements: [ COMPILE RETICLE ] */}
      {isCompiling && (
        <div className="-translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
          {/* Outer Dashed Compile Ring */}
          <div className="h-9 w-9 rounded-full border border-dashed border-caution animate-spin duration-700 flex items-center justify-center" />

          {/* Center Point */}
          <span className="absolute h-1.5 w-1.5 rounded-full bg-caution" />

          {/* Micro Tag Label */}
          <span className="absolute -bottom-5 font-mono text-[8px] uppercase tracking-hud font-bold text-caution bg-base/90 px-1 border border-caution/40">
            COMPILE
          </span>
        </div>
      )}
    </div>
  )
}
