import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { curveT, damp, scrollState } from '../lib/scroll'
import { pointer } from '../lib/pointer'
import { usePrefersReducedMotion } from '../lib/motion'
import { fovAt, lookCurve, positionCurve } from './path'

/**
 * Tracks the camera along the spline.
 *
 * Heavy inertia (lambda 1.6) plus a sub-centimetre handheld shake. The result
 * should feel like a dolly on rails, not a floating camera: fast enough to
 * arrive, slow enough to feel like it weighs something.
 */
export function CameraRig() {
  const { camera } = useThree()
  const reduced = usePrefersReducedMotion()
  const smoothed = useRef(0)
  const position = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const progress = reduced ? scrollState.progress : curveT(scrollState.progress)

    // Adaptive catch-up: normal scrolling keeps the heavy inertia (lambda 1.55);
    // big discontinuities (Home key, anchor jumps, fast flings) converge quickly
    // so the camera never trails the world by a chapter.
    const diff = Math.abs(progress - smoothed.current)
    const lambda = reduced ? 12 : 1.55 + diff * 5.5
    smoothed.current = damp(smoothed.current, progress, lambda, dt)
    const t = smoothed.current

    positionCurve.getPoint(t, position)
    lookCurve.getPoint(t, look)

    if (!reduced) {
      const time = state.clock.elapsedTime

      // Handheld: two incommensurate sines, a few millimetres of travel.
      const shakeX = (Math.sin(time * 31.7) + Math.sin(time * 11.3)) * 0.012
      const shakeY = (Math.cos(time * 27.1) + Math.sin(time * 9.7)) * 0.01

      right.setFromMatrixColumn(camera.matrix, 0)
      position.addScaledVector(right, pointer.x * 0.24 + shakeX)
      position.y += pointer.y * 0.12 + shakeY
      look.addScaledVector(right, pointer.x * 0.5)
      look.y += pointer.y * 0.28
    }

    camera.position.copy(position)
    camera.lookAt(look)

    // A fraction of a degree of roll, just enough to feel hand-held.
    if (!reduced) camera.rotation.z += Math.sin(state.clock.elapsedTime * 0.23) * 0.0015

    const cam = camera as THREE.PerspectiveCamera
    const nextFov = fovAt(t)
    const fov = reduced ? nextFov : damp(cam.fov, nextFov, 2.4, dt)
    if (Math.abs(cam.fov - fov) > 0.001) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }
  })

  return null
}
