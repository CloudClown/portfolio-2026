import { useMemo, useRef } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../../lib/scroll'
import { vectorGridFragment, vectorGridVertex, crtScreenFragment, crtScreenVertex } from '../shaders'
import { soundManager } from '../../lib/ambient'
import { projects, type Project } from '../../data/projects'

/**
 * THE VECTOR WORLD — inside the CRT.
 *
 * Old vector flight-sim graphics: a clean anti-aliased grid floor fading into
 * fog, low-poly wireframe mountains, a horizon line. Terrain starts as pure
 * wireframe and "compiles" into solid graphite with yellow edge lines as the
 * build progresses (scroll 25% → 90%). Chapter set pieces live in the world:
 * commit-log blocks (about), the wireframe parts tray (skills), floppy-disk
 * beacons (projects), and a giant terminal wall (AI workflow).
 */

/** Map global scroll to terrain compile progress. */
function compileProgress() {
  return THREE.MathUtils.clamp((scrollState.progress - 0.24) / 0.62, 0, 1)
}

/* -------------------------------------------------------------------------- */
/*  GRID FLOOR                                                                */
/* -------------------------------------------------------------------------- */

function GridFloor() {
  const material = useRef<THREE.ShaderMaterial>(null!)

  const uniforms = useMemo(
    () => ({
      uColorBase: { value: new THREE.Color('#08080A') },
      uColorGrid: { value: new THREE.Color('#B8B8BE') },
      uColorCaution: { value: new THREE.Color('#FFD400') },
      uCamPos: { value: new THREE.Vector3() },
      uFogDensity: { value: 0.017 },
    }),
    [],
  )

  useFrame((state) => {
    uniforms.uCamPos.value.copy(state.camera.position)
  })

  return (
    <mesh position={[0, -0.02, -80]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[420, 420]} />
      <shaderMaterial
        ref={material}
        vertexShader={vectorGridVertex}
        fragmentShader={vectorGridFragment}
        uniforms={uniforms}
      />
    </mesh>
  )
}

/* -------------------------------------------------------------------------- */
/*  LOW-POLY MOUNTAINS: wireframe → compiled solid + yellow edges             */
/* -------------------------------------------------------------------------- */

type Peak = {
  position: [number, number, number]
  radius: number
  height: number
  sides: number
  /** scroll threshold where this peak compiles */
  threshold: number
}

function Mountain({ peak }: { peak: Peak }) {
  const solid = useRef<THREE.Mesh>(null!)
  const wire = useRef<THREE.LineSegments>(null!)

  const geometry = useMemo(
    () => new THREE.ConeGeometry(peak.radius, peak.height, peak.sides, 1),
    [peak],
  )
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 12), [geometry])

  useFrame(() => {
    const c = compileProgress()
    const local = THREE.MathUtils.clamp((c - peak.threshold) / 0.18, 0, 1)
    const solidMat = solid.current.material as THREE.MeshStandardMaterial
    const wireMat = wire.current.material as THREE.LineBasicMaterial
    solidMat.opacity = local
    solid.current.visible = local > 0.01
    // Edges always visible: yellow wireframe that stays as an accent when solid
    wireMat.opacity = 1 - local * 0.72
  })

  return (
    <group position={peak.position}>
      <mesh ref={solid} geometry={geometry} castShadow>
        <meshStandardMaterial
          color="#17171B"
          roughness={0.75}
          metalness={0.15}
          flatShading
          transparent
          opacity={0}
          depthWrite
        />
      </mesh>
      <lineSegments ref={wire} geometry={edges}>
        <lineBasicMaterial color="#FFD400" transparent opacity={1} toneMapped={false} />
      </lineSegments>
    </group>
  )
}

function Mountains() {
  const peaks = useMemo<Peak[]>(() => {
    const list: Peak[] = []
    let seed = 7
    const rand = () => {
      seed = (seed * 16807) % 2147483647
      return (seed % 1000) / 1000
    }
    for (let i = 0; i < 46; i++) {
      const z = -14 - i * 4.2 - rand() * 3
      const side = rand() > 0.5 ? 1 : -1
      const x = side * (6 + rand() * 26)
      const radius = 3 + rand() * 9
      const height = 2.5 + rand() * 10
      const near = (z + 16) / -180
      list.push({
        position: [x, -0.1, z],
        radius,
        height,
        sides: 4 + Math.floor(rand() * 3),
        threshold: THREE.MathUtils.clamp(0.05 + Math.abs(x) / 60 + near * 0.7, 0, 0.95),
      })
    }
    return list
  }, [])

  return (
    <group>
      {peaks.map((p, i) => (
        <Mountain key={i} peak={p} />
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  HORIZON LINE                                                              */
/* -------------------------------------------------------------------------- */

function HorizonLine() {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    const mat = ref.current.material as THREE.MeshBasicMaterial
    // Slow pulse, like a distant beacon
    mat.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15
  })
  return (
    <mesh ref={ref} position={[0, 3.2, -230]}>
      <boxGeometry args={[240, 0.06, 0.06]} />
      <meshBasicMaterial color="#FFD400" transparent toneMapped={false} />
    </mesh>
  )
}

/* -------------------------------------------------------------------------- */
/*  ABOUT: floating commit-log blocks                                         */
/* -------------------------------------------------------------------------- */

function CommitBlocks() {
  const group = useRef<THREE.Group>(null!)
  const blocks = useMemo(() => {
    const list: { pos: [number, number, number]; size: number; speed: number }[] = []
    for (let i = 0; i < 9; i++) {
      list.push({
        pos: [-5 + (i % 3) * 4.6, 1.6 + Math.floor(i / 3) * 1.7, -28 - (i % 2) * 3],
        size: 0.8 + (i % 3) * 0.5,
        speed: 0.4 + (i % 4) * 0.18,
      })
    }
    return list
  }, [])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      child.rotation.y = t * 0.12 * (i % 2 ? 1 : -1)
      child.rotation.x = Math.sin(t * 0.2 + i) * 0.08
    })
  })

  return (
    <group ref={group}>
      {blocks.map((b, i) => (
        <group key={i} position={b.pos}>
          <mesh>
            <boxGeometry args={[b.size, b.size, b.size]} />
            <meshBasicMaterial color="#0A0A0C" wireframe transparent opacity={0.9} />
          </mesh>
          {/* One glowing "merged" commit */}
          {i === 4 && <pointLight intensity={1.4} distance={4} color="#FFD400" />}
        </group>
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  SKILLS: wireframe parts hovering over the grid                            */
/* -------------------------------------------------------------------------- */

function PartsTray() {
  const group = useRef<THREE.Group>(null!)
  const parts = useMemo(() => {
    const list: { pos: [number, number, number]; kind: 'chip' | 'keycap' | 'cable' }[] = []
    for (let i = 0; i < 12; i++) {
      const x = -5.5 + (i % 4) * 3.6
      const z = -50 - Math.floor(i / 4) * 4
      list.push({ pos: [x, 1.2 + (i % 3) * 0.6, z], kind: (['chip', 'keycap', 'cable'] as const)[i % 3] })
    }
    return list
  }, [])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      child.position.y += Math.sin(t * 0.9 + i * 1.7) * 0.0012
      child.rotation.z = Math.sin(t * 0.4 + i) * 0.12
    })
  })

  return (
    <group ref={group}>
      {parts.map((p, i) => (
        <group key={i} position={p.pos}>
          {p.kind === 'chip' && (
            <>
              <mesh>
                <boxGeometry args={[0.7, 0.12, 0.7]} />
                <meshBasicMaterial color="#0A0A0C" wireframe />
              </mesh>
              <pointLight intensity={0.6} distance={2.4} color="#FFD400" />
            </>
          )}
          {p.kind === 'keycap' && (
            <mesh rotation={[0.2, 0.4, 0]}>
              <boxGeometry args={[0.5, 0.3, 0.5]} />
              <meshBasicMaterial color="#0A0A0C" wireframe />
            </mesh>
          )}
          {p.kind === 'cable' && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.45, 0.09, 8, 24, Math.PI * 1.4]} />
              <meshBasicMaterial color="#0A0A0C" wireframe />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  PROJECTS: five glowing floppy beacons                                     */
/* -------------------------------------------------------------------------- */

function ProjectBeacons({ onOpen }: { onOpen: (p: Project) => void }) {
  const group = useRef<THREE.Group>(null!)

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      child.position.y = 1.9 + Math.sin(t * 1.1 + i * 1.3) * 0.09
    })
  })

  return (
    <group ref={group}>
      {projects.map((p, i) => (
        <group key={p.id} position={[-6 + i * 3, 1.9, -84 - (i % 2) * 2.4]}>
          {/* Pedestal: compiled early, always solid */}
          <mesh position={[0, -1.35, 0]}>
            <cylinderGeometry args={[0.32, 0.4, 1.1, 6]} />
            <meshStandardMaterial color="#17171B" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, -0.78, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.06, 6]} />
            <meshStandardMaterial color="#FFD400" emissive="#FFD400" emissiveIntensity={0.55} />
          </mesh>

          {/* Disk */}
          <mesh
            onClick={(e: ThreeEvent<MouseEvent>) => {
              e.stopPropagation()
              soundManager.playUITone()
              window.setTimeout(() => onOpen(p), 620)
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <boxGeometry args={[0.62, 0.62, 0.05]} />
            <meshStandardMaterial
              color="#101012"
              emissive="#FFD400"
              emissiveIntensity={p.status === 'SHIPPED' ? 0.35 : 0.12}
              roughness={0.5}
            />
          </mesh>
          <pointLight intensity={1.1} distance={3.4} color="#FFD400" />
        </group>
      ))}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  AI WORKFLOW: the giant terminal wall                                      */
/* -------------------------------------------------------------------------- */

function TerminalWall() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBoot: { value: 1 },
      uEnd: { value: 0 },
      uFlash: { value: 0 },
      uBg: { value: new THREE.Color('#08080A') },
      uFg: { value: new THREE.Color('#EDEDEA') },
      uCaution: { value: new THREE.Color('#FFD400') },
    }),
    [],
  )

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <group position={[0, 0, -116]}>
      {/* Terminal screen */}
      <mesh position={[0, 3.4, 0]}>
        <planeGeometry args={[13, 7]} />
        <shaderMaterial
          vertexShader={crtScreenVertex}
          fragmentShader={crtScreenFragment}
          uniforms={uniforms}
        />
      </mesh>
      {/* Wireframe housing frame */}
      <mesh position={[0, 3.4, -0.3]}>
        <boxGeometry args={[13.9, 7.9, 0.5]} />
        <meshBasicMaterial color="#0A0A0C" wireframe />
      </mesh>
      <pointLight position={[0, 3.4, 3]} intensity={4} distance={16} decay={2} color="#FFD400" />
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  THE WORLD                                                                 */
/* -------------------------------------------------------------------------- */

export function VectorWorld({ onOpen }: { onOpen: (p: Project) => void }) {
  return (
    <group>
      <GridFloor />
      <Mountains />
      <HorizonLine />
      <CommitBlocks />
      <PartsTray />
      <ProjectBeacons onOpen={onOpen} />
      <TerminalWall />
      {/* Dust motes inside the phosphor world */}
      <AmbientDust />
    </group>
  )
}

function AmbientDust() {
  const ref = useRef<THREE.Points>(null!)
  const geometry = useMemo(() => {
    const count = 320
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = Math.random() * 9
      positions[i * 3 + 2] = -4 - Math.random() * 130
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.01
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.035} color="#FFD400" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  )
}
