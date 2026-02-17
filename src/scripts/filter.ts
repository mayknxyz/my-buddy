/**
 * Client-side filtering engine with URL param sync.
 * Auto-initializes on pages that have a #filter-bar element.
 */

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function applyFilters(
  tbody: HTMLElement,
  selects: NodeListOf<HTMLSelectElement>,
  searchInput: HTMLInputElement | null,
): void {
  const rows = tbody.querySelectorAll<HTMLTableRowElement>('tr:not(#filter-no-results)')
  const searchQuery = (searchInput?.value || '').toLowerCase().trim()

  let visibleIndex = 0

  rows.forEach((row) => {
    let visible = true

    // Check each dropdown filter
    selects.forEach((select) => {
      const filterName = select.dataset.filterName!
      const filterValue = select.value
      if (!filterValue) return // "All" selected

      const rowValue = row.dataset[`filter${capitalize(filterName)}`]

      // Array fields (tags): comma-separated, check includes
      if (rowValue?.includes(',')) {
        if (!rowValue.split(',').includes(filterValue)) {
          visible = false
        }
      } else if (rowValue !== filterValue) {
        visible = false
      }
    })

    // Text search
    if (visible && searchQuery) {
      const rowText = row.textContent?.toLowerCase() || ''
      if (!rowText.includes(searchQuery)) {
        visible = false
      }
    }

    // Apply visibility
    row.style.display = visible ? '' : 'none'

    // Reindex focusable items for keyboard nav
    if (visible) {
      const focusable = row.querySelector<HTMLElement>('[data-focusable], [data-focusable-hidden]')
      if (focusable) {
        focusable.setAttribute('data-focusable', '')
        focusable.removeAttribute('data-focusable-hidden')
        focusable.setAttribute('tabindex', '0')
        focusable.dataset.index = String(visibleIndex)
        visibleIndex++
      }
    } else {
      const focusable = row.querySelector<HTMLElement>('[data-focusable]')
      if (focusable) {
        focusable.removeAttribute('data-focusable')
        focusable.setAttribute('data-focusable-hidden', '')
        focusable.setAttribute('tabindex', '-1')
      }
    }
  })

  // Empty state
  let noResultsEl = document.getElementById('filter-no-results')
  if (visibleIndex === 0) {
    if (!noResultsEl) {
      noResultsEl = document.createElement('tr')
      noResultsEl.id = 'filter-no-results'
      noResultsEl.innerHTML = `<td colspan="99" class="py-8 text-center text-[var(--color-text-muted)]">No results match your filters.</td>`
      tbody.appendChild(noResultsEl)
    }
    noResultsEl.style.display = ''
  } else if (noResultsEl) {
    noResultsEl.style.display = 'none'
  }
}

function syncURL(
  selects: NodeListOf<HTMLSelectElement>,
  searchInput: HTMLInputElement | null,
): void {
  const params = new URLSearchParams()

  selects.forEach((select) => {
    const name = select.dataset.filterName!
    const value = select.value
    if (value) {
      params.set(name, value)
    }
  })

  if (searchInput?.value) {
    params.set('q', searchInput.value)
  }

  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname

  window.history.replaceState(null, '', newURL)
}

function initFilters(): void {
  const filterBar = document.getElementById('filter-bar')
  if (!filterBar) return

  const tbody = document.querySelector('tbody')
  if (!tbody) return

  const selects = filterBar.querySelectorAll<HTMLSelectElement>('[data-filter-select]')
  const searchInput = filterBar.querySelector<HTMLInputElement>('[data-filter-search]')

  // Restore state from URL params
  const params = new URLSearchParams(window.location.search)

  selects.forEach((select) => {
    const paramName = select.dataset.filterName!
    const paramValue = params.get(paramName) || ''
    select.value = paramValue
  })

  if (searchInput) {
    searchInput.value = params.get('q') || ''
  }

  // Apply initial filters
  applyFilters(tbody, selects, searchInput)

  // Listen for changes
  selects.forEach((select) => {
    select.addEventListener('change', () => {
      applyFilters(tbody, selects, searchInput)
      syncURL(selects, searchInput)
    })
  })

  if (searchInput) {
    let debounceTimer: number
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => {
        applyFilters(tbody, selects, searchInput)
        syncURL(selects, searchInput)
      }, 150)
    })
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFilters)
} else {
  initFilters()
}
