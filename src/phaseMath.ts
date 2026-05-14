import type { PhaseFunctionId } from './types'

export type ParameterMap = Record<string, number>

// 统一空间尺度和数值稳定性参数
const NOISE_SCALE = 0.15
const EPSILON = 1e-5 // 用于避免除零错误的小量
const GRADIENT_CLAMP = 10.0 // 梯度幅值的上限，避免数值爆炸

export function evaluatePhase(
  phaseId: PhaseFunctionId,
  parameters: ParameterMap,
  x: number,
  y: number,
) {
  switch (phaseId) {
    case 'polynomial': {
      const a = parameters.a ?? 0
      const b = parameters.b ?? 0
      const c = parameters.c ?? 0
      const d = parameters.d ?? 0
      return a * x * x + b * y * y + c * x * y + d * x
    }
    case 'airy': {
      const alpha = parameters.alpha ?? 0
      const beta = parameters.beta ?? 0
      return alpha * x * x * x + beta * y * y * y
    }
    case 'vortex': {
      const m = parameters.m ?? 0
      return m * Math.atan2(y, x)
    }
    case 'axicon': {
      const alpha = parameters.alpha ?? 0
      return alpha * Math.sqrt(x * x + y * y)
    }
    case 'noise': {
      const frequency = parameters.frequency ?? 1
      const amplitude = parameters.amplitude ?? 0
      const fx = frequency * NOISE_SCALE
      return (
        amplitude *
        (Math.sin(x * fx) * Math.cos(y * fx * 1.3) +
          0.35 * Math.sin((x + y) * fx * 0.7) +
          0.2 * Math.cos((x - 2 * y) * fx * 1.7))
      )
    }
  }
}

export function evaluateGradient(
  phaseId: PhaseFunctionId,
  parameters: ParameterMap,
  x: number,
  y: number,
) {
  let dx: number
  let dy: number

  switch (phaseId) {
    case 'polynomial': {
      const a = parameters.a ?? 0
      const b = parameters.b ?? 0
      const c = parameters.c ?? 0
      const d = parameters.d ?? 0
      dx = 2 * a * x + c * y + d
      dy = 2 * b * y + c * x
      break
    }
    case 'airy': {
      const alpha = parameters.alpha ?? 0
      const beta = parameters.beta ?? 0
      dx = 3 * alpha * x * x
      dy = 3 * beta * y * y
      break
    }
    case 'vortex': {
      const m = parameters.m ?? 0
      const r2 = x * x + y * y + EPSILON
      dx = (-m * y) / r2
      dy = (m * x) / r2
      break
    }
    case 'axicon': {
      const alpha = parameters.alpha ?? 0
      const radius = Math.sqrt(x * x + y * y + EPSILON)
      dx = (alpha * x) / radius
      dy = (alpha * y) / radius
      break
    }
    case 'noise': {
      const frequency = parameters.frequency ?? 1
      const amplitude = parameters.amplitude ?? 0
      const fx = frequency * NOISE_SCALE
      dx =
        amplitude *
        (fx * Math.cos(x * fx) * Math.cos(y * fx * 1.3) +
          0.35 * fx * 0.7 * Math.cos((x + y) * fx * 0.7) -
          0.2 * fx * 1.7 * Math.sin((x - 2 * y) * fx * 1.7))
      dy =
        amplitude *
        (-1.3 * fx * Math.sin(x * fx) * Math.sin(y * fx * 1.3) +
          0.35 * fx * 0.7 * Math.cos((x + y) * fx * 0.7) +
          0.4 * fx * 1.7 * Math.sin((x - 2 * y) * fx * 1.7))
      break
    }
  }

  // 限制梯度幅值，避免数值爆炸
  const magnitude = Math.sqrt(dx * dx + dy * dy)
  if (magnitude > GRADIENT_CLAMP) {
    const scale = GRADIENT_CLAMP / magnitude
    dx *= scale
    dy *= scale
  }

  return { dx, dy }
}