import { useEffect, useRef, useState } from 'react'
import type { Project } from '../data/projects'
import { projects } from '../data/projects'
import { lockScroll, unlockScroll } from '../lib/lenis'
import { soundManager } from '../lib/ambient'

/**
 * Full-Screen Case Study Modal: "RETRO COMPUTING SOUL"
 * Inserting a disk boots its case study on the CRT: a short seek/boot beat,
 * then the real content on a phosphor window — problem, solution, verified
 * metrics, stack, live + GitHub links.
 */
const BOOT_LINES = [
  'INSERTING DISK ............ OK',
  'SEEK TRACK 0 .............. OK',
  'MOUNTING CASE STUDY ....... OK',
]
export function ProjectModal({
  project,
  onClose,
  onNavigate,
}: {
  project: Project | null
  onClose: () => void
  onNavigate: (project: Project) => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [visible, setVisible] = useState(false)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    if (!project) {
      setVisible(false)
      setBooted(false)
      return
    }

    lockScroll()
    const raf = requestAnimationFrame(() => setVisible(true))
    const bootTimer = window.setTimeout(() => setBooted(true), 950)
    const focusTimer = window.setTimeout(() => closeButton.current?.focus(), 60)

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(bootTimer)
      window.clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKeyDown)
      unlockScroll()
    }
  }, [project, onClose])

  if (!project) return null

  const isShipped = project.status === 'SHIPPED'
  const currentIndex = projects.findIndex((p) => p.id === project.id)
  const prevProject = projects[(currentIndex - 1 + projects.length) % projects.length]
  const nextProject = projects[(currentIndex + 1) % projects.length]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-study-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Dark Studio Backdrop */}
      <div
        onClick={() => {
          soundManager.playKeyClick(0.9)
          onClose()
        }}
        className="fixed inset-0 bg-base/90 backdrop-blur-md"
      />

      {/* Case Study Card: a CRT window */}
      <div
        ref={panel}
        className="crt-window relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto border border-caution/40 p-6 sm:p-10 shadow-2xl transition-transform duration-300"
        data-lenis-prevent
      >
        {/* CRT scanline mask */}
        <div aria-hidden className="crt-scanlines pointer-events-none absolute inset-0 opacity-60" />

        {/* Top Hazard Tape Ribbon */}
        <div className="hazard-tape-sm h-2.5 w-full mb-6" />

        {/* Disk boot beat */}
        {!booted && (
          <div className="py-24 font-screen text-xl text-caution sm:text-2xl">
            {BOOT_LINES.map((l, i) => (
              <div key={i} style={{ animationDelay: `${i * 200}ms` }} className="animate-pulse">
                {l}
              </div>
            ))}
            <div className="mt-2 animate-pulse">LOADING {project.title.toUpperCase()} ▊</div>
          </div>
      )}

      {booted && (
        <>
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ash tracking-hud uppercase">
              {project.code}
            </span>
            <span className={isShipped ? 'chip-shipped' : 'chip-cooking'}>
              {isShipped ? '● SHIPPED' : '○ STILL COOKING'}
            </span>
          </div>

          <button
            ref={closeButton}
            type="button"
            onClick={() => {
              soundManager.playKeyClick(0.9)
              onClose()
            }}
            className="border border-white/20 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-hud text-bone hover:border-caution hover:text-caution transition-colors"
          >
            [ CLOSE ESC ]
          </button>
        </div>

        {/* Project Title & Role */}
        <div className="mt-6">
          <span className="font-mono text-xs uppercase tracking-hud text-caution">
            {project.role} // {project.year}
          </span>
          <h2 id="case-study-title" className="font-display mt-2 text-3xl sm:text-5xl font-bold tracking-tight text-bone">
            {project.title}
          </h2>
          <p className="mt-3 text-base text-ash max-w-2xl">
            {project.blurb}
          </p>
        </div>

        {/* The Problem & The Solution */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-white/10 bg-base/60 p-5">
            <span className="font-mono text-[10px] uppercase tracking-hud text-caution font-bold">
              01 // THE BOTTLENECK / PROBLEM
            </span>
            <p className="mt-3 text-sm text-bone leading-relaxed">
              {project.problem}
            </p>
          </div>

          <div className="border border-white/10 bg-base/60 p-5">
            <span className="font-mono text-[10px] uppercase tracking-hud text-caution font-bold">
              02 // ARCHITECTURE & WHAT I BUILT
            </span>
            <p className="mt-3 text-sm text-bone leading-relaxed">
              {project.solution}
            </p>
          </div>
        </div>

        {/* Verified Metrics */}
        <div className="mt-8">
          <span className="font-mono text-[10px] uppercase tracking-hud text-ash">
            VERIFIED PRODUCTION METRICS
          </span>
          <div className="mt-3 grid grid-cols-3 gap-4 border-y border-white/10 py-5">
            {project.metrics.map((m) => (
              <div key={m.label}>
                <div className="font-display text-2xl sm:text-4xl font-extrabold text-caution">
                  {m.value}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-hud text-ash mt-1">
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-6 flex flex-wrap gap-2">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] text-bone"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* External Links */}
        <div className="mt-8 flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-caution bg-caution px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-hud text-base hover:bg-caution-muted transition-colors"
            >
              Examine Live Application →
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 bg-white/[0.04] px-5 py-2.5 font-mono text-xs uppercase tracking-hud text-bone hover:border-caution hover:text-caution transition-colors"
            >
              Inspect GitHub Source ↗
            </a>
          )}
        </div>

        {/* Bottom Pagination */}
        <div className="mt-8 flex justify-between border-t border-white/10 pt-4 font-mono text-[10px] text-ash">
          <button
            type="button"
            onClick={() => {
              soundManager.playKeyClick(1.1)
              onNavigate(prevProject)
            }}
            className="hover:text-caution"
          >
            ← PREV: {prevProject.title}
          </button>
          <button
            type="button"
            onClick={() => {
              soundManager.playKeyClick(1.1)
              onNavigate(nextProject)
            }}
            className="hover:text-caution"
          >
            NEXT: {nextProject.title} →
          </button>
        </div>
        </>
      )}
      </div>
    </div>
  )
}
