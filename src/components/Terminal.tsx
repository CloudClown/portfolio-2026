import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import { projects } from '../data/projects'
import { skillGroups } from '../data/skills'
import { soundManager } from '../lib/ambient'

/**
 * THE TERMINAL — a working command line on the CRT, with an always-visible
 * clickable alternative for visitors who don't want to type.
 *
 * Commands print real content: 3+ years experience, real projects with links,
 * email and GitHub. Output types out like a real terminal.
 */

type Line = { text: string; tone?: 'dim' | 'caution' | 'bright' }

const BANNER: Line[] = [
  { text: 'TAHMID-TERM v1.0 // phosphor build 99%', tone: 'dim' },
  { text: "type 'help' for commands — or just click one", tone: 'dim' },
]

function buildOutput(raw: string): Line[] {
  const cmd = raw.trim().toLowerCase()

  if (cmd === 'help' || cmd === '?') {
    return [
      { text: 'AVAILABLE COMMANDS', tone: 'caution' },
      { text: '  help            this list' },
      { text: '  ls projects     all shipped disks' },
      { text: '  cat about.txt   who I am' },
      { text: '  skills          the daily stack' },
      { text: '  contact         email / github / linkedin' },
      { text: '  hire --now      the direct approach' },
    ]
  }

  if (cmd === 'ls projects' || cmd === 'ls' || cmd === 'projects') {
    return [
      { text: `INSERTED DISKS: ${projects.length}`, tone: 'caution' },
      ...projects.map<Line>((p) => ({
        text: `  ${p.code}  ${p.title.padEnd(20, ' ')} ${p.status}  ${p.year}`,
        tone: p.status === 'SHIPPED' ? 'bright' : 'dim',
      })),
      { text: 'tip: click any disk in the scene (or the Projects section) to boot a case study', tone: 'dim' },
    ]
  }

  if (cmd === 'cat about.txt' || cmd === 'about' || cmd === 'cat about') {
    return [
      { text: 'ABOUT.TXT', tone: 'caution' },
      ...site.bio.map<Line>((b) => ({ text: b })),
      { text: `status: ${site.availability}`, tone: 'bright' },
    ]
  }

  if (cmd === 'skills' || cmd === 'cat skills') {
    return [
      { text: 'INSTALLED PACKAGES', tone: 'caution' },
      ...skillGroups.flatMap<Line>((g) => [
        { text: `[${g.name}]`, tone: 'dim' },
        ...g.skills.map<Line>((s) => ({
          text: `  ${s.name.padEnd(14, ' ')} ${s.level}`,
          tone: 'bright',
        })),
      ]),
    ]
  }

  if (cmd === 'contact' || cmd === 'cat contact') {
    return [
      { text: 'CONTACT ROUTES', tone: 'caution' },
      { text: `  email     ${site.email}`, tone: 'bright' },
      { text: `  github    ${site.github}` },
      { text: `  linkedin  ${site.linkedin}` },
      { text: site.replyTimeJoke, tone: 'dim' },
    ]
  }

  if (cmd === 'hire --now' || cmd === 'hire' || cmd === 'hire-now') {
    return [
      { text: 'EXECUTING hire --now ...', tone: 'caution' },
      { text: '  3+ years production React / Next.js / TypeScript: CONFIRMED' },
      { text: '  5 live applications: CONFIRMED' },
      { text: '  compiles under pressure, ships on time: CONFIRMED' },
      { text: `  → email ${site.email} — I reply fast.`, tone: 'caution' },
      { text: 'build 100%. offer accepted. (jk — your move.)', tone: 'dim' },
    ]
  }

  if (cmd === '') return []

  return [
    { text: `${raw}: command not found`, tone: 'caution' },
    { text: "try 'help'", tone: 'dim' },
  ]
}

const CLICKABLE = ['help', 'ls projects', 'cat about.txt', 'skills', 'contact', 'hire --now']

export function Terminal() {
  const [history, setHistory] = useState<Line[]>(BANNER)
  const [typed, setTyped] = useState<Line[] | null>(null) // output being typed
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to the bottom as output lands
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [history, typed])

  /** Print output with real-terminal typing feel: line by line. */
  const run = (raw: string) => {
    if (busy) return
    soundManager.playKeyClick(1.1)
    setBusy(true)
    setHistory((h) => [...h, { text: `> ${raw}`, tone: 'caution' }])

    const out = buildOutput(raw)
    setTyped([])
    out.forEach((line, i) => {
      window.setTimeout(() => {
        setTyped((prev) => [...(prev ?? []), line])
        soundManager.playKeyClick(0.7 + Math.random() * 0.2)
        if (i === out.length - 1) {
          window.setTimeout(() => {
            // Swap the typed preview into history and free the cursor
            setHistory((h) => [...h, ...out])
            setTyped(null)
            setBusy(false)
          }, 140)
        }
      }, 60 + i * 55)
    })
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const raw = input
    setInput('')
    run(raw)
  }

  return (
    <div
      className="pointer-events-auto relative overflow-hidden border border-caution/40 bg-[#060607]"
      data-interactive
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-1.5">
        <span className="font-mono text-[9px] uppercase tracking-hud text-ash">
          /dev/crt0 — guest@tahmid
        </span>
        <span className="flex gap-1.5">
          <span className="h-2 w-2 bg-caution/70" />
          <span className="h-2 w-2 bg-white/20" />
        </span>
      </div>

      {/* Clickable commands — for visitors who don't type */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 px-3 py-2.5">
        {CLICKABLE.map((cmd) => (
          <button
            key={cmd}
            type="button"
            disabled={busy}
            onClick={() => run(cmd)}
            className="border border-white/15 bg-white/[0.03] px-2.5 py-1 font-screen text-base text-bone hover:border-caution hover:text-caution transition-colors disabled:opacity-40"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Output viewport */}
      <div
        ref={scrollRef}
        className="crt-scanlines relative h-[280px] overflow-y-auto px-3 py-3 font-screen text-lg leading-[1.4]"
        data-lenis-prevent
      >
        {history.map((line, i) => (
          <div
            key={i}
            className={
              line.tone === 'caution'
                ? 'text-caution'
                : line.tone === 'dim'
                  ? 'text-ash'
                  : line.tone === 'bright'
                    ? 'text-bone'
                    : 'text-bone/85 whitespace-pre'
            }
          >
            {line.text || '\u00A0'}
          </div>
        ))}

        {typed?.map((line, i) => (
          <div
            key={`t${i}`}
            className={
              line.tone === 'caution'
                ? 'text-caution'
                : line.tone === 'dim'
                  ? 'text-ash'
                  : line.tone === 'bright'
                    ? 'text-bone'
                    : 'text-bone/85 whitespace-pre'
            }
          >
            {line.text || '\u00A0'}
          </div>
        ))}
        {typed && <span className="animate-pulse text-caution">▊</span>}
      </div>

      {/* Input line */}
      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-white/10 px-3 py-2">
        <span className="font-screen text-lg text-caution">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={() => soundManager.playKeyClick(1.3)}
          spellCheck={false}
          autoComplete="off"
          aria-label="Terminal command input"
          placeholder="type a command… (help)"
          className="w-full bg-transparent font-screen text-lg text-bone placeholder:text-ash/50 focus:outline-none"
        />
      </form>
    </div>
  )
}
