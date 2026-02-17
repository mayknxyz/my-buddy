import { defineConfig } from './src/lib/config'

export default defineConfig({
  persona: {
    name: 'Buddy',           // Your assistant's name
    tone: 'friendly',        // 'blunt' | 'friendly' | 'professional'
    customPrompt: '',        // Override persona instructions entirely
    boundaries: [],          // Lines the persona won't cross
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
  backup: {
    onEnd: true,            // Run data backup when ending a session
  },
  theme: {
    accentColor: 'indigo',
  },
})
