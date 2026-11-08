// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CustomerProfileDrawer } from './CustomerProfileDrawer'

afterEach(cleanup)

describe('Customer profile', () => {
  it('saves contact changes while keeping the account email read-only', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<CustomerProfileDrawer isOpen onClose={vi.fn()} onSave={onSave} customer={{ uid: 'a', displayName: 'Ana', phoneNumber: null, email: 'ana@example.com', emailVerified: true, provider: 'google.com', photoURL: null }} />)
    const user = userEvent.setup()
    expect((screen.getByLabelText('Correo electrónico') as HTMLInputElement).readOnly).toBe(true)
    await user.clear(screen.getByLabelText('Nombre completo'))
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Teléfono de contacto'), '+502 55551234')
    await user.click(screen.getByRole('button', { name: 'Guardar perfil' }))
    expect(onSave).toHaveBeenCalledWith('Ana Pérez', '+502 55551234')
    expect((await screen.findByRole('status')).textContent).toContain('guardó correctamente')
  })
})
