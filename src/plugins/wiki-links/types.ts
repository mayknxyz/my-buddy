/** A resolved content entry in the slug index */
export interface SlugEntry {
  /** The collection this entry belongs to */
  collection: string
  /** The URL path to this entry */
  url: string
  /** Human-readable display name */
  displayName: string
}

/** Slug → entry lookup table */
export type SlugIndex = Record<string, SlugEntry>

/** Collection-scoped slug index: collection/slug → entry */
export type ScopedSlugIndex = Record<string, SlugEntry>

/** A backlink source reference */
export interface BacklinkSource {
  /** Slug of the source entry */
  slug: string
  /** Collection of the source entry */
  collection: string
  /** Display name of the source entry */
  displayName: string
  /** URL to the source entry */
  url: string
}

/** Target slug → list of sources that link to it */
export type BacklinkIndex = Record<string, BacklinkSource[]>

/** Collections searched in priority order for slug resolution */
export const COLLECTION_PRIORITY = [
  'accounts',
  'contacts',
  'projects',
  'deals',
  'tasks',
  'kb',
  'meetings',
  'journals',
] as const

export type CollectionName = (typeof COLLECTION_PRIORITY)[number]
