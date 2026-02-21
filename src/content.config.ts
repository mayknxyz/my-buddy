/**
 * Content collection schemas for my-buddy.
 * Defines Zod schemas for all 34 business collections using Astro 5's Content Layer API.
 * Each collection uses the glob loader pointed at content/{collection}/.
 */
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// WHY: Helper to reduce boilerplate — every collection uses the same glob pattern
const md = (base: string) => glob({ pattern: "**/*.md", base: `./content/${base}` });

// ---------------------------------------------------------------------------
// 3.1 CRM — Leads, Opportunities, Clients, Contacts, Interactions
// ---------------------------------------------------------------------------

const leads = defineCollection({
	loader: md("leads"),
	schema: z.object({
		name: z.string(),
		status: z.enum(["new", "contacted", "qualified", "disqualified"]),
		source: z.enum(["referral", "social", "inbound", "cold"]),
		contact: z.string().nullable().optional(),
		notes: z.string().default(""),
	}),
});

const opportunities = defineCollection({
	loader: md("opportunities"),
	schema: z.object({
		title: z.string(),
		lead: z.string(),
		contact: z.string().nullable().optional(),
		value: z.number(),
		probability: z.number().min(0).max(100),
		stage: z.enum([
			"discovery",
			"scoping",
			"proposal-sent",
			"negotiation",
			"closed-won",
			"closed-lost",
		]),
		"expected-close": z.coerce.date().nullable().optional(),
		proposal: z.string().nullable().optional(),
	}),
});

const clients = defineCollection({
	loader: md("clients"),
	schema: z.object({
		name: z.string(),
		status: z.enum(["active", "inactive", "churned"]),
		projects: z.array(z.string()).default([]),
		industry: z.string().default(""),
		website: z.string().default(""),
	}),
});

const contacts = defineCollection({
	loader: md("contacts"),
	schema: z.object({
		name: z.string(),
		client: z.string(),
		role: z.string().default(""),
		email: z.string().default(""),
		phone: z.string().default(""),
		status: z.enum(["active", "inactive"]),
		projects: z.array(z.string()).default([]),
	}),
});

const interactions = defineCollection({
	loader: md("interactions"),
	schema: z.object({
		title: z.string(),
		client: z.string(),
		contact: z.string().nullable().optional(),
		project: z.string().nullable().optional(),
		type: z.enum(["call", "email", "chat", "in-person", "async"]),
		direction: z.enum(["inbound", "outbound"]),
		date: z.coerce.date(),
		summary: z.string().default(""),
		"follow-up": z.coerce.date().nullable().optional(),
		tags: z.array(z.string()).default([]),
	}),
});

// ---------------------------------------------------------------------------
// 3.2 Projects & Tasks
// ---------------------------------------------------------------------------

const projects = defineCollection({
	loader: md("projects"),
	schema: z.object({
		title: z.string(),
		status: z.enum(["active", "paused", "completed", "archived"]),
		client: z.string().nullable().optional(),
		stack: z.array(z.string()).default([]),
		priority: z.enum(["high", "medium", "low"]),
		start: z.coerce.date().nullable().optional(),
		end: z.coerce.date().nullable().optional(),
		budget: z.number().default(0),
		tags: z.array(z.string()).default([]),
	}),
});

const tasks = defineCollection({
	loader: md("tasks"),
	schema: z.object({
		title: z.string(),
		project: z.string(),
		status: z.enum(["todo", "doing", "done", "blocked", "deferred"]),
		assignee: z.string().nullable().optional(),
		priority: z.enum(["high", "medium", "low"]),
		due: z.coerce.date().nullable().optional(),
		sprint: z.number().nullable().optional(),
		recurrence: z.enum(["daily", "weekly", "monthly", "yearly"]).nullable().optional(),
		"recurrence-end": z.coerce.date().nullable().optional(),
		tags: z.array(z.string()).default([]),
	}),
});

const meetings = defineCollection({
	loader: md("meetings"),
	schema: z.object({
		title: z.string(),
		project: z.string(),
		client: z.string().nullable().optional(),
		contacts: z.array(z.string()).default([]),
		date: z.coerce.date(),
		duration: z.number().default(60),
		type: z.enum(["kickoff", "standup", "review", "demo", "internal"]),
		agenda: z.array(z.string()).default([]),
		"action-items": z
			.array(
				z.object({
					task: z.string(),
					owner: z.string(),
				}),
			)
			.default([]),
		"recurring-id": z.string().nullable().optional(),
	}),
});

// ---------------------------------------------------------------------------
// 3.3 Finance — Proposals, Invoices, Payments, Expenses, Budgets, Tax
// ---------------------------------------------------------------------------

const proposals = defineCollection({
	loader: md("proposals"),
	schema: z.object({
		title: z.string(),
		client: z.string(),
		project: z.string().nullable().optional(),
		date: z.coerce.date(),
		value: z.number(),
		status: z.enum(["draft", "sent", "accepted", "rejected"]),
		file: z.string().default(""),
	}),
});

const invoices = defineCollection({
	loader: md("invoices"),
	schema: z.object({
		id: z.string(),
		client: z.string(),
		project: z.string().nullable().optional(),
		date: z.coerce.date(),
		due: z.coerce.date(),
		amount: z.number(),
		status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
		file: z.string().default(""),
	}),
});

const payments = defineCollection({
	loader: md("payments"),
	schema: z.object({
		id: z.string(),
		client: z.string(),
		invoice: z.string(),
		amount: z.number(),
		date: z.coerce.date(),
		method: z.enum(["bank-transfer", "paypal", "stripe", "cash"]),
		status: z.enum(["pending", "confirmed", "failed"]),
	}),
});

const expenses = defineCollection({
	loader: md("expenses"),
	schema: z.object({
		title: z.string(),
		project: z.string().nullable().optional(),
		category: z.enum(["software", "hardware", "travel", "marketing", "office", "other"]),
		amount: z.number(),
		date: z.coerce.date(),
		recurring: z.enum(["monthly", "annual", "one-time"]),
		receipt: z.string().default(""),
	}),
});

const budgets = defineCollection({
	loader: md("budgets"),
	schema: z.object({
		project: z.string().nullable().optional(),
		period: z.string(),
		planned: z.number(),
		spent: z.number().default(0),
		currency: z.string().default("USD"),
	}),
});

const tax = defineCollection({
	loader: md("tax"),
	schema: z.object({
		period: z.string(),
		status: z.enum(["in-progress", "filed", "audited"]),
		deductibles: z.array(z.string()).default([]),
		"total-income": z.number().default(0),
		"total-expenses": z.number().default(0),
		"filed-date": z.coerce.date().nullable().optional(),
	}),
});

// ---------------------------------------------------------------------------
// 3.4 Contracts
// ---------------------------------------------------------------------------

const contracts = defineCollection({
	loader: md("contracts"),
	schema: z.object({
		title: z.string(),
		client: z.string(),
		project: z.string().nullable().optional(),
		type: z.enum(["service-agreement", "nda", "msa", "sow"]),
		signed: z.coerce.date().nullable().optional(),
		expires: z.coerce.date().nullable().optional(),
		value: z.number().default(0),
		status: z.enum(["draft", "sent", "signed", "expired", "terminated"]),
		file: z.string().default(""),
	}),
});

// ---------------------------------------------------------------------------
// 3.5 Time Tracking
// ---------------------------------------------------------------------------

const timelog = defineCollection({
	loader: md("timelog"),
	schema: z.object({
		project: z.string(),
		task: z.string().nullable().optional(),
		member: z.string(),
		date: z.coerce.date(),
		hours: z.number(),
		billable: z.boolean().default(true),
		description: z.string().default(""),
	}),
});

// ---------------------------------------------------------------------------
// 3.6 Team & HR
// ---------------------------------------------------------------------------

const team = defineCollection({
	loader: md("team"),
	schema: z.object({
		name: z.string(),
		role: z.string(),
		email: z.string().default(""),
		status: z.enum(["active", "inactive"]),
		skills: z.array(z.string()).default([]),
		"start-date": z.coerce.date().nullable().optional(),
	}),
});

const roles = defineCollection({
	loader: md("roles"),
	schema: z.object({
		title: z.string(),
		department: z.enum(["engineering", "design", "marketing", "operations"]),
		level: z.enum(["junior", "mid", "senior", "lead"]),
		responsibilities: z.array(z.string()).default([]),
		skills: z.array(z.string()).default([]),
		status: z.enum(["open", "filled", "closed"]),
	}),
});

const leave = defineCollection({
	loader: md("leave"),
	schema: z.object({
		member: z.string(),
		type: z.enum(["vacation", "sick", "holiday", "unpaid"]),
		start: z.coerce.date(),
		end: z.coerce.date(),
		days: z.number(),
		status: z.enum(["pending", "approved", "rejected"]),
	}),
});

// ---------------------------------------------------------------------------
// 3.7 Assets
// ---------------------------------------------------------------------------

const assetsHardware = defineCollection({
	loader: md("assets/hardware"),
	schema: z.object({
		title: z.string(),
		type: z.string(),
		serial: z.string().default(""),
		purchased: z.coerce.date().nullable().optional(),
		cost: z.number().default(0),
		status: z.enum(["active", "storage", "retired", "sold"]),
		"assigned-to": z.array(z.string()).default([]),
		"warranty-until": z.coerce.date().nullable().optional(),
	}),
});

const assetsSoftware = defineCollection({
	loader: md("assets/software"),
	schema: z.object({
		title: z.string(),
		vendor: z.string(),
		"license-type": z.enum(["subscription", "perpetual", "open-source", "freemium"]),
		seats: z.number().default(1),
		cost: z.number().default(0),
		billing: z.enum(["monthly", "annual"]).nullable().optional(),
		purchased: z.coerce.date().nullable().optional(),
		expires: z.coerce.date().nullable().optional(),
		"assigned-to": z.array(z.string()).default([]),
		status: z.enum(["active", "expired", "cancelled"]),
	}),
});

const assetsDomains = defineCollection({
	loader: md("assets/domains"),
	schema: z.object({
		title: z.string(),
		registrar: z.string(),
		registered: z.coerce.date().nullable().optional(),
		expires: z.coerce.date().nullable().optional(),
		"auto-renew": z.boolean().default(false),
		cost: z.number().default(0),
		project: z.string().nullable().optional(),
		status: z.enum(["active", "expired", "transferred"]),
	}),
});

const assetsServers = defineCollection({
	loader: md("assets/servers"),
	schema: z.object({
		title: z.string(),
		provider: z.string(),
		ip: z.string().default(""),
		specs: z.string().default(""),
		cost: z.number().default(0),
		billing: z.enum(["monthly", "annual"]).nullable().optional(),
		projects: z.array(z.string()).default([]),
		status: z.enum(["active", "inactive", "decommissioned"]),
	}),
});

const assetsAccounts = defineCollection({
	loader: md("assets/accounts"),
	schema: z.object({
		title: z.string(),
		url: z.string().default(""),
		credentials: z.string().default(""),
		owner: z.string(),
		projects: z.array(z.string()).default([]),
		services: z.array(z.string()).default([]),
	}),
});

// ---------------------------------------------------------------------------
// 3.8 Subscriptions
// ---------------------------------------------------------------------------

const subscriptions = defineCollection({
	loader: md("subscriptions"),
	schema: z.object({
		title: z.string(),
		category: z.enum(["design", "dev", "marketing", "productivity", "infra", "other"]),
		cost: z.number(),
		billing: z.enum(["monthly", "annual"]),
		renewal: z.coerce.date(),
		status: z.enum(["active", "cancelled", "paused"]),
		url: z.string().default(""),
	}),
});

// ---------------------------------------------------------------------------
// 3.9 Knowledge Base
// ---------------------------------------------------------------------------

const knowledgeBase = defineCollection({
	loader: md("knowledge/base"),
	schema: z.object({
		title: z.string(),
		category: z.string(),
		tags: z.array(z.string()).default([]),
		related: z.array(z.string()).default([]),
		projects: z.array(z.string()).default([]),
		"last-reviewed": z.coerce.date().nullable().optional(),
	}),
});

const knowledgeProjects = defineCollection({
	loader: md("knowledge/projects"),
	schema: z.object({
		title: z.string(),
		category: z.string().default(""),
		tags: z.array(z.string()).default([]),
		related: z.array(z.string()).default([]),
		projects: z.array(z.string()).default([]),
		"last-reviewed": z.coerce.date().nullable().optional(),
	}),
});

const knowledgeClients = defineCollection({
	loader: md("knowledge/clients"),
	schema: z.object({
		title: z.string(),
		category: z.string().default(""),
		tags: z.array(z.string()).default([]),
		related: z.array(z.string()).default([]),
		"last-reviewed": z.coerce.date().nullable().optional(),
	}),
});

// ---------------------------------------------------------------------------
// 3.10 Strategic — Goals, Ideas, Journal
// ---------------------------------------------------------------------------

const goals = defineCollection({
	loader: md("goals"),
	schema: z.object({
		title: z.string(),
		period: z.string(),
		status: z.enum(["not-started", "in-progress", "achieved", "missed"]),
		okrs: z
			.array(
				z.object({
					objective: z.string(),
					kr: z.array(
						z.object({
							metric: z.string(),
							progress: z.number(),
						}),
					),
				}),
			)
			.default([]),
		projects: z.array(z.string()).default([]),
	}),
});

const ideas = defineCollection({
	loader: md("ideas"),
	schema: z.object({
		title: z.string(),
		status: z.enum(["raw", "exploring", "validated", "shelved"]),
		effort: z.enum(["low", "medium", "high"]).nullable().optional(),
		potential: z.enum(["low", "medium", "high"]).nullable().optional(),
		tags: z.array(z.string()).default([]),
		"related-project": z.string().nullable().optional(),
	}),
});

const journal = defineCollection({
	loader: md("journal"),
	schema: z.object({
		date: z.coerce.date(),
		type: z.enum(["daily", "weekly", "monthly"]),
		energy: z.enum(["high", "medium", "low"]).nullable().optional(),
		highlights: z.array(z.string()).default([]),
		blockers: z.array(z.string()).default([]),
		tags: z.array(z.string()).default([]),
	}),
});

// ---------------------------------------------------------------------------
// 3.11 Marketing — Content, Campaigns
// ---------------------------------------------------------------------------

const marketingBlog = defineCollection({
	loader: md("marketing/blog"),
	schema: z.object({
		title: z.string(),
		status: z.enum(["draft", "review", "scheduled", "published"]),
		published: z.coerce.date().nullable().optional(),
		campaign: z.string().nullable().optional(),
		tags: z.array(z.string()).default([]),
		url: z.string().nullable().optional(),
	}),
});

const marketingSocial = defineCollection({
	loader: md("marketing/social"),
	schema: z.object({
		title: z.string(),
		platform: z.enum(["linkedin", "twitter", "bluesky", "threads"]),
		status: z.enum(["draft", "scheduled", "published"]),
		scheduled: z.coerce.date().nullable().optional(),
		published: z.coerce.date().nullable().optional(),
		campaign: z.string().nullable().optional(),
		tags: z.array(z.string()).default([]),
		url: z.string().nullable().optional(),
	}),
});

const marketingNewsletter = defineCollection({
	loader: md("marketing/newsletter"),
	schema: z.object({
		title: z.string(),
		status: z.enum(["draft", "review", "scheduled", "sent"]),
		scheduled: z.coerce.date().nullable().optional(),
		sent: z.coerce.date().nullable().optional(),
		campaign: z.string().nullable().optional(),
		subscribers: z.number().default(0),
		"open-rate": z.number().nullable().optional(),
		platform: z.enum(["buttondown", "convertkit", "resend", "manual"]).nullable().optional(),
		url: z.string().nullable().optional(),
	}),
});

const campaigns = defineCollection({
	loader: md("campaigns"),
	schema: z.object({
		title: z.string(),
		goal: z.enum(["lead-generation", "brand-awareness", "retention", "launch"]),
		status: z.enum(["active", "paused", "completed"]),
		start: z.coerce.date().nullable().optional(),
		end: z.coerce.date().nullable().optional(),
		budget: z.number().default(0),
		channels: z.array(z.string()).default([]),
		marketing: z.array(z.string()).default([]),
		"leads-generated": z.number().default(0),
	}),
});

// ---------------------------------------------------------------------------
// 3.12 Compliance
// ---------------------------------------------------------------------------

const compliance = defineCollection({
	loader: md("compliance"),
	schema: z.object({
		title: z.string(),
		type: z.enum([
			"privacy-policy",
			"terms-of-service",
			"dpa",
			"cookie-policy",
			"acceptable-use",
		]),
		status: z.enum(["draft", "active", "archived"]),
		effective: z.coerce.date().nullable().optional(),
		"review-due": z.coerce.date().nullable().optional(),
		"applies-to": z.array(z.string()).default([]),
		file: z.string().default(""),
	}),
});

// ---------------------------------------------------------------------------
// 3.13 Files (R2 Metadata)
// ---------------------------------------------------------------------------

const files = defineCollection({
	loader: md("files"),
	schema: z.object({
		title: z.string(),
		url: z.string(),
		type: z.enum(["pdf", "image", "document", "spreadsheet", "other"]),
		size: z.number().default(0),
		uploaded: z.coerce.date(),
		"uploaded-by": z.string().default(""),
		tags: z.array(z.string()).default([]),
	}),
});

// ---------------------------------------------------------------------------
// 3.14 SOPs
// ---------------------------------------------------------------------------

const sops = defineCollection({
	loader: md("sops"),
	schema: z.object({
		title: z.string(),
		category: z.enum(["engineering", "operations", "sales", "onboarding", "other"]),
		status: z.enum(["draft", "active", "archived"]),
		owner: z.string().nullable().optional(),
		"last-reviewed": z.coerce.date().nullable().optional(),
		"review-cycle": z.enum(["monthly", "quarterly", "annual"]).nullable().optional(),
		tags: z.array(z.string()).default([]),
	}),
});

// ---------------------------------------------------------------------------
// Export all collections
// ---------------------------------------------------------------------------

export const collections = {
	leads,
	opportunities,
	clients,
	contacts,
	interactions,
	projects,
	tasks,
	meetings,
	proposals,
	invoices,
	payments,
	expenses,
	budgets,
	tax,
	contracts,
	timelog,
	team,
	roles,
	leave,
	assetsHardware,
	assetsSoftware,
	assetsDomains,
	assetsServers,
	assetsAccounts,
	subscriptions,
	knowledgeBase,
	knowledgeProjects,
	knowledgeClients,
	goals,
	ideas,
	journal,
	marketingBlog,
	marketingSocial,
	marketingNewsletter,
	campaigns,
	compliance,
	files,
	sops,
};
