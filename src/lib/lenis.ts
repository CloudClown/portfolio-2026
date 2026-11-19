import type Lenis from 'lenis'

/**
 * A single Lenis instance for the app. The overlay and the 3D world both need to
 * stop and start it (the loader and the project modal lock scrolling), so it
 * lives here rather than in a React context.
 */
let instance: Lenis | null = null

export function setLenis(next: Lenis | null) {
  instance = next
}

export function getLenis() {
  return instance
}

export function lockScroll() {
  instance?.stop()
  document.documentElement.classList.add('u-no-scroll')
}

export function unlockScroll() {
  instance?.start()
  document.documentElement.classList.remove('u-no-scroll')
}

/**
 * Scroll so a chapter sits at the position where the camera holds it:
 * the vertical centre of the section, not its top edge.
 */
export function scrollToChapter(id: string) {
  const element = document.getElementById(id)
  if (!element) return

  const target = element.offsetTop + element.offsetHeight / 2 - window.innerHeight / 2

  if (instance) {
    instance.scrollTo(target, { duration: 2.2 })
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' })
  }
}
