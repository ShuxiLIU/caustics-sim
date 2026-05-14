import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { evaluateGradient, evaluatePhase } from '../phaseMath'
import { useSimulationStore } from '../store'

const APERTURE_SIZE = 56
const HEIGHT_SCALE = 3.0
const DEFLECTION_SCALE = 0.2
const INCIDENT_Z = -42
const MAX_GRID_SIZE = 180
const SURFACE_SEGMENTS = 100

type RayBundle = {
  lineGeometry: THREE.BufferGeometry
  renderedRayCount: number
}

function buildSurfaceGeometry(
  phaseId: ReturnType<typeof useSimulationStore.getState>['phaseId'],
  parameters: Record<string, number>,
) {
  const geometry = new THREE.PlaneGeometry(
    APERTURE_SIZE,
    APERTURE_SIZE,
    SURFACE_SEGMENTS,
    SURFACE_SEGMENTS,
  )
  const positions = geometry.attributes.position

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const y = positions.getY(index)
    const phaseValue = evaluatePhase(phaseId, parameters, x / 12, y / 12)
    positions.setZ(index, phaseValue * HEIGHT_SCALE)
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

function buildRayBundle(
  phaseId: ReturnType<typeof useSimulationStore.getState>['phaseId'],
  parameters: Record<string, number>,
  sampleCount: number,
  screenZ: number,
  screenVisible: boolean,
): RayBundle {
  const gridSize = Math.max(12, Math.min(MAX_GRID_SIZE, Math.round(Math.sqrt(sampleCount))))
  const step = APERTURE_SIZE / (gridSize - 1)
  const half = APERTURE_SIZE / 2
  const totalRays = gridSize * gridSize
  
  const linePositions = new Float32Array(totalRays * 12)
  let rayIndex = 0

  for (let yi = 0; yi < gridSize; yi += 1) {
    const y = -half + yi * step

    for (let xi = 0; xi < gridSize; xi += 1) {
      const x = -half + xi * step
      const { dx, dy } = evaluateGradient(phaseId, parameters, x / 12, y / 12)
      
      const directionX = dx * DEFLECTION_SCALE
      const directionY = dy * DEFLECTION_SCALE
      const directionZ = 1
      const length = Math.sqrt(directionX * directionX + directionY * directionY + directionZ * directionZ)
      const normX = directionX / length
      const normY = directionY / length
      const normZ = directionZ / length

      const renderDistance = screenVisible ? screenZ / normZ : 300
      
      const lineEndX = x + normX * renderDistance
      const lineEndY = y + normY * renderDistance
      const lineEndZ = 0 + normZ * renderDistance

      const lineOffset = rayIndex * 12
      linePositions[lineOffset] = x
      linePositions[lineOffset + 1] = y
      linePositions[lineOffset + 2] = INCIDENT_Z
      linePositions[lineOffset + 3] = x
      linePositions[lineOffset + 4] = y
      linePositions[lineOffset + 5] = 0
      linePositions[lineOffset + 6] = x
      linePositions[lineOffset + 7] = y
      linePositions[lineOffset + 8] = 0
      linePositions[lineOffset + 9] = lineEndX
      linePositions[lineOffset + 10] = lineEndY
      linePositions[lineOffset + 11] = lineEndZ
      
      rayIndex += 1
    }
  }

  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(linePositions, 3),
  )

  return {
    lineGeometry,
    renderedRayCount: totalRays,
  }
}

function SceneContent() {
  const phaseId = useSimulationStore((state) => state.phaseId)
  const parameters = useSimulationStore((state) => state.parameters[state.phaseId])
  const screenZ = useSimulationStore((state) => state.screenZ)
  const screenVisible = useSimulationStore((state) => state.screenVisible)
  const screenSize = useSimulationStore((state) => state.screenSize)
  const sampleCount = useSimulationStore((state) => state.sampleCount)

  const surfaceGeometry = useMemo(
    () => buildSurfaceGeometry(phaseId, parameters),
    [parameters, phaseId],
  )

  const rayBundle = useMemo(
    () => buildRayBundle(phaseId, parameters, sampleCount, screenZ, screenVisible),
    [parameters, phaseId, sampleCount, screenZ, screenVisible],
  )

  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null)

  useFrame((state) => {
    const focus = new THREE.Vector3(54, -10, -28)
    const distance = state.camera.position.distanceTo(focus)
    const distanceFactor = THREE.MathUtils.clamp((distance - 70) / 150, 0, 1)

    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = THREE.MathUtils.lerp(0.08, 0.28, distanceFactor)
    }
  })

  return (
    <>
      <color attach="background" args={['#01050a']} />
      <fog attach="fog" args={['#01050a', 150, 350]} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[60, 45, 40]} intensity={1.2} color="#a8d8ff" />
      <pointLight position={[0, 0, 120]} intensity={2500} distance={300} color="#7fbfff" />
      <axesHelper args={[20]} />

      <group position={[32, -10, -18]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[APERTURE_SIZE, APERTURE_SIZE]} />
          <meshBasicMaterial color="#4a89dc" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        <mesh geometry={surfaceGeometry} position={[0, 0, 0.01]}>
          <meshStandardMaterial
            color="#3498db"
            emissive="#0a243c"
            metalness={0.1}
            roughness={0.25}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>

        {screenVisible && (
          <mesh position={[0, 0, screenZ]}>
            <planeGeometry args={[screenSize, screenSize]} />
            <meshStandardMaterial 
              color="#36d7b7" 
              emissive="#36d7b7" 
              emissiveIntensity={1.2}
              transparent 
              opacity={0.5} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        )}

        <lineSegments geometry={rayBundle.lineGeometry}>
          <lineBasicMaterial
            ref={lineMaterialRef}
            color="#fffbcc"
            transparent
            opacity={0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </lineSegments>
      </group>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enablePan
        panSpeed={1.15}
        target={[56, -10, -28]}
        minDistance={200}
        maxDistance={800}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />
    </>
  )
}

export function Viewport3D() {
  return (
    <div className="viewport">
      <Canvas
        className="viewport-canvas-host"
        dpr={[1, 1.5]}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 800], fov: 22, near: 0.1, far: 800 }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}