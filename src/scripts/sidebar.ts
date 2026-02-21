/**
 * Sidebar interactions: mobile toggle, compact mode, and keyboard dismiss.
 * No [data-navigable] attributes on sidebar — j/k keyboard nav is unaffected.
 */

const sidebar = document.getElementById("sidebar");
const backdrop = document.getElementById("sidebar-backdrop");
const toggle = document.getElementById("sidebar-toggle");
const compactToggle = document.getElementById("sidebar-compact-toggle");

const COMPACT_KEY = "sidebar-compact";

/** Open the mobile sidebar. */
function openMobile(): void {
	sidebar?.classList.remove("-translate-x-full");
	backdrop?.classList.remove("hidden");
	toggle?.setAttribute("aria-expanded", "true");
}

/** Close the mobile sidebar. */
function closeMobile(): void {
	sidebar?.classList.add("-translate-x-full");
	backdrop?.classList.add("hidden");
	toggle?.setAttribute("aria-expanded", "false");
}

/** Apply or remove compact mode on desktop. */
function setCompact(compact: boolean): void {
	if (compact) {
		document.documentElement.setAttribute("data-sidebar-compact", "");
		localStorage.setItem(COMPACT_KEY, "1");
	} else {
		document.documentElement.removeAttribute("data-sidebar-compact");
		localStorage.removeItem(COMPACT_KEY);
	}
}

// Mobile toggle
toggle?.addEventListener("click", () => {
	const isOpen = !sidebar?.classList.contains("-translate-x-full");
	if (isOpen) {
		closeMobile();
	} else {
		openMobile();
	}
});

// Backdrop closes mobile sidebar
backdrop?.addEventListener("click", closeMobile);

// Compact toggle
compactToggle?.addEventListener("click", () => {
	const isCompact = document.documentElement.hasAttribute("data-sidebar-compact");
	setCompact(!isCompact);
});

// Escape closes mobile sidebar (does not conflict with help modal —
// keyboard.ts handles Escape for help modal separately)
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && !sidebar?.classList.contains("-translate-x-full")) {
		// Only on mobile (lg:translate-x-0 keeps it visible on desktop)
		if (window.innerWidth < 1024) {
			closeMobile();
		}
	}
});
