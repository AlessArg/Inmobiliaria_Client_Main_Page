import { getCustomerToken } from '@services/firebase/client'
import { buildApiUrl } from '@services/http/client'
import type { CustomerProfile, CustomerProcess } from '@/types/customer'
import type { LeadContactPayload } from '@/types/domain'

async function customerRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getCustomerToken()
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers },
  })
  const body = await response.json()
  if (!response.ok) {
    if (response.status === 401) throw new Error('Tu sesión venció. Inicia sesión de nuevo.')
    throw new Error(body.message ?? 'No se pudo completar la solicitud.')
  }
  return (body.data ?? body) as T
}

export function updateCustomerProfile(displayName: string, phoneNumber: string) {
  return customerRequest<CustomerProfile>('portal/profile', {
    method: 'PATCH', body: JSON.stringify({ displayName, phoneNumber }),
  })
}

export function fetchCustomerProcesses() {
  return customerRequest<CustomerProcess[]>('portal/processes')
}

export function createCustomerLead(payload: LeadContactPayload) {
  return customerRequest<{ id_lead: number }>('portal/leads', {
    method: 'POST', body: JSON.stringify(payload),
  })
}
