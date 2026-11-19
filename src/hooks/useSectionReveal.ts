import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from '../lib/anim'
import { usePrefersReducedMotion } from '../lib/motion'

/**
 * Masked line reveals.
 *
 * `[data-reveal]` sits inside an overflow-hidden wrapper and slides up from
 * below the mask with an expo-out: fast arrival, long settle. `[data-fade]` is
 * for paragraphs and controls, which would read badly if clipped.
 *
 * No blur, no long opacity ramps. The motion language is mechanical: it arrives,
 * then it stops.
 */
export function useSectionReveal(ref: RefObject<HTMLElement>, enabled = true) {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || reduced || !enabled) return

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]', root).forEach((element, index) => {
        gsap.fromTo(
          element,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: 'expo.out',
            delay: (index % 4) * 0.055,
            scrollTrigger: {
              trigger: root,
              start: 'top 72%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-fade]', root).forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: 'power3.out',
            delay: 0.08 + (index % 6) * 0.045,
            scrollTrigger: {
              trigger: root,
              start: 'top 72%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      })
    }, root)

    return () => context.revert()
  }, [ref, reduced, enabled])
}

/** Fade a chapter back as it leaves, so two scenes are never both loud. */
export function useSectionExit(ref: RefObject<HTMLElement>, enabled = true) {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || reduced || !enabled) return

    const context = gsap.context(() => {
      gsap.to(root, {
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'bottom 85%',
          end: 'bottom 40%',
          scrub: true,
        },
      })
    }, root)

    return () => context.revert()
  }, [ref, reduced, enabled])
}

/** Keep ScrollTrigger honest after fonts, viewport changes or modal open. */
export function useRefreshTriggers(dependency: unknown) {
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(id)
  }, [dependency])
}
