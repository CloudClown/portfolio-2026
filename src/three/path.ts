import * as THREE from 'three'

/**
 * Camera Flight Path: "RETRO COMPUTING SOUL"
 *
 * One continuous camera dolly:
 * 1. hero     — in front of the CRT desk in a dark room, facing the glowing glass
 * 2. dive     — the camera pushes INTO the screen (scanline flash) and arrives
 *               inside a yellow wireframe vector landscape
 * 3. about    — floating commit-log blocks in the vector world
 * 4. skills   — wireframe hardware parts hovering over the grid
 * 5. projects — five glowing floppy-disk beacons on pedestals
 * 6. ai       — a giant terminal wall in the fog
 * 7. contact  — the camera pulls back OUT through the glass to the finished
 *               desk: "BUILD SUCCESSFUL."
 *
 * The screen plane sits at z = CRT_SCREEN_Z; every crossing of it triggers the
 * phosphor flash (see Effects.tsx).
 */

export type Stop = {
  id: string
  position: THREE.Vector3
  look: THREE.Vector3
  fov: number
}

/** z of the CRT glass plane in world space (desk scene). */
export const CRT_SCREEN_Z = -0.62

export const STOPS: Stop[] = [
  {
    // Hero: seated at the desk, eye-level with the phosphor.
    id: 'hero',
    position: new THREE.Vector3(0.0, 1.32, 2.35),
    look: new THREE.Vector3(0.0, 1.18, -0.62),
    fov: 40,
  },
  {
    // About: just inside the world — commit-log monoliths ahead.
    id: 'about',
    position: new THREE.Vector3(0.0, 1.7, -16),
    look: new THREE.Vector3(0.0, 2.4, -30),
    fov: 44,
  },
  {
    // Skills: drifting above the grid, parts tray of wireframe components.
    id: 'skills',
    position: new THREE.Vector3(0.0, 2.9, -42),
    look: new THREE.Vector3(0.0, 1.1, -56),
    fov: 46,
  },
  {
    // Projects: level flight past the floppy beacons.
    id: 'projects',
    position: new THREE.Vector3(0.0, 2.0, -68),
    look: new THREE.Vector3(0.0, 1.9, -86),
    fov: 44,
  },
  {
    // AI workflow: facing the giant terminal wall.
    id: 'ai-workflow',
    position: new THREE.Vector3(0.0, 2.2, -96),
    look: new THREE.Vector3(0.0, 2.6, -114),
    fov: 46,
  },
  {
    // Contact: pulled back out through the glass, seated at the finished desk.
    id: 'contact',
    position: new THREE.Vector3(0.0, 1.32, 2.55),
    look: new THREE.Vector3(0.0, 1.18, -0.62),
    fov: 40,
  },
]

const curvePoints = STOPS.map((s) => s.position)
export const cameraSpline = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.25)
export const positionCurve = cameraSpline

const lookPoints = STOPS.map((s) => s.look)
export const lookSpline = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.25)
export const lookCurve = lookSpline

export function fovAt(t: number): number {
  const n = STOPS.length - 1
  const scaled = THREE.MathUtils.clamp(t, 0, 1) * n
  const i = Math.min(Math.floor(scaled), n - 1)
  const frac = scaled - i
  const fovA = STOPS[i].fov
  const fovB = STOPS[Math.min(i + 1, n)].fov
  return fovA + (fovB - fovA) * frac
}

export function sampleCamera(progress: number, outPos: THREE.Vector3, outLook: THREE.Vector3): number {
  const t = THREE.MathUtils.clamp(progress, 0, 1)
  cameraSpline.getPoint(t, outPos)
  lookSpline.getPoint(t, outLook)
  return fovAt(t)
}
