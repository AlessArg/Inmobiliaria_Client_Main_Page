export function GuestProcessesView({ onSignIn }: { onSignIn: () => void }) {
  return <section className="guest-access guest-processes" aria-labelledby="guest-process-title">
    <div className="guest-access-icon" aria-hidden="true">◷</div>
    <p className="eyebrow">TU ESPACIO PERSONAL</p>
    <h2 id="guest-process-title">Cada paso, en un solo lugar</h2>
    <p>Inicia sesión para consultar el estado de tus solicitudes y dar seguimiento a las propiedades que te interesan.</p>
    <button type="button" className="portal-action" onClick={onSignIn}>Iniciar sesión o crear cuenta <span aria-hidden="true">→</span></button>
    <div className="guest-benefits"><span>✓ Consulta tus solicitudes</span><span>✓ Conoce cada avance</span><span>✓ Mantén tus datos a mano</span></div>
  </section>
}
