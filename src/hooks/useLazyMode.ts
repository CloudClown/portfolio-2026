import { useEffect, useRef, useState } from 'react'

/**
 * Lazy Mode: auto-scrolls the entire journey at a smooth, comfortable pace.
 * Stops when the user manually scrolls (wheel / touch) or reaches the bottom.
 *
 * Uses window.scrollBy() per frame — Lenis picks it up automatically
 * through its native scroll listener, so the camera and smooth-scroll
 * stay perfectly in sync without any Lenis API gymnastics.
 */
export function useLazyMode() {
  const [active, setActive] = useState(false)
  const rafRef = useRef<number | null>(null)
  const activeRef = useRef(false) // ref so RAF callback always reads latest value

  useEffect(() => {
    activeRef.current = active

    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    const step = () => {
      if (!activeRef.current) return

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (window.scrollY >= maxScroll - 4) {
        // Reached the bottom — stop automatically
        activeRef.current = false
        setActive(false)
        return
      }

      // Scroll 2px per frame (~120px/s at 60fps). Lenis intercepts this
      // naturally so smoothing, camera sync and progress all stay correct.
      window.scrollBy(0, 2)
      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)

    // Cancel on manual wheel or touch input
    const stop = () => {
      activeRef.current = false
      setActive(false)
    }

    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchstart', stop)
    }
  }, [active])

  const toggle = () => setActive((v) => !v)

  return { isLazyMode: active, toggleLazyMode: toggle }
}
