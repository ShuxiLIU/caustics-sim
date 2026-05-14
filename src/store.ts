import { create } from 'zustand'
import { phaseDefinitions } from './phaseDefinitions'
import type { NumericParam, PhaseFunctionDefinition, PhaseFunctionId } from './types'

type ParameterMap = Record<string, number>

type SimulationState = {
  phaseId: PhaseFunctionId
  parameters: Record<PhaseFunctionId, ParameterMap>
  screenZ: number
  screenVisible: boolean
  screenSize: number
  sampleCount: number
  setPhaseId: (phaseId: PhaseFunctionId) => void
  setParameter: (phaseId: PhaseFunctionId, key: string, value: number) => void
  setScreenZ: (value: number) => void
  setScreenVisible: (value: boolean) => void
  setScreenSize: (value: number) => void
  setSampleCount: (value: number) => void
}

const toParameterMap = (params: NumericParam[]) =>
  Object.fromEntries(params.map((param) => [param.key, param.value]))

const initialParameters = Object.fromEntries(
  phaseDefinitions.map((definition) => [definition.id, toParameterMap(definition.params)]),
) as Record<PhaseFunctionId, ParameterMap>

export const useSimulationStore = create<SimulationState>((set) => ({
  phaseId: 'polynomial',
  parameters: initialParameters,
  screenZ: 120,
  screenVisible: true,
  screenSize: 100,
  sampleCount: 10000,
  setPhaseId: (phaseId) => set({ phaseId }),
  setParameter: (phaseId, key, value) =>
    set((state) => ({
      parameters: {
        ...state.parameters,
        [phaseId]: {
          ...state.parameters[phaseId],
          [key]: value,
        },
      },
    })),
  setScreenZ: (value) => set({ screenZ: value }),
  setScreenVisible: (value) => set({ screenVisible: value }),
  setScreenSize: (value) => set({ screenSize: value }),
  setSampleCount: (value) => set({ sampleCount: value }),
}))

export const getActivePhaseDefinition = (phaseId: PhaseFunctionId): PhaseFunctionDefinition =>
  phaseDefinitions.find((definition) => definition.id === phaseId) ?? phaseDefinitions[0]