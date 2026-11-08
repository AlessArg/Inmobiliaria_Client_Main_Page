import { useState, type FormEvent } from 'react'
import type { CustomerProfile } from '@/types/customer'

type Props = {
  customer: CustomerProfile
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, phone: string) => Promise<void>
}

export function CustomerProfileDrawer({ customer, isOpen, onClose, onSave }: Props) {
  const [name, setName] = useState(customer.displayName ?? '')
  const [phone, setPhone] = useState(customer.phoneNumber ?? '')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true); setFeedback(''); setError('')
    try {
      await onSave(name.trim(), phone.trim())
      setFeedback('Tu perfil se guardó correctamente.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el perfil.')
    } finally { setBusy(false) }
  }

  return <>
    <div className={`drawer-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} aria-hidden={!isOpen} />
    <aside className={`profile-drawer ${isOpen ? 'open' : ''}`} aria-label="Mi perfil de cliente" inert={!isOpen}>
      <header className="profile-drawer-header"><h3>Mi perfil</h3><button type="button" className="drawer-close" onClick={onClose}>Cerrar</button></header>
      <div className="customer-profile-summary"><span className="customer-avatar">{(customer.displayName || customer.email || 'C').charAt(0).toUpperCase()}</span><strong>{customer.displayName || 'Completa tu perfil'}</strong><p>{customer.email}</p><small>{customer.provider === 'google.com' ? 'Cuenta de Google' : 'Cuenta con correo electrónico'}</small></div>
      <form className="customer-profile-form" onSubmit={(event) => void submit(event)}>
        <fieldset disabled={busy} className="auth-fields">
          <label>Nombre completo<input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" maxLength={150} required /></label>
          <label>Correo electrónico<input type="email" value={customer.email ?? ''} readOnly aria-describedby="profile-email-help" /></label>
          <small id="profile-email-help">El correo corresponde a tu cuenta de acceso.</small>
          <label>Teléfono de contacto<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" minLength={7} maxLength={30} required /></label>
          <p className="customer-hint">Usaremos estos datos para completar tus consultas de propiedades.</p>
          <button type="submit" className="btn-primary">{busy ? 'Guardando…' : 'Guardar perfil'}</button>
        </fieldset>
        {error ? <p className="feedback-error" role="alert">{error}</p> : null}
        {feedback ? <p className="feedback-success" role="status">{feedback}</p> : null}
      </form>
    </aside>
  </>
}
