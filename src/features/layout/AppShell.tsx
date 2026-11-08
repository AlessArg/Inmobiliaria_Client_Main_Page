import type { PropsWithChildren } from 'react'
import { mainMenu } from '@shared/config/menu'

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="container">
          <p className="app-shell__brand">Proyecto Final - Client Main Page</p>
          <nav aria-label="Navegacion principal">
            <ul className="app-shell__menu">
              {mainMenu.map((item) => (
                <li key={item.path}>
                  <a href={item.path}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="container app-shell__content">{children}</main>

      <footer className="app-shell__footer">
        <div className="container">
          <small>Base profesional con React + Vite + TypeScript</small>
        </div>
      </footer>
    </div>
  )
}
