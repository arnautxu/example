import { useRef, useMemo, forwardRef, useImperativeHandle, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

export type Scene3DHandle = {
  setProgress: (t: number) => void
}

type Theme = 'night' | 'day'

type RigProps = { progressRef: React.MutableRefObject<number> }
type SculptProps = RigProps & { lite: boolean; theme: Theme }

const WAYPOINTS: Array<{ pos: [number, number, number]; look: [number, number, number] }> = [
  { pos: [0, 0, 6.5],      look: [0, 0, 0] },
  { pos: [3.6, 1.2, 4.8],  look: [0.6, 0.4, 0] },
  { pos: [-2.4, -1.8, 5.2], look: [0, 0, 0] },
  { pos: [0, 2.4, 3.4],    look: [0, 0, 0] },
  { pos: [-3.2, 0.8, 5.0], look: [-0.4, 0, 0] },
  { pos: [0.8, -0.6, 7.6], look: [0, 0, 0] },
]

function Rig({ progressRef }: RigProps) {
  const tmpPos  = useMemo(() => new THREE.Vector3(), [])
  const tmpLook = useMemo(() => new THREE.Vector3(), [])
  const curPos  = useMemo(() => new THREE.Vector3(0, 0, 6.5), [])
  const curLook = useMemo(() => new THREE.Vector3(0, 0, 0), [])

  useFrame((state, delta) => {
    const p    = progressRef.current
    const segs = WAYPOINTS.length - 1
    const t    = Math.min(Math.max(p, 0), 1) * segs
    const i    = Math.min(Math.floor(t), segs - 1)
    const local = t - i
    const ease  = local * local * (3 - 2 * local)

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

function makeBokehTexture() {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0,    'rgba(255, 220, 200, 0.9)')
  g.addColorStop(0.25, 'rgba(255, 180, 150, 0.45)')
  g.addColorStop(0.55, 'rgba(220, 90,  70,  0.18)')
  g.addColorStop(1,    'rgba(180, 50,  40,  0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function BokehField({ progressRef, lite }: SculptProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const tex = useMemo(makeBokehTexture, [])

  const orbs = useMemo(() => {
    const count = lite ? 26 : 48
    return Array.from({ length: count }, (_, i) => {
      const angle  = Math.random() * Math.PI * 2
      const r      = 1.8 + Math.random() * 3.4
      const depth  = (Math.random() - 0.5) * 4
      const isFar  = Math.random() < 0.55
      const scale  = isFar ? 0.22 + Math.random() * 0.35 : 0.5 + Math.random() * 1.1
      const warm   = Math.random()
      const color  = warm < 0.7
        ? new THREE.Color('#ea4a3a').lerp(new THREE.Color('#ff7a55'), Math.random())
        : new THREE.Color('#ffd9b8').lerp(new THREE.Color('#ffc290'), Math.random())
      return {
        x: Math.cos(angle) * r,
        y: (Math.random() - 0.5) * 3.2,
        z: Math.sin(angle) * r + depth,
        scale, color,
        opacity: isFar ? 0.18 + Math.random() * 0.18 : 0.35 + Math.random() * 0.28,
        speed:   0.05 + Math.random() * 0.18,
        phase:   i * 0.7,
      }
    })
  }, [lite])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const p = progressRef.current
    if (groupRef.current) {
      groupRef.current.rotation.y = -t * 0.018 + p * Math.PI * 0.3
      groupRef.current.rotation.x = Math.sin(t * 0.04) * 0.06 - p * 0.1
      groupRef.current.children.forEach((mesh, i) => {
        const o = orbs[i]
        if (!o) return
        mesh.position.x = o.x + Math.sin(t * o.speed + o.phase) * 0.16
        mesh.position.y = o.y + Math.sin(t * o.speed * 0.8 + o.phase * 1.3) * 0.22
        mesh.position.z = o.z + Math.cos(t * o.speed * 0.7 + o.phase) * 0.16
      })
    }
  })

  return (
    <group ref={groupRef}>
      {orbs.map((o, i) => (
        <sprite key={i} position={[o.x, o.y, o.z]} scale={[o.scale, o.scale, o.scale]}>
          <spriteMaterial
            map={tex}
            color={o.color}
            transparent
            opacity={o.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  )
}

function Backdrop({ theme }: { theme: Theme }) {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  const targetMix = theme === 'day' ? 1 : 0
  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
      const cur = matRef.current.uniforms.uMix.value as number
      const k = 1 - Math.pow(0.001, delta * 0.6)
      matRef.current.uniforms.uMix.value = cur + (targetMix - cur) * k
    }
  })
  return (
    <mesh position={[0, 0, -8]} scale={[40, 22, 1]} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        depthWrite={false}
        depthTest={false}
        uniforms={{ uTime: { value: 0 }, uMix: { value: targetMix } }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform float uMix;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            vec2 uv = vUv - 0.5;
            uv.x *= 1.6;
            float r = length(uv);

            vec3 nInner = vec3(0.085, 0.060, 0.055);
            vec3 nOuter = vec3(0.030, 0.020, 0.018);
            vec3 nGlow  = vec3(0.85, 0.16, 0.12);
            vec3 nRim   = vec3(0.85, 0.45, 0.25);

            vec3 dInner = vec3(0.985, 0.965, 0.935);
            vec3 dOuter = vec3(0.910, 0.870, 0.825);
            vec3 dGlow  = vec3(0.92, 0.50, 0.45);
            vec3 dRim   = vec3(1.00, 0.85, 0.70);

            vec3 inner = mix(nInner, dInner, uMix);
            vec3 outer = mix(nOuter, dOuter, uMix);
            vec3 glowC = mix(nGlow, dGlow, uMix);
            vec3 rimC  = mix(nRim, dRim, uMix);

            vec3 col = mix(inner, outer, smoothstep(0.0, 0.85, r));
            float glow = exp(-r * 4.5) * mix(0.32, 0.24, uMix);
            col += glowC * glow;

            vec2 rimUv = vUv - vec2(0.78, 0.32);
            rimUv.x *= 1.4;
            float rim = exp(-length(rimUv) * 5.5) * 0.14;
            col += rimC * rim;

            float n = hash(vUv * 1024.0 + floor(uTime * 8.0));
            col += (n - 0.5) * 0.008;

            float v = smoothstep(0.45, 1.05, r);
            col *= 1.0 - v * mix(0.65, 0.22, uMix);

            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

function Sculpture({ progressRef, lite, theme }: SculptProps) {
  const helixGroup = useRef<THREE.Group>(null!)
  const ring       = useRef<THREE.Mesh>(null!)
  const ribbonRefs = useRef<Array<THREE.Mesh | null>>([])
  const spineRefs  = useRef<Array<THREE.Mesh | null>>([])

  useFrame((state, delta) => {
    const p = progressRef.current
    const t = state.clock.elapsedTime

    if (helixGroup.current) {
      helixGroup.current.rotation.y += delta * 0.16
      helixGroup.current.rotation.x = Math.sin(t * 0.24) * 0.12 + p * Math.PI * 0.9
      const s = 1 + Math.sin(t * 0.6) * 0.04 - p * 0.12
      helixGroup.current.scale.setScalar(s)
    }

    ribbonRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.rotation.z = Math.sin(t * 0.9 + i * 0.22) * 0.12
      mesh.rotation.x = Math.cos(t * 0.55 + i * 0.18) * 0.08
    })

    spineRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      mesh.position.y += Math.sin(t * 1.1 + i * 1.7) * 0.0008
      mesh.rotation.y  += delta * (0.1 + i * 0.04)
    })

    if (ring.current) {
      ring.current.rotation.z += delta * 0.06
      ring.current.rotation.x = -0.4 + p * 0.6
    }
  })

  return (
    <group>
      <Backdrop theme={theme} />
      <Environment preset={theme === 'day' ? 'apartment' : 'warehouse'} />

      {/* Helicoidal column with diamond refraction material */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group ref={helixGroup}>
          {[0, Math.PI * 0.66, Math.PI * 1.33].map((phase, strandIndex) =>
            Array.from({ length: lite ? 8 : 10 }, (_, i) => {
              const count  = lite ? 7 : 9
              const tSeg   = i / count
              const angle  = phase + tSeg * Math.PI * 2.18
              const radius = 0.68 + Math.sin(tSeg * Math.PI) * 0.14
              const x      = Math.cos(angle) * radius
              const y      = -1.9 + tSeg * 3.8
              const z      = Math.sin(angle) * radius * 0.38
              const rotY   = angle + Math.PI / 2
              const scaleY = 0.52 + Math.sin(tSeg * Math.PI) * 0.34
              const refIndex = strandIndex * (lite ? 8 : 10) + i

              return (
                <mesh
                  key={`${strandIndex}-${i}`}
                  ref={(el) => { ribbonRefs.current[refIndex] = el }}
                  position={[x, y, z]}
                  rotation={[0, rotY, Math.PI / 9]}
                  scale={[0.12, scaleY, 0.36]}
                >
                  <boxGeometry args={[1, 1, 1]} />
                  <MeshTransmissionMaterial
                    backside
                    thickness={lite ? 0.4 : 0.6}
                    roughness={0.05}
                    chromaticAberration={0.04}
                    anisotropy={0.3}
                    distortion={0.2}
                    distortionScale={0.4}
                    temporalDistortion={0.1}
                    ior={1.4}
                    color="#ffffff"
                    transmissionSampler
                  />
                </mesh>
              )
            }),
          )}

          {/* Spine elements — kept with simple transparent material */}
          {[
            { pos: [0, 0, 0],     scale: [0.1, 3.6, 0.1] },
            { pos: [0, 0.18, 0],  scale: [0.04, 2.7, 0.04] },
            { pos: [0, -0.15, 0], scale: [0.26, 0.22, 0.26] },
          ].map((spine, i) => (
            <mesh
              key={`spine-${i}`}
              ref={(el) => { spineRefs.current[i] = el }}
              position={spine.pos as [number, number, number]}
              scale={spine.scale as [number, number, number]}
            >
              <cylinderGeometry args={[1, 1, 1, lite ? 10 : 18]} />
              {i === 0 ? (
                <meshBasicMaterial color="#fff8f0" transparent opacity={0.1} />
              ) : i === 1 ? (
                <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
              ) : (
                <meshBasicMaterial color="#fff3ea" transparent opacity={0.12} />
              )}
            </mesh>
          ))}
        </group>
      </Float>

      {/* Outer ring — glass transmission material */}
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.2, 0.055, 32, lite ? 120 : 240]} />
        <MeshTransmissionMaterial
          backside
          thickness={0.6}
          roughness={0.1}
          chromaticAberration={0.04}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.4}
          temporalDistortion={0.1}
          ior={1.4}
          color="#ffffff"
          transmissionSampler
        />
      </mesh>

      {/* Cinematic bokeh orbs */}
      <BokehField progressRef={progressRef} lite={lite} theme={theme} />
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

type Scene3DProps = { theme: Theme }

const Scene3D = forwardRef<Scene3DHandle, Scene3DProps>(({ theme }, ref) => {
  const progressRef = useRef(0)
  const lite = useIsLite()

  useImperativeHandle(ref, () => ({
    setProgress: (t: number) => { progressRef.current = t },
  }))

  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.8]}
      gl={{ antialias: !lite, alpha: false, powerPreference: 'high-performance' }}
      camera={{ fov: 38, position: [0, 0, 6.5] }}
      frameloop="always"
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={[theme === 'day' ? '#f4ece0' : '#100806']} />
      <ambientLight intensity={theme === 'day' ? 1.2 : 0.7}   color={theme === 'day' ? '#fff7e8' : '#ffe6cc'} />
      <directionalLight position={[4, 5, 4]}  intensity={theme === 'day' ? 1.6 : 1.1} color={theme === 'day' ? '#ffffff' : '#fff0d8'} />
      <directionalLight position={[-3, 1, 2]} intensity={theme === 'day' ? 0.8 : 0.6} color={theme === 'day' ? '#ffe8d4' : '#ffd0b0'} />
      <pointLight        position={[0, 0, 5]}  intensity={theme === 'day' ? 0.7 : 0.5} color={theme === 'day' ? '#ffeed6' : '#ffd9b8'} />

      <Suspense fallback={null}>
        <Sculpture progressRef={progressRef} lite={lite} theme={theme} />
      </Suspense>
      <Rig progressRef={progressRef} />
    </Canvas>
  )
})

Scene3D.displayName = 'Scene3D'
export default Scene3D
