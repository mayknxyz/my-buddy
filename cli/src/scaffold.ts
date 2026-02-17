import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface ScaffoldOptions {
  directory: string
  personaName: string
  tone: string
  collections: string[]
  accentColor: string
  packageManager: string
  install: boolean
  git: boolean
}

const ALL_COLLECTIONS = [
  'accounts',
  'contacts',
  'deals',
  'projects',
  'tasks',
  'kb',
  'meetings',
  'journals',
]

/** Directories/files to skip when copying the template. */
const SKIP = new Set([
  'node_modules',
  'dist',
  '.astro',
  '.git',
  'cli',
  '.env',
  'bun.lockb',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
])

export async function scaffold(opts: ScaffoldOptions): Promise<void> {
  const dest = resolve(opts.directory)
  const templateRoot = resolve(__dirname, '..')

  // Check if we're running from within cli/dist or from the repo root
  const repoRoot = existsSync(join(templateRoot, 'template'))
    ? join(templateRoot, 'template')
    : resolve(templateRoot, '..')

  if (!existsSync(repoRoot) || !existsSync(join(repoRoot, 'package.json'))) {
    throw new Error(`Template not found. Expected at: ${repoRoot}`)
  }

  // Create destination
  await mkdir(dest, { recursive: true })

  // Copy template files
  await copyDir(repoRoot, dest)

  // Generate buddy.config.ts
  const collectionsObj = ALL_COLLECTIONS.map(
    (c) => `    ${c}: ${opts.collections.includes(c)},`,
  ).join('\n')

  const configContent = `import { defineConfig } from './src/lib/config'

export default defineConfig({
  persona: {
    name: '${opts.personaName}',
    tone: '${opts.tone}',
    customPrompt: '',
    boundaries: [],
  },
  collections: {
${collectionsObj}
  },
  theme: {
    accentColor: '${opts.accentColor}',
  },
})
`
  await writeFile(join(dest, 'buddy.config.ts'), configContent)

  // Remove disabled collection directories, pages, and templates
  const disabledCollections = ALL_COLLECTIONS.filter((c) => !opts.collections.includes(c))

  for (const collection of disabledCollections) {
    // Remove content directory
    const contentDir = join(dest, 'src', 'content', collection)
    if (existsSync(contentDir)) {
      await rm(contentDir, { recursive: true })
    }

    // Remove pages directory
    const pagesDir = join(dest, 'src', 'pages', collection)
    if (existsSync(pagesDir)) {
      await rm(pagesDir, { recursive: true })
    }

    // Remove template
    const templateFile = join(dest, '.templates', `${singularize(collection)}.md`)
    if (existsSync(templateFile)) {
      await rm(templateFile)
    }

    // Remove CRUD commands
    const commandsDir = join(dest, '.claude', 'commands')
    if (existsSync(commandsDir)) {
      const singular = singularize(collection)
      const commands = await readdir(commandsDir)
      for (const cmd of commands) {
        if (cmd.startsWith(`mybuddy.${singular}.`)) {
          await rm(join(commandsDir, cmd))
        }
      }
    }
  }

  // Install dependencies
  if (opts.install) {
    execSync(`${opts.packageManager} install`, {
      cwd: dest,
      stdio: 'ignore',
    })
  }

  // Git init
  if (opts.git) {
    execSync('git init', { cwd: dest, stdio: 'ignore' })
    execSync('git add -A', { cwd: dest, stdio: 'ignore' })
    execSync('git commit -m "Initial commit from create-my-buddy"', {
      cwd: dest,
      stdio: 'ignore',
    })
  }
}

async function copyDir(src: string, dest: string): Promise<void> {
  const entries = await readdir(src, { withFileTypes: true })

  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue

    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      await mkdir(destPath, { recursive: true })
      await copyDir(srcPath, destPath)
    } else {
      await cp(srcPath, destPath)
    }
  }
}

function singularize(collection: string): string {
  const map: Record<string, string> = {
    accounts: 'account',
    contacts: 'contact',
    deals: 'deal',
    projects: 'project',
    tasks: 'task',
    meetings: 'meeting',
    journals: 'journal',
    kb: 'kb',
  }
  return map[collection] || collection
}
