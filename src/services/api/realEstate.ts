import { buildApiUrl } from '@services/http/client'
import type { HouseRecord, LeadContactPayload, ProjectRecord } from '@/types/domain'

const buildHeaders = (includeContentType = false): HeadersInit => {
  const headers: Record<string, string> = {}

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

const pickText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }

  return ''
}

const pickNumber = (...values: unknown[]) => {
  for (const value of values) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return 0
}

const pickBool = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'boolean') return value

    const parsed = Number(value)
    if (parsed === 1) return true
    if (parsed === 0) return false
  }

  return false
}

const normalizeProject = (item: Record<string, unknown>, index: number): ProjectRecord => {
  return {
    id_project: Number(item.id_project ?? item.project_id ?? item.id ?? index + 1),
    name: pickText(item.name, item.project_name) || `Proyecto ${index + 1}`,
    description: pickText(item.description, item.project_description, item.summary) || 'Sin descripcion disponible.',
    city: pickText(item.city, item.project_city, item.department) || 'No especificado',
    municipality: pickText(item.municipality, item.project_municipality) || 'No especificado',
    construction_style: pickText(item.construction_style, item.project_construction_style) || 'No especificado',
    status: pickBool(item.status, item.project_status) ? 'Activo' : pickText(item.status, item.project_status) || 'Activo',
    project_logo: pickText(item.project_logo, item.logo, item.project_photo_1) || null,
    parks: pickNumber(item.parks, item.project_parks),
    pools: pickNumber(item.pools, item.project_pools),
    discos: pickNumber(item.discos, item.project_discos),
    night_clubs: pickNumber(item.night_clubs, item.project_night_clubs),
    recreational_centers: pickNumber(item.recreational_centers, item.project_recreational_centers),
    multi_use_scenarios: pickNumber(item.multi_use_scenarios, item.project_multi_use_scenarios),
  }
}

const normalizeHouse = (item: Record<string, unknown>, index: number): HouseRecord => {
  return {
    id_house: Number(item.id_house ?? item.house_id ?? item.id ?? index + 1),
    id_project: Number(item.id_project ?? item.project_id ?? 0),
    house_name: pickText(item.house_name, item.name, item.nombre) || `Casa ${index + 1}`,
    house_description: pickText(item.house_description, item.description, item.detalle) || 'Sin descripcion disponible.',
    house_size: pickText(item.house_size, item.size, item.medida) || 'No especificado',
    house_price: pickNumber(item.house_price, item.price),
    house_status: pickBool(item.house_status, item.status),
    house_floors: pickNumber(item.house_floors, item.floors),
    house_total_rooms: pickNumber(item.house_total_rooms, item.total_rooms),
    house_bedrooms: pickNumber(item.house_bedrooms, item.bedrooms),
    house_bathrooms: pickNumber(item.house_bathrooms, item.bathrooms),
    house_garage: pickNumber(item.house_garage, item.garage),
    house_frontyard: pickBool(item.house_frontyard, item.frontyard),
    house_backyard: pickBool(item.house_backyard, item.backyard),
    house_furnished: pickBool(item.house_furnished, item.furnished),
    house_photo_1: pickText(item.house_photo_1, item.photo_1, item.image_1) || null,
    house_photo_2: pickText(item.house_photo_2, item.photo_2, item.image_2) || null,
    house_photo_3: pickText(item.house_photo_3, item.photo_3, item.image_3) || null,
  }
}

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json()
    if (payload && typeof payload === 'object' && 'message' in payload) {
      const message = String(payload.message).trim()
      if (message) return message
    }
  } catch {
    return `Error HTTP ${response.status}`
  }

  return `Error HTTP ${response.status}`
}

export const fetchProjects = async (): Promise<ProjectRecord[]> => {
  const response = await fetch(buildApiUrl('projects/catalog'), {
    headers: buildHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  const payload: unknown = await response.json()
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown })?.data)
      ? (payload as { data: unknown[] }).data
      : []

  return records.map((item, index) => normalizeProject(item as Record<string, unknown>, index))
}

export const fetchHousesByProject = async (projectId: number): Promise<HouseRecord[]> => {
  const response = await fetch(buildApiUrl(`houses/project/${projectId}/active`), {
    headers: buildHeaders(),
  })
  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  const payload: unknown = await response.json()
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown })?.data)
      ? (payload as { data: unknown[] }).data
      : []

  return records.map((item, index) => normalizeHouse(item as Record<string, unknown>, index))
}

export const createLeadContactCenter = async (payload: LeadContactPayload): Promise<void> => {
  const response = await fetch(buildApiUrl('leads/contact-center'), {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }
}
