import { useEffect, useRef, useState } from 'react'
import {
  customerAuthError, loginClientWithEmail, loginClientWithGoogle, logoutClient,
  registerClient, syncClientSession, watchClientSession,
} from '@services/api/auth'
import { updateCustomerProfile } from '@services/api/portal'
import { getClientAuth } from '@services/firebase/client'
import type { CustomerProfile } from '@/types/customer'
import type { User } from 'firebase/auth'

export function useClientSession() {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pendingGoogle, setPendingGoogle] = useState<CustomerProfile | null>(null)
  const mutation = useRef(false)
  const version = useRef(0)

  useEffect(() => {
    let active = true
    let unsubscribe: (() => void) | undefined
    void watchClientSession((user) => {
      if (!active || mutation.current) return
      const current = ++version.current
      setCustomer((previous) => previous?.uid === user?.uid ? previous : null)
      if (!user) { setInitializing(false); return }
      void syncClientSession(user).then((profile) => {
        if (active && current === version.current) {
          if (profile.provider === 'google.com' && !profile.phoneNumber) setPendingGoogle(profile)
          else setCustomer(profile)
          setError('')
        }
      }).catch((cause: unknown) => {
        if (active && current === version.current) { setCustomer(null); setError(customerAuthError(cause)) }
      }).finally(() => {
        if (active && current === version.current) setInitializing(false)
      })
    }).then((stop) => {
      if (!active) stop()
      else unsubscribe = stop
    }).catch((cause: unknown) => {
      if (active) { setError(customerAuthError(cause)); setInitializing(false) }
    })
    return () => { active = false; version.current++; unsubscribe?.() }
  }, [])

  const authenticate = async (operation: () => Promise<User>, phone?: string, requirePhone = false) => {
    if (mutation.current) return false
    mutation.current = true
    version.current++
    setBusy(true)
    setError('')
    try {
      const user = await operation()
      let profile = await syncClientSession(user)
      if (phone) profile = await updateCustomerProfile(profile.displayName ?? '', phone)
      if (requirePhone && !profile.phoneNumber) setPendingGoogle(profile)
      else setCustomer(profile)
      return true
    } catch (cause) {
      setError(customerAuthError(cause))
      return false
    } finally {
      mutation.current = false
      setBusy(false)
      setInitializing(false)
    }
  }

  const logout = async () => {
    if (mutation.current) return false
    mutation.current = true
    version.current++
    setBusy(true)
    try {
      await logoutClient()
      setCustomer(null)
      setPendingGoogle(null)
      setError('')
      return true
    } catch (cause) {
      setError(customerAuthError(cause))
      return false
    } finally { mutation.current = false; setBusy(false) }
  }

  const saveProfile = async (name: string, phone: string) => {
    const uid = customer?.uid
    const profile = await updateCustomerProfile(name, phone)
    if (getClientAuth().currentUser?.uid === uid) setCustomer(profile)
  }

  const finishGoogle = async (phone: string) => {
    if (!pendingGoogle || mutation.current) return false
    mutation.current = true
    setBusy(true)
    setError('')
    try {
      const profile = await updateCustomerProfile(pendingGoogle.displayName ?? '', phone)
      setPendingGoogle(null)
      setCustomer(profile)
      return true
    } catch (cause) {
      setError(customerAuthError(cause))
      return false
    } finally { mutation.current = false; setBusy(false) }
  }

  return {
    customer, initializing, busy, error, logout, saveProfile, pendingGoogle, finishGoogle, clearError: () => setError(''),
    loginEmail: (email: string, password: string) => authenticate(() => loginClientWithEmail(email, password)),
    loginGoogle: () => authenticate(loginClientWithGoogle, undefined, true),
    register: (name: string, phone: string, email: string, password: string) =>
      authenticate(() => registerClient(email, password, name), phone),
    retry: () => authenticate(async () => {
      const user = getClientAuth().currentUser
      if (!user) throw new Error('Inicia sesión para continuar.')
      return user
    }),
  }
}
