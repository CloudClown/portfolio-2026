import { useMemo, useRef, useState } from 'react'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scrollState } from '../../lib/scroll'
import { soundManager } from '../../lib/ambient'
import { crtScreenFragment, crtScreenVertex } from '../shaders'
import { projects } from '../../data/projects'
import {
  deskPlateTexture,
  floppyLabelTexture,
  shippedLabelTexture,
  stickyNoteTexture,
} from '../../lib/textures'
import { projectDiskLabels, type Project } from '../../data/projects'
import { site } from '../../data/site'

/**
 * THE DESK — a developer's old-school computer workshop in a dark room.
 *
 * One large, well-modeled 3D CRT monitor (curved glass, thick beveled plastic
 * bezel, vents, power LED) is lit by its own amber phosphor glow plus soft rim
 * lights. Around it: a stack of hand-labelled floppies (the unfinished ideas,
 * plus ONE glowing shipped disk), a floppy drive, a mechanical keyboard, a
 * coffee mug, cables, sticky notes and an engraved desk plate.
 *
 * Projects ARE the disks: clicking one inserts it into the drive and boots its
 * case study on the CRT.
 */

const GRAPHITE = '#141416'
const PLASTIC = '#1B1B1F'
const CASE_DARK = '#232327'

/* -------------------------------------------------------------------------- */
/*  CRT MONITOR                                                               */
/* -------------------------------------------------------------------------- */

function CRTMonitor() {
  const screenMat = useRef<THREE.ShaderMaterial>(null!)
  const led = useRef<THREE.Mesh>(null!)

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
    const u = uniforms
    u.uTime.value = state.clock.elapsedTime
    // The finished-desk readout near the end of the journey.
    u.uEnd.value = THREE.MathUtils.smoothstep(scrollState.progress, 0.9, 0.97)
    // Glass pass-through flash (camera crossing the screen plane).
    const d = Math.abs(state.camera.position.z - -0.62)
    u.uFlash.value = Math.exp(-Math.pow(d / 0.5, 2))
    // Power LED flickers brighter during the final pull-out.
    if (led.current) {
      const mat = led.current.material as THREE.MeshBasicMaterial
      mat.color.setScalar(0).lerp(new THREE.Color('#FFD400'), 1)
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Swivel base */}
      <mesh position={[0, 0.05, -0.1]} castShadow>
        <cylinderGeometry args={[0.34, 0.42, 0.09, 24]} />
        <meshStandardMaterial color={CASE_DARK} roughness={0.6} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.1, -0.1]} castShadow>
        <cylinderGeometry args={[0.2, 0.32, 0.06, 24]} />
        <meshStandardMaterial color={GRAPHITE} roughness={0.7} />
      </mesh>

      {/* Rear shell — tapered deep plastic housing */}
      <mesh position={[0, 0.62, -1.05]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <boxGeometry args={[1.15, 1.05, 0.85]} />
        <meshStandardMaterial color={PLASTIC} roughness={0.62} metalness={0.08} />
      </mesh>

      {/* Main bezel body: thick plastic with bevels */}
      <mesh position={[0, 0.62, -0.28]} castShadow receiveShadow>
        <boxGeometry args={[1.62, 1.24, 0.72]} />
        <meshStandardMaterial color={PLASTIC} roughness={0.5} metalness={0.12} />
      </mesh>
      {/* Bezel front face plate */}
      <mesh position={[0, 0.62, 0.09]} castShadow>
        <boxGeometry args={[1.66, 1.28, 0.06]} />
        <meshStandardMaterial color={CASE_DARK} roughness={0.45} metalness={0.15} />
      </mesh>
      {/* Screen recess: black inset behind the glass */}
      <mesh position={[0, 0.62, 0.115]}>
        <boxGeometry args={[1.36, 1.0, 0.04]} />
        <meshStandardMaterial color="#060607" roughness={0.9} />
      </mesh>

      {/* Vents on top: dark slots */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[-0.55 + i * 0.14, 1.245, -0.35]}>
          <boxGeometry args={[0.07, 0.012, 0.5]} />
          <meshStandardMaterial color="#0A0A0C" roughness={0.9} />
        </mesh>
      ))}

      {/* Power LED (amber) bottom-right of bezel */}
      <mesh ref={led} position={[0.66, 0.12, 0.125]}>
        <sphereGeometry args={[0.016, 12, 12]} />
        <meshBasicMaterial color="#FFD400" toneMapped={false} />
      </mesh>
      <pointLight position={[0.66, 0.12, 0.3]} intensity={0.35} distance={0.9} color="#FFD400" />

      {/* Hazard sticker: small stencil warning on the bezel */}
      <mesh position={[-0.66, 0.12, 0.125]} rotation={[0, 0, -0.03]}>
        <planeGeometry args={[0.16, 0.05]} />
        <meshBasicMaterial color="#FFD400" />
      </mesh>

      {/* Curved glass + phosphor screen (the shader plane) */}
      <group position={[0, 0.62, 0.14]}>
        <mesh>
          <planeGeometry args={[1.26, 0.92]} />
          <shaderMaterial
            ref={screenMat}
            vertexShader={crtScreenVertex}
            fragmentShader={crtScreenFragment}
            uniforms={uniforms}
          />
        </mesh>
        {/* Glass bulge: slightly curved transparent shell for specular */}
        <mesh position={[0, 0, -0.012]} scale={[1.3, 1.3, 0.42]}>
          <sphereGeometry args={[0.5, 48, 32, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.36]} />
          <meshPhysicalMaterial
            color="#0A0A0C"
            roughness={0.06}
            metalness={0}
            transparent
            opacity={0.22}
            clearcoat={1}
            clearcoatRoughness={0.08}
            side={THREE.BackSide}
          />
        </mesh>
        {/* Phosphor glow halo on the wall / desk behind */}
        <pointLight position={[0, 0, 0.9]} intensity={2.6} distance={5.5} decay={2} color="#FFD400" />
        <pointLight position={[0, 0, 0.4]} intensity={1.6} distance={2.4} decay={2} color="#FFD400" />
      </group>

      {/* Brand plate: "T-99 PHOSPHOR" */}
      <mesh position={[0.42, 0.12, 0.126]}>
        <planeGeometry args={[0.2, 0.045]} />
        <meshStandardMaterial color="#3A3A42" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  FLOPPY DISKS (the projects + the unfinished ideas)                        */
/* -------------------------------------------------------------------------- */

function Floppy({
  label,
  sub,
  shipped = false,
  onClick,
  position,
}: {
  label: string
  sub?: string
  shipped?: boolean
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  position: [number, number, number]
}) {
  const group = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  const body = useMemo(
    () =>
      shipped
        ? { color: '#101012', emissive: '#FFD400', emissiveIntensity: 0.32 }
        : { color: '#26262B', emissive: '#000000', emissiveIntensity: 0 },
    [shipped],
  )

  const texture = useMemo(
    () =>
      shipped
        ? shippedLabelTexture(label)
        : floppyLabelTexture(label, sub ?? 'unfinished'),
    [label, sub, shipped],
  )

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    if (shipped) {
      group.current.position.y = position[1] + Math.sin(t * 1.4) * 0.012
    }
    // Hover lift
    const target = hovered ? 0.05 : 0
    if (!shipped) {
      group.current.position.y = THREE.MathUtils.damp(
        group.current.position.y,
        position[1] + target,
        10,
        0.016,
      )
    }
  })

  return (
    <group
      ref={group}
      position={position}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
    >
      {/* Disk body */}
      <mesh castShadow>
        <boxGeometry args={[0.36, 0.36, 0.022]} />
        <meshStandardMaterial
          color={body.color}
          roughness={0.55}
          metalness={0.15}
          emissive={body.emissive}
          emissiveIntensity={body.emissiveIntensity}
        />
      </mesh>
      {/* Metal shutter */}
      <mesh position={[0, 0.1, 0.013]}>
        <boxGeometry args={[0.16, 0.13, 0.006]} />
        <meshStandardMaterial color="#9A9AA2" metalness={0.9} roughness={0.25} />
      </mesh>
      {/* Label */}
      <mesh position={[0, -0.035, 0.013]}>
        <planeGeometry args={[0.28, 0.28]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          emissive={shipped ? '#FFD400' : '#000000'}
          emissiveMap={shipped ? texture : null}
          emissiveIntensity={shipped ? 0.55 : 0}
        />
      </mesh>
      {/* Corner notch */}
      <mesh position={[0.15, -0.15, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.024]} />
        <meshStandardMaterial color={body.color} roughness={0.55} />
      </mesh>
      {/* Shipped: halo */}
      {shipped && (
        <pointLight intensity={0.8} distance={0.9} color="#FFD400" position={[0, 0, 0.2]} />
      )}
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  FLOPPY DRIVE (click target for inserting a disk)                          */
/* -------------------------------------------------------------------------- */

function FloppyDrive() {
  const [hovered, setHovered] = useState(false)
  const slot = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (!slot.current) return
    // Drive LED breathes
    const t = state.clock.elapsedTime
    const mat = slot.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.55 + Math.sin(t * 2.1) * 0.25
  })

  return (
    <group
      position={[1.32, 0, -0.3]}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.44, 0.12, 0.42]} />
        <meshStandardMaterial color={hovered ? '#2E2E34' : CASE_DARK} roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Slot */}
      <mesh position={[0, 0.062, -0.02]}>
        <boxGeometry args={[0.3, 0.006, 0.06]} />
        <meshStandardMaterial color="#050506" roughness={0.9} />
      </mesh>
      {/* Eject button */}
      <mesh position={[0.16, 0.062, 0.1]}>
        <boxGeometry args={[0.05, 0.01, 0.05]} />
        <meshStandardMaterial color="#3A3A42" roughness={0.4} />
      </mesh>
      {/* Amber activity LED */}
      <mesh ref={slot} position={[-0.15, 0.062, 0.1]}>
        <boxGeometry args={[0.035, 0.008, 0.02]} />
        <meshBasicMaterial color="#FFD400" transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  KEYBOARD / MUG / CABLES / NOTES / PLATE                                   */
/* -------------------------------------------------------------------------- */

function MechanicalKeyboard() {
  const keys = useMemo(() => {
    const list: { x: number; z: number; w: number }[] = []
    const rows = 4
    for (let r = 0; r < rows; r++) {
      let x = -0.3 + (r % 2) * 0.015
      const z = -0.09 + r * 0.062
      for (let k = 0; k < 12; k++) {
        const w = k === 0 && r === 3 ? 0.055 : 0.038
        list.push({ x, z, w })
        x += w + 0.006
      }
    }
    return list
  }, [])

  return (
    <group position={[-0.05, 0, 0.62]} rotation={[0, 0.06, 0]}>
      {/* Case */}
      <mesh position={[0, 0.018, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.82, 0.036, 0.3]} />
        <meshStandardMaterial color={GRAPHITE} roughness={0.6} metalness={0.15} />
      </mesh>
      {/* Keycaps — two-tone: bone alphas + one yellow escape */}
      {keys.map((k, i) => (
        <mesh key={i} position={[k.x, 0.042, k.z]} castShadow>
          <boxGeometry args={[k.w, 0.014, 0.048]} />
          <meshStandardMaterial
            color={i === 0 ? '#FFD400' : i % 7 === 3 ? '#3A3A42' : '#C9C9C4'}
            roughness={0.35}
          />
        </mesh>
      ))}
      {/* Cable out the back */}
      <Cable from={[-0.4, 0.03, 0.14]} to={[-0.9, 0.4, -0.4]} color="#111114" radius={0.012} />
    </group>
  )
}

function Cable({
  from,
  to,
  color = '#111114',
  radius = 0.014,
}: {
  from: [number, number, number]
  to: [number, number, number]
  color?: string
  radius?: number
}) {
  const geometry = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const mid = a.clone().lerp(b, 0.5)
    mid.y -= 0.28 // sag
    const curve = new THREE.CatmullRomCurve3([a, mid, b])
    return new THREE.TubeGeometry(curve, 32, radius, 8, false)
  }, [from, to, radius])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
    </mesh>
  )
}

function Mug({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <group
      position={[0.85, 0, 0.55]}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = ''
      }}
    >
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.062, 0.14, 24]} />
        <meshStandardMaterial color={hovered ? '#FFD400' : '#EDEDEA'} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.071, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.004, 24]} />
        <meshStandardMaterial color="#1A1208" roughness={0.2} />
      </mesh>
      <mesh position={[0.085, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.045, 0.011, 12, 24, Math.PI]} />
        <meshStandardMaterial color={hovered ? '#FFD400' : '#EDEDEA'} roughness={0.35} />
      </mesh>
    </group>
  )
}

function StickyNotes() {
  const notes = useMemo(
    () => [
      { text: 'TODO: finish the TODO list', pos: [-1.02, 0, 0.2] as const, rot: 0.14 },
      { text: 'ship it', pos: [-0.86, 0, 0.42] as const, rot: -0.1 },
      { text: '45 tabs left to close', pos: [0.55, 0, 0.78] as const, rot: 0.05 },
    ],
    [],
  )

  return (
    <>
      {notes.map((n, i) => (
        <mesh
          key={i}
          position={[n.pos[0], 0.003, n.pos[2]]}
          rotation={[-Math.PI / 2, 0, n.rot]}
          receiveShadow
        >
          <planeGeometry args={[0.17, 0.17]} />
          <meshStandardMaterial map={stickyNoteTexture(n.text)} roughness={0.9} />
        </mesh>
      ))}
    </>
  )
}

function DeskPlate() {
  const texture = useMemo(() => deskPlateTexture(site.name, site.personalDetail), [])
  return (
    <group position={[0, 0.028, 0.9]}>
      <mesh rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.62, 0.02, 0.15]} />
        <meshStandardMaterial color="#2A2A30" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Engraved face */}
      <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.58, 0.13]} />
        <meshStandardMaterial map={texture} metalness={0.55} roughness={0.45} />
      </mesh>
    </group>
  )
}

/* -------------------------------------------------------------------------- */
/*  THE DESK SCENE                                                            */
/* -------------------------------------------------------------------------- */

export function DeskScene({ onOpen }: { onOpen: (p: Project) => void }) {
  const handleDiskClick = (project: Project) => {
    soundManager.playUITone()
    window.setTimeout(() => onOpen(project), 620)
  }

  const handleMug = () => soundManager.playMugTap()

  return (
    <group>
      {/* Room floor: near-black with a faint sheen */}
      <mesh position={[0, 0, -0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0B0B0D" roughness={0.55} metalness={0.35} />
      </mesh>

      {/* Desk top */}
      <mesh position={[0, 0.66, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 0.07, 2.1]} />
        <meshStandardMaterial color="#1A1A1D" roughness={0.62} metalness={0.2} />
      </mesh>
      {/* Desk legs */}
      <mesh position={[-2.1, 0.31, -0.2]}>
        <boxGeometry args={[0.09, 0.62, 1.9]} />
        <meshStandardMaterial color="#0C0C0E" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[2.1, 0.31, -0.2]}>
        <boxGeometry args={[0.09, 0.62, 1.9]} />
        <meshStandardMaterial color="#0C0C0E" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Desk front edge: hazard tape strip */}
      <mesh position={[0, 0.66, 0.86]} rotation={[0, 0, 0]}>
        <boxGeometry args={[4.6, 0.03, 0.02]} />
        <meshBasicMaterial color="#FFD400" toneMapped={false} />
      </mesh>

      {/* Desk surface top y = 0.695 */}
      <group position={[0, 0.695, 0]}>
        <CRTMonitor />

        {/* Floppy drive right of the CRT */}
        <FloppyDrive />

        {/* The shipped disk — glowing yellow, sits alone */}
        <Floppy
          shipped
          label="sortedrack"
          position={[1.32, 0.012, 0.28]}
          onClick={() => handleDiskClick(projects[0])}
        />

        {/* Stack of unfinished idea disks */}
        <Floppy label="plans_v1" sub="draft" position={[-1.45, 0.012, 0.05]} />
        <Floppy label="plans_v2" sub="draft" position={[-1.45, 0.036, 0.05]} />
        <Floppy label="plans_FINAL_final" sub="really final" position={[-1.42, 0.012, 0.38]} />
        <Floppy label="todo_someday" sub="someday" position={[-1.42, 0.036, 0.38]} />

        {/* The five shipped project disks fan — insert one to boot its case study */}
        {projects.map((p, i) => (
          <Floppy
            key={p.id}
            shipped={p.status === 'SHIPPED'}
            label={projectDiskLabels[p.id] ?? p.title}
            sub={p.year}
            position={[-1.75 + i * 0.3, 0.012 + (i % 2) * 0.024, 0.72 + (i % 3) * 0.04]}
            onClick={() => handleDiskClick(p)}
          />
        ))}


        <MechanicalKeyboard />
        <Mug onClick={handleMug} />
        <StickyNotes />
        <DeskPlate />

        {/* Power cables dropping behind the desk */}
        <Cable from={[1.32, 0.0, -0.5]} to={[1.5, -0.3, -0.9]} radius={0.013} />
        <Cable from={[0, -0.1, -1.1]} to={[0.6, -0.32, -1.0]} radius={0.016} />
      </group>
    </group>
  )
}
