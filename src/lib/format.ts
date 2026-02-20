/**
 * Display formatting utilities for the my-buddy UI.
 * Centralizes currency, date, status, and label formatting.
 */

/** Format a number as USD currency. */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
	}).format(amount);
}

/** Format a date as "Feb 20, 2026". */
export function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/** Format a date as a relative string like "3 days ago". */
export function formatRelativeDate(date: Date | string): string {
	const now = new Date();
	const target = new Date(date);
	const diffMs = now.getTime() - target.getTime();
	const diffDays = Math.floor(diffMs / 86400000);

	if (diffDays < 0) {
		const absDays = Math.abs(diffDays);
		if (absDays === 1) return "tomorrow";
		if (absDays < 7) return `in ${absDays} days`;
		if (absDays < 30) return `in ${Math.floor(absDays / 7)} weeks`;
		return formatDate(date);
	}

	if (diffDays === 0) return "today";
	if (diffDays === 1) return "yesterday";
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
	if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
	return formatDate(date);
}

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "accent";

/** Map any status string to a Badge variant color. */
export function statusVariant(status: string): BadgeVariant {
	const map: Record<string, BadgeVariant> = {
		// Client / general
		active: "success",
		inactive: "neutral",
		churned: "danger",
		// Lead
		new: "info",
		contacted: "warning",
		qualified: "success",
		disqualified: "danger",
		// Task
		todo: "neutral",
		doing: "info",
		done: "success",
		blocked: "danger",
		deferred: "warning",
		// Invoice / contract
		draft: "neutral",
		sent: "info",
		paid: "success",
		overdue: "danger",
		cancelled: "danger",
		signed: "success",
		expired: "danger",
		terminated: "danger",
		// Pipeline
		discovery: "info",
		scoping: "info",
		"proposal-sent": "warning",
		negotiation: "warning",
		"closed-won": "success",
		"closed-lost": "danger",
		// Interaction direction
		inbound: "info",
		outbound: "accent",
	};

	return map[status] ?? "neutral";
}

/** Convert a pipeline stage slug to a human-readable label. */
export function stageLabel(stage: string): string {
	const map: Record<string, string> = {
		discovery: "Discovery",
		scoping: "Scoping",
		"proposal-sent": "Proposal Sent",
		negotiation: "Negotiation",
		"closed-won": "Closed Won",
		"closed-lost": "Closed Lost",
	};
	return map[stage] ?? stage;
}

/** Convert a lead source slug to a human-readable label. */
export function sourceLabel(source: string): string {
	const map: Record<string, string> = {
		referral: "Referral",
		social: "Social",
		inbound: "Inbound",
		cold: "Cold Outreach",
	};
	return map[source] ?? source;
}

/** Extract the client slug from a folder-namespaced content ID. */
export function clientSlugFromId(id: string): string {
	// "acme-corp/index" → "acme-corp"
	// "acme-corp/john-doe" → "acme-corp"
	return id.split("/")[0];
}
