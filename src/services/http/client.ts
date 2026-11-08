const backendBaseUrl =
  (import.meta.env.BACKEND_URL_BASE?.trim() || 'http://localhost:3000').replace(/\/+$/, '')

export function buildApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`

  return `${backendBaseUrl}${normalizedEndpoint}`
}
