import {
  createUserWithEmailAndPassword, GoogleAuthProvider, onIdTokenChanged,
  signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile,
  type User,
} from 'firebase/auth'
import { getClientAuth, prepareClientAuth } from '@services/firebase/client'
import { buildApiUrl } from '@services/http/client'
import type { CustomerProfile } from '@/types/customer'

export function customerAuthError(error: unknown): string {
  const code = (error as { code?: string } | null)?.code
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'El correo o la contraseña no son correctos.',
    'auth/wrong-password': 'El correo o la contraseña no son correctos.',
    'auth/user-not-found': 'El correo o la contraseña no son correctos.',
    'auth/email-already-in-use': 'Ese correo ya tiene una cuenta. Inicia sesión.',
    'auth/weak-password': 'Elige una contraseña más segura de al menos 6 caracteres.',
    'auth/password-does-not-meet-requirements': 'La contraseña no cumple la política de seguridad de la cuenta.',
    'auth/invalid-email': 'Escribe un correo electrónico válido.',
    'auth/popup-closed-by-user': 'Se cerró la ventana de Google. Puedes intentarlo de nuevo.',
    'auth/cancelled-popup-request': 'Se canceló el acceso con Google.',
    'auth/popup-blocked': 'Permite las ventanas emergentes para continuar con Google.',
    'auth/unauthorized-domain': 'El dominio del portal no está autorizado en Firebase.',
    'auth/operation-not-allowed': 'Este método de acceso no está habilitado en Firebase.',
    'auth/account-exists-with-different-credential': 'Ya existe una cuenta con ese correo. Usa su método de acceso original.',
    'auth/too-many-requests': 'Hubo demasiados intentos. Espera un momento y vuelve a intentar.',
    'auth/network-request-failed': 'No se pudo conectar con Firebase. Revisa tu conexión.',
    'auth/user-disabled': 'Esta cuenta está deshabilitada.',
    'auth/invalid-api-key': 'Revisa la configuración Firebase del portal.',
  }
  return (code && messages[code]) || (error instanceof Error ? error.message : 'No fue posible completar la solicitud.')
}

export async function loginClientWithEmail(email: string, password: string) {
  await prepareClientAuth()
  return (await signInWithEmailAndPassword(getClientAuth(), email, password)).user
}

export async function registerClient(email: string, password: string, displayName: string) {
  await prepareClientAuth()
  const { user } = await createUserWithEmailAndPassword(getClientAuth(), email, password)
  await updateProfile(user, { displayName })
  await user.getIdToken(true)
  return user
}

export async function loginClientWithGoogle() {
  await prepareClientAuth()
  return (await signInWithPopup(getClientAuth(), new GoogleAuthProvider())).user
}

export function logoutClient() {
  return signOut(getClientAuth())
}

export async function watchClientSession(onUser: (user: User | null) => void) {
  await prepareClientAuth()
  return onIdTokenChanged(getClientAuth(), onUser)
}

export async function syncClientSession(user: User): Promise<CustomerProfile> {
  const token = await user.getIdToken()
  const response = await fetch(buildApiUrl('auth/session'), {
    method: 'POST', headers: { Authorization: `Bearer ${token}` },
  })
  const body = await response.json()
  if (!response.ok) throw new Error(body.message ?? 'No se pudo cargar tu perfil. Vuelve a intentar.')
  const payload = body.data ?? body
  if (!payload.valid || payload.customer?.uid !== user.uid) throw new Error('La sesión recibida no es válida.')
  return payload.customer as CustomerProfile
}
