// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

afterEach(cleanup)

function setup() {
  const props = { feedbackMessage: '', busy: false, onGuestAccess: vi.fn(), onGoogleLogin: vi.fn(), onEmailLogin: vi.fn(), onRegister: vi.fn(), onClearError: vi.fn(), onCareers: vi.fn() }
  render(<LoginPage {...props} />)
  return { ...props, user: userEvent.setup() }
}

describe('Customer account access', () => {
  it('registers with the full contact profile and matching passwords', async () => {
    const { user, onRegister, onEmailLogin } = setup()
    await user.click(screen.getByRole('button', { name: /Continuar con correo/ }))
    await user.click(screen.getByRole('button', { name: /Crear cuenta/ }))
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Teléfono'), '55551234')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'password123')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta' }))
    expect(onRegister).toHaveBeenCalledWith('Ana Pérez', '55551234', 'ana@example.com', 'password123')
    expect(onEmailLogin).not.toHaveBeenCalled()
  })

  it('rejects password mismatch before account creation', async () => {
    const { user, onRegister } = setup()
    await user.click(screen.getByRole('button', { name: /Continuar con correo/ }))
    await user.click(screen.getByRole('button', { name: /Crear cuenta/ }))
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Teléfono'), '55551234')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.type(screen.getByLabelText('Contraseña', { exact: true }), 'password123')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'different123')
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta' }))
    expect(screen.getByRole('alert').textContent).toContain('Las contraseñas no coinciden.')
    expect(onRegister).not.toHaveBeenCalled()
  })

  it('offers both Google and guest access', async () => {
    const { user, onGoogleLogin, onGuestAccess } = setup()
    await user.click(screen.getByRole('button', { name: /Continuar con Google/ }))
    expect(onGoogleLogin).toHaveBeenCalledOnce()
    await user.click(screen.getByRole('button', { name: /Entrar como invitado/ }))
    expect(onGuestAccess).toHaveBeenCalledOnce()
  })

  it('signs in after the email and password steps', async () => {
    const { user, onEmailLogin } = setup()
    await user.click(screen.getByRole('button', { name: /Continuar con correo/ }))
    await user.click(screen.getByRole('button', { name: /Iniciar sesión/ }))
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(onEmailLogin).toHaveBeenCalledWith('ana@example.com', 'password123')
  })

  it('clears authentication errors when navigating and toggles password visibility', async () => {
    const { user, onClearError } = setup()
    await user.click(screen.getByRole('button', { name: /Continuar con correo/ }))
    await user.click(screen.getByRole('button', { name: /Iniciar sesión/ }))
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    const input = screen.getByLabelText('Contraseña')
    expect(input.getAttribute('type')).toBe('password')
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(input.getAttribute('type')).toBe('text')
    await user.click(screen.getByRole('button', { name: /Volver/ }))
    expect(onClearError).toHaveBeenCalled()
    expect(screen.queryByText('Reintentar cargar mi sesión')).toBeNull()
  })

  it('collects a phone after Google authentication', async () => {
    const onGooglePhone = vi.fn()
    render(<LoginPage feedbackMessage="" busy={false} pendingGoogle onGooglePhone={onGooglePhone} onGuestAccess={vi.fn()} onGoogleLogin={vi.fn()} onEmailLogin={vi.fn()} onRegister={vi.fn()} onClearError={vi.fn()} onCareers={vi.fn()} />)
    const user = userEvent.setup()
    await user.type(screen.getByLabelText('Teléfono'), '55551234')
    await user.click(screen.getByRole('button', { name: /Continuar/ }))
    expect(onGooglePhone).toHaveBeenCalledWith('55551234')
  })

  it('opens careers from the login screen', async () => {
    const { user, onCareers } = setup()
    await user.click(screen.getByRole('button', { name: /Trabaja con nosotros/ }))
    expect(onCareers).toHaveBeenCalledOnce()
  })
})
