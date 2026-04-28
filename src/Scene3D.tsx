import { useRef, useMemo, forwardRef, useImperativeHandle, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { Environment, MeshTransmissionMaterial, Float } from '@react-three/drei'
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

function Sculpture({ progressRef, lite }: SculptProps) {
  const logoGroup = useRef<THREE.Group>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const shards = useRef<THREE.Group>(null!)

  const logoGeom = useLogoGeometry(lite)

  useFrame((state, delta) => {
    const p = progressRef.current
    const t = state.clock.elapsedTime

    if (logoGroup.current) {
      // Same kind of motion the torus knot had: gentle Y spin + sinusoidal X
      // tilt + scroll-driven X rotation + subtle scale breathing
      logoGroup.current.rotation.y += delta * 0.18
      logoGroup.current.rotation.x = Math.sin(t * 0.3) * 0.18 + p * Math.PI * 1.1
      const s = 1 + Math.sin(t * 0.6) * 0.04 - p * 0.12
      logoGroup.current.scale.setScalar(s)
    }

    if (ring.current) {
      ring.current.rotation.z += delta * 0.06
      ring.current.rotation.x = -0.4 + p * 0.6
    }

    if (shards.current) {
      shards.current.rotation.y = -t * 0.04 + p * Math.PI
      shards.current.children.forEach((c, i) => {
        const phase = i * 0.7 + t * 0.4
        c.position.y = Math.sin(phase) * 0.3 + (i - 4) * 0.05
        ;(c as THREE.Mesh).rotation.x = phase
        ;(c as THREE.Mesh).rotation.z = phase * 0.5
      })
    }
  })

  const shardCount = lite ? 5 : 9
  const shardIdx = useMemo(() => Array.from({ length: shardCount }, (_, i) => i), [shardCount])

  return (
    <group>
      {/* PalSec logo, extruded — same material & motion as the previous knot */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group ref={logoGroup}>
          <mesh geometry={logoGeom} castShadow>
            {lite ? (
              <meshPhysicalMaterial
                color="#f25c4c"
                metalness={0.15}
                roughness={0.22}
                clearcoat={1}
                clearcoatRoughness={0.18}
                emissive="#7a1a10"
                emissiveIntensity={0.55}
              />
            ) : (
              <MeshTransmissionMaterial
                backside
                samples={6}
                resolution={512}
                transmission={1}
                roughness={0.06}
                thickness={1.2}
                ior={1.45}
                chromaticAberration={0.18}
                anisotropy={0.4}
                distortion={0.2}
                distortionScale={0.4}
                temporalDistortion={0.1}
                color="#fff5ec"
                attenuationColor="#ea0029"
                attenuationDistance={1.2}
              />
            )}
          </mesh>
        </group>
      </Float>

      {/* Outer thin ring — accent */}
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.6, 0.008, 16, lite ? 120 : 240]} />
        <meshBasicMaterial color="#ea0029" />
      </mesh>

      {/* Orbiting metallic shards */}
      <group ref={shards}>
        {shardIdx.map((i) => {
          const angle = (i / shardCount) * Math.PI * 2
          const r = 3.0 + (i % 3) * 0.18
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
              scale={[0.06 + (i % 4) * 0.015, 0.45 + (i % 3) * 0.18, 0.06]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={i % 4 === 0 ? '#ea0029' : '#f5ede0'}
                metalness={0.9}
                roughness={0.18}
              />
            </mesh>
          )
        })}
      </group>

      {/* Backdrop disc */}
      <mesh position={[0, 0, -3.5]} scale={[14, 14, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#1c1814" roughness={1} metalness={0} />
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

      <ambientLight intensity={lite ? 0.55 : 0.35} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} color="#fff2e0" />
      <directionalLight position={[-3, -2, -2]} intensity={0.6} color="#ea0029" />
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#ffd9c2" />

      <Suspense fallback={null}>
        <Sculpture progressRef={progressRef} lite={lite} />
      </Suspense>
      <Rig progressRef={progressRef} />

      {!lite && <Environment preset="warehouse" />}
    </Canvas>
  )
})

Scene3D.displayName = 'Scene3D'
export default Scene3D
