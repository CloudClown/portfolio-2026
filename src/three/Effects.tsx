import { useMemo, type ReactElement } from 'react'
import {
  Bloom,
  DepthOfField,
  EffectComposer,
} from '@react-three/postprocessing'
import { BlendFunction, Effect } from 'postprocessing'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useQuality } from '../lib/motion'
import { crtPostFragment } from './shaders'

/**
 * The glass pass-through: the camera crosses the CRT screen plane twice
 * (dive-in near the start, pull-out at the end). A gaussian of the distance
 * to that plane drives the phosphor flare on both crossings.
 */
export const CRT_SCREEN_Z = -0.62

class CRTEffectImpl extends Effect {
  constructor() {
    super('CRTEffect', crtPostFragment, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([
        ['uTime', new THREE.Uniform(0)],
        ['uDive', new THREE.Uniform(0)],
        ['uCurvature', new THREE.Uniform(0.085)],
        ['uAberration', new THREE.Uniform(0.0007)],
        ['uScanDepth', new THREE.Uniform(0.055)],
        ['uFlicker', new THREE.Uniform(0.022)],
      ]),
    })
  }
}

export function Effects() {
  const quality = useQuality()
  const { camera } = useThree()
  const crt = useMemo(() => new CRTEffectImpl(), [])

  // Drive the CRT uniforms every frame, outside React's render loop.
  useFrame((state) => {
    const uTime = crt.uniforms.get('uTime')
    const uDive = crt.uniforms.get('uDive')
    if (uTime) uTime.value = state.clock.elapsedTime
    if (uDive) {
      const d = Math.abs(camera.position.z - CRT_SCREEN_Z)
      uDive.value = Math.exp(-Math.pow(d / 0.55, 2)) * 0.85
    }
  })

  const passes = useMemo(() => {
    if (!quality.post) return []

    const list: ReactElement[] = [
      // Phosphor bloom: only the emissive screen and yellow edges burn.
      <Bloom
        key="bloom"
        mipmapBlur
        intensity={1.15}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.24}
        radius={0.6}
      />,
      <primitive key="crt" object={crt} />,
    ]

    if (quality.dof) {
      list.push(
        <DepthOfField key="dof" focusDistance={0.016} focalLength={0.024} bokehScale={1.2} height={480} />,
      )
    }

    return list
  }, [quality.post, quality.dof, crt])

  if (!quality.post) return null

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {passes}
    </EffectComposer>
  )
}
