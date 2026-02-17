/**
 * Pre-build script: scans all content collections and generates
 * wiki-link-index.json (slug lookup) and backlink-index.json (reverse links).
 *
 * Run before `astro build` via: bun src/plugins/wiki-links/build-index.ts
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import type { BacklinkIndex, ScopedSlugIndex, SlugEntry, SlugIndex } from './types.ts'
import { COLLECTION_PRIORITY } from './types.ts'

const CONTENT_DIR = join(import.meta.dirname, '../../content')
const DATA_DIR = join(import.meta.dirname, '../../data')

/** Extract display name from frontmatter YAML */
function extractDisplayName(frontmatter: string, collection: string, slug: string): string {
  if (collection === 'contacts') {
    const first = frontmatter.match(/^first_name:\s*(.+)$/m)?.[1]?.trim()
    const last = frontmatter.match(/^last_name:\s*(.+)$/m)?.[1]?.trim()
    if (first && last) return `${first} ${last}`
  }

  const title = frontmatter.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1]?.trim()
  if (title) return title

  // For journals: format date as readable string
  if (collection === 'journals' && /^\d{4}-\d{2}-\d{2}$/.test(slug)) {
    const d = new Date(`${slug}T00:00:00`)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  // Fallback: humanize slug (replace hyphens, strip date prefix, title-case)
  const humanized = slug
    .replace(/^\d{4}-\d{2}-\d{2}-?/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
  return humanized || slug
}

/** Parse frontmatter from a markdown file */
function parseFrontmatter(content: string): string {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  return match?.[1] ?? ''
}

/** Extract markdown body (after frontmatter) */
function extractBody(content: string): string {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/)
  return match?.[1] ?? ''
}

/** Find all [[slug]] patterns in markdown body, excluding code blocks */
function extractWikiLinks(body: string): string[] {
  // Remove fenced code blocks
  const withoutCodeBlocks = body.replace(/```[\s\S]*?```/g, '')
  // Remove inline code
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]+`/g, '')

  const links: string[] = []
  const regex = /\[\[([^\]]+)\]\]/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(withoutInlineCode)) !== null) {
    // Extract slug part (before any pipe for display text)
    const raw = match[1].split('|')[0].trim()
    links.push(raw)
  }
  return links
}

function buildIndices(): void {
  // Priority-based index: first collection to claim a slug wins
  const slugIndex: SlugIndex = {}
  // Scoped index: collection/slug → entry (always available for disambiguation)
  const scopedIndex: ScopedSlugIndex = {}
  const backlinkIndex: BacklinkIndex = {}

  // Collect all file data for backlink scanning
  const fileData: { collection: string; slug: string; body: string }[] = []

  for (const collection of COLLECTION_PRIORITY) {
    const dir = join(CONTENT_DIR, collection)
    if (!existsSync(dir)) continue

    const files = readdirSync(dir).filter((f) => f.endsWith('.md'))

    for (const file of files) {
      const slug = basename(file, '.md')
      const content = readFileSync(join(dir, file), 'utf-8')
      const frontmatter = parseFrontmatter(content)
      const name = extractDisplayName(frontmatter, collection, slug)
      const url = `/${collection}/${slug}/`

      const entry: SlugEntry = { collection, url, displayName: name }

      // Scoped index always gets the entry
      scopedIndex[`${collection}/${slug}`] = entry

      // Priority index: first collection wins
      if (!(slug in slugIndex)) {
        slugIndex[slug] = entry
      }

      fileData.push({ collection, slug, body: extractBody(content) })
    }
  }

  // Build backlink index
  for (const { collection, slug, body } of fileData) {
    const wikiLinks = extractWikiLinks(body)
    const sourceUrl = `/${collection}/${slug}/`
    const sourceName = scopedIndex[`${collection}/${slug}`]?.displayName ?? slug.replace(/-/g, ' ')

    for (const linkTarget of wikiLinks) {
      // Determine the actual target key for the backlink index
      let resolvedSlug: string
      if (linkTarget.includes('/')) {
        // Scoped: use as-is, but extract just the slug for the backlink key
        resolvedSlug = linkTarget.split('/')[1]
      } else {
        resolvedSlug = linkTarget
      }

      if (!backlinkIndex[resolvedSlug]) {
        backlinkIndex[resolvedSlug] = []
      }

      // Avoid duplicate backlinks from the same source
      const alreadyLinked = backlinkIndex[resolvedSlug].some(
        (s) => s.slug === slug && s.collection === collection,
      )
      if (!alreadyLinked) {
        backlinkIndex[resolvedSlug].push({
          slug,
          collection,
          displayName: sourceName,
          url: sourceUrl,
        })
      }
    }
  }

  // Write indices
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  // Merge slug + scoped into one file for the plugin
  const combined = { slugs: slugIndex, scoped: scopedIndex }
  writeFileSync(join(DATA_DIR, 'wiki-link-index.json'), JSON.stringify(combined, null, 2))
  writeFileSync(join(DATA_DIR, 'backlink-index.json'), JSON.stringify(backlinkIndex, null, 2))

  const slugCount = Object.keys(slugIndex).length
  const scopedCount = Object.keys(scopedIndex).length
  const backlinkCount = Object.values(backlinkIndex).reduce((sum, arr) => sum + arr.length, 0)
  console.log(
    `[wiki-links] Built index: ${slugCount} slugs, ${scopedCount} scoped, ${backlinkCount} backlinks`,
  )
}

buildIndices()
