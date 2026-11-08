// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectsRealEstateView } from './ProjectsRealEstateView'
import { createLeadContactCenter, fetchHousesByProject, fetchProjects } from '@services/api/realEstate'
import { createCustomerLead } from '@services/api/portal'
import type { CustomerProfile } from '@/types/customer'

vi.mock('@services/api/realEstate', () => ({ createLeadContactCenter: vi.fn(), fetchHousesByProject: vi.fn(), fetchProjects: vi.fn() }))
vi.mock('@services/api/portal', () => ({ createCustomerLead: vi.fn() }))

const customer: CustomerProfile = {
  uid: 'customer-a', displayName: 'Ana Pérez', email: 'ana@example.com',
  phoneNumber: '55551234', photoURL: null, emailVerified: true, provider: 'google.com',
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(fetchProjects).mockResolvedValue([{ id_project: 7, name: 'Bosque', description: 'Proyecto residencial', status: 'Activo' } as never])
  vi.mocked(fetchHousesByProject).mockResolvedValue([{ id_house: 9, id_project: 7, house_name: 'Casa Azul', house_status: true, house_price: 500000 } as never])
  vi.mocked(createCustomerLead).mockResolvedValue({ id_lead: 42 })
  vi.mocked(createLeadContactCenter).mockResolvedValue(undefined)
})
afterEach(cleanup)

async function openProperty(profile: CustomerProfile | null) {
  const onViewProcesses = vi.fn()
  render(<ProjectsRealEstateView customer={profile} onViewProcesses={onViewProcesses} />)
  const user = userEvent.setup()
  await user.click(await screen.findByText('Bosque'))
  await user.click(await screen.findByText('Casa Azul'))
  return { user, onViewProcesses }
}

describe('Property contact form', () => {
  it('prefills the account data and creates a customer-owned process', async () => {
    const { user, onViewProcesses } = await openProperty(customer)
    expect((screen.getByLabelText('Nombre completo') as HTMLInputElement).value).toBe('Ana Pérez')
    expect((screen.getByLabelText('Telefono') as HTMLInputElement).value).toBe('55551234')
    const email = screen.getByLabelText('Email') as HTMLInputElement
    expect(email.value).toBe('ana@example.com')
    expect(email.readOnly).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Enviar formulario' }))
    await waitFor(() => expect(createCustomerLead).toHaveBeenCalledWith({
      lead_client_name: 'Ana Pérez', lead_client_phone: '55551234',
      lead_client_email: 'ana@example.com', id_project: 7, id_house: 9,
    }))
    expect(createLeadContactCenter).not.toHaveBeenCalled()
    await user.click(await screen.findByRole('button', { name: 'Ver mis procesos' }))
    expect(onViewProcesses).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Enviar formulario' })).toBeNull()
  })

  it('keeps guest contact fields empty and uses the public lead endpoint', async () => {
    const { user } = await openProperty(null)
    const name = screen.getByLabelText('Nombre completo') as HTMLInputElement
    const email = screen.getByLabelText('Email') as HTMLInputElement
    expect(name.value).toBe('')
    expect(email.value).toBe('')
    expect(email.readOnly).toBe(false)
    await user.type(name, 'Invitado')
    await user.type(screen.getByLabelText('Telefono'), '55559999')
    await user.type(email, 'guest@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar formulario' }))
    await waitFor(() => expect(createLeadContactCenter).toHaveBeenCalledOnce())
    expect(createCustomerLead).not.toHaveBeenCalled()
  })
})
