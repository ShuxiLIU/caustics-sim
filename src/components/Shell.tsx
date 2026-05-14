import type { ReactNode } from 'react'

type ShellProps = {
  sidebar: ReactNode
  viewport: ReactNode
  info: ReactNode
}

export function Shell({ sidebar, viewport, info }: ShellProps) {
  return (
    <div className="app-shell">
      <aside className="panel panel-sidebar">{sidebar}</aside>
      <main className="panel panel-viewport">{viewport}</main>
      <section className="panel panel-info">{info}</section>
    </div>
  )
}
