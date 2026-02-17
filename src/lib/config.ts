import { z } from 'zod'

const buddyConfigSchema = z.object({
  persona: z
    .object({
      name: z.string().default('Buddy'),
      tone: z.enum(['blunt', 'friendly', 'professional']).default('friendly'),
      customPrompt: z.string().default(''),
      boundaries: z.array(z.string()).default([]),
    })
    .default({}),
  collections: z
    .object({
      accounts: z.boolean().default(true),
      contacts: z.boolean().default(true),
      deals: z.boolean().default(true),
      projects: z.boolean().default(true),
      tasks: z.boolean().default(true),
      kb: z.boolean().default(true),
      meetings: z.boolean().default(true),
      journals: z.boolean().default(true),
    })
    .default({}),
  backup: z
    .object({
      onEnd: z.boolean().default(true),
    })
    .default({}),
  theme: z
    .object({
      accentColor: z.string().default('indigo'),
    })
    .default({}),
})

export type BuddyConfig = z.infer<typeof buddyConfigSchema>

export function defineConfig(config: z.input<typeof buddyConfigSchema>): BuddyConfig {
  return buddyConfigSchema.parse(config)
}

export async function loadConfig(): Promise<BuddyConfig> {
  try {
    const mod = await import('../../buddy.config.ts')
    return buddyConfigSchema.parse(mod.default)
  } catch {
    return buddyConfigSchema.parse({})
  }
}
