import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/anim'
import { clamp, setProgress, setStops } from '../lib/scroll'
import { setLenis } from '../lib/lenis'
import Lenis from 'lenis'

/**
 * Owns the page's scrolling.
 *
 * Lenis drives the native scroll position; ScrollTrigger listens to it so the
 * HTML reveals stay perfectly in sync with the smoothed scroll; and the same
 * position is published to the 3D world through `setProgress`.
 */
export function useSmoothScroll(enabled: boolean) {
  const [ready, setReady] = useState(false)
  const measure = useRef<() => void>(() => {})

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      smoothWheel: true,
      autoRaf: false,
    })

    setLenis(lenis)
    setReady(true)

    // Dev-only QA hook.
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__lenis = lenis
    }

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      setProgress(window.scrollY / max, lenis.velocity)
    }

    const raf = (time: number) => lenis.raf(time * 1000)
    const onTriggerUpdate = () => ScrollTrigger.update()

    lenis.on('scroll', onScroll)
    lenis.on('scroll', onTriggerUpdate)
    // Any scroll counts — Lenis' own, keyboard paging, an anchor jump or the
    // browser restoring a position. Without this the camera can lag behind a
    // scroll it did not perform itself.
    window.addEventListener('scroll', onScroll, { passive: true })
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // --- measure where each chapter is "held" ---------------------------------
    const measureStops = () => {
      const viewport = window.innerHeight
      const max = document.documentElement.scrollHeight - viewport
      if (max <= 0) return

      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
      const stops = sections.map((section) =>
        clamp((section.offsetTop + section.offsetHeight / 2 - viewport / 2) / max),
      )
      setStops(stops)
      onScroll()
      ScrollTrigger.refresh()
    }
    measure.current = measureStops
    measureStops()

    // Fonts change the height of the page; re-measure once they land.
    if (document.fonts?.ready) {
      void document.fonts.ready.then(measureStops)
    }

    window.addEventListener('resize', measureStops, { passive: true })
    const observer = new ResizeObserver(measureStops)
    observer.observe(document.body)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measureStops)
      observer.disconnect()
      gsap.ticker.remove(raf)
      lenis.off('scroll', onScroll)
      lenis.off('scroll', onTriggerUpdate)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // Pause the world while the loader is in front of it. The project modal has
  // its own lock (see lib/lenis) so the two cannot fight over the flag.
  useEffect(() => {
    if (enabled) document.documentElement.classList.remove('u-no-scroll')
    else document.documentElement.classList.add('u-no-scroll')
  }, [enabled])

  return { ready, remeasure: () => measure.current() }
}
