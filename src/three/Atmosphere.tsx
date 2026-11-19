import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuality } from '../lib/motion'

/**
 * Dark Room Atmosphere:
 * - Near-black studio base
 * - Very dim ambient so the CRT phosphor owns the scene
 * - Soft bone-white rim light to model the plastic bezel and desk
 * - A cool graphite back light for silhouettes
 * (The amber screen glow itself is emitted by the monitor's own point lights.)
 */
export function Atmosphere() {
  const { scene } = useThree()
  const quality = useQuality()

  useEffect(() => {
    scene.fog = new THREE.FogExp2('#08080A', quality.isMobile ? 0.02 : 0.014)
    scene.background = new THREE.Color('#08080A')
    return () => {
      scene.fog = null
      scene.background = null
    }
  }, [scene, quality.isMobile])

  return (
    <>
      {/* Dim ambient — the room is dark, the screen does the lighting */}
      <ambientLight intensity={0.16} color="#23232A" />

      {/* Soft bone rim, front-right: models bezel bevels and keycaps */}
      <directionalLight position={[5, 7, 5]} intensity={0.85} color="#EDEDEA" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0001} />

      {/* Graphite back light for silhouettes */}
      <directionalLight position={[-6, 5, -8]} intensity={0.55} color="#86868B" />

      {/* Faint fill from below-left so nothing goes pitch black */}
      <directionalLight position={[-4, -2, 4]} intensity={0.12} color="#3A3A42" />
    </>
  )
}
