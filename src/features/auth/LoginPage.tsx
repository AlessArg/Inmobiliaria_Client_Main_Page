import { useState, type FormEvent } from 'react'

type LoginPageProps = {
  feedbackMessage: string
  busy: boolean
  pendingGoogle?: boolean
  onGuestAccess: () => void
  onGoogleLogin: () => Promise<unknown>
  onGooglePhone?: (phone: string) => Promise<unknown>
  onEmailLogin: (email: string, password: string) => Promise<unknown>
  onRegister: (name: string, phone: string, email: string, password: string) => Promise<unknown>
  onClearError: () => void
  onCareers: () => void
}

type Step = 'welcome' | 'choice' | 'email' | 'contact' | 'password' | 'confirm'

export function LoginPage({ feedbackMessage, busy, pendingGoogle, onGuestAccess, onGoogleLogin, onGooglePhone, onEmailLogin, onRegister, onClearError, onCareers }: LoginPageProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [validation, setValidation] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const go = (next: Step) => { setValidation(''); onClearError(); setShowPassword(false); setStep(next) }
  const back = () => go(step === 'choice' ? 'welcome' : step === 'email' ? 'choice' : step === 'contact' ? 'email' : step === 'password' ? (mode === 'register' ? 'contact' : 'email') : 'password')
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidation('')
    if (pendingGoogle) { await onGooglePhone?.(phone.trim()); return }
    if (step === 'email') go(mode === 'register' ? 'contact' : 'password')
    else if (step === 'contact') go('password')
    else if (step === 'password' && mode === 'register') go('confirm')
    else if (step === 'password') await onEmailLogin(email.trim(), password)
    else if (step === 'confirm') {
      if (password !== confirmation) { setValidation('Las contraseñas no coinciden.'); return }
      await onRegister(name.trim(), phone.trim(), email.trim(), password)
    }
  }
  const title = pendingGoogle ? 'Un último detalle' : step === 'welcome' ? 'Bienvenido a Phien' : step === 'choice' ? '¿Cómo deseas continuar?' : step === 'email' ? 'Tu correo electrónico' : step === 'contact' ? 'Cuéntanos sobre ti' : step === 'confirm' ? 'Confirma tu contraseña' : mode === 'register' ? 'Crea una contraseña' : 'Ingresa tu contraseña'

  return <main className="login-page">
    <section className="login-hero">
      <div className="login-brand"><span>PH</span><div><strong>PHIEN</strong><small>BIENES RAÍCES</small></div></div>
      <div className="login-hero-copy"><p className="login-tag">UN LUGAR PARA COMENZAR</p><h1>El siguiente capítulo comienza aquí.</h1><p>Descubre espacios pensados para ti y encuentra acompañamiento en cada paso hacia tu nuevo hogar.</p></div>
      <div className="login-illustration" aria-hidden="true"><span className="login-orb" /><span className="login-building"><i /><i /><i /></span></div>
      <p className="login-hero-footer">PHIEN · Un espacio para lo que viene</p>
    </section>
    <section className="login-card" aria-labelledby="login-title">
      <div className="login-card-inner">
        {!pendingGoogle && step !== 'welcome' ? <button className="login-back" type="button" disabled={busy} onClick={back}>← Volver</button> : <p className="eyebrow">PORTAL DE CLIENTES</p>}
        <div className="login-step" key={pendingGoogle ? 'google-phone' : step}>
          <div className="login-heading"><h2 id="login-title">{title}</h2><p>{pendingGoogle ? 'Agrega tu teléfono para que podamos acompañarte en tus consultas.' : step === 'welcome' ? 'Tu próximo hogar está más cerca de lo que imaginas.' : step === 'choice' ? 'Elige una opción para acceder con tu correo.' : step === 'contact' ? 'Usaremos estos datos para acompañarte en tus consultas.' : step === 'confirm' ? 'Escríbela nuevamente para asegurarnos de que sea correcta.' : step === 'password' ? 'Mantén tu cuenta segura con una contraseña.' : 'La usaremos para identificar tu cuenta.'}</p></div>
          {step === 'welcome' && !pendingGoogle ? <div className="login-actions">
            <button type="button" className="login-option" disabled={busy} onClick={() => void onGoogleLogin()}><span className="login-google" aria-hidden="true">G</span><span>Continuar con Google<small>Accede con tu cuenta de Google</small></span><b aria-hidden="true">→</b></button>
            <button type="button" className="login-option" disabled={busy} onClick={() => go('choice')}><span className="login-option-icon" aria-hidden="true">✉</span><span>Continuar con correo<small>Inicia sesión o crea una cuenta</small></span><b aria-hidden="true">→</b></button>
            <div className="login-divider"><span>O EXPLORA PRIMERO</span></div>
            <button type="button" className="login-guest" disabled={busy} onClick={onGuestAccess}>Entrar como invitado <span aria-hidden="true">→</span></button>
          </div> : step === 'choice' && !pendingGoogle ? <div className="login-actions"><button className="login-primary" type="button" onClick={() => { setMode('login'); go('email') }}>Iniciar sesión <span>→</span></button><button className="login-secondary" type="button" onClick={() => { setMode('register'); go('email') }}>Crear cuenta <span>→</span></button></div> : <form className="login-form" onSubmit={(event) => void submit(event)}><fieldset disabled={busy} className="auth-fields">
            {step === 'email' && !pendingGoogle ? <label>Correo electrónico<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nombre@correo.com" required autoFocus /></label> : null}
            {step === 'contact' && !pendingGoogle ? <label>Nombre completo<input autoComplete="name" value={name} onChange={e => setName(e.target.value)} maxLength={150} required autoFocus /></label> : null}
            {pendingGoogle || step === 'contact' ? <label>Teléfono<input type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} minLength={7} maxLength={30} required autoFocus={!!pendingGoogle} /></label> : null}
            {(step === 'password' || step === 'confirm') && !pendingGoogle ? <><input type="email" autoComplete="username" value={email} readOnly hidden /><label>{step === 'confirm' ? 'Confirmar contraseña' : 'Contraseña'}<span className="login-password-field"><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={step === 'confirm' ? confirmation : password} onChange={e => step === 'confirm' ? setConfirmation(e.target.value) : setPassword(e.target.value)} minLength={mode === 'register' ? 6 : undefined} required autoFocus /><button type="button" className="login-show-password" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{showPassword ? <path d="M4 4l16 16" /> : null}</svg></button></span></label>{mode === 'register' && step === 'password' ? <small className="login-hint">Usa al menos 6 caracteres.</small> : null}</> : null}
            <button className="login-primary" type="submit">{busy ? 'Conectando…' : pendingGoogle ? 'Continuar' : step === 'confirm' ? 'Crear mi cuenta' : step === 'password' && mode === 'login' ? 'Iniciar sesión' : 'Continuar'} <span aria-hidden="true">→</span></button>
          </fieldset></form>}
          {validation || feedbackMessage ? <div className="login-info" role="alert"><p>{validation || feedbackMessage}</p></div> : null}
        </div>
        <p className="login-footnote">Un espacio para descubrir, conectar y avanzar.</p>
        <button type="button" className="login-careers-link" onClick={onCareers}>Trabaja con nosotros <span aria-hidden="true">→</span></button>
      </div>
    </section>
  </main>
}
