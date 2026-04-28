import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, MeshTransmissionMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

export type Scene3DHandle = {
  setProgress: (t: number) => void
}

type RigProps = { progressRef: React.MutableRefObject<number> }

// Six camera waypoints — one per scene. Position + look-at target.
const WAYPOINTS: Array<{ pos: [number, number, number]; look: [number, number, number] }> = [
  { pos: [0, 0, 6.5], look: [0, 0, 0] },         // 0 title
  { pos: [3.6, 1.2, 4.8], look: [0.6, 0.4, 0] }, // 1 manifesto
  { pos: [-2.4, -1.8, 5.2], look: [0, 0, 0] },   // 2 works
  { pos: [0, 2.4, 3.4], look: [0, 0, 0] },       // 3 quote
  { pos: [-3.2, 0.8, 5.0], look: [-0.4, 0, 0] }, // 4 services
  { pos: [0.8, -0.6, 7.6], look: [0, 0, 0] },    // 5 contact
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
    const ease = local * local * (3 - 2 * local) // smoothstep

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

    const k = 1 - Math.pow(0.001, delta) // smoothing
    curPos.lerp(tmpPos, k)
    curLook.lerp(tmpLook, k)

    state.camera.position.copy(curPos)
    state.camera.lookAt(curLook)
  })

  return null
}

function Sculpture({ progressRef }: RigProps) {
  const knot = useRef<THREE.Mesh>(null!)
  const ring = useRef<THREE.Mesh>(null!)
  const shards = useRef<THREE.Group>(null!)

  useFrame((state, delta) => {
    const p = progressRef.current
    const t = state.clock.elapsedTime

    if (knot.current) {
      knot.current.rotation.y += delta * 0.18
      knot.current.rotation.x = Math.sin(t * 0.3) * 0.2 + p * Math.PI * 1.2
      const s = 1 + Math.sin(t * 0.6) * 0.04 - p * 0.15
      knot.current.scale.setScalar(s)
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

  const shardMats = useMemo(() => Array.from({ length: 9 }, (_, i) => i), [])

  return (
    <group>
      {/* Central glass torus knot — the hero object */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={knot}>
          <torusKnotGeometry args={[1.05, 0.32, 220, 32, 2, 3]} />
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
            attenuationColor="#f25c4c"
            attenuationDistance={1.2}
          />
        </mesh>
      </Float>

      {/* Outer thin ring — accent */}
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.4, 0.008, 16, 240]} />
        <meshBasicMaterial color="#f25c4c" />
      </mesh>

      {/* Orbiting metallic shards */}
      <group ref={shards}>
        {shardMats.map((i) => {
          const angle = (i / 9) * Math.PI * 2
          const r = 2.9 + (i % 3) * 0.18
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
              scale={[0.06 + (i % 4) * 0.015, 0.45 + (i % 3) * 0.18, 0.06]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={i % 4 === 0 ? '#f25c4c' : '#f5ede0'}
                metalness={0.9}
                roughness={0.18}
              />
            </mesh>
          )
        })}
      </group>

      {/* Backdrop disc — adds depth, catches accent light */}
      <mesh position={[0, 0, -3.5]} scale={[14, 14, 1]}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#1c1814" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

const Scene3D = forwardRef<Scene3DHandle>((_, ref) => {
  const progressRef = useRef(0)

  useImperativeHandle(ref, () => ({
    setProgress: (t: number) => {
      progressRef.current = t
    },
  }))

  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: false }}
      camera={{ fov: 38, position: [0, 0, 6.5] }}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={['#100e0c']} />
      <fog attach="fog" args={['#100e0c', 8, 22]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} color="#fff2e0" />
      <directionalLight position={[-3, -2, -2]} intensity={0.6} color="#f25c4c" />
      <pointLight position={[0, 0, 4]} intensity={0.6} color="#ffd9c2" />

      <Sculpture progressRef={progressRef} />
      <Rig progressRef={progressRef} />

      <Environment preset="warehouse" />
    </Canvas>
  )
})

Scene3D.displayName = 'Scene3D'
export default Scene3D
