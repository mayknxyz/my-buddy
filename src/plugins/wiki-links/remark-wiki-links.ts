/**
 * Remark plugin that transforms [[slug]] wiki-link syntax into <a> elements.
 *
 * Supports:
 * - [[slug]]                  → priority-based resolution
 * - [[slug|display text]]     → custom display text
 * - [[collection/slug]]       → explicit collection
 * - [[collection/slug|text]]  → explicit collection + custom text
 *
 * Skips code blocks and inline code nodes.
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { PhrasingContent, Root, Text } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

interface WikiLinkIndex {
  slugs: Record<string, { collection: string; url: string; displayName: string }>
  scoped: Record<string, { collection: string; url: string; displayName: string }>
}

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g

function loadIndex(): WikiLinkIndex | null {
  const indexPath = join(import.meta.dirname, '../../data/wiki-link-index.json')
  if (!existsSync(indexPath)) {
    console.warn('[wiki-links] No index found at', indexPath, '— run build-index.ts first')
    return null
  }
  return JSON.parse(readFileSync(indexPath, 'utf-8'))
}

interface ResolvedLink {
  url: string
  displayName: string
  broken: boolean
}

function resolveLink(raw: string, index: WikiLinkIndex): ResolvedLink {
  const [slugPart, customText] = raw.split('|').map((s) => s.trim())

  let entry: { collection: string; url: string; displayName: string } | undefined

  if (slugPart.includes('/')) {
    // Explicit collection: collection/slug
    entry = index.scoped[slugPart]
  } else {
    // Priority-based resolution
    entry = index.slugs[slugPart]
  }

  if (entry) {
    return {
      url: entry.url,
      displayName: customText || entry.displayName,
      broken: false,
    }
  }

  // Broken link
  const fallbackName = customText || slugPart.replace(/-/g, ' ')
  return { url: '', displayName: fallbackName, broken: true }
}

const remarkWikiLinks: Plugin<[], Root> = () => {
  const index = loadIndex()

  return (tree, file) => {
    if (!index) return

    visit(tree, 'text', (node: Text, nodeIndex, parent) => {
      if (!parent || nodeIndex === undefined) return

      // Skip if inside code or inlineCode
      if (parent.type === 'code' || parent.type === 'inlineCode') return

      const value = node.value
      if (!value.includes('[[')) return

      const children: PhrasingContent[] = []
      let lastIndex = 0

      WIKI_LINK_RE.lastIndex = 0
      let match: RegExpExecArray | null

      while ((match = WIKI_LINK_RE.exec(value)) !== null) {
        const raw = match[1]
        const matchStart = match.index

        // Text before the match
        if (matchStart > lastIndex) {
          children.push({ type: 'text', value: value.slice(lastIndex, matchStart) })
        }

        const resolved = resolveLink(raw, index)

        if (resolved.broken) {
          // Broken link: render as <span> with warning class
          const slugPart = raw.split('|')[0].trim()
          children.push({
            type: 'html',
            value: `<span class="wiki-link-broken" title="Unresolved: ${slugPart}">${resolved.displayName}</span>`,
          } as unknown as PhrasingContent)

          // Log warning
          const filename = file?.history?.[0] ?? 'unknown'
          console.warn(`[wiki-links] Broken link [[${raw}]] in ${filename}`)
        } else {
          // Valid link: render as <a>
          children.push({
            type: 'link',
            url: resolved.url,
            data: {
              hProperties: { class: 'wiki-link' },
            },
            children: [{ type: 'text', value: resolved.displayName }],
          })
        }

        lastIndex = matchStart + match[0].length
      }

      // Remaining text after last match
      if (lastIndex < value.length) {
        children.push({ type: 'text', value: value.slice(lastIndex) })
      }

      // Only replace if we found matches
      if (children.length > 0 && lastIndex > 0) {
        parent.children.splice(nodeIndex, 1, ...children)
      }
    })
  }
}

export default remarkWikiLinks
