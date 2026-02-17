/**
 * Get display name for a content entry.
 * Uses `title` from frontmatter if available, otherwise formats the slug.
 */
export function displayName(entry: { id: string; data: { title?: string } }): string {
  return entry.data.title || entry.id.replace(/-/g, ' ')
}

/**
 * Get display name for a reference (only has id, no data).
 * Requires a lookup map from id → display name.
 */
export function refName(id: string, nameMap: Record<string, string>): string {
  return nameMap[id] || id.replace(/-/g, ' ')
}
