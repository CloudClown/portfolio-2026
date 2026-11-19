import { useEffect, useRef, useState } from 'react'
import { chapters, site } from '../data/site'
import { scrollToChapter } from '../lib/lenis'
import { useScrollPercent } from '../lib/scroll'
import { soundManager } from '../lib/ambient'

/** Which chapter is currently in the middle of the viewport */
export function useActiveChapter() {
  const [active, setActive] = useState<string>(chapters[0].id)

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-chapter]'))
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return active
}

/* -------------------------------------------------------------------------- */
/*  01: TOP BAR NAVIGATION & LAZY MODE TOGGLE                                 */
/* -------------------------------------------------------------------------- */

export function TopBar({
  onOpenQuickView,
  isLazyMode,
  onToggleLazyMode,
}: {
  onOpenQuickView?: () => void
  isLazyMode?: boolean
  onToggleLazyMode?: () => void
}) {
  const active = useActiveChapter()

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-base/85 backdrop-blur-md">
      <div className="u-shell flex h-14 items-center justify-between gap-4">
        {/* Logo / Identity */}
        <a
          href="#hero"
          onClick={(event) => {
            event.preventDefault()
            soundManager.playKeyClick()
            scrollToChapter('hero')
          }}
          className="pointer-events-auto flex items-center gap-3"
          aria-label={`${site.name}, return to workspace`}
        >
          <span className="todo-tag">BUILD 99%</span>
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold tracking-tight text-bone">
              {site.name}
            </span>
            <span className="font-screen text-sm text-ash">
              {site.role.split('(')[0]}
            </span>
          </div>
        </a>

        {/* Chapters Navigation */}
        <nav aria-label="Chapters" className="pointer-events-auto hidden items-center gap-6 lg:flex">
          {chapters.map((chapter) => {
            const isActive = active === chapter.id
            return (
              <a
                key={chapter.id}
                href={`#${chapter.id}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  soundManager.playKeyClick()
                  scrollToChapter(chapter.id)
                }}
                className={`group relative flex items-baseline gap-1.5 font-mono text-[10px] uppercase tracking-hud transition-colors ${
                  isActive ? 'text-caution font-bold' : 'text-ash hover:text-bone'
                }`}
              >
                <span>{chapter.code}</span>
                <span>{chapter.nav}</span>
                <span
                  className={`absolute -bottom-2 left-0 h-[2px] bg-caution transition-all duration-300 ${
                    isActive ? 'w-full' : 'w-0'
                  }`}
                />
              </a>
            )
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Tabs Open Counter */}
          <div className="hidden sm:flex items-center gap-2 border border-white/10 bg-white/[0.02] px-2.5 py-1 font-mono text-[9px] tracking-hud text-ash">
            <span className="h-1.5 w-1.5 rounded-full bg-caution animate-ping" />
            <span>TABS: {site.tabsOpen}</span>
          </div>

          {/* Signature LAZY MODE Toggle */}
          {onToggleLazyMode && (
            <button
              type="button"
              onClick={() => {
                soundManager.playKeyClick()
                onToggleLazyMode()
              }}
              className={`border px-2.5 py-1 font-mono text-[9px] uppercase tracking-hud transition-colors ${
                isLazyMode
                  ? 'border-caution bg-caution text-base font-bold'
                  : 'border-white/20 bg-white/[0.02] text-ash hover:border-caution hover:text-caution'
              }`}
              title="Too lazy to scroll? Lazy mode autoplays the journey"
            >
              {isLazyMode ? '⚡ LAZY MODE: ON' : 'LAZY MODE'}
            </button>
          )}

          {/* Quick Dossier Button (Direct Recruiter Access) */}
          {onOpenQuickView && (
            <button
              type="button"
              onClick={() => {
                soundManager.playKeyClick()
                onOpenQuickView()
              }}
              className="border border-caution bg-caution/10 px-3 py-1 font-mono text-[9px] uppercase tracking-hud text-caution hover:bg-caution hover:text-base transition-colors"
            >
              [ RECRUITER DOSSIER ]
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

/* -------------------------------------------------------------------------- */
/*  02: BUILD PROGRESS BAR (WITH FAKE COMPILER LOGS)                          */
/* -------------------------------------------------------------------------- */

export function ProgressMeter() {
  const { percent } = useScrollPercent()
  const active = useActiveChapter()
  const currentChapter = chapters.find((c) => c.id === active) ?? chapters[0]

  // The build bar reaches 99% and stalls until the very bottom (contact), where it becomes 100%
  const isComplete = percent >= 96
  const displayBuild = isComplete ? 100 : Math.min(99, Math.floor((percent / 96) * 99))

  // Gauge needles are visual only — just a barely audible soft tick as the
  // meter moves (throttled so fast scrolls don't clatter).
  const lastTick = useRef(0)
  useEffect(() => {
    const now = performance.now()
    if (now - lastTick.current < 400) return
    lastTick.current = now
    soundManager.playGaugeTick()
  }, [displayBuild])

  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2 md:flex">
      {/* Percentage / Stalled joke */}
      <div className="flex items-baseline gap-1 font-mono text-xs font-bold tracking-hud">
        <span className={displayBuild === 100 ? 'text-caution' : 'text-bone'}>
          BUILD {displayBuild}%
        </span>
      </div>

      {/* Build Progress Bar */}
      <div className="h-36 w-[3px] bg-white/10 relative overflow-hidden">
        <div
          className="w-full bg-caution absolute top-0 left-0 transition-all duration-150"
          style={{ height: `${displayBuild}%` }}
        />
      </div>

      {/* Compiler Log Line */}
      <span className="font-screen text-sm text-ash max-w-[22ch] text-right leading-tight">
        {isComplete ? 'BUILD SUCCESSFUL' : currentChapter.log.split('...')[0]}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  03: SECTION RAIL                                                          */
/* -------------------------------------------------------------------------- */

export function SectionRail() {
  const active = useActiveChapter()

  return (
    <nav
      aria-label="Section tracker"
      className="pointer-events-none fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 xl:flex"
    >
      {chapters.map((chapter) => {
        const isActive = active === chapter.id
        return (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            onClick={(event) => {
              event.preventDefault()
              soundManager.playKeyClick()
              scrollToChapter(chapter.id)
            }}
            className="pointer-events-auto flex items-center gap-3"
          >
            <span
              className={`h-[2px] transition-all duration-300 ${
                isActive ? 'w-6 bg-caution' : 'w-2 bg-white/20'
              }`}
            />
            <span
              className={`font-mono text-[10px] tracking-hud transition-colors ${
                isActive ? 'text-caution font-bold' : 'text-ash/60 hover:text-ash'
              }`}
            >
              {chapter.code}
            </span>
            <span
              className={`font-mono text-[9px] uppercase tracking-hud transition-all duration-300 ${
                isActive
                  ? 'text-bone opacity-100 translate-x-0'
                  : 'text-ash opacity-0 -translate-x-1'
              }`}
            >
              {chapter.nav}
            </span>
          </a>
        )
      })}
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/*  04: CORNER TECH BRACKETS                                                  */
/* -------------------------------------------------------------------------- */

export function CornerBrackets() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-4 z-30 sm:inset-6">
      <span className="absolute left-0 top-0 font-mono text-[11px] text-caution/40 leading-none">
        +
      </span>
      <span className="absolute right-0 top-0 font-mono text-[11px] text-caution/40 leading-none">
        +
      </span>
      <span className="absolute bottom-0 left-0 font-mono text-[11px] text-caution/40 leading-none">
        +
      </span>
      <span className="absolute bottom-0 right-0 font-mono text-[11px] text-caution/40 leading-none">
        +
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  05: STATUS LINE FOOTER                                                    */
/* -------------------------------------------------------------------------- */

export function StatusLine() {
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-30 hidden border-t border-white/5 bg-base/80 px-8 py-2.5 backdrop-blur-sm sm:block">
      <div className="u-shell flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-caution animate-pulse" />
          <span className="font-mono text-[9px] uppercase tracking-hud text-ash">
            {site.availability}
          </span>
        </div>

        <div className="flex items-center gap-5">
          <span className="font-mono text-[9px] uppercase tracking-hud text-ash/70">
            {site.colophon}
          </span>
        </div>
      </div>
    </footer>
  )
}
