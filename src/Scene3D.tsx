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

    geom.rotateX(Math.PI)
    geom.computeBoundingBox()
    const bb = geom.boundingBox!
    const cx = (bb.min.x + bb.max.x) / 2
    const cy = (bb.min.y + bb.max.y) / 2
    const cz = (bb.min.z + bb.max.z) / 2
    geom.translate(-cx, -cy, -cz)

    const sizeX = bb.max.x - bb.min.x
    const target = 3.4
    const k = target / sizeX
    geom.scale(k, k, k)

    geom.computeVertexNormals()
    return geom
  }, [data, lite])
}

// Soft bokeh sprite — very soft falloff, no hot core. Used for the
// premium, defocused-light-spot look.
function makeBokehTexture() {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255, 220, 200, 0.9)')
  g.addColorStop(0.25, 'rgba(255, 180, 150, 0.45)')
  g.addColorStop(0.55, 'rgba(220, 90, 70, 0.18)')
  g.addColorStop(1, 'rgba(180, 50, 40, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Floating bokeh orbs — cinematic out-of-focus light specks. Some big and
// blurry, some small and sharp. Reads as premium, not as a particle effect.
function BokehField({ progressRef, lite }: SculptProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const tex = useMemo(makeBokehTexture, [])

  const orbs = useMemo(() => {
    const count = lite ? 26 : 48
    return Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const r = 1.8 + Math.random() * 3.4
      const depth = (Math.random() - 0.5) * 4
      // Bias toward larger, blurrier orbs in front; smaller ones in back
      const isFar = Math.random() < 0.55
      const scale = isFar ? 0.22 + Math.random() * 0.35 : 0.5 + Math.random() * 1.1
      // Warm tonal range — biased red, with a few champagne highlights
      const warm = Math.random()
      const color = warm < 0.7
        ? new THREE.Color('#ea4a3a').lerp(new THREE.Color('#ff7a55'), Math.random())
        : new THREE.Color('#ffd9b8').lerp(new THREE.Color('#ffc290'), Math.random())
      return {
        x: Math.cos(angle) * r,
        y: (Math.random() - 0.5) * 3.2,
        z: Math.sin(angle) * r + depth,
        scale,
        color,
        opacity: isFar ? 0.18 + Math.random() * 0.18 : 0.35 + Math.random() * 0.28,
        speed: 0.05 + Math.random() * 0.18,
        phase: i * 0.7,
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

// Gradient backdrop shader — replaces the flat black background with a
// warm, cinematic radial gradient + subtle red glow + film grain.
function Backdrop() {
  const matRef = useRef<THREE.ShaderMaterial>(null!)
  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })
  return (
    <mesh position={[0, 0, -8]} scale={[40, 22, 1]} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        depthWrite={false}
        depthTest={false}
        uniforms={{ uTime: { value: 0 } }}
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

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            vec2 uv = vUv - 0.5;
            uv.x *= 1.6;
            float r = length(uv);

            // Base gradient: warm dark center → deeper espresso edges
            vec3 inner = vec3(0.135, 0.095, 0.085);
            vec3 outer = vec3(0.045, 0.030, 0.025);
            vec3 col = mix(inner, outer, smoothstep(0.0, 0.85, r));

            // Soft red glow behind the logo
            float glow = exp(-r * 3.2) * 0.55;
            col += vec3(0.92, 0.18, 0.14) * glow;

            // Off-axis amber rim highlight, very subtle
            vec2 rimUv = vUv - vec2(0.78, 0.32);
            rimUv.x *= 1.4;
            float rim = exp(-length(rimUv) * 4.5) * 0.22;
            col += vec3(0.95, 0.55, 0.30) * rim;

            // Film grain — kept very low so it reads as texture, not noise
            float n = hash(vUv * 1024.0 + floor(uTime * 8.0));
            col += (n - 0.5) * 0.010;

            // Edge vignette
            float v = smoothstep(0.55, 1.05, r);
            col *= 1.0 - v * 0.55;

            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
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
      <Backdrop />

      {/* PalSec logo — red glass */}
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
        <group ref={logoGroup}>
          <mesh geometry={logoGeom} castShadow>
            {lite ? (
              <meshPhysicalMaterial
                color="#ea0029"
                metalness={0}
                roughness={0.18}
                clearcoat={1}
                clearcoatRoughness={0.12}
                transmission={0.6}
                thickness={0.6}
                ior={1.45}
                attenuationColor="#ea0029"
                attenuationDistance={0.8}
                emissive="#3a0006"
                emissiveIntensity={0.4}
              />
            ) : (
              <MeshTransmissionMaterial
                backside
                samples={8}
                resolution={1024}
                transmission={1}
                roughness={0.18}
                thickness={1.4}
                ior={1.4}
                chromaticAberration={0.02}
                anisotropy={0.1}
                distortion={0.05}
                distortionScale={0.2}
                temporalDistortion={0}
                color="#ffe7d8"
                attenuationColor="#ea0029"
                attenuationDistance={1.6}
              />
            )}
          </mesh>
        </group>
      </Float>

      {/* Outer thin ring — red accent */}
      <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.6, 0.008, 16, lite ? 120 : 240]} />
        <meshBasicMaterial color="#ea0029" />
      </mesh>

      {/* Cinematic bokeh orbs */}
      <BokehField progressRef={progressRef} lite={lite} />
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
      <color attach="background" args={['#100806']} />
      {/* Soft, mostly diffuse lighting — avoid saturated red lights that
          create harsh red/black contrast on the transmission material. */}
      <ambientLight intensity={lite ? 0.75 : 0.6} color="#ffe6cc" />
      <directionalLight position={[3, 4, 4]} intensity={0.9} color="#fff0d8" />
      <directionalLight position={[-3, 1, 2]} intensity={0.5} color="#ffd0b0" />
      <pointLight position={[0, 0, 5]} intensity={0.4} color="#ffd9b8" />

      <Suspense fallback={null}>
        <Sculpture progressRef={progressRef} lite={lite} />
      </Suspense>
      <Rig progressRef={progressRef} />

      <Environment preset={lite ? 'sunset' : 'warehouse'} />
    </Canvas>
  )
})

Scene3D.displayName = 'Scene3D'
export default Scene3D
