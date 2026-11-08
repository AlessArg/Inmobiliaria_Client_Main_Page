import type { CustomerProfile } from '@/types/customer'

export function leadFormForCustomer(customer?: CustomerProfile | null) {
  return {
    lead_client_name: customer?.displayName ?? '',
    lead_client_phone: customer?.phoneNumber ?? '',
    lead_client_email: customer?.email ?? '',
  }
}
