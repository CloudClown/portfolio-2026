import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import { projects } from '../data/projects'
import { skills } from '../data/skills'
import { experiences } from '../data/journey'
import { lockScroll, unlockScroll } from '../lib/lenis'
import { soundManager } from '../lib/ambient'

/**
 * Direct Recruiter Dossier Modal:
 * Instant 1-click access to everything a hiring manager or recruiter needs within 3 seconds:
 * - 3+ years experience summary
 * - SJ Innovation (2024–2025) & Console-IT (2023–2024)
 * - All 5 projects with direct live & GitHub links
 * - Production skills matrix
 * - Direct contact with one-click email copy
 */
export function RecruiterDossier({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    lockScroll()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      unlockScroll()
    }
  }, [open, onClose])

  if (!open) return null

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(site.email)
    setCopied(true)
    soundManager.playKeyClick(1.3)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="recruiter-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
    >
      {/* Dark backdrop */}
      <div
        onClick={() => {
          soundManager.playKeyClick(0.9)
          onClose()
        }}
        className="fixed inset-0 bg-base/90 backdrop-blur-md"
      />

      <div
        ref={panelRef}
        className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-white/10 bg-graphite p-6 sm:p-10 shadow-2xl outline-none"
        data-lenis-prevent
        tabIndex={0}
      >
        {/* Top Hazard Tape Ribbon */}
        <div className="hazard-tape-sm h-2.5 w-full mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <span className="todo-tag">EXECUTIVE SUMMARY</span>
            <h2 id="recruiter-title" className="font-display mt-2 text-2xl sm:text-4xl font-bold text-bone">
              {site.name} — {site.role}
            </h2>
            <p className="font-mono text-xs text-caution mt-1">
              {site.availability} // {site.yearsExperience} YEARS PRODUCTION EXP
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playKeyClick(0.9)
              onClose()
            }}
            className="border border-white/20 bg-white/[0.04] px-3.5 py-1.5 font-mono text-xs uppercase tracking-hud text-bone hover:border-caution hover:text-caution"
          >
            [ ESC ]
          </button>
        </div>

        {/* Quick Contact Action Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-4 bg-base/70 p-4 border border-white/10">
          <a
            href={`mailto:${site.email}`}
            className="border border-caution bg-caution px-4 py-2 font-mono text-xs font-bold uppercase tracking-hud text-base hover:bg-caution-muted"
          >
            Email Directly: {site.email}
          </a>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="border border-white/20 bg-white/[0.04] px-4 py-2 font-mono text-xs uppercase tracking-hud text-bone hover:border-caution hover:text-caution"
          >
            {copied ? '✓ COPIED TO CLIPBOARD' : 'COPY EMAIL ADDRESS'}
          </button>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-ash hover:text-caution underline ml-auto"
          >
            GitHub Profile ↗
          </a>
        </div>

        {/* Verified Work Experience */}
        <div className="mt-8">
          <span className="font-mono text-[10px] uppercase tracking-hud text-ash font-bold">
            01 // PROFESSIONAL COMMIT LOG
          </span>
          <div className="mt-4 space-y-4">
            {experiences.map((exp) => (
              <div key={exp.company} className="border border-white/10 bg-base/50 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display text-base font-bold text-bone">
                    {exp.company} — <span className="text-caution">{exp.role}</span>
                  </span>
                  <span className="font-mono text-xs text-ash">{exp.period}</span>
                </div>
                <p className="mt-2 text-xs text-bone leading-relaxed">
                  {exp.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipped Applications */}
        <div className="mt-8">
          <span className="font-mono text-[10px] uppercase tracking-hud text-ash font-bold">
            02 // PRODUCTION APPLICATIONS (5 LIVE)
          </span>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div key={proj.id} className="border border-white/10 bg-base/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-base font-bold text-bone">
                    {proj.title}
                  </span>
                  <span className={proj.status === 'SHIPPED' ? 'chip-shipped' : 'chip-cooking'}>
                    {proj.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ash">
                  {proj.blurb}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {proj.stack.slice(0, 3).map((s) => (
                    <span key={s} className="border border-white/10 px-2 py-0.5 font-mono text-[9px] text-bone">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-4 font-mono text-[10px]">
                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-caution hover:underline"
                    >
                      Live App ↗
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ash hover:text-bone underline"
                    >
                      GitHub Source ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mt-8">
          <span className="font-mono text-[10px] uppercase tracking-hud text-ash font-bold">
            03 // TECHNICAL SKILLS
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs text-bone"
              >
                <span className="text-caution mr-1.5">{skill.stampedMark}</span>
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
