import { useMemo, useState } from 'react'
import { evaluatePhase, evaluateGradient } from '../phaseMath'
import { Modal } from './Modal'
import type { PhaseFunctionId } from '../types'

type PhaseMapProps = {
  phaseId: PhaseFunctionId
  parameters: Record<string, number>
}

const GRID_SIZE = 20
const VIEWBOX_SIZE = 200

type ViewType = 'phase' | 'gradient'

function mapPhaseToColor(value: number, min: number, max: number) {
  const normalized = max > min ? (value - min) / (max - min) : 0.5
  const hue = 205 - normalized * 165
  const lightness = 26 + normalized * 48
  return `hsl(${hue}, 88%, ${lightness}%)`
}

function mapGradientToColor(magnitude: number, maxMagnitude: number) {
  const normalized = maxMagnitude > 0 ? magnitude / maxMagnitude : 0
  const hue = 120 - normalized * 120
  return `hsl(${hue}, 80%, 50%)`
}

export function PhaseMap({ phaseId, parameters }: PhaseMapProps) {
  const [viewType, setViewType] = useState<ViewType>('phase')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const phaseData = useMemo(() => {
    const values: { x: number; y: number; value: number }[] = []
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY

    for (let row = 0; row < GRID_SIZE; row += 1) {
      const y = -2.4 + (4.8 * row) / (GRID_SIZE - 1)
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const x = -2.4 + (4.8 * col) / (GRID_SIZE - 1)
        const value = evaluatePhase(phaseId, parameters, x, y)
        values.push({ x: col, y: row, value })
        min = Math.min(min, value)
        max = Math.max(max, value)
      }
    }

    return { values, min, max }
  }, [parameters, phaseId])

  const gradientData = useMemo(() => {
    const gradients: { x: number; y: number; dx: number; dy: number; magnitude: number }[] = []
    let maxMagnitude = 0

    for (let row = 0; row < GRID_SIZE; row += 1) {
      const y = -2.4 + (4.8 * row) / (GRID_SIZE - 1)
      for (let col = 0; col < GRID_SIZE; col += 1) {
        const x = -2.4 + (4.8 * col) / (GRID_SIZE - 1)
        const { dx, dy } = evaluateGradient(phaseId, parameters, x, y)
        const magnitude = Math.sqrt(dx * dx + dy * dy)
        gradients.push({ x: col, y: row, dx, dy, magnitude })
        maxMagnitude = Math.max(maxMagnitude, magnitude)
      }
    }

    return { gradients, maxMagnitude }
  }, [parameters, phaseId])

  const cellSize = VIEWBOX_SIZE / GRID_SIZE

  const handleDoubleClick = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const generateModalContent = () => {
    return (
      <svg width={1200} height={1200} viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
        {viewType === 'phase' && phaseData.values.map((cell) => (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x * cellSize}
            y={cell.y * cellSize}
            width={cellSize + 0.2}
            height={cellSize + 0.2}
            fill={mapPhaseToColor(cell.value, phaseData.min, phaseData.max)}
          />
        ))}

        {viewType === 'gradient' && gradientData.gradients.map((cell) => (
          <g key={`${cell.x}-${cell.y}`}>
            <rect
              x={cell.x * cellSize}
              y={cell.y * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill={mapGradientToColor(cell.magnitude, gradientData.maxMagnitude)}
            />
            <line
              x1={cell.x * cellSize + cellSize / 2}
              y1={cell.y * cellSize + cellSize / 2}
              x2={cell.x * cellSize + cellSize / 2 + cell.dx * cellSize * 0.4}
              y2={cell.y * cellSize + cellSize / 2 + cell.dy * cellSize * 0.4}
              stroke="white"
              strokeWidth="1"
            />
          </g>
        ))}
      </svg>
    )
  }

  return (
    <div className="phase-map">
      <div className="phase-map-controls">
        <button
          className={viewType === 'phase' ? 'active' : ''}
          onClick={() => setViewType('phase')}
        >
          二维相位图
        </button>
        <button
          className={viewType === 'gradient' ? 'active' : ''}
          onClick={() => setViewType('gradient')}
        >
          相位梯度场
        </button>
      </div>

      <div className="phase-map-container">
        <svg 
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} 
          aria-label="二维相位图"
          onDoubleClick={handleDoubleClick}
        >
          {viewType === 'phase' && phaseData.values.map((cell) => (
            <rect
              key={`${cell.x}-${cell.y}`}
              x={cell.x * cellSize}
              y={cell.y * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill={mapPhaseToColor(cell.value, phaseData.min, phaseData.max)}
            />
          ))}

          {viewType === 'gradient' && gradientData.gradients.map((cell) => (
            <g key={`${cell.x}-${cell.y}`}>
              <rect
                x={cell.x * cellSize}
                y={cell.y * cellSize}
                width={cellSize + 0.2}
                height={cellSize + 0.2}
                fill={mapGradientToColor(cell.magnitude, gradientData.maxMagnitude)}
              />
              <line
                x1={cell.x * cellSize + cellSize / 2}
                y1={cell.y * cellSize + cellSize / 2}
                x2={cell.x * cellSize + cellSize / 2 + cell.dx * cellSize * 0.4}
                y2={cell.y * cellSize + cellSize / 2 + cell.dy * cellSize * 0.4}
                stroke="white"
                strokeWidth="1"
              />
            </g>
          ))}
        </svg>

        <div className="phase-map-colorbar">
          <svg viewBox="0 0 20 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="phaseGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                {viewType === 'phase' && (
                  <>
                    <stop offset="0%" stopColor={mapPhaseToColor(phaseData.min, phaseData.min, phaseData.max)} />
                    <stop offset="50%" stopColor={mapPhaseToColor((phaseData.min + phaseData.max) / 2, phaseData.min, phaseData.max)} />
                    <stop offset="100%" stopColor={mapPhaseToColor(phaseData.max, phaseData.min, phaseData.max)} />
                  </>
                )}
                {viewType === 'gradient' && (
                  <>
                    <stop offset="0%" stopColor={mapGradientToColor(0, gradientData.maxMagnitude)} />
                    <stop offset="100%" stopColor={mapGradientToColor(gradientData.maxMagnitude, gradientData.maxMagnitude)} />
                  </>
                )}
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="20" height="200" fill="url(#phaseGradient)" />
          </svg>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {generateModalContent()}
      </Modal>
    </div>
  )
}