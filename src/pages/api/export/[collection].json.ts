/**
 * Static JSON export endpoints for all collections.
 * Generates /api/export/{collection}.json at build time.
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

export const GET: APIRoute = async ({ params }) => {
	const name = params.collection as (typeof COLLECTIONS)[number];
	const entries = await getCollection(name).catch(() => []);

	const data = entries.map((entry) => ({
		id: entry.id,
		...entry.data,
	}));

	return new Response(JSON.stringify(data, null, 2), {
		headers: {
			"Content-Type": "application/json",
			"Content-Disposition": `attachment; filename="${name}.json"`,
		},
	});
};
