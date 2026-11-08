type GuestProfileDrawerProps = { isOpen: boolean; onClose: () => void; onSignIn: () => void }

export function GuestProfileDrawer({ isOpen, onClose, onSignIn }: GuestProfileDrawerProps) {
  return <>
    <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} aria-hidden={!isOpen} />
    <aside className={`profile-drawer guest-profile-drawer ${isOpen ? 'open' : ''}`} aria-label="Panel de perfil" inert={!isOpen}>
      <header className="profile-drawer-header"><div><p className="eyebrow">TU ESPACIO PERSONAL</p><h3>Mi perfil</h3></div><button type="button" className="drawer-close" onClick={onClose}>Cerrar</button></header>
      <div className="guest-access guest-profile-access"><div className="guest-access-icon" aria-hidden="true">◉</div><h2>Un perfil para acompañarte</h2><p>Guarda tus datos y ten a mano todo lo que necesitas para consultar sobre tu próximo hogar.</p><button type="button" className="portal-action" onClick={onSignIn}>Iniciar sesión o crear cuenta <span aria-hidden="true">→</span></button><div className="guest-benefits"><span>✓ Tus datos en un solo lugar</span><span>✓ Seguimiento de tus consultas</span></div></div>
    </aside>
  </>
}
