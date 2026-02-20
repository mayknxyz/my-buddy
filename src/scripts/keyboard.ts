/**
 * Client-side keyboard navigation for my-buddy.
 * Vim-style j/k list navigation, Enter to open, / for search,
 * ? for help modal, and g+key chords for collection shortcuts.
 */

// WHY: Two-key chord state. When `g` is pressed, we wait for the next key
// within 500ms. If no follow-up arrives, the chord resets silently.
let chordPending = false;
let chordTimer: ReturnType<typeof setTimeout> | null = null;

/** Collection shortcuts — g + key navigates to the route. */
const CHORD_ROUTES: Record<string, string> = {
	z: "/",
	p: "/projects",
	t: "/tasks",
	c: "/clients",
	l: "/leads",
	o: "/opportunities",
	i: "/invoices",
	m: "/meetings",
	k: "/knowledge",
	j: "/journal",
	a: "/assets",
	e: "/interactions",
	x: "/expenses",
	y: "/payments",
};

/** Get all navigable items on the page. */
function getNavigableItems(): HTMLElement[] {
	return Array.from(document.querySelectorAll<HTMLElement>("[data-navigable]"));
}

/** Get the currently selected item index, or -1 if none. */
function getSelectedIndex(items: HTMLElement[]): number {
	return items.findIndex((el) => el.hasAttribute("data-selected"));
}

/** Select a navigable item by index. */
function selectItem(items: HTMLElement[], index: number): void {
	// Deselect all
	for (const item of items) {
		item.removeAttribute("data-selected");
	}

	if (index >= 0 && index < items.length) {
		items[index].setAttribute("data-selected", "");
		items[index].scrollIntoView({ block: "nearest", behavior: "smooth" });
	}
}

/** Open the currently selected item's link. */
function openSelected(items: HTMLElement[]): void {
	const selected = items.find((el) => el.hasAttribute("data-selected"));
	if (!selected) return;

	// Look for an anchor in the selected item
	const link = selected.querySelector<HTMLAnchorElement>("a[href]") ?? selected.closest<HTMLAnchorElement>("a[href]");
	if (link) {
		window.location.href = link.href;
	}
}

/** Toggle the help modal visibility. */
function toggleHelpModal(): void {
	const modal = document.getElementById("help-modal");
	if (!modal) return;

	const isOpen = !modal.classList.contains("hidden");
	if (isOpen) {
		modal.classList.add("hidden");
	} else {
		modal.classList.remove("hidden");
	}
}

/** Close the help modal if open. */
function closeHelpModal(): void {
	const modal = document.getElementById("help-modal");
	if (modal) modal.classList.add("hidden");
}

/** Check if an element is an input-like element that should capture keys. */
function isInputFocused(): boolean {
	const el = document.activeElement;
	if (!el) return false;
	const tag = el.tagName.toLowerCase();
	return tag === "input" || tag === "textarea" || tag === "select" || (el as HTMLElement).isContentEditable;
}

function handleKeyDown(event: KeyboardEvent): void {
	// Don't intercept when typing in inputs
	if (isInputFocused()) return;

	const key = event.key;

	// Handle chord completion: g was pressed, now waiting for second key
	if (chordPending) {
		chordPending = false;
		if (chordTimer) clearTimeout(chordTimer);

		const route = CHORD_ROUTES[key];
		if (route) {
			event.preventDefault();
			window.location.href = route;
		}
		return;
	}

	switch (key) {
		case "j": {
			event.preventDefault();
			const items = getNavigableItems();
			if (items.length === 0) return;
			const idx = getSelectedIndex(items);
			selectItem(items, Math.min(idx + 1, items.length - 1));
			break;
		}
		case "k": {
			event.preventDefault();
			const items = getNavigableItems();
			if (items.length === 0) return;
			const idx = getSelectedIndex(items);
			selectItem(items, Math.max(idx - 1, 0));
			break;
		}
		case "Enter": {
			const items = getNavigableItems();
			openSelected(items);
			break;
		}
		case "/": {
			event.preventDefault();
			const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]");
			if (searchInput) searchInput.focus();
			break;
		}
		case "Escape": {
			closeHelpModal();
			// Deselect all navigable items
			for (const item of getNavigableItems()) {
				item.removeAttribute("data-selected");
			}
			// Blur any focused element
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
			break;
		}
		case "?": {
			event.preventDefault();
			toggleHelpModal();
			break;
		}
		case "g": {
			event.preventDefault();
			chordPending = true;
			// Reset chord after 500ms if no second key
			chordTimer = setTimeout(() => {
				chordPending = false;
			}, 500);
			break;
		}
	}
}

// Initialize on DOM ready
document.addEventListener("keydown", handleKeyDown);
