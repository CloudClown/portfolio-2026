import * as THREE from 'three'

/**
 * 6 palette stops for "BUILD 99%"
 * Strictly: Near-Black (#0A0A0B), Graphite (#141416), Caution Yellow (#FFD400), Bone White (#EDEDEA)
 */
export const PALETTE = {
  base: '#0A0A0B',
  graphite: '#141416',
  clay: '#1E1E22',
  clayLight: '#2A2A30',
  wire: '#3A3A42',
  ash: '#86868B',
  bone: '#EDEDEA',
  caution: '#FFD400',
  hazard: '#FFD400',
}

export type PaletteStop = {
  fog: THREE.Color
  bg: THREE.Color
  keyLight: THREE.Color
  rimLight: THREE.Color
}

export const PALETTE_STOPS: PaletteStop[] = [
  // 01 // Hero
  {
    fog: new THREE.Color('#0A0A0B'),
    bg: new THREE.Color('#0A0A0B'),
    keyLight: new THREE.Color('#FFD400'),
    rimLight: new THREE.Color('#EDEDEA'),
  },
  // 02 // About
  {
    fog: new THREE.Color('#0C0C0E'),
    bg: new THREE.Color('#0A0A0B'),
    keyLight: new THREE.Color('#FFD400'),
    rimLight: new THREE.Color('#A8A8B0'),
  },
  // 03 // Skills
  {
    fog: new THREE.Color('#0A0A0B'),
    bg: new THREE.Color('#0A0A0B'),
    keyLight: new THREE.Color('#FFD400'),
    rimLight: new THREE.Color('#EDEDEA'),
  },
  // 04 // Projects
  {
    fog: new THREE.Color('#0E0E11'),
    bg: new THREE.Color('#0A0A0B'),
    keyLight: new THREE.Color('#FFD400'),
    rimLight: new THREE.Color('#EDEDEA'),
  },
  // 05 // AI Workflow
  {
    fog: new THREE.Color('#0A0A0B'),
    bg: new THREE.Color('#0A0A0B'),
    keyLight: new THREE.Color('#FFD400'),
    rimLight: new THREE.Color('#86868B'),
  },
  // 06 // Contact (Build Complete)
  {
    fog: new THREE.Color('#0D0D10'),
    bg: new THREE.Color('#0A0A0B'),
    keyLight: new THREE.Color('#FFD400'),
    rimLight: new THREE.Color('#FFFFFF'),
  },
]
