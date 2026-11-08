// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApplicationForm } from './ApplicationForm'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('ApplicationForm', () => {
  it('enables the current career only for students and sends the application', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<ApplicationForm vacancyId={4} />)
    const career = screen.getByLabelText('Nombre de carrera en curso') as HTMLInputElement
    expect(career.disabled).toBe(true)
    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
    await user.type(screen.getByLabelText('Edad'), '24')
    await user.type(screen.getByLabelText('DPI'), '1234567890123')
    await user.type(screen.getByLabelText('Último grado académico'), 'Bachillerato')
    await user.type(screen.getByLabelText('Años de estudio completados'), '12')
    await user.type(screen.getByLabelText('Años de experiencia'), '0')
    await user.click(screen.getByLabelText('Sí'))
    expect(career.disabled).toBe(false)
    await user.type(career, 'Ingeniería')
    await user.click(screen.getByRole('button', { name: /Enviar postulación/ }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Postulación enviada'))
    const body = fetchMock.mock.calls[0][1].body as FormData
    expect(body.get('current_career')).toBe('Ingeniería')
    expect(body.get('currently_studying')).toBe('true')
    expect(body.get('study_years')).toBe('12')
    expect(body.get('experience_years')).toBe('0')
  })
})
