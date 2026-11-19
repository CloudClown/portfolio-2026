import { useRef, type ReactNode } from 'react'

/**
 * Magnetic pull for primary actions. Four pixels of travel, applied directly to
 * the element's transform so it never enters React's render cycle.
 */
export function Magnetic({ children, strength = 4 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null)

  return (
    <span
      ref={ref}
      className="inline-flex"
      onPointerMove={(event) => {
        const el = ref.current
        const parent = el?.parentElement
        if (!el || !parent) return
        const rect = parent.getBoundingClientRect()
        const dx = ((event.clientX - rect.left) / rect.width - 0.5) * 2
        const dy = ((event.clientY - rect.top) / rect.height - 0.5) * 2
        el.style.transform = `translate3d(${dx * strength}px, ${dy * strength}px, 0)`
      }}
      onPointerLeave={() => {
        if (ref.current) ref.current.style.transform = 'translate3d(0,0,0)'
      }}
    >
      <span ref={ref} className="inline-flex transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]">
        {children}
      </span>
    </span>
  )
}
