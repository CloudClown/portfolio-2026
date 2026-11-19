import { useEffect, useState } from 'react'

const reducedQuery = '(prefers-reduced-motion: reduce)'
const mobileQuery = '(max-width: 820px), (pointer: coarse)'

function useMedia(query: string, fallback = false) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? fallback : window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export const usePrefersReducedMotion = () => useMedia(reducedQuery)
export const useIsMobile = () => useMedia(mobileQuery)

/**
 * Quality tiers.
 *
 * The reflector is the one expensive thing in the scene: it renders the world a
 * second time for the wet floor. Desktop gets it, phones get a dark metal plane
 * and a grid. Post-processing is dropped entirely for reduced motion.
 */
export function useQuality() {
  const isMobile = useIsMobile()
  const reduced = usePrefersReducedMotion()

  return {
    isMobile,
    reduced,
    dust: reduced ? 90 : isMobile ? 280 : 700,
    post: !reduced,
    dof: !isMobile && !reduced,
    reflective: !isMobile && !reduced,
    maxDpr: isMobile ? 1.5 : 1.9,
  }
}
