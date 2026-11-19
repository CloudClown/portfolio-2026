import { useEffect, useRef, useState } from 'react'
import { soundManager } from '../lib/ambient'

const PREF_KEY = 'tahmid-sound-pref'
const REDUCED_QUERY = '(prefers-reduced-motion: reduce)'

/**
 * THE MINI PLAYER — retro cassette/CRT widget, corner-mounted, collapsible.
 *
 * - Collapsed: a small tape control in the corner at all times
 * - Expanded: play/pause, next track, volume, tiny equalizer and a
 *   "NOW PLAYING" line in mono type
 * - Sharp rectangles, black + caution yellow, thin borders
 * - Fully keyboard accessible with aria-labels
 * - Sound starts only after an explicit click (preloader entry or this
 *   control); the choice is remembered; silent default under
 *   prefers-reduced-motion
 */
export function MiniPlayer() {
  const [state, setState] = useState<'off' | 'armed' | 'on'>(() => {
    if (typeof window === 'undefined') return 'off'
    if (window.matchMedia(REDUCED_QUERY).matches) return 'off'
    try {
      return localStorage.getItem(PREF_KEY) === 'on' ? 'armed' : 'off'
    } catch {
      return 'off'
    }
  })
  const [expanded, setExpanded] = useState(false)
  const [volume, setVolume] = useState(() => soundManager.getMusicVolume())
  const [title, setTitle] = useState(() => soundManager.nowPlaying.title)
  const barsRef = useRef<Array<HTMLSpanElement | null>>([])

  /* Armed: the visitor chose ON before — wake on the first gesture. */
  useEffect(() => {
    if (state !== 'armed') return

    const wake = () => {
      void soundManager.start()
    }
    window.addEventListener('pointerdown', wake, { once: true })
    window.addEventListener('keydown', wake, { once: true })

    return () => {
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('keydown', wake)
    }
  }, [state])

  /* Sync with the manager: sound may also start via the preloader entry. */
  useEffect(
    () =>
      soundManager.subscribe(() => {
        setState((prev) => {
          if (soundManager.isPlaying) {
            setTitle(soundManager.nowPlaying.title)
            return 'on'
          }
          return prev === 'on' ? 'off' : prev
        })
      }),
    [],
  )

  /* Tiny equalizer — analyser data, direct DOM writes, no re-renders. */
  useEffect(() => {
    if (state !== 'on') return
    let raf = 0
    const tick = () => {
      const levels = soundManager.getLevels(barsRef.current.length)
      barsRef.current.forEach((el, i) => {
        if (el) el.style.height = `${2 + (levels[i] ?? 0) * 12}px`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      barsRef.current.forEach((el) => {
        if (el) el.style.height = '2px'
      })
    }
  }, [state])

  /* Keep the NOW PLAYING line fresh on track changes. */
  useEffect(() => {
    const id = window.setInterval(() => {
      const t = soundManager.nowPlaying.title
      setTitle((prev) => (prev === t ? prev : t))
    }, 4000)
    return () => window.clearInterval(id)
  }, [])

  const toggle = () => {
    if (window.matchMedia(REDUCED_QUERY).matches && state === 'off') {
      // Reduced motion defaults to silent — an explicit click opts in.
      try {
        localStorage.setItem(PREF_KEY, 'on')
      } catch {
        /* private mode */
      }
      void soundManager.start()
      setState('on')
      return
    }

    if (state === 'on') {
      soundManager.stop()
      try {
        localStorage.setItem(PREF_KEY, 'off')
      } catch {
        /* private mode */
      }
      setState('off')
      return
    }

    // off → on (also resolves the armed state explicitly)
    try {
      localStorage.setItem(PREF_KEY, 'on')
    } catch {
      /* private mode */
    }
    void soundManager.start()
    setState('on')
  }

  const onVolume = (v: number) => {
    setVolume(v)
    soundManager.setMusicVolume(v)
  }

  const label = state === 'on' ? 'SOUND: ON' : 'SOUND: OFF'

  return (
    <div className="fixed bottom-5 left-5 z-30 flex flex-col items-start gap-2">
      {/* ── Expanded panel: cassette deck ── */}
      {expanded && state === 'on' && (
        <div
          className="crt-window w-[240px] border border-caution/50 p-3"
          role="group"
          aria-label="Music mini player"
        >
          {/* Tape window + EQ */}
          <div className="flex items-center gap-3 border border-white/10 bg-black/60 p-2">
            {/* Tape reels */}
            <span aria-hidden className="flex gap-1.5">
              {[0, 1].map((r) => (
                <span
                  key={r}
                  className="block h-4 w-4 rounded-full border border-caution/70 animate-spin"
                  style={{ animationDuration: '3.2s', animationTimingFunction: 'linear' }}
                />
              ))}
            </span>
            {/* EQ bars */}
            <span aria-hidden className="ml-auto flex h-3.5 items-end gap-[2px]">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  ref={(el) => {
                    barsRef.current[i] = el
                  }}
                  className="block w-[2px] bg-caution"
                  style={{ height: '2px' }}
                />
              ))}
            </span>
          </div>

          {/* NOW PLAYING */}
          <div className="mt-2 truncate font-screen text-base text-caution" aria-live="polite">
            NOW PLAYING: {title}
          </div>

          {/* Controls */}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={state === 'on' ? 'Pause music' : 'Play music'}
              className="border border-white/20 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-bone hover:border-caution hover:text-caution transition-colors"
            >
              {state === 'on' ? '⏸ PAUSE' : '▶ PLAY'}
            </button>
            <button
              type="button"
              onClick={() => soundManager.nextTrack()}
              aria-label="Next track"
              className="border border-white/20 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-bone hover:border-caution hover:text-caution transition-colors"
            >
              ⏭ NEXT
            </button>
          </div>

          {/* Volume */}
          <label className="mt-3 flex items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-hud text-ash">VOL</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolume(Number(e.target.value))}
              aria-label="Music volume"
              className="h-1 w-full appearance-none bg-white/15 accent-[#FFD400]"
            />
          </label>

          {/* Collapse */}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Collapse mini player"
            className="mt-3 w-full border border-white/10 py-1 font-mono text-[9px] uppercase tracking-hud text-ash hover:border-caution hover:text-caution transition-colors"
          >
            [ — COLLAPSE ]
          </button>
        </div>
      )}

      {/* ── Collapsed: small corner control ── */}
      <button
        type="button"
        onClick={() => {
          if (state === 'on') setExpanded((v) => !v)
          else toggle()
        }}
        aria-pressed={state === 'on'}
        aria-label={`${label} — lo-fi playlist, quiet night room. ${state === 'on' ? 'Expand player' : 'Turn sound on'}`}
        title={`"${soundManager.nowPlaying.title}" — lo-fi, in-browser synth. Starts only on your click.`}
        className={`flex items-center gap-2.5 border px-3 py-2 backdrop-blur-sm transition-colors ${
          state === 'on'
            ? 'border-caution/50 bg-base/85 hover:border-caution'
            : 'border-white/15 bg-base/80 hover:border-caution/50'
        }`}
      >
        {/* Tape icon */}
        <span aria-hidden className="flex h-3.5 items-center gap-[3px]">
          {[0, 1].map((r) => (
            <span
              key={r}
              className={`block h-2.5 w-2.5 rounded-full border ${
                state === 'on' ? 'border-caution animate-spin' : 'border-ash/50'
              }`}
              style={{ animationDuration: '3.2s', animationTimingFunction: 'linear' }}
            />
          ))}
        </span>
        <span
          className={`font-mono text-[10px] font-bold uppercase tracking-hud transition-colors ${
            state === 'on' ? 'text-caution' : 'text-ash group-hover:text-bone'
          }`}
        >
          {label}
        </span>
      </button>
    </div>
  )
}
