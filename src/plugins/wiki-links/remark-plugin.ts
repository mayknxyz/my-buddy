/**
 * Remark plugin for wiki-link resolution.
 * Transforms [[slug]] and [[slug|label]] syntax in Markdown into:
 *   - `<a class="wiki-link" href="...">` for resolved links
 *   - `<span class="wiki-link-broken">` for unresolved links
 *
 * Supports explicit collection references: [[collection/slug]] and [[collection/slug|label]].
 */
import type { Root, Text } from "mdast";
import { visit } from "unist-util-visit";

interface WikiLinkEntry {
	route: string;
	collection: string;
}

type WikiLinkIndex = Record<string, WikiLinkEntry>;

/**
 * Load the wiki-link index at plugin init time.
 * WHY: The index is pre-built by build-index.ts. Reading it once at init
 * avoids per-file I/O during the remark transform pass.
 */
function loadIndex(): WikiLinkIndex {
	try {
		// LEARN: Dynamic import won't work in remark plugin context — use readFileSync
		const { readFileSync } = require("node:fs");
		const { join } = require("node:path");
		const indexPath = join(__dirname, "../../data/wiki-link-index.json");
		return JSON.parse(readFileSync(indexPath, "utf-8"));
	} catch {
		return {};
	}
}

/** Pattern matching [[slug]] and [[slug|display text]] */
const WIKI_LINK_PATTERN = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Remark plugin that transforms wiki-link syntax into HTML anchor elements.
 *
 * @returns A unified transformer function
 */
export function remarkWikiLinks(options?: { index?: WikiLinkIndex }) {
	const index = options?.index ?? loadIndex();

	return (tree: Root) => {
		visit(tree, "text", (node: Text, nodeIndex, parent) => {
			if (!parent || nodeIndex === undefined) return;

			const value = node.value;
			if (!value.includes("[[")) return;

			const children: (Text | { type: "html"; value: string })[] = [];
			let lastIndex = 0;

			// Reset regex state
			WIKI_LINK_PATTERN.lastIndex = 0;

			let match: RegExpExecArray | null;
			while ((match = WIKI_LINK_PATTERN.exec(value)) !== null) {
				const [fullMatch, rawSlug, displayText] = match;
				const slug = rawSlug.trim();
				const label = displayText?.trim() || slug;

				// Add preceding text
				if (match.index > lastIndex) {
					children.push({
						type: "text" as const,
						value: value.slice(lastIndex, match.index),
					});
				}

				// Resolve the wiki-link
				const entry = index[slug];
				if (entry) {
					children.push({
						type: "html",
						value: `<a class="wiki-link" href="${entry.route}">${label}</a>`,
					});
				} else {
					children.push({
						type: "html",
						value: `<span class="wiki-link-broken" title="Unresolved: ${slug}">${label}</span>`,
					});
				}

				lastIndex = match.index + fullMatch.length;
			}

			// No matches found — leave node unchanged
			if (children.length === 0) return;

			// Add trailing text
			if (lastIndex < value.length) {
				children.push({
					type: "text" as const,
					value: value.slice(lastIndex),
				});
			}

			// Replace the text node with mixed text + html nodes
			parent.children.splice(nodeIndex, 1, ...children);
		});
	};
}
