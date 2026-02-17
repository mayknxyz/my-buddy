#!/usr/bin/env node
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { scaffold } from './scaffold.js'

const COLLECTIONS = [
  'accounts',
  'contacts',
  'deals',
  'projects',
  'tasks',
  'kb',
  'meetings',
  'journals',
] as const

async function main() {
  p.intro(pc.bgCyan(pc.black(' create-my-buddy ')))

  const dirArg = process.argv[2]

  const project = await p.group(
    {
      directory: () =>
        p.text({
          message: 'Where should we create the project?',
          placeholder: './my-buddy',
          initialValue: dirArg || './my-buddy',
          validate: (value) => {
            if (!value) return 'Directory is required'
          },
        }),

      personaName: () =>
        p.text({
          message: 'What should your assistant be called?',
          placeholder: 'Buddy',
          initialValue: 'Buddy',
        }),

      tone: () =>
        p.select({
          message: 'What tone should the assistant use?',
          options: [
            { value: 'friendly', label: 'Friendly', hint: 'warm and encouraging' },
            { value: 'blunt', label: 'Blunt', hint: 'direct and no-nonsense' },
            { value: 'professional', label: 'Professional', hint: 'neutral and structured' },
          ],
        }),

      collections: () =>
        p.multiselect({
          message: 'Which collections do you want?',
          options: COLLECTIONS.map((c) => ({
            value: c,
            label: c.charAt(0).toUpperCase() + c.slice(1),
            hint: c === 'accounts' || c === 'contacts' || c === 'deals' ? 'CRM' : 'Work',
          })),
          initialValues: [...COLLECTIONS],
          required: true,
        }),

      accentColor: () =>
        p.select({
          message: 'Pick an accent color:',
          options: [
            { value: 'indigo', label: 'Indigo' },
            { value: 'blue', label: 'Blue' },
            { value: 'emerald', label: 'Emerald' },
            { value: 'amber', label: 'Amber' },
            { value: 'rose', label: 'Rose' },
            { value: 'violet', label: 'Violet' },
          ],
        }),

      packageManager: () => Promise.resolve('bun'),

      install: () =>
        p.confirm({
          message: 'Install dependencies?',
          initialValue: true,
        }),

      git: () =>
        p.confirm({
          message: 'Initialize a git repository?',
          initialValue: true,
        }),
    },
    {
      onCancel: () => {
        p.cancel('Setup cancelled.')
        process.exit(0)
      },
    },
  )

  const s = p.spinner()
  s.start('Scaffolding project...')

  try {
    await scaffold({
      directory: project.directory as string,
      personaName: project.personaName as string,
      tone: project.tone as string,
      collections: project.collections as string[],
      accentColor: project.accentColor as string,
      packageManager: project.packageManager as string,
      install: project.install as boolean,
      git: project.git as boolean,
    })
  } catch (err) {
    s.stop('Failed to scaffold project.')
    p.log.error(String(err))
    process.exit(1)
  }

  s.stop('Project scaffolded!')

  p.note(
    [
      `cd ${project.directory}`,
      project.install ? '' : `${project.packageManager} install`,
      `${project.packageManager} run dev`,
    ]
      .filter(Boolean)
      .join('\n'),
    'Next steps',
  )

  p.outro(pc.green('Happy building!'))
}

main().catch(console.error)
