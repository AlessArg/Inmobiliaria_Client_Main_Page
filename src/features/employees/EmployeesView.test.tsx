// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { EmployeesView } from './EmployeesView'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('smoothly scrolls to the vacancies when exploring opportunities', async () => {
  const scrollIntoView = vi.fn()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  render(<EmployeesView />)
  const section = document.getElementById('oportunidades')!
  section.scrollIntoView = scrollIntoView
  await userEvent.setup().click(screen.getByRole('link', { name: /Explorar oportunidades/ }))
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
})
