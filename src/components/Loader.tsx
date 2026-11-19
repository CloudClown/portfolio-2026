import { useEffect, useRef, useState } from 'react'
import { soundManager } from '../lib/ambient'

/**
 * 01 // PRELOADER: THE BOOT SEQUENCE
 *
 * The monitor's power-on ritual in a crisp bitmap/mono font:
 *   BIOS-style lines type out ("MEMORY TEST... OK", "LOADING PLANS... 99%") —
 *   then the counter STALLS at 99%. After a beat: "fine. I'll give it a push."
 *   and it jumps to 100% with a boot chime. The desk fades in.
 */

const BIOS_LINES: Array<{ text: string; delay: number; tone?: 'dim' | 'ok' | 'warn' }> = [
  { text: 'T-99 PHOSPHOR BIOS v3.70 — TAHMICRO SYSTEMS', delay: 240, tone: 'dim' },
  { text: 'COPYRIGHT (C) 1987-2025, NO RIGHTS RESERVED', delay: 160, tone: 'dim' },
  { text: '', delay: 260 },
  { text: 'DETECTING WORKSHOP .............. OK', delay: 320, tone: 'ok' },
  { text: 'MEMORY TEST ................. 640K OK', delay: 420, tone: 'ok' },
  { text: 'KEYBOARD ..................... FOUND', delay: 220, tone: 'ok' },
  { text: 'MUG ........................ 81% FULL', delay: 260, tone: 'ok' },
  { text: 'CABLES .................. 9 UNLABELED', delay: 240, tone: 'warn' },
  { text: '', delay: 300 },
  { text: 'LOADING PLANS ....', delay: 200 },
]

type Phase = 'bios' | 'counting' | 'stalled' | 'done'
type EntryChoice = 'sound' | 'silent'

const PREF_KEY = 'tahmid-sound-pref'

export function Loader({
  ready: _ready,
  onDone,
  onOpenQuickView,
}: {
  ready: boolean
  onDone: () => void
  onOpenQuickView?: () => void
}) {
  const [lines, setLines] = useState<string[]>([])
  const [display, setDisplay] = useState(0)
  const [phase, setPhase] = useState<Phase>('bios')
  const [gone, setGone] = useState(false)

  const phaseRef = useRef<Phase>('bios')
  const rafRef = useRef<number | null>(null)
  const pushRef = useRef<() => void>(() => {})

  /* ---------------------------------------------------------------- */
  /* Step 1: type the BIOS lines                                       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false
    let t = 0

    BIOS_LINES.forEach((line) => {
      t += line.delay
      window.setTimeout(() => {
        if (cancelled) return
        setLines((prev) => [...prev, line.text])
        if (line.text) soundManager.playKeyClick(0.8 + Math.random() * 0.3)
      }, t)
    })

    // After the last line, start counting
    window.setTimeout(() => {
      if (cancelled) return
      phaseRef.current = 'counting'
      setPhase('counting')
    }, t + 320)

    return () => {
      cancelled = true
    }
  }, [])

  /* ---------------------------------------------------------------- */
  /* Step 2: count 0 → 99 over ~1.4s, then stall                       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (phase !== 'counting') return
    const start = performance.now()

    const tick = (now: number) => {
      if (phaseRef.current !== 'counting') return

      const elapsed = (now - start) / 1000
      const raw = Math.min(99, Math.max(0, (elapsed / 1.4) * 99))
      const rounded = Math.floor(raw)
      setDisplay(rounded)

      if (rounded >= 99) {
        setDisplay(99)
        phaseRef.current = 'stalled'
        setPhase('stalled')
        return
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [phase])

  /* Step 2b: at the stall, hold the unresolved chord; auto-push after a beat */
  useEffect(() => {
    if (phase !== 'stalled') return
    soundManager.stallHold()
    const timer = window.setTimeout(() => pushRef.current(), 2600)
    return () => window.clearTimeout(timer)
  }, [phase])

  /* ---------------------------------------------------------------- */
  /* Step 3: push to 100% — resolve beat, then the entry choice         */
  /* ---------------------------------------------------------------- */
  pushRef.current = () => {
    if (phaseRef.current === 'done') return
    phaseRef.current = 'done'

    setDisplay(100)
    setPhase('done')
    // The pad resolves into a warm open chord with a soft bell — relief,
    // not a fanfare (only audible if sound is running).
    soundManager.resolveRelease()
  }

  /** Enter the workshop; the click itself starts the Web Audio context. */
  const enter = (choice: EntryChoice) => {
    try {
      localStorage.setItem(PREF_KEY, choice === 'sound' ? 'on' : 'off')
    } catch {
      /* private mode */
    }
    if (choice === 'sound') void soundManager.start()
    setGone(true)
    onDone()
  }

  /* Auto-enter (keeping any previous preference untouched) if untouched. */
  useEffect(() => {
    if (phase !== 'done') return
    const t = window.setTimeout(() => {
      setGone(true)
      onDone()
    }, 6000)
    return () => window.clearTimeout(t)
  }, [phase, onDone])

  if (gone) return null

  return (
    <aside
      aria-label="System boot loader"
      className="fixed inset-0 z-50 flex flex-col bg-base p-5 sm:p-10"
    >
      {/* CRT overlay layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 crt-scanlines"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255,212,0,0.045) 0%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3 font-screen text-[11px] uppercase tracking-hud text-ash">
          <span className="inline-block h-2 w-2 bg-caution animate-pulse" />
          <span>POST // COLD BOOT</span>
        </div>

        {onOpenQuickView && (
          <button
            type="button"
            onClick={() => {
              setGone(true)
              onDone()
              onOpenQuickView()
            }}
            className="border border-white/20 px-3 py-1.5 font-mono text-[9px] uppercase tracking-hud text-bone hover:border-caution hover:text-caution transition-colors"
          >
            [ SKIP // DIRECT TO DOSSIER ]
          </button>
        )}
      </div>

      {/* ── Screen centre: BIOS log + counter ── */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-3xl">
          {/* BIOS log */}
          <div className="font-screen text-[15px] sm:text-lg leading-[1.45] text-bone/85 min-h-[16rem] sm:min-h-[19rem]">
            {lines.map((line, i) => {
              const info = BIOS_LINES[i]
              const tone =
                info?.tone === 'ok'
                  ? 'text-bone'
                  : info?.tone === 'warn'
                    ? 'text-caution'
                    : info?.tone === 'dim'
                      ? 'text-ash'
                      : 'text-bone/85'
              return (
                <div key={i} className={tone}>
                  {line || '\u00A0'}
                </div>
              )
            })}
            {(phase === 'counting' || phase === 'stalled' || phase === 'done') && (
              <div className="text-caution">
                {display}%{phase !== 'done' && <span className="animate-pulse">▊</span>}
              </div>
            )}
          </div>

          {/* Giant counter */}
          <div className="mt-4 flex items-end justify-between gap-6">
            <div className="font-screen text-caution leading-none text-[clamp(4rem,14vw,11rem)] select-none">
              {display}
              <span className="text-[0.5em]">%</span>
            </div>

            {phase === 'stalled' && (
              <button
                type="button"
                onClick={() => pushRef.current()}
                className="mb-4 border border-caution bg-caution/10 px-5 py-2.5 font-screen text-xl text-caution hover:bg-caution hover:text-base transition-colors"
              >
                fine. I'll give it a push →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom status + entry choice ── */}
      <div className="relative z-10 flex flex-col gap-3">
        {phase === 'done' && (
          <div className="flex flex-wrap items-center justify-center gap-4 pb-2">
            <button
              type="button"
              onClick={() => enter('sound')}
              className="border border-caution bg-caution/10 px-6 py-2.5 font-screen text-xl text-caution hover:bg-caution hover:text-base transition-colors"
            >
              ENTER WITH SOUND
            </button>
            <button
              type="button"
              onClick={() => enter('silent')}
              className="border border-white/20 bg-white/[0.03] px-6 py-2.5 font-screen text-xl text-bone hover:border-caution hover:text-caution transition-colors"
            >
              ENTER SILENT
            </button>
          </div>
        )}

        <div className="flex justify-between font-mono text-[10px] text-ash tracking-hud uppercase">
          <span>boot device: /dev/desk0</span>
          <span>{display === 100 ? 'BUILD SUCCESSFUL' : 'LOADING PLANS'}</span>
        </div>
        <div className="h-1.5 w-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-caution"
            style={{ width: `${display}%`, transition: 'width 90ms linear' }}
          />
        </div>
      </div>
    </aside>
  )
}
