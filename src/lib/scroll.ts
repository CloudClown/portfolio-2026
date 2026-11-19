/**
 * A tiny scroll bus shared by the DOM overlay and the 3D scene.
 *
 * The DOM scroll position is owned by Lenis. Each frame we write the normalised
 * progress into `scrollState`, which the camera rig and the shaders read inside
 * `useFrame` — no React re-render on scroll, which is what keeps this at 60fps.
 * React components subscribe to a coarse snapshot (whole percent) instead.
 */
import { useSyncExternalStore } from 'react'

export type ScrollState = {
  progress: number
  velocity: number
  direction: 1 | -1
  /** Scroll progress at which each chapter is "held" on screen. Measured from the DOM. */
  stops: number[]
}

export const scrollState: ScrollState = {
  progress: 0,
  velocity: 0,
  direction: 1,
  stops: [],
}

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const smoothstep = (t: number) => {
  const x = clamp(t)
  return x * x * (3 - 2 * x)
}
/** Fast acceleration, long deceleration. The camera's motion signature. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp(t), 3)
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * Math.min(dt, 0.1)))

type Snapshot = { percent: number; progress: number; direction: 1 | -1 }

let snapshot: Snapshot = { percent: 0, progress: 0, direction: 1 }
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

export function setProgress(progress: number, velocity = 0) {
  const p = clamp(progress)
  scrollState.progress = p
  scrollState.velocity = velocity
  scrollState.direction = velocity < 0 ? -1 : 1

  const percent = Math.round(p * 100)
  if (percent !== snapshot.percent) {
    snapshot = { percent, progress: p, direction: scrollState.direction }
    emit()
  }
}

export function setStops(stops: number[]) {
  scrollState.stops = stops
}

/**
 * Remaps global scroll progress to the camera curve's parameter space.
 *
 * Each chapter is held at a measured scroll position; this maps those positions
 * onto evenly spaced control points and smooths every leg, so the camera glides
 * out of one scene, drifts, and settles into the next regardless of section
 * heights or viewport size.
 */
export function curveT(progress: number) {
  const stops = scrollState.stops
  const last = stops.length - 1
  if (last < 1) return clamp(progress)
  if (progress <= stops[0]) return 0
  if (progress >= stops[last]) return 1

  for (let i = 0; i < last; i++) {
    const a = stops[i]
    const b = stops[i + 1]
    if (progress >= a && progress <= b) {
      const local = (progress - a) / Math.max(1e-6, b - a)
      // Accelerate out of a stop, settle slowly into the next one.
      return (i + easeOutCubic(local)) / last
    }
  }
  return 1
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export const getSnapshot = () => snapshot

// Dev-only QA hook: lets local capture scripts read scroll internals.
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__scrollState = scrollState
}

/** Whole-percent progress for the UI. Re-renders at most 100 times per journey. */
export function useScrollPercent() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/** Index of the chapter nearest to the current scroll position. */
export function chapterForProgress(progress: number) {
  const stops = scrollState.stops
  if (!stops.length) return 0
  let best = 0
  let bestDistance = Infinity
  stops.forEach((stop, i) => {
    const distance = Math.abs(stop - progress)
    if (distance < bestDistance) {
      bestDistance = distance
      best = i
    }
  })
  return best
}
