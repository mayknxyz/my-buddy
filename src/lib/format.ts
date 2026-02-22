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
		// Client / project / general
		active: "success",
		inactive: "neutral",
		churned: "danger",
		paused: "warning",
		completed: "success",
		archived: "neutral",
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
		// Meeting type
		kickoff: "accent",
		standup: "info",
		review: "warning",
		demo: "success",
		internal: "neutral",
		// Priority
		high: "danger",
		medium: "warning",
		low: "info",
		// Interaction direction
		inbound: "info",
		outbound: "accent",
		// Proposal
		accepted: "success",
		rejected: "danger",
		// Payment
		pending: "warning",
		confirmed: "success",
		failed: "danger",
		// Tax
		"in-progress": "info",
		filed: "success",
		audited: "warning",
		// Assets
		storage: "warning",
		retired: "neutral",
		sold: "neutral",
		transferred: "neutral",
		decommissioned: "danger",
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

/** Convert a meeting type slug to a human-readable label. */
export function meetingTypeLabel(type: string): string {
	const map: Record<string, string> = {
		kickoff: "Kickoff",
		standup: "Standup",
		review: "Review",
		demo: "Demo",
		internal: "Internal",
		"in-person": "In Person",
	};
	return map[type] ?? type;
}

/** Convert a priority slug to a human-readable label. */
export function priorityLabel(priority: string): string {
	const map: Record<string, string> = {
		high: "High",
		medium: "Medium",
		low: "Low",
	};
	return map[priority] ?? priority;
}

/** Convert a payment method slug to a human-readable label. */
export function paymentMethodLabel(method: string): string {
	const map: Record<string, string> = {
		"bank-transfer": "Bank Transfer",
		paypal: "PayPal",
		stripe: "Stripe",
		cash: "Cash",
	};
	return map[method] ?? method;
}

/** Convert an expense category slug to a human-readable label. */
export function expenseCategoryLabel(category: string): string {
	const map: Record<string, string> = {
		software: "Software",
		hardware: "Hardware",
		travel: "Travel",
		marketing: "Marketing",
		office: "Office",
		other: "Other",
	};
	return map[category] ?? category;
}

/** Convert a contract type slug to a human-readable label. */
export function contractTypeLabel(type: string): string {
	const map: Record<string, string> = {
		"service-agreement": "Service Agreement",
		nda: "NDA",
		msa: "MSA",
		sow: "SOW",
	};
	return map[type] ?? type;
}

/** Convert a recurring frequency slug to a human-readable label. */
export function recurringLabel(recurring: string): string {
	const map: Record<string, string> = {
		monthly: "Monthly",
		annual: "Annual",
		"one-time": "One-time",
	};
	return map[recurring] ?? recurring;
}

/** Convert a license type slug to a human-readable label. */
export function licenseTypeLabel(type: string): string {
	const map: Record<string, string> = {
		subscription: "Subscription",
		perpetual: "Perpetual",
		"open-source": "Open Source",
		freemium: "Freemium",
	};
	return map[type] ?? type;
}

/** Convert a subscription category slug to a human-readable label. */
export function subscriptionCategoryLabel(category: string): string {
	const map: Record<string, string> = {
		design: "Design",
		dev: "Dev",
		marketing: "Marketing",
		productivity: "Productivity",
		infra: "Infrastructure",
		other: "Other",
	};
	return map[category] ?? category;
}

/** Convert a compliance type slug to a human-readable label. */
export function complianceTypeLabel(type: string): string {
	const map: Record<string, string> = {
		"privacy-policy": "Privacy Policy",
		"terms-of-service": "Terms of Service",
		dpa: "DPA",
		"cookie-policy": "Cookie Policy",
		"acceptable-use": "Acceptable Use",
	};
	return map[type] ?? type;
}

/** Convert a billing frequency slug to a human-readable label. */
export function billingLabel(billing: string): string {
	const map: Record<string, string> = {
		monthly: "Monthly",
		annual: "Annual",
	};
	return map[billing] ?? billing;
}

/** Convert an asset type key to a human-readable label. */
export function assetTypeLabel(type: string): string {
	const map: Record<string, string> = {
		hardware: "Hardware",
		software: "Software",
		domains: "Domains",
		servers: "Servers",
		accounts: "Accounts",
	};
	return map[type] ?? type;
}

/** Convert a journal type slug to a human-readable label. */
export function journalTypeLabel(type: string): string {
	const map: Record<string, string> = {
		daily: "Daily",
		weekly: "Weekly",
		monthly: "Monthly",
	};
	return map[type] ?? type;
}

/** Convert a SOP category slug to a human-readable label. */
export function sopCategoryLabel(category: string): string {
	const map: Record<string, string> = {
		engineering: "Engineering",
		operations: "Operations",
		sales: "Sales",
		onboarding: "Onboarding",
		other: "Other",
	};
	return map[category] ?? category;
}

/** Convert a knowledge scope key to a human-readable label. */
export function knowledgeScopeLabel(scope: string): string {
	const map: Record<string, string> = {
		base: "Base",
		projects: "Project",
		clients: "Client",
	};
	return map[scope] ?? scope;
}

/** Convert a knowledge category slug to a human-readable label. */
export function knowledgeCategoryLabel(category: string): string {
	const map: Record<string, string> = {
		dev: "Development",
		business: "Business",
		tools: "Tools",
		personal: "Personal",
	};
	return map[category] ?? category;
}

/** Extract the client slug from a folder-namespaced content ID. */
export function clientSlugFromId(id: string): string {
	// "acme-corp/index" → "acme-corp"
	// "acme-corp/john-doe" → "acme-corp"
	return id.split("/")[0];
}
