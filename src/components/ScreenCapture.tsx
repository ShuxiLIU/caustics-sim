import { useMemo, useState } from 'react'
import { evaluateGradient } from '../phaseMath'
import { useSimulationStore } from '../store'
import { Modal } from './Modal'

const GRID_RESOLUTION = 100
const MAX_INTENSITY = 100

export function ScreenCapture() {
  const phaseId = useSimulationStore((state) => state.phaseId)
  const parameters = useSimulationStore((state) => state.parameters[state.phaseId])
  const screenZ = useSimulationStore((state) => state.screenZ)
  const screenSize = useSimulationStore((state) => state.screenSize)
  const sampleCount = useSimulationStore((state) => state.sampleCount)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const intensityMap = useMemo(() => {
    const gridSize = Math.max(12, Math.min(180, Math.round(Math.sqrt(sampleCount))))
    const step = 56 / (gridSize - 1)
    const half = 56 / 2

    const intensity = Array(GRID_RESOLUTION).fill(0).map(() => Array(GRID_RESOLUTION).fill(0))
    const screenHalf = screenSize / 2
    const pixelSize = screenSize / GRID_RESOLUTION

    for (let yi = 0; yi < gridSize; yi += 1) {
      const y = -half + yi * step

      for (let xi = 0; xi < gridSize; xi += 1) {
        const x = -half + xi * step
        const { dx, dy } = evaluateGradient(phaseId, parameters, x / 12, y / 12)

        const directionX = dx * 0.2
        const directionY = dy * 0.2
        const directionZ = 1
        const length = Math.sqrt(directionX * directionX + directionY * directionY + directionZ * directionZ)
        const normX = directionX / length
        const normY = directionY / length
        const normZ = directionZ / length

        const renderDistance = screenZ / normZ

        const hitX = x + normX * renderDistance
        const hitY = y + normY * renderDistance

        if (Math.abs(hitX) <= screenHalf && Math.abs(hitY) <= screenHalf) {
          const gridX = Math.floor((hitX + screenHalf) / pixelSize)
          const gridY = Math.floor((hitY + screenHalf) / pixelSize)

          if (gridX >= 0 && gridX < GRID_RESOLUTION && gridY >= 0 && gridY < GRID_RESOLUTION) {
            intensity[gridY][gridX] = Math.min(intensity[gridY][gridX] + 1, MAX_INTENSITY)
          }
        }
      }
    }

    return intensity
  }, [phaseId, parameters, screenZ, screenSize, sampleCount])

  const generateSVG = () => {
    const pixelSize = screenSize / GRID_RESOLUTION
    const pixels = []

    for (let y = 0; y < GRID_RESOLUTION; y += 1) {
      for (let x = 0; x < GRID_RESOLUTION; x += 1) {
        const intensity = intensityMap[y][x]
        const normalizedIntensity = intensity / MAX_INTENSITY
        const enhancedIntensity = Math.sqrt(normalizedIntensity) * 1.2
        const clampedIntensity = Math.min(enhancedIntensity, 1)
        const gray = Math.floor(clampedIntensity * 255)
        const color = `rgb(${gray}, ${gray}, ${gray})`

        pixels.push(
          <rect
            key={`${x}-${y}`}
            x={x * pixelSize}
            y={y * pixelSize}
            width={pixelSize}
            height={pixelSize}
            fill={color}
          />
        )
      }
    }

    return (
      <svg viewBox={`0 0 ${screenSize} ${screenSize}`} preserveAspectRatio="none">
        {pixels}
      </svg>
    )
  }

  const handleDoubleClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const generateModalContent = () => {
    const pixelSize = screenSize / GRID_RESOLUTION
    const pixels = []

    for (let y = 0; y < GRID_RESOLUTION; y += 1) {
      for (let x = 0; x < GRID_RESOLUTION; x += 1) {
        const intensity = intensityMap[y][x]
        const normalizedIntensity = intensity / MAX_INTENSITY
        const enhancedIntensity = Math.sqrt(normalizedIntensity) * 1.2
        const clampedIntensity = Math.min(enhancedIntensity, 1)
        const gray = Math.floor(clampedIntensity * 255)
        const color = `rgb(${gray}, ${gray}, ${gray})`

        pixels.push(
          <rect
            key={`${x}-${y}`}
            x={x * pixelSize}
            y={y * pixelSize}
            width={pixelSize}
            height={pixelSize}
            fill={color}
          />
        )
      }
    }

    return (
      <svg width={1200} height={1200} viewBox={`0 0 ${screenSize} ${screenSize}`}>
        {pixels}
      </svg>
    )
  }

  return (
    <div className="phase-map">
      <div className="phase-map-controls">
        <button className="active">
          拍摄效果
        </button>
      </div>

      <div className="phase-map-container">
        <div className="screen-capture-image" onDoubleClick={handleDoubleClick}>
          {generateSVG()}
        </div>
        <div className="phase-map-colorbar">
          <svg viewBox="0 0 20 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="intensityGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="rgb(0, 0, 0)" />
                <stop offset="100%" stopColor="rgb(255, 255, 255)" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="20" height="200" fill="url(#intensityGradient)" />
          </svg>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {generateModalContent()}
      </Modal>
    </div>
  )
}