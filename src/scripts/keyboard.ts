/**
 * Keyboard Navigation System
 * Implements keyboard-first navigation with mouse interactions disabled by default.
 */

// =============================================================================
// Types (T003)
// =============================================================================

export interface KeyboardState {
  /** Current pending key sequence (e.g., "g" awaiting second key) */
  pendingSequence: string | null
  /** Timestamp when pending sequence started (for timeout) */
  sequenceStartTime: number | null
  /** Whether help modal is currently open */
  isHelpModalOpen: boolean
  /** Whether search overlay is currently open */
  isSearchOpen: boolean
  /** Currently focused list item index (-1 if none) */
  focusedListIndex: number
}

export interface ShortcutDefinition {
  /** Key or key sequence (e.g., "j", "g p") */
  keys: string
  /** Human-readable description for help modal */
  description: string
  /** Category for grouping in help modal */
  category: 'navigation' | 'list' | 'scroll' | 'utility'
  /** Action to execute */
  action: () => void
}

export interface FocusableItem {
  /** The DOM element */
  element: HTMLElement
  /** URL to navigate to on Enter */
  href: string
  /** Unique identifier (for focus restoration) */
  id: string
}

// =============================================================================
// Constants
// =============================================================================

const SEQUENCE_TIMEOUT = 1000 // 1 second timeout for multi-key sequences

// Guard against multiple initializations
let isInitialized = false

// =============================================================================
// State
// =============================================================================

const state: KeyboardState = {
  pendingSequence: null,
  sequenceStartTime: null,
  isHelpModalOpen: false,
  isSearchOpen: false,
  focusedListIndex: -1,
}

// =============================================================================
// Shortcut Registry (T028)
// =============================================================================

const shortcuts: ShortcutDefinition[] = []

function registerShortcut(shortcut: ShortcutDefinition): void {
  shortcuts.push(shortcut)
}

export function getShortcuts(): ShortcutDefinition[] {
  return [...shortcuts]
}

// =============================================================================
// Focus Manager (T021)
// =============================================================================

function getFocusableItems(): FocusableItem[] {
  const elements = document.querySelectorAll<HTMLElement>('[data-focusable]')
  return Array.from(elements).map((element, index) => ({
    element,
    href: element.getAttribute('href') || element.dataset.href || '',
    id: element.dataset.id || `focusable-${index}`,
  }))
}

function focusItem(index: number): void {
  const items = getFocusableItems()
  if (index >= 0 && index < items.length) {
    state.focusedListIndex = index
    items[index].element.focus()
  }
}

function focusNext(): void {
  const items = getFocusableItems()
  if (items.length === 0) return

  if (state.focusedListIndex < 0) {
    focusItem(0)
  } else if (state.focusedListIndex < items.length - 1) {
    focusItem(state.focusedListIndex + 1)
  }
  // At last item: stay (no wrap per spec)
}

function focusPrevious(): void {
  const items = getFocusableItems()
  if (items.length === 0) return

  if (state.focusedListIndex < 0) {
    focusItem(items.length - 1)
  } else if (state.focusedListIndex > 0) {
    focusItem(state.focusedListIndex - 1)
  }
  // At first item: stay (no wrap per spec)
}

function openFocusedItem(): void {
  const items = getFocusableItems()
  if (state.focusedListIndex >= 0 && state.focusedListIndex < items.length) {
    const item = items[state.focusedListIndex]
    if (item.href) {
      window.location.href = item.href
    }
  }
}

// =============================================================================
// KeyToast (T007, T010, T011)
// =============================================================================

let keyToastElement: HTMLElement | null = null

function getOrCreateKeyToast(): HTMLElement {
  if (keyToastElement && document.body.contains(keyToastElement)) {
    return keyToastElement
  }

  keyToastElement = document.createElement('div')
  keyToastElement.id = 'key-toast'
  keyToastElement.setAttribute('aria-live', 'polite')
  keyToastElement.setAttribute('aria-atomic', 'true')
  keyToastElement.style.cssText = `
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    background-color: rgba(30, 41, 59, 0.95);
    color: #e2e8f0;
    border-radius: 0.375rem;
    font-family: ui-monospace, monospace;
    font-size: 0.875rem;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
    pointer-events: none;
  `
  document.body.appendChild(keyToastElement)
  return keyToastElement
}

function showKeyToast(text: string): void {
  const toast = getOrCreateKeyToast()
  toast.textContent = text
  toast.style.opacity = '1'
}

function hideKeyToast(): void {
  if (keyToastElement) {
    keyToastElement.style.opacity = '0'
  }
}

// =============================================================================
// Help Modal (T027, T029, T030, T031, T032)
// =============================================================================

let helpModalElement: HTMLElement | null = null
let previouslyFocusedElement: HTMLElement | null = null

function createHelpModal(): HTMLElement {
  const modal = document.createElement('div')
  modal.id = 'help-modal'
  modal.setAttribute('role', 'dialog')
  modal.setAttribute('aria-modal', 'true')
  modal.setAttribute('aria-labelledby', 'help-modal-title')
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 10000;
    pointer-events: auto;
  `

  const content = document.createElement('div')
  content.style.cssText = `
    background-color: #1e293b;
    border-radius: 0.5rem;
    padding: 3.5rem;
    color: #e2e8f0;
  `

  const title = document.createElement('h2')
  title.id = 'help-modal-title'
  title.textContent = 'Keyboard Shortcuts'
  title.style.cssText = `
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: white;
  `
  content.appendChild(title)

  // Grid container for 2-column layout
  const grid = document.createElement('div')
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, auto);
    gap: 2.5rem;
  `

  // Group shortcuts by category
  const categories = {
    navigation: 'Navigation',
    list: 'List Navigation',
    scroll: 'Scrolling',
    utility: 'Utility',
  }

  for (const [category, label] of Object.entries(categories)) {
    const categoryShortcuts = shortcuts.filter((s) => s.category === category)
    if (categoryShortcuts.length === 0) continue

    const section = document.createElement('div')
    section.style.cssText = 'margin-bottom: 1rem;'

    const sectionTitle = document.createElement('h3')
    sectionTitle.textContent = label
    sectionTitle.style.cssText = `
      font-size: 0.875rem;
      font-weight: 500;
      color: #94a3b8;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `
    section.appendChild(sectionTitle)

    const list = document.createElement('div')
    list.style.cssText = 'display: grid; gap: 0.25rem;'

    for (const shortcut of categoryShortcuts) {
      const row = document.createElement('div')
      row.style.cssText = `
        display: flex;
        justify-content: space-between;
        padding: 0.25rem 0;
      `

      const keySpan = document.createElement('span')
      keySpan.style.cssText = `
        font-family: ui-monospace, monospace;
        background-color: #334155;
        padding: 0.125rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
      `
      keySpan.textContent = shortcut.keys

      const descSpan = document.createElement('span')
      descSpan.style.cssText = 'color: #cbd5e1; font-size: 0.875rem;'
      descSpan.textContent = shortcut.description

      row.appendChild(keySpan)
      row.appendChild(descSpan)
      list.appendChild(row)
    }

    section.appendChild(list)
    grid.appendChild(section)
  }

  content.appendChild(grid)

  // Close hint
  const hint = document.createElement('p')
  hint.style.cssText = `
    text-align: center;
    color: #64748b;
    font-size: 0.75rem;
    margin-top: 1rem;
  `
  hint.textContent = 'Press ? or Escape to close'
  content.appendChild(hint)

  modal.appendChild(content)
  return modal
}

function openHelpModal(): void {
  if (state.isHelpModalOpen) return

  previouslyFocusedElement = document.activeElement as HTMLElement
  state.isHelpModalOpen = true

  helpModalElement = createHelpModal()
  document.body.appendChild(helpModalElement)

  // Focus trap: focus the modal itself
  helpModalElement.setAttribute('tabindex', '-1')
  helpModalElement.focus()
}

function closeHelpModal(): void {
  if (!state.isHelpModalOpen || !helpModalElement) return

  state.isHelpModalOpen = false
  helpModalElement.remove()
  helpModalElement = null

  // Restore focus
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus()
    previouslyFocusedElement = null
  }
}

// =============================================================================
// Search Overlay (027-pagefind-search)
// =============================================================================

let searchOverlayElement: HTMLElement | null = null
let searchPreviouslyFocused: HTMLElement | null = null
let searchFocusedIndex = -1
let searchResultElements: HTMLElement[] = []
// biome-ignore lint/suspicious/noExplicitAny: Pagefind API is dynamically imported at runtime
let pagefindInstance: any = null
let pagefindFailed = false

const COLLECTION_LABELS: Record<string, string> = {
  accounts: 'Account',
  contacts: 'Contact',
  deals: 'Deal',
  projects: 'Project',
  tasks: 'Task',
  kb: 'KB',
  meetings: 'Meeting',
  journals: 'Journal',
}

const COLLECTION_COLORS: Record<string, string> = {
  accounts: '#3b82f6',
  contacts: '#8b5cf6',
  deals: '#10b981',
  projects: '#f59e0b',
  tasks: '#ef4444',
  kb: '#06b6d4',
  meetings: '#ec4899',
  journals: '#6366f1',
}

function createSearchOverlay(): HTMLElement {
  const overlay = document.createElement('div')
  overlay.id = 'search-overlay'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', 'Search')
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
    background-color: rgba(0, 0, 0, 0.75);
    z-index: 10001;
    pointer-events: auto;
  `

  const panel = document.createElement('div')
  panel.style.cssText = `
    background-color: #1e293b;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 640px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  `

  const inputWrapper = document.createElement('div')
  inputWrapper.style.cssText = `
    padding: 1rem;
    border-bottom: 1px solid #334155;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `

  const searchIcon = document.createElement('span')
  searchIcon.style.cssText = 'color: #94a3b8; font-size: 1.125rem; flex-shrink: 0;'
  searchIcon.textContent = '/'

  const input = document.createElement('input')
  input.id = 'search-overlay-input'
  input.type = 'text'
  input.placeholder = 'Search across all collections...'
  input.autocomplete = 'off'
  input.style.cssText = `
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #e2e8f0;
    font-size: 1rem;
    font-family: inherit;
  `

  const hint = document.createElement('span')
  hint.style.cssText = 'color: #64748b; font-size: 0.75rem; flex-shrink: 0;'
  hint.textContent = 'esc to close'

  inputWrapper.appendChild(searchIcon)
  inputWrapper.appendChild(input)
  inputWrapper.appendChild(hint)

  const results = document.createElement('div')
  results.id = 'search-overlay-results'
  results.style.cssText = `
    overflow-y: auto;
    flex: 1;
    padding: 0.5rem;
  `

  const emptyState = document.createElement('p')
  emptyState.id = 'search-empty-state'
  emptyState.style.cssText = `
    text-align: center;
    color: #64748b;
    font-size: 0.875rem;
    padding: 2rem 1rem;
  `
  emptyState.textContent = 'Type to search across all collections'
  results.appendChild(emptyState)

  panel.appendChild(inputWrapper)
  panel.appendChild(results)
  overlay.appendChild(panel)

  // Wire up search input
  let debounceTimer: number | null = null
  input.addEventListener('input', () => {
    const query = input.value.trim()
    if (debounceTimer) clearTimeout(debounceTimer)

    if (!query) {
      renderSearchEmpty('Type to search across all collections')
      return
    }

    debounceTimer = window.setTimeout(() => {
      performSearch(query)
    }, 300)
  })

  // Handle keyboard navigation within overlay
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      closeSearchOverlay()
      return
    }

    if (e.key === 'ArrowDown' || (e.key === 'j' && !input.value)) {
      e.preventDefault()
      e.stopPropagation()
      focusSearchResult(searchFocusedIndex + 1)
      return
    }

    if (e.key === 'ArrowUp' || (e.key === 'k' && !input.value)) {
      e.preventDefault()
      e.stopPropagation()
      if (searchFocusedIndex <= 0) {
        searchFocusedIndex = -1
        highlightSearchResult(-1)
        input.focus()
      } else {
        focusSearchResult(searchFocusedIndex - 1)
      }
      return
    }

    if (
      e.key === 'Enter' &&
      searchFocusedIndex >= 0 &&
      searchFocusedIndex < searchResultElements.length
    ) {
      e.preventDefault()
      e.stopPropagation()
      const url = searchResultElements[searchFocusedIndex].dataset.url
      if (url) {
        closeSearchOverlay()
        window.location.href = url
      }
      return
    }

    // Focus trap: Tab cycles within overlay
    if (e.key === 'Tab') {
      e.preventDefault()
      input.focus()
    }
  })

  return overlay
}

function focusSearchResult(index: number): void {
  if (index >= 0 && index < searchResultElements.length) {
    searchFocusedIndex = index
    highlightSearchResult(index)
  }
}

function highlightSearchResult(index: number): void {
  for (let i = 0; i < searchResultElements.length; i++) {
    searchResultElements[i].style.backgroundColor = i === index ? '#334155' : 'transparent'
  }
}

function renderSearchEmpty(message: string): void {
  const resultsContainer = document.getElementById('search-overlay-results')
  if (!resultsContainer) return
  resultsContainer.innerHTML = ''
  searchResultElements = []
  searchFocusedIndex = -1

  const p = document.createElement('p')
  p.style.cssText = 'text-align: center; color: #64748b; font-size: 0.875rem; padding: 2rem 1rem;'
  p.textContent = message
  resultsContainer.appendChild(p)
}

async function performSearch(query: string): Promise<void> {
  if (!pagefindInstance && !pagefindFailed) {
    try {
      const pagefindPath = '/pagefind/pagefind.js'
      pagefindInstance = await import(/* @vite-ignore */ pagefindPath)
    } catch {
      pagefindFailed = true
    }
  }

  if (pagefindFailed) {
    renderSearchEmpty('Search is available after running: bun run build')
    return
  }

  try {
    const search = await pagefindInstance.debouncedSearch(query, {}, 300)
    if (!search) return // debounced away

    if (search.results.length === 0) {
      renderSearchEmpty('No results found')
      return
    }

    const loaded = await Promise.all(
      search.results.slice(0, 10).map((r: { data: () => Promise<unknown> }) => r.data()),
    )
    renderSearchResults(loaded)
  } catch {
    renderSearchEmpty('Search error — try rebuilding with: bun run build')
  }
}

interface PagefindResult {
  url: string
  excerpt: string
  meta: { title: string }
  filters: Record<string, string[]>
}

function renderSearchResults(results: unknown[]): void {
  const resultsContainer = document.getElementById('search-overlay-results')
  if (!resultsContainer) return
  resultsContainer.innerHTML = ''
  searchResultElements = []
  searchFocusedIndex = -1

  for (const result of results as PagefindResult[]) {
    const collection = result.filters?.collection?.[0] || 'unknown'
    const label = COLLECTION_LABELS[collection] || collection
    const color = COLLECTION_COLORS[collection] || '#94a3b8'
    const title = result.meta?.title || result.url

    const item = document.createElement('div')
    item.dataset.url = result.url
    item.style.cssText = `
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      cursor: pointer;
      transition: background-color 0.1s;
    `

    const topRow = document.createElement('div')
    topRow.style.cssText =
      'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;'

    const badge = document.createElement('span')
    badge.style.cssText = `
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      background-color: ${color}20;
      color: ${color};
    `
    badge.textContent = label

    const titleEl = document.createElement('span')
    titleEl.style.cssText = 'color: #e2e8f0; font-size: 0.875rem; font-weight: 500;'
    titleEl.textContent = title

    topRow.appendChild(badge)
    topRow.appendChild(titleEl)

    item.appendChild(topRow)

    if (result.excerpt) {
      const excerpt = document.createElement('div')
      excerpt.style.cssText = 'color: #94a3b8; font-size: 0.75rem; line-height: 1.4;'
      excerpt.innerHTML = result.excerpt
      // Style the <mark> tags from Pagefind
      for (const mark of excerpt.querySelectorAll('mark')) {
        ;(mark as HTMLElement).style.cssText =
          'background-color: #fbbf2440; color: #fbbf24; border-radius: 2px;'
      }
      item.appendChild(excerpt)
    }

    item.addEventListener('click', () => {
      closeSearchOverlay()
      window.location.href = result.url
    })

    item.addEventListener('mouseenter', () => {
      const idx = searchResultElements.indexOf(item)
      if (idx >= 0) {
        searchFocusedIndex = idx
        highlightSearchResult(idx)
      }
    })

    resultsContainer.appendChild(item)
    searchResultElements.push(item)
  }
}

function openSearchOverlay(): void {
  if (state.isSearchOpen || state.isHelpModalOpen) return

  searchPreviouslyFocused = document.activeElement as HTMLElement
  state.isSearchOpen = true

  searchOverlayElement = createSearchOverlay()
  document.body.appendChild(searchOverlayElement)

  const input = document.getElementById('search-overlay-input') as HTMLInputElement
  if (input) input.focus()
}

function closeSearchOverlay(): void {
  if (!state.isSearchOpen || !searchOverlayElement) return

  state.isSearchOpen = false
  searchOverlayElement.remove()
  searchOverlayElement = null
  searchResultElements = []
  searchFocusedIndex = -1

  if (searchPreviouslyFocused) {
    searchPreviouslyFocused.focus()
    searchPreviouslyFocused = null
  }
}

// =============================================================================
// Scroll Handlers (T037)
// =============================================================================

function getScrollContainer(): Element {
  return document.querySelector('main') || document.documentElement
}

function scrollByLines(lines: number): void {
  const lineHeight = 20 // Approximate line height in pixels
  getScrollContainer().scrollBy({ top: lines * lineHeight, behavior: 'smooth' })
}

function scrollByPage(pages: number): void {
  const pageHeight = window.innerHeight * 0.9
  getScrollContainer().scrollBy({ top: pages * pageHeight, behavior: 'smooth' })
}

function scrollHalfPage(direction: number): void {
  const halfPage = window.innerHeight * 0.5
  getScrollContainer().scrollBy({ top: direction * halfPage, behavior: 'smooth' })
}

// =============================================================================
// Go Back Navigation (T033, T034, T035, T036)
// =============================================================================

function getParentRoute(): string | null {
  const path = window.location.pathname
  // Match patterns like /projects/slug/ -> /projects/
  const match = path.match(/^(\/[^/]+\/)[^/]+\/?$/)
  return match ? match[1] : null
}

function goBack(): void {
  const parentRoute = getParentRoute()
  if (parentRoute) {
    window.location.href = parentRoute
  }
}

// =============================================================================
// Input Field Detection (T005)
// =============================================================================

function isInInputField(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false

  const tagName = target.tagName.toLowerCase()
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true
  if (target.isContentEditable) return true

  return false
}

// =============================================================================
// Multi-Key Sequence Handler (T008)
// =============================================================================

function handlePendingSequence(key: string): boolean {
  const now = Date.now()

  // Check for timeout
  if (state.pendingSequence && state.sequenceStartTime) {
    if (now - state.sequenceStartTime > SEQUENCE_TIMEOUT) {
      clearPendingSequence()
    }
  }

  // Check if this key starts a new sequence
  if (key === 'g' && !state.pendingSequence) {
    state.pendingSequence = 'g'
    state.sequenceStartTime = now
    showKeyToast('g...')
    return true
  }

  // Check if this completes a pending sequence
  if (state.pendingSequence === 'g') {
    const fullSequence = `g ${key}`
    const shortcut = shortcuts.find((s) => s.keys === fullSequence)

    clearPendingSequence()
    hideKeyToast()

    if (shortcut) {
      shortcut.action()
      return true
    }
  }

  return false
}

function clearPendingSequence(): void {
  state.pendingSequence = null
  state.sequenceStartTime = null
}

// Set up timeout check
let sequenceTimeoutId: number | null = null

function startSequenceTimeout(): void {
  if (sequenceTimeoutId) {
    clearTimeout(sequenceTimeoutId)
  }
  sequenceTimeoutId = window.setTimeout(() => {
    if (state.pendingSequence) {
      clearPendingSequence()
      hideKeyToast()
    }
  }, SEQUENCE_TIMEOUT)
}

// =============================================================================
// KeyboardManager (T004)
// =============================================================================

function handleKeyDown(event: KeyboardEvent): void {
  const target = event.target

  // Ignore if in input field (except for Escape to blur)
  if (isInInputField(target)) {
    if (event.key === 'Escape') {
      ;(target as HTMLElement).blur()
      event.preventDefault()
    }
    return
  }

  // If search overlay is open, let overlay handle its own keys
  if (state.isSearchOpen) {
    return
  }

  // If help modal is open, handle modal-specific keys
  if (state.isHelpModalOpen) {
    if (event.key === 'Escape' || event.key === '?') {
      closeHelpModal()
      event.preventDefault()
    }
    return
  }

  // Handle multi-key sequences first
  if (handlePendingSequence(event.key)) {
    if (state.pendingSequence) {
      startSequenceTimeout()
    }
    event.preventDefault()
    return
  }

  // Handle single-key shortcuts
  const shortcut = shortcuts.find((s) => {
    // Only match single keys (not sequences)
    if (s.keys.includes(' ')) return false

    // Check for modifier keys
    if (s.keys.startsWith('Ctrl+')) {
      return event.ctrlKey && s.keys === `Ctrl+${event.key}`
    }

    return s.keys === event.key
  })

  if (shortcut) {
    shortcut.action()
    event.preventDefault()
  }
}

// =============================================================================
// Initialize (T006)
// =============================================================================

export function initKeyboard(): void {
  // Prevent multiple initializations
  if (isInitialized) {
    return
  }
  isInitialized = true

  // Register navigation shortcuts (T009)
  registerShortcut({
    keys: 'g z',
    description: 'Go to Dashboard',
    category: 'navigation',
    action: () => (window.location.href = '/'),
  })
  registerShortcut({
    keys: 'g p',
    description: 'Go to Projects',
    category: 'navigation',
    action: () => (window.location.href = '/projects/'),
  })
  registerShortcut({
    keys: 'g t',
    description: 'Go to Tasks',
    category: 'navigation',
    action: () => (window.location.href = '/tasks/'),
  })
  registerShortcut({
    keys: 'g a',
    description: 'Go to Accounts',
    category: 'navigation',
    action: () => (window.location.href = '/accounts/'),
  })
  registerShortcut({
    keys: 'g c',
    description: 'Go to Contacts',
    category: 'navigation',
    action: () => (window.location.href = '/contacts/'),
  })
  registerShortcut({
    keys: 'g d',
    description: 'Go to Deals',
    category: 'navigation',
    action: () => (window.location.href = '/deals/'),
  })
  registerShortcut({
    keys: 'g m',
    description: 'Go to Meetings',
    category: 'navigation',
    action: () => (window.location.href = '/meetings/'),
  })
  registerShortcut({
    keys: 'g j',
    description: 'Go to Journals',
    category: 'navigation',
    action: () => (window.location.href = '/journals/'),
  })
  registerShortcut({
    keys: 'g k',
    description: 'Go to Knowledge Base',
    category: 'navigation',
    action: () => (window.location.href = '/kb/'),
  })

  // Register list navigation shortcuts (T022, T023, T024)
  registerShortcut({
    keys: 'j',
    description: 'Next item',
    category: 'list',
    action: focusNext,
  })
  registerShortcut({
    keys: 'k',
    description: 'Previous item',
    category: 'list',
    action: focusPrevious,
  })
  registerShortcut({
    keys: 'Enter',
    description: 'Open selected item',
    category: 'list',
    action: openFocusedItem,
  })

  // Register search shortcut (027-pagefind-search)
  registerShortcut({
    keys: '/',
    description: 'Open search',
    category: 'utility',
    action: openSearchOverlay,
  })

  // Register help shortcut (T029)
  registerShortcut({
    keys: '?',
    description: 'Show keyboard shortcuts',
    category: 'utility',
    action: openHelpModal,
  })

  // Register go-back shortcuts (T034, T035)
  registerShortcut({
    keys: 'Escape',
    description: 'Go back / Close',
    category: 'navigation',
    action: goBack,
  })
  registerShortcut({
    keys: 'Backspace',
    description: 'Go back',
    category: 'navigation',
    action: goBack,
  })

  // Register scroll shortcuts (T037)
  registerShortcut({
    keys: 'ArrowUp',
    description: 'Scroll up',
    category: 'scroll',
    action: () => scrollByLines(-3),
  })
  registerShortcut({
    keys: 'ArrowDown',
    description: 'Scroll down',
    category: 'scroll',
    action: () => scrollByLines(3),
  })
  registerShortcut({
    keys: 'PageUp',
    description: 'Scroll page up',
    category: 'scroll',
    action: () => scrollByPage(-1),
  })
  registerShortcut({
    keys: 'PageDown',
    description: 'Scroll page down',
    category: 'scroll',
    action: () => scrollByPage(1),
  })
  registerShortcut({
    keys: 'Ctrl+u',
    description: 'Scroll half-page up',
    category: 'scroll',
    action: () => scrollHalfPage(-1),
  })
  registerShortcut({
    keys: 'Ctrl+d',
    description: 'Scroll half-page down',
    category: 'scroll',
    action: () => scrollHalfPage(1),
  })

  // Add event listeners with event delegation (T004)
  document.addEventListener('keydown', handleKeyDown)

  // Track focus changes to update focusedListIndex
  document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement
    if (target.hasAttribute('data-focusable')) {
      const items = getFocusableItems()
      const index = items.findIndex((item) => item.element === target)
      if (index >= 0) {
        state.focusedListIndex = index
      }
    }
  })

  // Handle DOM removal edge case (T038)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const removedNode of mutation.removedNodes) {
        if (removedNode instanceof HTMLElement) {
          const focusedElement = document.activeElement
          if (removedNode.contains(focusedElement) || removedNode === focusedElement) {
            // Focused element was removed, focus next sibling or parent
            const items = getFocusableItems()
            if (items.length > 0) {
              const newIndex = Math.min(state.focusedListIndex, items.length - 1)
              focusItem(Math.max(0, newIndex))
            }
          }
        }
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyboard)
  } else {
    initKeyboard()
  }
}
