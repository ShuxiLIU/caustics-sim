export type PhaseFunctionId =
  | 'polynomial'
  | 'airy'
  | 'vortex'
  | 'axicon'
  | 'noise'

export type NumericParam = {
  key: string
  label: string
  min: number
  max: number
  step: number
  value: number
}

export type PhaseFunctionDefinition = {
  id: PhaseFunctionId
  name: string
  expression: string
  summary: string
  explanation: string
  caveats: string[]
  params: NumericParam[]
}
