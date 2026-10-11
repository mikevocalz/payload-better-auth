import { describe, expect, it } from 'vitest'
import { betterAuthCollections } from '../../src/adapter/collections.js'
import type { CollectionConfig, Config, Field } from 'payload'

function build(): CollectionConfig[] {
  const plugin = betterAuthCollections({
    betterAuthOptions: {
      user: { modelName: 'member' },
    } as never,
    skipCollections: ['user'],
  })
  const config = plugin({ collections: [] } as unknown as Config) as Config
  return (config.collections ?? []) as CollectionConfig[]
}

function relationTo(collection: CollectionConfig | undefined, fieldName: string): string | undefined {
  const field = (collection?.fields ?? []).find(
    (candidate): candidate is Extract<Field, { name: string; relationTo: string }> =>
      'name' in candidate &&
      candidate.name === fieldName &&
      candidate.type === 'relationship',
  )
  return field?.relationTo
}

describe('custom Better Auth model relationship targets', () => {
  it('points account.user at the configured user model collection', () => {
    const accounts = build().find((collection) => collection.slug === 'accounts')
    expect(relationTo(accounts, 'user')).toBe('members')
  })

  it('points session.user at the configured user model collection', () => {
    const sessions = build().find((collection) => collection.slug === 'sessions')
    expect(relationTo(sessions, 'user')).toBe('members')
  })

  it('still uses users when no custom user model is configured', () => {
    const plugin = betterAuthCollections()
    const config = plugin({ collections: [] } as unknown as Config) as Config
    const accounts = (config.collections ?? []).find((collection) => collection.slug === 'accounts')
    expect(relationTo(accounts as CollectionConfig | undefined, 'user')).toBe('users')
  })
})
