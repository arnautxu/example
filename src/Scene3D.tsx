import { useRef, useMemo, forwardRef, useImperativeHandle, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Environment, Float } from '@react-three/drei'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'
import * as THREE from 'three'

export type Scene3DHandle = {
  setProgress: (t: number) => void
}

type RigProps = { progressRef: React.MutableRefObject<number> }
type SculptProps = RigProps & { lite: boolean }

const WAYPOINTS: Array<{ pos: [number, number, number]; look: [number, number, number] }> = [
  { pos: [0, 0, 6.5], look: [0, 0, 0] },
  { pos: [3.6, 1.2, 4.8], look: [0.6, 0.4, 0] },
  { pos: [-2.4, -1.8, 5.2], look: [0, 0, 0] },
  { pos: [0, 2.4, 3.4], look: [0, 0, 0] },
  { pos: [-3.2, 0.8, 5.0], look: [-0.4, 0, 0] },
  { pos: [0.8, -0.6, 7.6], look: [0, 0, 0] },
]

function Rig({ progressRef }: RigProps) {
  const tmpPos = useMemo(() => new THREE.Vector3(), [])
  const tmpLook = useMemo(() => new THREE.Vector3(), [])
  const curPos = useMemo(() => new THREE.Vector3(0, 0, 6.5), [])
  const curLook = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useFrame((state, delta) => {
    const p = progressRef.current
    const segs = WAYPOINTS.length - 1
    const t = Math.min(Math.max(p, 0), 1) * segs
    const i = Math.min(Math.floor(t), segs - 1)
    const local = t - i
    const ease = local * local * (3 - 2 * local)

    const a = WAYPOINTS[i]
    const b = WAYPOINTS[i + 1]
    tmpPos.set(
      a.pos[0] + (b.pos[0] - a.pos[0]) * ease,
      a.pos[1] + (b.pos[1] - a.pos[1]) * ease,
      a.pos[2] + (b.pos[2] - a.pos[2]) * ease,
    )
    tmpLook.set(
      a.look[0] + (b.look[0] - a.look[0]) * ease,
      a.look[1] + (b.look[1] - a.look[1]) * ease,
      a.look[2] + (b.look[2] - a.look[2]) * ease,
    )

    const k = 1 - Math.pow(0.001, delta)
    curPos.lerp(tmpPos, k)
    curLook.lerp(tmpLook, k)

    state.camera.position.copy(curPos)
    state.camera.lookAt(curLook)
  })

  return null
}

// Build a single, centered, normalized BufferGeometry from the PalSec logo SVG.
function useLogoGeometry(lite: boolean): THREE.BufferGeometry {
  const data = useLoader(SVGLoader, '/palsec-logo.svg')

  return useMemo(() => {
    const shapes: THREE.Shape[] = []
    for (const path of data.paths) {
      const ss = SVGLoader.createShapes(path)
      for (const s of ss) shapes.push(s)
    }

    const depth = lite ? 22 : 28
    const geom = new THREE.ExtrudeGeometry(shapes, {
      depth,
      bevelEnabled: true,
      bevelSegments: lite ? 2 : 4,
      bevelSize: 1.4,
      bevelThickness: 1.4,
      curveSegments: lite ? 8 : 14,
    })

    // SVG y-axis is flipped vs three.js
    geom.scale(1, -1, 1)
    geom.computeBoundingBox()
    const bb = geom.boundingBox!
    const cx = (bb.min.x + bb.max.x) / 2
    const cy = (bb.min.y + bb.max.y) / 2
    const cz = (bb.min.z + bb.max.z) / 2
    geom.translate(-cx, -cy, -cz)

    // Normalize size so the logo's longest side fits ~3 units
    const sizeX = bb.max.x - bb.min.x
    const target = 3.4
    const k = target / sizeX
    geom.scale(k, k, k)

    geom.computeVertexNormals()
    return geom
  }, [data, lite])
}

// Build a soft circular sprite for dust particles — single radial gradient.
function makeDustTexture() {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255, 230, 160, 1)')
  g.addColorStop(0.4, 'rgba(255, 200, 110, 0.6)')
  g.addColorStop(1, 'rgba(255, 180, 80, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function GoldenDust({ progressRef, lite }: SculptProps) {
  const ref = useRef<THREE.Points>(null!)
  const count = lite ? 220 : 700
  const tex = useMemo(makeDustTexture, [])

  const { positions, basePositions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const basePositions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      // Spherical-ish cloud, biased toward a wide flat ring, but with depth
      const angle = Math.random() * Math.PI * 2
      const r = 2.2 + Math.random() * 2.4
      const y = (Math.random() - 0.5) * 2.6
      const z = Math.sin(angle) * r + (Math.random() - 0.5) * 0.6
      const x = Math.cos(angle) * r + (Math.random() - 0.5) * 0.6
      positions[i * 3 + 0] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      basePositions[i * 3 + 0] = x
      basePositions[i * 3 + 1] = y
      basePositions[i * 3 + 2] = z
      speeds[i] = 0.4 + Math.random() * 1.2
    }
    return { positions, basePositions, speeds }
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const p = progressRef.current
    const t = state.clock.elapsedTime
    const arr = (ref.current.geometry.attributes.position.array as Float32Array)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const sp = speeds[i]
      arr[i3 + 1] = basePositions[i3 + 1] + Math.sin(t * sp + i) * 0.18
      arr[i3 + 0] = basePositions[i3 + 0] + Math.sin(t * sp * 0.6 + i * 1.3) * 0.12
      arr[i3 + 2] = basePositions[i3 + 2] + Math.cos(t * sp * 0.7 + i * 0.7) * 0.12
    }
    ref.current.geometry.attributes.position.needsUpdate = true

    // Slow drifting rotation, biased by scroll progress
    ref.current.rotation.y = -t * 0.04 + p * Math.PI * 0.6
    ref.current.rotation.x = Math.sin(t * 0.05) * 0.1 - p * 0.2
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={lite ? 0.07 : 0.085}
        map={tex}
        color="#ffd271"
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

function Sculpture({ progressRef, lite }: SculptProps) {
  const logoGroup = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)

  const logoGeom = useLogoGeometry(lite)

  useFrame((state, delta) => {
    const p = progressRef.current
    const t = state.clock.elapsedTime

    if (logoGroup.current) {
      logoGroup.current.rotation.y += delta * 0.18
      logoGroup.current.rotation.x = Math.sin(t * 0.3) * 0.18 + p * Math.PI * 1.1
      const s = 1 + Math.sin(t * 0.6) * 0.04 - p * 0.12
      logoGroup.current.scale.setScalar(s)
    }

    if (ring.current) {
      ring.current.rotation.z += delta * 0.06
      ring.current.rotation.x = -0.4 + p * 0.6
    }
  })

  return (
    <group>
      {/* PalSec logo, extruded — gold material */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group ref={logoGroup}>
          <mesh geometry={logoGeom} castShadow>
            <meshPhysicalMaterial
              color="#d4a23a"
              metalness={1}
              roughness={lite ? 0.32 : 0.22}
              clearcoat={0.6}
              clearcoatRoughness={0.25}
              emissive="#3a2200"
              emissiveIntensity={0.25}
              envMapIntensity={1.4}
            />
          </mesh>
        </group>
      </Float>

      {/* Outer thin ring — gold accent */}
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.6, 0.008, 16, lite ? 120 : 240]} />
        <meshBasicMaterial color="#ffd271" />
      </mesh>

      {/* Golden dust cloud — replaces the orbiting shards */}
      <GoldenDust progressRef={progressRef} lite={lite} />

      {/* Backdrop disc */}
      <mesh position={[0, 0, -3.5]} scale={[14, 14, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#15110c" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

function useIsLite() {
  const [lite, setLite] = useState(() => {
    if (typeof window === 'undefined') return false
    const narrow = window.matchMedia('(max-width: 820px)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const lowMem = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4
    return narrow || coarse || lowMem
  })
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 820px), (pointer: coarse)')
    const onChange = () => setLite(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return lite
}

const Scene3D = forwardRef<Scene3DHandle>((_, ref) => {
  const progressRef = useRef(0)
  const lite = useIsLite()

  useImperativeHandle(ref, () => ({
    setProgress: (t: number) => {
      progressRef.current = t
    },
  }))

  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.8]}
      gl={{ antialias: !lite, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 38, position: [0, 0, 6.5] }}
      frameloop="always"
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#100e0c']} />
      {!lite && <fog attach="fog" args={['#100e0c', 8, 22]} />}

      <ambientLight intensity={lite ? 0.4 : 0.25} color="#fff1d6" />
      <directionalLight position={[4, 5, 3]} intensity={1.6} color="#fff2cf" />
      <directionalLight position={[-3, -2, -2]} intensity={0.5} color="#a86a1a" />
      <pointLight position={[0, 0, 4]} intensity={0.7} color="#ffce8a" />

      <Suspense fallback={null}>
        <Sculpture progressRef={progressRef} lite={lite} />
      </Suspense>
      <Rig progressRef={progressRef} />

      {/* Gold needs reflections to read as gold — keep env on mobile too */}
      <Environment preset={lite ? 'sunset' : 'warehouse'} />
    </Canvas>
  )
})

Scene3D.displayName = 'Scene3D'
export default Scene3D
