import { defineConfig } from './src/lib/config'

export default defineConfig({
  persona: {
    name: 'Buddy',
    tone: 'friendly',
    customPrompt: '',
    boundaries: [],
  },
  collections: {
    accounts: true,
    contacts: true,
    deals: true,
    projects: true,
    tasks: true,
    kb: true,
    meetings: true,
    journals: true,
  },
  theme: {
    accentColor: 'indigo',
  },
})
