// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from 'firebase/auth'
import { useClientSession } from './useClientSession'
import { loginClientWithEmail, logoutClient, syncClientSession, watchClientSession } from '@services/api/auth'

vi.mock('@services/api/auth', () => ({
  customerAuthError: (error: Error) => error.message,
  loginClientWithEmail: vi.fn(), loginClientWithGoogle: vi.fn(), logoutClient: vi.fn(),
  registerClient: vi.fn(), syncClientSession: vi.fn(), watchClientSession: vi.fn(),
}))
vi.mock('@services/api/portal', () => ({ updateCustomerProfile: vi.fn() }))
vi.mock('@services/firebase/client', () => ({ getClientAuth: () => ({ currentUser: null }) }))

let observer: (user: User | null) => void
const profile = { uid: 'customer-a', displayName: 'Ana', email: 'ana@example.com', phoneNumber: '55551234', emailVerified: true, provider: 'password', photoURL: null }
const firebaseUser = { uid: profile.uid } as User

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(watchClientSession).mockImplementation(async (callback) => { observer = callback; return () => undefined })
  vi.mocked(syncClientSession).mockResolvedValue(profile)
  vi.mocked(logoutClient).mockResolvedValue(undefined)
})
afterEach(cleanup)

describe('Restored customer sessions', () => {
  it('restores the Firebase account and loads its profile', async () => {
    const { result } = renderHook(useClientSession)
    await waitFor(() => expect(watchClientSession).toHaveBeenCalledOnce())
    await act(async () => observer(firebaseUser))
    await waitFor(() => expect(result.current.customer?.uid).toBe('customer-a'))
    expect(result.current.initializing).toBe(false)
  })

  it('ignores a late profile response after logout', async () => {
    let resolveProfile!: (value: typeof profile) => void
    vi.mocked(syncClientSession).mockReturnValueOnce(new Promise(resolve => { resolveProfile = resolve }))
    const { result } = renderHook(useClientSession)
    await waitFor(() => expect(watchClientSession).toHaveBeenCalledOnce())
    act(() => observer(firebaseUser))
    await act(async () => { await result.current.logout() })
    await act(async () => resolveProfile(profile))
    expect(result.current.customer).toBeNull()
  })

  it('does not duplicate profile writes when the SDK emits during email login', async () => {
    const { result } = renderHook(useClientSession)
    await waitFor(() => expect(watchClientSession).toHaveBeenCalledOnce())
    await act(async () => observer(null))
    vi.mocked(loginClientWithEmail).mockImplementationOnce(async () => {
      observer(firebaseUser)
      return firebaseUser
    })
    await act(async () => { await result.current.loginEmail('ana@example.com', 'password') })
    expect(result.current.customer?.uid).toBe('customer-a')
    expect(syncClientSession).toHaveBeenCalledOnce()
  })
})
