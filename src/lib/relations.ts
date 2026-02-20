/**
 * Cross-collection query helpers for the my-buddy dashboard.
 * Provides 8 typed functions that resolve relationships between flat-file
 * collections using slug prefix matching and frontmatter references.
 */
import { getCollection } from "astro:content";

// ---------------------------------------------------------------------------
// Helper: safe collection fetch — returns empty array if collection is empty
// ---------------------------------------------------------------------------

// LEARN: Astro's getCollection throws on unknown collections but returns []
// for empty ones. We still wrap in try/catch as a safety net during dev.
async function safeGetCollection<T>(name: string): Promise<T[]> {
	try {
		return (await getCollection(name as any)) as T[];
	} catch {
		return [];
	}
}

// ---------------------------------------------------------------------------
// Types for return values
// ---------------------------------------------------------------------------

type Entry<T = Record<string, any>> = {
	id: string;
	data: T;
	body?: string;
};

/** Full project context with all related entities. */
export interface ProjectWithRelations {
	project: Entry | undefined;
	tasks: Entry[];
	meetings: Entry[];
	timelog: Entry[];
	files: Entry[];
	invoices: Entry[];
	expenses: Entry[];
	budgets: Entry[];
	client: Entry | undefined;
	contacts: Entry[];
	interactions: Entry[];
	knowledge: Entry[];
}

/** Full client context with all related entities. */
export interface ClientWithRelations {
	client: Entry | undefined;
	projects: Entry[];
	contacts: Entry[];
	contracts: Entry[];
	invoices: Entry[];
	payments: Entry[];
	interactions: Entry[];
	proposals: Entry[];
}

/** Contact with parent client and related data. */
export interface ContactWithRelations {
	contact: Entry | undefined;
	client: Entry | undefined;
	projects: Entry[];
	interactions: Entry[];
}

/** Opportunity grouped by pipeline stage. */
export interface PipelineStage {
	stage: string;
	opportunities: Entry[];
	totalValue: number;
}

/** Invoice totals grouped by status. */
export interface InvoiceSummary {
	draft: { count: number; total: number };
	sent: { count: number; total: number };
	paid: { count: number; total: number };
	overdue: { count: number; total: number };
	cancelled: { count: number; total: number };
}

/** Billable vs non-billable hours. */
export interface BillableHours {
	billable: number;
	nonBillable: number;
	total: number;
}

// ---------------------------------------------------------------------------
// 1. getProjectWithRelations
// ---------------------------------------------------------------------------

/**
 * Fetch a project and all its related entities.
 * Uses slug prefix matching for folder-namespaced collections and
 * frontmatter field matching for cross-references.
 */
export async function getProjectWithRelations(slug: string): Promise<ProjectWithRelations> {
	const [
		projects,
		allTasks,
		allMeetings,
		allTimelog,
		allFiles,
		allInvoices,
		allExpenses,
		allBudgets,
		allClients,
		allContacts,
		allInteractions,
		allKnowledgeProjects,
	] = await Promise.all([
		safeGetCollection<Entry>("projects"),
		safeGetCollection<Entry>("tasks"),
		safeGetCollection<Entry>("meetings"),
		safeGetCollection<Entry>("timelog"),
		safeGetCollection<Entry>("files"),
		safeGetCollection<Entry>("invoices"),
		safeGetCollection<Entry>("expenses"),
		safeGetCollection<Entry>("budgets"),
		safeGetCollection<Entry>("clients"),
		safeGetCollection<Entry>("contacts"),
		safeGetCollection<Entry>("interactions"),
		safeGetCollection<Entry>("knowledgeProjects"),
	]);

	// LEARN: Astro 5 glob loader strips "index" from IDs — index.md → just the folder slug
	const project = projects.find((p: any) => p.id === slug);
	const clientSlug = (project as any)?.data?.client;

	return {
		project,
		tasks: allTasks.filter((t: any) => t.id.startsWith(`${slug}/`)),
		meetings: allMeetings.filter((m: any) => m.id.startsWith(`${slug}/`)),
		timelog: allTimelog.filter((t: any) => t.id.startsWith(`${slug}/`)),
		files: allFiles.filter((f: any) => f.id.startsWith(`${slug}/`)),
		invoices: allInvoices.filter((i: any) => i.data.project === slug),
		expenses: allExpenses.filter((e: any) => e.id.startsWith(`${slug}/`)),
		// WHY: Budgets use index.md so glob loader gives ID "acme-website" not "acme-website/index"
		budgets: allBudgets.filter((b: any) => b.id === slug || b.id.startsWith(`${slug}/`)),
		client: clientSlug
			? allClients.find((c: any) => c.id === clientSlug)
			: undefined,
		contacts: allContacts.filter((c: any) => c.data.projects?.includes(slug)),
		interactions: allInteractions.filter((i: any) => i.data.project === slug),
		knowledge: allKnowledgeProjects.filter((k: any) => k.id.startsWith(`${slug}/`)),
	};
}

// ---------------------------------------------------------------------------
// 2. getClientWithRelations
// ---------------------------------------------------------------------------

/**
 * Fetch a client and all its related entities.
 * Client-scoped collections use folder namespace matching.
 */
export async function getClientWithRelations(slug: string): Promise<ClientWithRelations> {
	const [allClients, allProjects, allContacts, allContracts, allInvoices, allPayments, allInteractions, allProposals] =
		await Promise.all([
			safeGetCollection<Entry>("clients"),
			safeGetCollection<Entry>("projects"),
			safeGetCollection<Entry>("contacts"),
			safeGetCollection<Entry>("contracts"),
			safeGetCollection<Entry>("invoices"),
			safeGetCollection<Entry>("payments"),
			safeGetCollection<Entry>("interactions"),
			safeGetCollection<Entry>("proposals"),
		]);

	return {
		client: allClients.find((c: any) => c.id === slug),
		projects: allProjects.filter((p: any) => p.data.client === slug),
		contacts: allContacts.filter((c: any) => c.id.startsWith(`${slug}/`)),
		contracts: allContracts.filter((c: any) => c.id.startsWith(`${slug}/`)),
		invoices: allInvoices.filter((i: any) => i.id.startsWith(`${slug}/`)),
		payments: allPayments.filter((p: any) => p.id.startsWith(`${slug}/`)),
		interactions: allInteractions.filter((i: any) => i.id.startsWith(`${slug}/`)),
		proposals: allProposals.filter((p: any) => p.id.startsWith(`${slug}/`)),
	};
}

// ---------------------------------------------------------------------------
// 3. getOpportunityPipeline
// ---------------------------------------------------------------------------

/** Group opportunities by stage for a pipeline board view. */
export async function getOpportunityPipeline(): Promise<PipelineStage[]> {
	const opportunities = await safeGetCollection<Entry>("opportunities");

	const stageOrder = ["discovery", "scoping", "proposal-sent", "negotiation", "closed-won", "closed-lost"];
	const grouped: Record<string, Entry[]> = {};

	for (const stage of stageOrder) {
		grouped[stage] = [];
	}

	for (const opp of opportunities) {
		const stage = (opp as any).data.stage;
		if (!grouped[stage]) grouped[stage] = [];
		grouped[stage].push(opp);
	}

	return stageOrder.map((stage) => ({
		stage,
		opportunities: grouped[stage] ?? [],
		totalValue: (grouped[stage] ?? []).reduce((sum, o: any) => sum + (o.data.value ?? 0), 0),
	}));
}

// ---------------------------------------------------------------------------
// 4. getInvoiceSummary
// ---------------------------------------------------------------------------

/** Aggregate invoice totals by status. */
export async function getInvoiceSummary(): Promise<InvoiceSummary> {
	const invoices = await safeGetCollection<Entry>("invoices");

	const summary: InvoiceSummary = {
		draft: { count: 0, total: 0 },
		sent: { count: 0, total: 0 },
		paid: { count: 0, total: 0 },
		overdue: { count: 0, total: 0 },
		cancelled: { count: 0, total: 0 },
	};

	for (const inv of invoices) {
		const status = (inv as any).data.status as keyof InvoiceSummary;
		if (summary[status]) {
			summary[status].count++;
			summary[status].total += (inv as any).data.amount ?? 0;
		}
	}

	return summary;
}

// ---------------------------------------------------------------------------
// 4b. getInvoiceWithPayments
// ---------------------------------------------------------------------------

/** Invoice with resolved client, project, payments, and balance. */
export interface InvoiceWithPayments {
	invoice: Entry;
	client: Entry | undefined;
	project: Entry | undefined;
	payments: Entry[];
	totalPaid: number;
	balance: number;
}

/**
 * Fetch an invoice by content ID and resolve its client, project, and payments.
 * Payment.invoice references the file slug (e.g. "inv-001"), not the full
 * content ID ("acme-corp/inv-001"), so we match via `id.split("/").pop()`.
 */
export async function getInvoiceWithPayments(contentId: string): Promise<InvoiceWithPayments | null> {
	const [allInvoices, allClients, allProjects, allPayments] = await Promise.all([
		safeGetCollection<Entry>("invoices"),
		safeGetCollection<Entry>("clients"),
		safeGetCollection<Entry>("projects"),
		safeGetCollection<Entry>("payments"),
	]);

	const invoice = allInvoices.find((i: any) => i.id === contentId);
	if (!invoice) return null;

	const invoiceFileSlug = contentId.split("/").pop()!;
	const clientSlug = (invoice as any).data.client;
	const projectSlug = (invoice as any).data.project;

	const payments = allPayments.filter(
		(p: any) => p.data.invoice === invoiceFileSlug,
	);
	const totalPaid = payments.reduce((sum, p: any) => sum + (p.data.amount ?? 0), 0);

	return {
		invoice,
		client: clientSlug ? allClients.find((c: any) => c.id === clientSlug) : undefined,
		project: projectSlug ? allProjects.find((p: any) => p.id === projectSlug) : undefined,
		payments,
		totalPaid,
		balance: (invoice as any).data.amount - totalPaid,
	};
}

// ---------------------------------------------------------------------------
// 5. getExpiringAssets
// ---------------------------------------------------------------------------

/** Find all assets, contracts, subscriptions, and compliance docs expiring within N days. */
export async function getExpiringAssets(
	days: number,
): Promise<{ label: string; slug: string; expires: Date; type: string }[]> {
	const cutoff = new Date(Date.now() + days * 86400000);

	const [domains, contracts, subscriptions, software, complianceDocs] = await Promise.all([
		safeGetCollection<Entry>("assetsDomains"),
		safeGetCollection<Entry>("contracts"),
		safeGetCollection<Entry>("subscriptions"),
		safeGetCollection<Entry>("assetsSoftware"),
		safeGetCollection<Entry>("compliance"),
	]);

	const expiring: { label: string; slug: string; expires: Date; type: string }[] = [];

	for (const d of domains) {
		const exp = (d as any).data.expires;
		if (exp && new Date(exp) <= cutoff) {
			expiring.push({ label: (d as any).data.title, slug: (d as any).id, expires: new Date(exp), type: "domain" });
		}
	}

	for (const c of contracts) {
		const exp = (c as any).data.expires;
		if (exp && new Date(exp) <= cutoff) {
			expiring.push({ label: (c as any).data.title, slug: (c as any).id, expires: new Date(exp), type: "contract" });
		}
	}

	for (const s of subscriptions) {
		const exp = (s as any).data.renewal;
		if (exp && new Date(exp) <= cutoff) {
			expiring.push({
				label: (s as any).data.title,
				slug: (s as any).id,
				expires: new Date(exp),
				type: "subscription",
			});
		}
	}

	for (const s of software) {
		const exp = (s as any).data.expires;
		if (exp && new Date(exp) <= cutoff) {
			expiring.push({ label: (s as any).data.title, slug: (s as any).id, expires: new Date(exp), type: "software" });
		}
	}

	for (const c of complianceDocs) {
		const exp = (c as any).data["review-due"];
		if (exp && new Date(exp) <= cutoff) {
			expiring.push({
				label: (c as any).data.title,
				slug: (c as any).id,
				expires: new Date(exp),
				type: "compliance",
			});
		}
	}

	// Sort by expiry date ascending
	expiring.sort((a, b) => a.expires.getTime() - b.expires.getTime());
	return expiring;
}

// ---------------------------------------------------------------------------
// 6. getProjectBillableHours
// ---------------------------------------------------------------------------

/** Calculate billable vs non-billable hours for a project. */
export async function getProjectBillableHours(slug: string): Promise<BillableHours> {
	const allTimelog = await safeGetCollection<Entry>("timelog");
	const entries = allTimelog.filter((t: any) => t.id.startsWith(`${slug}/`));

	let billable = 0;
	let nonBillable = 0;

	for (const entry of entries) {
		const hours = (entry as any).data.hours ?? 0;
		if ((entry as any).data.billable) {
			billable += hours;
		} else {
			nonBillable += hours;
		}
	}

	return { billable, nonBillable, total: billable + nonBillable };
}

// ---------------------------------------------------------------------------
// 7. getContactWithRelations
// ---------------------------------------------------------------------------

/** Fetch a contact with its parent client, linked projects, and interactions. */
export async function getContactWithRelations(slug: string): Promise<ContactWithRelations> {
	const [allContacts, allClients, allProjects, allInteractions] = await Promise.all([
		safeGetCollection<Entry>("contacts"),
		safeGetCollection<Entry>("clients"),
		safeGetCollection<Entry>("projects"),
		safeGetCollection<Entry>("interactions"),
	]);

	// WHY: Contact slug may be full ID "acme-corp/john-doe" or just "john-doe"
	const contact = allContacts.find((c: any) => c.id === slug || c.id.endsWith(`/${slug}`));
	const clientSlug = (contact as any)?.data?.client;
	const projectSlugs: string[] = (contact as any)?.data?.projects ?? [];

	return {
		contact,
		client: clientSlug ? allClients.find((c: any) => c.id === clientSlug) : undefined,
		projects: allProjects.filter((p: any) => projectSlugs.includes(p.data.client) || projectSlugs.some((ps: string) => p.id === ps)),
		interactions: allInteractions.filter((i: any) => i.data.contact === slug),
	};
}

// ---------------------------------------------------------------------------
// 8. getKnowledgeForProject
// ---------------------------------------------------------------------------

/** Fetch project-scoped and tag-matched knowledge articles. */
export async function getKnowledgeForProject(slug: string): Promise<Entry[]> {
	const [projectKb, baseKb] = await Promise.all([
		safeGetCollection<Entry>("knowledgeProjects"),
		safeGetCollection<Entry>("knowledgeBase"),
	]);

	const projectScoped = projectKb.filter((k: any) => k.id.startsWith(`${slug}/`));
	const tagged = baseKb.filter(
		(k: any) => k.data.tags?.includes(slug) || k.data.projects?.includes(slug),
	);

	return [...projectScoped, ...tagged];
}
