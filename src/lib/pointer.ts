/**
 * Global pointer state, normalised to [-1, 1] with (0, 0) at the centre.
 * Written on window pointermove, read inside `useFrame` for parallax.
 */
export const pointer = {
  x: 0,
  y: 0,
  /** Normalised device coords, for raycast-free shader effects. */
  nx: 0,
  ny: 0,
  down: false,
}

let bound = false

export function bindPointer() {
  if (bound || typeof window === 'undefined') return () => {}
  bound = true

  const onMove = (event: PointerEvent) => {
    const w = window.innerWidth || 1
    const h = window.innerHeight || 1
    pointer.nx = (event.clientX / w) * 2 - 1
    pointer.ny = -((event.clientY / h) * 2 - 1)
    pointer.x = pointer.nx * (w > h ? 1 : h / w)
    pointer.y = pointer.ny
  }
  const onDown = () => (pointer.down = true)
  const onUp = () => (pointer.down = false)

  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointerleave', () => {
    pointer.x = 0
    pointer.y = 0
    pointer.nx = 0
    pointer.ny = 0
  })

  return () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    bound = false
  }
}

/**
 * Hover state shared with the 3D world without React re-renders:
 * the HTML list writes an index, the portals read it in `useFrame`.
 */
type HoverListener = (active: boolean) => void
const hoverListeners = new Set<HoverListener>()

export const hoverState = {
  project: -1,
  skill: -1,
  /** Set by 3D objects or DOM so the custom cursor can react to canvas hovers. */
  cursor: false,
  setCursor(active: boolean) {
    this.cursor = active
    hoverListeners.forEach((fn) => fn(active))
  },
  subscribe(fn: HoverListener) {
    hoverListeners.add(fn)
    return () => hoverListeners.delete(fn)
  },
}
