import { Suspense, lazy } from 'react'
import { InfoPanel } from './components/InfoPanel'
import { Shell } from './components/Shell'
import { Sidebar } from './components/Sidebar'

const Viewport3D = lazy(async () => {
  const module = await import('./components/Viewport3D')
  return { default: module.Viewport3D }
})

export default function App() {
  return (
    <Shell
      sidebar={<Sidebar />}
      viewport={
        <Suspense
          fallback={
            <div className="viewport viewport-loading">
              <div className="viewport-loading-card">
                <p className="eyebrow">Loading</p>
                <h2>正在加载三维渲染模块</h2>
                <p className="muted">
                  首屏先加载控制面板与说明区，Three.js 场景会按需拆包后再挂载。
                </p>
              </div>
            </div>
          }
        >
          <Viewport3D />
        </Suspense>
      }
      info={<InfoPanel />}
    />
  )
}
