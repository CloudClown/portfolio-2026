import { useRef } from 'react'
import { chapters, site } from '../data/site'
import { projects, type Project } from '../data/projects'
import { skillGroups } from '../data/skills'
import { experiences, stickyNotes } from '../data/journey'
import { aiWorkflow } from '../data/aiTools'
import { scrollToChapter } from '../lib/lenis'
import { useSectionReveal } from '../hooks/useSectionReveal'
import { soundManager } from '../lib/ambient'
import { musicCredit } from '../lib/playlist'
import { Terminal } from './Terminal'

const chapter = (id: string) => chapters.find((c) => c.id === id)!

function SectionMarker({ id }: { id: string }) {
  const c = chapter(id)
  return (
    <div className="flex flex-wrap items-center gap-3" data-fade>
      <span className="todo-tag">{c.code} // {c.label}</span>
      <span className="font-screen text-base text-ash">
        {c.log}
      </span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  01: HERO — THE CRT DESK                                                   */
/* -------------------------------------------------------------------------- */

export function HeroSection({
  enabled,
  onOpenQuickView,
}: {
  enabled: boolean
  onOpenQuickView?: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  useSectionReveal(ref, enabled)

  return (
    <section
      id="hero"
      data-chapter="hero"
      ref={ref}
      aria-labelledby="hero-title"
      className="relative min-h-[140vh]"
    >
      <div className="sticky top-0 flex min-h-screen items-center">
        {/* Readability gradient over the left third (never over the tube) */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base/95 via-base/60 to-transparent" />

        <div className="u-shell relative z-10 w-full pt-16 pb-12">
          <SectionMarker id="hero" />

          {/* Name + role: 5-second clarity */}
          <div className="mt-6 flex flex-wrap items-center gap-3" data-fade>
            <span className="chip-shipped font-bold">BOOT: OK</span>
            <span className="font-screen text-xl text-caution">
              TAHMID — FRONTEND DEVELOPER // {site.yearsExperience} YRS
            </span>
          </div>

          <h1
            id="hero-title"
            className="font-display mt-4 text-[clamp(2.8rem,8.5vw,7.5rem)] font-extrabold tracking-tightest text-bone leading-[0.95]"
          >
            {site.tagline}
          </h1>

          <p className="mt-4 max-w-xl font-mono text-xs sm:text-sm text-ash leading-relaxed" data-fade>
            {site.subtagline} {site.intro}
          </p>

          {/* CTAs */}
          <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-4" data-fade>
            <button
              type="button"
              onClick={() => {
                soundManager.playKeyClick(1.2)
                scrollToChapter('projects')
              }}
              className="border border-caution bg-caution px-6 py-3 font-mono text-xs font-bold uppercase tracking-hud text-base hover:bg-caution-muted transition-colors shadow-lg"
            >
              [ INSERT DISK // VIEW WORK ↓ ]
            </button>

            {onOpenQuickView && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playKeyClick(1.0)
                  onOpenQuickView()
                }}
                className="border border-white/20 bg-white/[0.04] px-5 py-3 font-mono text-xs uppercase tracking-hud text-bone hover:border-caution hover:text-caution transition-colors backdrop-blur-sm"
              >
                [ RECRUITER DOSSIER ]
              </button>
            )}
          </div>

          {/* Proof badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 pt-6 max-w-3xl" data-fade>
            {site.stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl sm:text-3xl font-bold text-bone">
                  {s.value}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-hud text-ash mt-0.5">
                  {s.label}
                </div>
                <div className="font-screen text-base text-caution/80">
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  02: ABOUT — COMMIT LOG                                                    */
/* -------------------------------------------------------------------------- */

export function AboutSection({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useSectionReveal(ref, enabled)

  return (
    <section
      id="about"
      data-chapter="about"
      ref={ref}
      aria-labelledby="about-title"
      className="relative min-h-[140vh]"
    >
      <div className="sticky top-0 flex min-h-screen items-center py-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base/95 via-base/70 to-transparent" />

        <div className="u-shell relative z-10 w-full">
          <SectionMarker id="about" />

          <h2
            id="about-title"
            className="font-display mt-4 text-3xl sm:text-6xl font-bold tracking-tight text-bone"
            data-reveal
          >
            cat experience.log
          </h2>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Real verified roles */}
            <div className="lg:col-span-7 space-y-4">
              <span className="font-mono text-[10px] uppercase tracking-hud text-caution font-bold" data-fade>
                PROVEN EXPERIENCE // NO JOKES IN THIS BLOCK
              </span>

              {experiences.map((exp) => (
                <div
                  key={exp.company}
                  className="card-workshop card-workshop-hover p-5 border border-white/10"
                  data-fade
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/5 pb-2">
                    <span className="font-display text-lg font-bold text-bone">
                      {exp.company}
                    </span>
                    <span className="font-mono text-xs text-caution font-semibold">
                      {exp.role} ({exp.period})
                    </span>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-bone/90 leading-relaxed">
                    {exp.summary}
                  </p>

                  <ul className="mt-3 space-y-1 font-mono text-[11px] text-ash">
                    {exp.deliverables.map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-caution">&gt;</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>

                  {exp.crossedOutJoke && (
                    <div className="mt-3 pt-2 border-t border-white/5 font-hand text-base text-ash/70">
                      {exp.crossedOutJoke}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sticky notes (handwritten) */}
            <div className="lg:col-span-5 space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-hud text-ash font-bold" data-fade>
                PINNED TO THE BEZEL
              </span>

              <div className="grid grid-cols-1 gap-2.5" data-fade>
                {stickyNotes.map((note, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-3 border p-3 ${
                      note.crossed
                        ? 'border-white/5 bg-clay/40'
                        : 'border-caution/30 bg-clay-light/80'
                    }`}
                    style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)` }}
                  >
                    <span
                      className={`font-hand text-xl ${
                        note.crossed ? 'text-ash/60 line-through' : 'text-bone'
                      }`}
                    >
                      {note.text}
                    </span>
                    <span
                      className={`shrink-0 font-mono text-[9px] uppercase px-1.5 py-0.5 ${
                        note.crossed ? 'bg-base text-ash/40' : 'bg-caution text-base font-bold'
                      }`}
                    >
                      {note.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  03: SKILLS — INSTALLED PACKAGES                                           */
/* -------------------------------------------------------------------------- */

export function SkillsSection({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useSectionReveal(ref, enabled)

  return (
    <section
      id="skills"
      data-chapter="skills"
      ref={ref}
      aria-labelledby="skills-title"
      className="relative min-h-[140vh]"
    >
      <div className="sticky top-0 flex min-h-screen items-center py-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base/95 via-base/70 to-transparent" />

        <div className="u-shell relative z-10 w-full">
          <SectionMarker id="skills" />

          <div className="flex flex-wrap items-baseline justify-between gap-4 mt-4">
            <h2
              id="skills-title"
              className="font-display text-3xl sm:text-6xl font-bold tracking-tight text-bone"
              data-reveal
            >
              Installed Packages.
            </h2>
            <span className="font-screen text-lg text-caution" data-fade>
              [ WIREFRAME PARTS IN THE WORLD — FLICK TO INSPECT ]
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {skillGroups.map((group) => (
              <div key={group.name} className="card-workshop p-5 border border-white/10" data-fade>
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <span className="h-2 w-2 bg-caution" />
                  <span className="font-mono text-xs font-bold uppercase tracking-hud text-bone">
                    {group.name}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {group.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="group border border-white/5 bg-base/50 p-3 hover:border-caution/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-bone group-hover:text-caution transition-colors">
                          <span className="text-caution mr-2">{skill.stampedMark}</span>
                          {skill.name}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-hud text-ash">
                          {skill.level}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-ash leading-relaxed">
                        {skill.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  04: PROJECTS — THE DISK LIBRARY                                           */
/* -------------------------------------------------------------------------- */

export function ProjectsSection({
  enabled,
  onOpenProject,
}: {
  enabled: boolean
  onOpenProject: (project: Project) => void
}) {
  const ref = useRef<HTMLElement>(null)
  useSectionReveal(ref, enabled)

  return (
    <section
      id="projects"
      data-chapter="projects"
      ref={ref}
      aria-labelledby="projects-title"
      className="relative min-h-[160vh]"
    >
      <div className="sticky top-0 flex min-h-screen items-center py-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base/95 via-base/75 to-transparent" />

        <div className="u-shell relative z-10 w-full">
          <SectionMarker id="projects" />

          <div className="flex flex-wrap items-baseline justify-between gap-4 mt-4">
            <h2
              id="projects-title"
              className="font-display text-3xl sm:text-6xl font-bold tracking-tight text-bone"
              data-reveal
            >
              The Disk Library.
            </h2>
            <span className="font-screen text-lg text-caution" data-fade>
              {projects.length} DISKS INSERTED // CLICK TO BOOT A CASE STUDY
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => {
              const isShipped = proj.status === 'SHIPPED'
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    soundManager.playUITone()
                    window.setTimeout(() => onOpenProject(proj), 200)
                  }}
                  onMouseEnter={() => soundManager.playHoverTone()}
                  className="card-workshop card-workshop-hover p-5 border border-white/10 cursor-pointer pointer-events-auto group"
                  data-fade
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-mono text-xs text-ash tracking-hud uppercase">
                      {proj.code}
                    </span>
                    <span className={isShipped ? 'chip-shipped' : 'chip-cooking'}>
                      {isShipped ? '● SHIPPED' : '○ STILL COOKING'}
                    </span>
                  </div>

                  <h3 className="font-display mt-4 text-xl sm:text-2xl font-bold text-bone group-hover:text-caution transition-colors">
                    {proj.title}
                  </h3>

                  <p className="mt-2 text-xs text-ash line-clamp-2">
                    {proj.blurb}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {proj.stack.slice(0, 3).map((s) => (
                      <span key={s} className="border border-white/10 bg-base/50 px-2 py-0.5 font-mono text-[9px] text-bone">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 flex items-center justify-between pt-3 border-t border-white/5 font-mono text-[10px]">
                    <span className="text-caution group-hover:underline">
                      Insert disk → boot case study
                    </span>
                    <span className="text-ash">{proj.year}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  05: AI WORKFLOW + THE TERMINAL                                            */
/* -------------------------------------------------------------------------- */

export function AIWorkflowSection({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useSectionReveal(ref, enabled)

  return (
    <section
      id="ai-workflow"
      data-chapter="ai-workflow"
      ref={ref}
      aria-labelledby="ai-title"
      className="relative min-h-[160vh]"
    >
      <div className="sticky top-0 flex min-h-screen items-center py-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base/95 via-base/70 to-transparent" />

        <div className="u-shell relative z-10 w-full">
          <SectionMarker id="ai-workflow" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
            {/* Left: the philosophy */}
            <div>
              <h2
                id="ai-title"
                className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-bone"
                data-reveal
              >
                {aiWorkflow.headline}
              </h2>

              <p className="mt-3 font-screen text-2xl text-caution" data-fade>
                {aiWorkflow.subheadline}
              </p>

              <p className="mt-3 font-mono text-xs text-ash max-w-xl leading-relaxed" data-fade>
                {aiWorkflow.philosophy}
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {aiWorkflow.tools.map((tool) => (
                  <div key={tool.id} className="card-workshop p-4 border border-white/10" data-fade>
                    <span className="todo-tag">{tool.name}</span>
                    <div className="font-mono text-xs text-caution mt-2 font-semibold">
                      {tool.role}
                    </div>
                    <p className="mt-2 text-xs text-bone/90 leading-relaxed">
                      {tool.usage}
                    </p>
                    <div className="mt-3 pt-2 border-t border-white/5 font-mono text-[10px] text-ash">
                      {tool.verdict}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: the working terminal */}
            <div data-fade>
              <div className="mb-3 flex items-center justify-between">
                <span className="font-stencil text-2xl font-black uppercase tracking-wide text-caution">
                  HAZARD: LIVE TERMINAL
                </span>
                <span className="font-mono text-[10px] uppercase tracking-hud text-ash">
                  real content · type or click
                </span>
              </div>
              <Terminal />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/*  06: CONTACT — BUILD SUCCESSFUL                                            */
/* -------------------------------------------------------------------------- */

export function ContactSection({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLElement>(null)
  useSectionReveal(ref, enabled)

  return (
    <section
      id="contact"
      data-chapter="contact"
      ref={ref}
      aria-labelledby="contact-title"
      className="relative min-h-[130vh]"
    >
      <div className="sticky top-0 flex min-h-screen items-center py-16">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-base/95 via-base/75 to-transparent" />

        <div className="u-shell relative z-10 w-full">
          {/* Hazard tape divider */}
          <div className="hazard-tape h-4 w-full mb-8 shadow-lg" data-fade />

          <SectionMarker id="contact" />

          <div className="mt-4 flex flex-wrap items-center gap-3" data-fade>
            <span className="chip-shipped font-bold">BUILD 100% SUCCESSFUL</span>
            <span className="font-screen text-lg text-caution">
              0 ERRORS // 0 RUNTIME EXCUSES
            </span>
          </div>

          <h2
            id="contact-title"
            className="font-display mt-4 text-4xl sm:text-7xl font-extrabold tracking-tightest text-bone leading-tight"
            data-reveal
          >
            BUILD SUCCESSFUL.
            <br />
            <span className="text-caution">This one I actually finished.</span>
          </h2>

          <p className="mt-4 font-mono text-xs sm:text-sm text-ash max-w-xl" data-fade>
            {site.replyTimeJoke} Let's build something exceptional together.
          </p>

          {/* Contact routes */}
          <div className="pointer-events-auto mt-8 flex flex-wrap items-center gap-4" data-fade>
            <a
              href={`mailto:${site.email}`}
              className="border border-caution bg-caution px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-hud text-base hover:bg-caution-muted transition-colors shadow-xl"
            >
              Deploy An Email: {site.email} →
            </a>

            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 bg-white/[0.04] px-6 py-3.5 font-mono text-xs uppercase tracking-hud text-bone hover:border-caution hover:text-caution transition-colors backdrop-blur-sm"
            >
              GitHub ↗
            </a>

            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 bg-white/[0.04] px-6 py-3.5 font-mono text-xs uppercase tracking-hud text-bone hover:border-caution hover:text-caution transition-colors backdrop-blur-sm"
            >
              LinkedIn ↗
            </a>
          </div>

          {/* Colophon */}
          <div className="mt-14 border-t border-white/10 pt-6 font-mono text-[10px] text-ash flex flex-wrap justify-between gap-4" data-fade>
            <span>TAHMID // FRONTEND DEVELOPER (REACT, NEXT.JS, TYPESCRIPT)</span>
            <span>SHIPPED WITH REACT + THREE.JS + CRT SHADERS + LENIS</span>
          </div>
          <div className="mt-2 font-mono text-[10px] text-ash/70" data-fade>
            {musicCredit()}
          </div>
        </div>
      </div>
    </section>
  )
}
