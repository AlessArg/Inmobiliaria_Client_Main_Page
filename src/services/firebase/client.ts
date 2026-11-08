import { getApp, getApps, initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'

let persistence: Promise<void> | undefined

export function getClientAuth() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim()
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()
  if (!apiKey || !projectId || !authDomain) {
    throw new Error('Configura las variables VITE_FIREBASE del portal para iniciar sesión. Puedes explorar como invitado.')
  }
  const app = getApps().length ? getApp() : initializeApp({
    apiKey, projectId, authDomain,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  })
  return getAuth(app)
}

export function prepareClientAuth() {
  persistence ??= setPersistence(getClientAuth(), browserLocalPersistence).catch((error: unknown) => {
    persistence = undefined
    throw error
  })
  return persistence
}

export async function getCustomerToken() {
  const user = getClientAuth().currentUser
  if (!user) throw new Error('Inicia sesión para continuar.')
  return user.getIdToken()
}
