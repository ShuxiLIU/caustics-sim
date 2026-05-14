import { PhaseMap } from './PhaseMap'
import { ScreenCapture } from './ScreenCapture'
import { RangeInput } from './RangeInput'
import { useSimulationStore } from '../store'

export function InfoPanel() {
  const phaseId = useSimulationStore((state) => state.phaseId)
  const parameters = useSimulationStore((state) => state.parameters[state.phaseId])
  const screenZ = useSimulationStore((state) => state.screenZ)
  const screenVisible = useSimulationStore((state) => state.screenVisible)
  const screenSize = useSimulationStore((state) => state.screenSize)
  const sampleCount = useSimulationStore((state) => state.sampleCount)
  const setScreenZ = useSimulationStore((state) => state.setScreenZ)
  const setScreenVisible = useSimulationStore((state) => state.setScreenVisible)
  const setScreenSize = useSimulationStore((state) => state.setScreenSize)
  const setSampleCount = useSimulationStore((state) => state.setSampleCount)

  return (
    <div className="stack">
      <section className="card">
        <h2>观察面与采样</h2>
        <div className="stack-sm">
          <RangeInput
            label="观察面位置 Z"
            value={screenZ}
            min={0}
            max={250}
            step={1}
            onChange={setScreenZ}
            formatValue={(v) => v.toFixed(0)}
          />

          <RangeInput
            label="观察面大小"
            value={screenSize}
            min={10}
            max={300}
            step={1}
            onChange={setScreenSize}
            formatValue={(v) => v.toFixed(0)}
          />

          <label className="toggle-row">
            <span>显示观察面</span>
            <input
              type="checkbox"
              checked={screenVisible}
              onChange={(event) => setScreenVisible(event.target.checked)}
            />
          </label>

          <RangeInput
            label="采样光线数"
            value={sampleCount}
            min={1000}
            max={50000}
            step={1000}
            onChange={setSampleCount}
            formatValue={(v) => v.toLocaleString('zh-CN')}
          />
        </div>
      </section>

      <section className="card">
        <div className="phase-map-block">
          <PhaseMap phaseId={phaseId} parameters={parameters} />
        </div>
      </section>

      <section className="card">
        <ScreenCapture />
      </section>
    </div>
  )
}