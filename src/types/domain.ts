export type ProjectRecord = {
  id_project: number
  name: string
  description: string
  city: string
  municipality: string
  construction_style: string
  status: string
  project_logo: string | null
  parks: number
  pools: number
  discos: number
  night_clubs: number
  recreational_centers: number
  multi_use_scenarios: number
}

export type HouseRecord = {
  id_house: number
  id_project: number
  house_name: string
  house_description: string
  house_size: string
  house_price: number
  house_status: boolean
  house_floors: number
  house_total_rooms: number
  house_bedrooms: number
  house_bathrooms: number
  house_garage: number
  house_frontyard: boolean
  house_backyard: boolean
  house_furnished: boolean
  house_photo_1: string | null
  house_photo_2: string | null
  house_photo_3: string | null
}

export type LeadContactPayload = {
  lead_client_name: string
  lead_client_phone: string
  lead_client_email: string
  id_project: number
  id_house?: number
}
