import { phaseDefinitions } from '../phaseDefinitions'
import { getActivePhaseDefinition, useSimulationStore } from '../store'
import { RangeInput } from './RangeInput'

export function Sidebar() {
  const phaseId = useSimulationStore((state) => state.phaseId)
  const parameters = useSimulationStore((state) => state.parameters)
  const setPhaseId = useSimulationStore((state) => state.setPhaseId)
  const setParameter = useSimulationStore((state) => state.setParameter)

  const active = getActivePhaseDefinition(phaseId)
  const activeParams = parameters[phaseId]

  return (
    <div className="stack">
      <div className="hero-card">
        <h1>焦散光场虚拟仿真教学系统</h1>
      </div>

      <section className="card">
        <h2>相位模型</h2>
        <p className="muted controls-hint">选择不同的相位函数以观察焦散效果</p>
        <div className="phase-list">
          {phaseDefinitions.map((definition) => (
            <button
              key={definition.id}
              className={definition.id === phaseId ? 'phase-chip active' : 'phase-chip'}
              onClick={() => setPhaseId(definition.id)}
              type="button"
            >
              <span>{definition.name}</span>
              <small>{definition.expression}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>参数控制</h2>
        <p className="muted controls-hint">调整参数以观察焦散结构的变化</p>
        <div className="stack-sm">
          {active.params.map((param) => (
            <RangeInput
              key={param.key}
              label={param.label}
              value={activeParams[param.key]}
              min={param.min}
              max={param.max}
              step={param.step}
              onChange={(value) => setParameter(phaseId, param.key, value)}
              formatValue={(v) => v.toFixed(2)}
            />
          ))}
        </div>
      </section>


    </div>
  )
}