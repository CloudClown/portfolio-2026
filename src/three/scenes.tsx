import { useRef, type ReactNode } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../lib/scroll'
import { soundManager } from '../lib/ambient'
import { CameraRig } from './CameraRig'
import { Atmosphere } from './Atmosphere'
import { Effects } from './Effects'
import { DeskScene } from './objects/CRTDesk'
import { VectorWorld } from './objects/VectorWorld'
import type { Project } from '../data/projects'

/**
 * Scene Assembly: "RETRO COMPUTING SOUL"
 *
 * The journey is one camera dolly through the CRT glass:
 * 1. Hero   — the desk in a dark room, facing the glowing CRT
 * 2. Dive   — through the glass into the yellow wireframe vector landscape
 * 3. Inside — commit blocks → parts tray → floppy beacons → terminal wall
 * 4. Pull-out — back through the glass to the finished desk: BUILD SUCCESSFUL.
 *
 * Zones follow the CAMERA'S ACTUAL (damped) position, not raw scroll progress:
 * the camera's t lags behind fast scrolls (Home key, anchor jumps, Lenis
 * flings), and hiding a zone before the camera has physically left it would
 * open black voids. The desk hides only once the camera is past the glass; the
 * world hides only once it is back outside. The overlap band around the glass
 * keeps both alive during the crossing.
 */
function Zone({
  visibleWhen,
  children,
}: {
  visibleWhen: (cameraZ: number) => boolean
  children: ReactNode
}) {
  const group = useRef<THREE.Group>(null!)
  const { camera } = useThree()

  useFrame(() => {
    if (!group.current) return
    group.current.visible = visibleWhen(camera.position.z)
  })

  return <group ref={group}>{children}</group>
}

/**
 * Scroll = gentle room response. Feeds the ambient every frame with the
 * smoothed scroll velocity, so the pad breathes with the exact same cadence
 * as the camera — tiny, slow changes; nothing in Lazy Mode.
 */
function AmbientScroll() {
  useFrame((_, delta) => {
    soundManager.updateScrollActivity(Math.abs(scrollState.velocity), delta)
  })
  return null
}

export function Experience({ onOpen }: { onOpen: (project: Project) => void }) {
  return (
    <>
      <CameraRig />
      <Atmosphere />
      <AmbientScroll />

      {/* The desk: hero (before the dive) and again at the end (pull-out) */}
      <Zone visibleWhen={(z) => z > -1.4}>
        <DeskScene onOpen={onOpen} />
      </Zone>

      {/* Inside the screen: the vector world */}
      <Zone visibleWhen={(z) => z < -0.2}>
        <VectorWorld onOpen={onOpen} />
      </Zone>

      <Effects />
      <AdaptiveQuality />
    </>
  )
}

function AdaptiveQuality() {
  const setDpr = useThree((state) => state.setDpr)

  return (
    <PerformanceMonitor
      ms={200}
      onDecline={() => setDpr(1)}
      onIncline={() => setDpr(Math.min(window.devicePixelRatio || 1, 1.75))}
    />
  )
}
