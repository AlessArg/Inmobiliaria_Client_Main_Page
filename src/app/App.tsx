import { useState } from 'react'
import { LoginPage } from '@features/auth'
import { useClientSession } from '@features/auth/useClientSession'
import { HomePage } from '@features/home/HomePage'
import { GuestProcessesView } from '@features/processes'
import { CustomerProcessesView } from '@features/processes/CustomerProcessesView'
import { GuestProfileDrawer } from '@features/profile'
import { CustomerProfileDrawer } from '@features/profile/CustomerProfileDrawer'
import { ProjectsRealEstateView } from '@features/projects'
import { EmployeesView } from '@features/employees/EmployeesView'

type Section = 'home' | 'projects' | 'processes' | 'employees'

const navigation: Array<{ id: Section; label: string; icon: string }> = [
  { id: 'home', label: 'Inicio', icon: '⌂' },
  { id: 'projects', label: 'Proyectos', icon: '▣' },
  { id: 'processes', label: 'Mis procesos', icon: '◷' },
  { id: 'employees', label: 'Empleados', icon: '♧' },
]

export default function App() {
  const auth = useClientSession()
  const [guest, setGuest] = useState(false)
  const [section, setSection] = useState<Section>('home')
  const [profileOpen, setProfileOpen] = useState(false)
  const [publicCareers, setPublicCareers] = useState(false)
  const customer = auth.customer

  const logout = async () => {
    if (!customer || await auth.logout()) {
      setGuest(false)
      setSection('home')
      setProfileOpen(false)
    }
  }

  if (auth.initializing) return <main className="session-loading" role="status">Preparando tu sesión…</main>

  if (!customer && !guest && publicCareers) return <main className="public-careers-page"><button className="public-careers-back" type="button" onClick={() => setPublicCareers(false)}>← Volver al inicio de sesión</button><EmployeesView /></main>

  if (!customer && !guest) return <LoginPage
    feedbackMessage={auth.error} busy={auth.busy}
    onGuestAccess={() => { setGuest(true); setSection('home') }}
    onGoogleLogin={auth.loginGoogle} onEmailLogin={auth.loginEmail}
    pendingGoogle={!!auth.pendingGoogle} onGooglePhone={auth.finishGoogle}
    onRegister={auth.register} onClearError={auth.clearError}
    onCareers={() => setPublicCareers(true)}
  />

  const userLabel = customer?.displayName || customer?.email || 'Invitado'
  return (
    <div className="client-workspace" key={customer?.uid ?? 'guest'}>
      <aside className="client-sidebar">
        <div className="client-brand"><span>PH</span><div><strong>PHIEN</strong><small>BIENES RAÍCES</small></div></div>
        <p className="client-sidebar-label">NAVEGACIÓN</p>
        <nav className="client-navigation" aria-label="Navegación principal de cliente">
          {navigation.map(item => <button key={item.id} type="button" className={section === item.id ? 'is-active' : ''} onClick={() => setSection(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
        </nav>
        <div className="client-sidebar-help"><strong>¿Necesitas ayuda?</strong><span>Estamos para acompañarte.</span><button type="button" onClick={() => setSection('projects')}>Ver proyectos</button></div>
        {!customer ? <button type="button" className="client-logout" onClick={() => setGuest(false)}>Iniciar sesión / Crear cuenta</button> : null}
        <button type="button" className="client-logout" disabled={auth.busy} onClick={() => void logout()}><span aria-hidden="true">↪</span><span>{customer ? 'Cerrar sesión' : 'Salir del modo invitado'}</span></button>
      </aside>
      <main className="client-main">
        <header className="client-topbar"><div><p className="eyebrow">PORTAL DE CLIENTES</p><h2>{section === 'home' ? 'Bienvenido' : section === 'projects' ? 'Proyectos inmobiliarios' : section === 'employees' ? 'Empleados' : 'Mis procesos'}</h2></div><button type="button" className="client-user" aria-label={`Abrir perfil de ${userLabel}`} aria-expanded={profileOpen} onClick={() => setProfileOpen(true)}><span>{userLabel.charAt(0).toUpperCase()}</span><div><strong>{userLabel}</strong><small>{customer ? 'Cuenta de cliente' : 'Explora libremente'}</small></div></button></header>
        <div className="client-content">
          {auth.error ? <p className="feedback-error" role="alert">{auth.error}</p> : null}
          {section === 'home' ? <HomePage onExploreProjects={() => setSection('projects')} /> : null}
          {section === 'projects' ? <ProjectsRealEstateView customer={customer} onViewProcesses={() => setSection('processes')} /> : null}
          {section === 'processes' ? customer ? <CustomerProcessesView onExploreProjects={() => setSection('projects')} /> : <GuestProcessesView onSignIn={() => setGuest(false)} /> : null}
          {section === 'employees' ? <EmployeesView /> : null}
        </div>
      </main>
      {customer ? <CustomerProfileDrawer key={customer.uid} customer={customer} isOpen={profileOpen} onClose={() => setProfileOpen(false)} onSave={auth.saveProfile} /> : <GuestProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} onSignIn={() => { setGuest(false); setProfileOpen(false) }} />}
    </div>
  )
}
