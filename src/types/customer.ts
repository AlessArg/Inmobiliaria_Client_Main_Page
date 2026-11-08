export type CustomerProfile = {
  uid: string
  email: string | null
  displayName: string | null
  phoneNumber: string | null
  photoURL: string | null
  emailVerified: boolean
  provider: string
}

export type CustomerProcess = {
  id_lead: number
  id_project: number | null
  id_house: number | null
  id_lead_phase: number
  phase_name: string | null
  project_name: string | null
  house_name: string | null
  house_photo_1: string | null
  lead_client_name: string
  lead_client_phone: string
  lead_client_email: string
  created_at: string
}
