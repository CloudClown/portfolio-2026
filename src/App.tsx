import { useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import { Experience } from './three/scenes'
import { STOPS } from './three/path'

import { TopBar, SectionRail, ProgressMeter, CornerBrackets, StatusLine } from './components/Hud'
import { Loader } from './components/Loader'
import { Cursor } from './components/Cursor'
import { MiniPlayer } from './components/MiniPlayer'
import { ProjectModal } from './components/ProjectModal'
import { RecruiterDossier } from './components/RecruiterDossier'
import {
  AboutSection,
  AIWorkflowSection,
  ContactSection,
  HeroSection,
  ProjectsSection,
  SkillsSection,
} from './components/Sections'

import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useLazyMode } from './hooks/useLazyMode'
import { bindPointer } from './lib/pointer'
import { soundManager } from './lib/ambient'
import type { Project } from './data/projects'

/**
 * RETRO COMPUTING SOUL: Tahmid — Frontend Developer
 * A developer's old-school computer workshop.
 *
 * Layers:
 *   1. Fixed 3D WebGL Canvas: CRT desk in a dark room -> dive through the glass
 *      into a wireframe vector landscape -> pull back out to the finished desk
 *   2. Semantic Document: Space Grotesk headlines, VT323 screen text,
 *      real metrics, disk-library projects, a working terminal
 *   3. HUD: BUILD 99% meter (stalls at 99%), Lazy Mode autoplay, 47 tabs,
 *      recruiter dossier, sound toggle, compiler reticle
 */
export default function App() {
  const [sceneReady, setSceneReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const [project, setProject] = useState<Project | null>(null)
  const [recruiterOpen, setRecruiterOpen] = useState(false)
  const { isLazyMode, toggleLazyMode } = useLazyMode()

  useSmoothScroll(entered)
  useEffect(() => bindPointer(), [])

  // Lazy Mode autopilot: the ambient stays steady, no changes.
  useEffect(() => {
    soundManager.setLazyMode(isLazyMode)
  }, [isLazyMode])

  // WebGL safety timeout
  useEffect(() => {
    const timeout = window.setTimeout(() => setSceneReady(true), 5000)
    return () => window.clearTimeout(timeout)
  }, [])

  const openProject = useCallback((next: Project) => setProject(next), [])
  const closeProject = useCallback(() => setProject(null), [])

  const openDossier = useCallback(() => setRecruiterOpen(true), [])
  const closeDossier = useCallback(() => setRecruiterOpen(false), [])

  return (
    <div className="relative min-h-screen bg-base text-bone select-text">
      {/* Accessible skip link */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:border focus:border-caution focus:bg-base focus:px-4 focus:py-3 focus:font-mono focus:text-[10px] focus:uppercase focus:tracking-hud focus:text-bone"
      >
        Skip to main content
      </a>

      {/* 3D Workshop Canvas */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <Canvas
          dpr={[1, 1.75]}
          gl={{
            antialias: false,
            alpha: false,
            stencil: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: import.meta.env.DEV,
          }}
          camera={{
            position: STOPS[0].position.toArray() as [number, number, number],
            fov: STOPS[0].fov,
            near: 0.1,
            far: 900,
          }}
          style={{ touchAction: 'pan-y' }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.08
            setSceneReady(true)
          }}
        >
          <Experience onOpen={openProject} />
        </Canvas>
      </div>

      {/* Subtle phosphor grade: ties the DOM to the tube (never dims text hard) */}
      <div aria-hidden className="crt-page-grade pointer-events-none fixed inset-0 z-20 opacity-50" />

      {/* The Semantic Document / Exhibits */}
      <main id="main" tabIndex={-1} className="pointer-events-none relative z-10">
        <HeroSection enabled={entered} onOpenQuickView={openDossier} />
        <AboutSection enabled={entered} />
        <SkillsSection enabled={entered} />
        <ProjectsSection enabled={entered} onOpenProject={openProject} />
        <AIWorkflowSection enabled={entered} />
        <ContactSection enabled={entered} />
      </main>

      {/* The Workshop HUD */}
      <TopBar
        onOpenQuickView={openDossier}
        isLazyMode={isLazyMode}
        onToggleLazyMode={toggleLazyMode}
      />
      <SectionRail />
      <ProgressMeter />
      <CornerBrackets />
      <StatusLine />
      <MiniPlayer />

      {/* Modals & Overlays */}
      <ProjectModal project={project} onClose={closeProject} onNavigate={openProject} />
      <RecruiterDossier open={recruiterOpen} onClose={closeDossier} />

      {/* Giant 99% Stalled Loader */}
      <Loader
        ready={sceneReady}
        onDone={() => setEntered(true)}
        onOpenQuickView={openDossier}
      />

      {/* Compiler Reticle Cursor */}
      <Cursor />
    </div>
  )
}
