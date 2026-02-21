/**
 * Static CSV export endpoints for all collections.
 * Generates /api/export/{collection}.csv at build time.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";

const COLLECTIONS = [
	"projects",
	"tasks",
	"clients",
	"contacts",
	"leads",
	"opportunities",
	"interactions",
	"invoices",
	"payments",
	"expenses",
	"timelog",
	"meetings",
	"subscriptions",
	"compliance",
	"team",
] as const;

export const getStaticPaths: GetStaticPaths = () => {
	return COLLECTIONS.map((collection) => ({
		params: { collection },
	}));
};

/** Escape a CSV field value — wraps in quotes if it contains commas, quotes, or newlines. */
function csvEscape(value: unknown): string {
	if (value === null || value === undefined) return "";
	const str = Array.isArray(value) ? value.join("; ") : String(value);
	if (str.includes(",") || str.includes('"') || str.includes("\n")) {
		return `"${str.replace(/"/g, '""')}"`;
	}
	return str;
}

export const GET: APIRoute = async ({ params }) => {
	const name = params.collection as (typeof COLLECTIONS)[number];
	const entries = await getCollection(name).catch(() => []);

	if (entries.length === 0) {
		return new Response("", {
			headers: { "Content-Type": "text/csv" },
		});
	}

	// Use first entry's keys as headers
	const headers = ["id", ...Object.keys(entries[0].data)];
	const rows = entries.map((entry) =>
		headers.map((h) => csvEscape(h === "id" ? entry.id : (entry.data as Record<string, unknown>)[h])).join(","),
	);

	const csv = [headers.join(","), ...rows].join("\n");

	return new Response(csv, {
		headers: {
			"Content-Type": "text/csv",
			"Content-Disposition": `attachment; filename="${name}.csv"`,
		},
	});
};
