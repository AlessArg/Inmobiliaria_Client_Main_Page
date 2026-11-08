import { describe, expect, it } from 'vitest'
import { mainMenu } from './menu'

describe('mainMenu', () => {
  it('contains at least one navigation item', () => {
    expect(mainMenu.length).toBeGreaterThan(0)
  })
})
