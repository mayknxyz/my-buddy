/**
 * Wiki-link index generator.
 * Scans content/ directories and produces two JSON files:
 *   - src/data/wiki-link-index.json  — slug → route mapping
 *   - src/data/backlink-index.json   — reverse reference index
 *
 * Run: `bun src/plugins/wiki-links/build-index.ts`
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { Glob } from "bun";

const CONTENT_DIR = join(import.meta.dirname, "../../../content");
const DATA_DIR = join(import.meta.dirname, "../../data");

/**
 * Collection-to-route mapping.
 * WHY: The route prefix for each collection determines the URL a wiki-link
 * resolves to. Parent entities (index.md) strip the /index suffix.
 */
const COLLECTION_ROUTES: Record<string, string> = {
	clients: "/clients",
	contacts: "/contacts",
	projects: "/projects",
	tasks: "/tasks",
	leads: "/leads",
	opportunities: "/opportunities",
	"knowledge/base": "/knowledge",
	"knowledge/projects": "/knowledge/projects",
	"knowledge/clients": "/knowledge/clients",
	meetings: "/meetings",
	journal: "/journal",
	interactions: "/interactions",
	invoices: "/invoices",
	payments: "/payments",
	proposals: "/proposals",
	contracts: "/contracts",
	expenses: "/expenses",
	budgets: "/budgets",
	timelog: "/timelog",
	team: "/team",
	roles: "/roles",
	leave: "/leave",
	subscriptions: "/subscriptions",
	sops: "/sops",
	compliance: "/compliance",
	campaigns: "/campaigns",
	goals: "/goals",
	ideas: "/ideas",
	tax: "/tax",
	files: "/files",
	"assets/hardware": "/assets",
	"assets/software": "/assets",
	"assets/domains": "/assets",
	"assets/servers": "/assets",
	"assets/accounts": "/assets",
	"marketing/blog": "/marketing/blog",
	"marketing/social": "/marketing/social",
	"marketing/newsletter": "/marketing/newsletter",
};

/**
 * Resolution priority — when a bare [[slug]] matches multiple collections,
 * the first match in this order wins.
 */
const RESOLUTION_PRIORITY = [
	"clients",
	"contacts",
	"projects",
	"tasks",
	"leads",
	"opportunities",
	"knowledge/base",
	"meetings",
	"journal",
];

/** Extract the leaf slug from a file path relative to content/. */
function extractSlug(filePath: string): string {
	const name = basename(filePath, ".md");
	// WHY: index.md files use their parent folder as the slug
	if (name === "index") {
		const parts = filePath.split("/");
		return parts[parts.length - 2] ?? name;
	}
	return name;
}

/** Parse wiki-link references from markdown content. */
function parseWikiLinks(content: string): string[] {
	const pattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
	const links: string[] = [];
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(content)) !== null) {
		links.push(match[1].trim());
	}
	return links;
}

type WikiLinkIndex = Record<string, { route: string; collection: string }>;
type BacklinkIndex = Record<string, string[]>;

async function buildIndex(): Promise<void> {
	if (!existsSync(CONTENT_DIR)) {
		console.log("No content/ directory found — generating empty indices.");
		if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
		writeFileSync(join(DATA_DIR, "wiki-link-index.json"), "{}");
		writeFileSync(join(DATA_DIR, "backlink-index.json"), "{}");
		return;
	}

	const wikiIndex: WikiLinkIndex = {};
	const backlinkIndex: BacklinkIndex = {};

	// WHY: We build a per-collection map first, then merge using priority
	const collectionMaps: Record<string, Record<string, string>> = {};

	for (const [collection, routePrefix] of Object.entries(COLLECTION_ROUTES)) {
		const collectionDir = join(CONTENT_DIR, collection);
		if (!existsSync(collectionDir)) continue;

		collectionMaps[collection] = {};

		const glob = new Glob("**/*.md");
		for await (const filePath of glob.scan(collectionDir)) {
			// Skip CLAUDE.md files — they're context docs, not content entries
			if (basename(filePath) === "CLAUDE.md") continue;

			const slug = extractSlug(filePath);
			const relativePath = filePath.replace(/\.md$/, "");
			const isIndex = basename(filePath) === "index.md";

			// Build the route: /collection/path (strip /index for parent entities)
			const route = isIndex
				? `${routePrefix}/${relativePath.replace(/\/index$/, "")}`
				: `${routePrefix}/${relativePath}`;

			collectionMaps[collection][slug] = route;

			// Also register with collection prefix for explicit [[collection/slug]]
			const prefixedKey = `${collection}/${slug}`;
			wikiIndex[prefixedKey] = { route, collection };

			// Parse backlinks from file content
			const fullPath = join(collectionDir, filePath);
			const content = await Bun.file(fullPath).text();
			const links = parseWikiLinks(content);

			const sourceKey = `${collection}/${slug}`;
			for (const link of links) {
				if (!backlinkIndex[link]) backlinkIndex[link] = [];
				if (!backlinkIndex[link].includes(sourceKey)) {
					backlinkIndex[link].push(sourceKey);
				}
			}
		}
	}

	// Merge into wikiIndex using resolution priority for bare slugs
	const registeredBareSlugs = new Set<string>();

	for (const collection of RESOLUTION_PRIORITY) {
		const slugMap = collectionMaps[collection];
		if (!slugMap) continue;

		for (const [slug, route] of Object.entries(slugMap)) {
			if (!registeredBareSlugs.has(slug)) {
				wikiIndex[slug] = { route, collection };
				registeredBareSlugs.add(slug);
			}
		}
	}

	// Register remaining collections (not in priority list) for bare slugs
	for (const [collection, slugMap] of Object.entries(collectionMaps)) {
		if (RESOLUTION_PRIORITY.includes(collection)) continue;
		for (const [slug, route] of Object.entries(slugMap)) {
			if (!registeredBareSlugs.has(slug)) {
				wikiIndex[slug] = { route, collection };
				registeredBareSlugs.add(slug);
			}
		}
	}

	if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

	writeFileSync(join(DATA_DIR, "wiki-link-index.json"), JSON.stringify(wikiIndex, null, 2));
	writeFileSync(join(DATA_DIR, "backlink-index.json"), JSON.stringify(backlinkIndex, null, 2));

	const slugCount = Object.keys(wikiIndex).length;
	const backlinkCount = Object.keys(backlinkIndex).length;
	console.log(`Wiki-link index: ${slugCount} slugs, ${backlinkCount} backlink sources`);
}

buildIndex();
