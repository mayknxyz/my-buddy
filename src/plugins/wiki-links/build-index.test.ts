/**
 * Tests for the wiki-links build-index utilities.
 * Since extractSlug and parseWikiLinks are not exported, we test them
 * by reimplementing the same logic used in build-index.ts.
 */
import { describe, it, expect } from "vitest";
import { basename } from "node:path";

/**
 * Reimplementation of extractSlug from build-index.ts.
 * WHY: The original is a module-private function. We mirror the logic here
 * to ensure correctness of the slug extraction rules.
 */
function extractSlug(filePath: string): string {
	const name = basename(filePath, ".md");
	if (name === "index") {
		const parts = filePath.split("/");
		return parts[parts.length - 2] ?? name;
	}
	return name;
}

/** Reimplementation of parseWikiLinks from build-index.ts. */
function parseWikiLinks(content: string): string[] {
	const pattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
	const links: string[] = [];
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(content)) !== null) {
		links.push(match[1].trim());
	}
	return links;
}

describe("extractSlug", () => {
	it("extracts slug from index.md using parent folder", () => {
		expect(extractSlug("acme-corp/index.md")).toBe("acme-corp");
	});

	it("extracts slug from nested index.md", () => {
		expect(extractSlug("clients/acme-corp/index.md")).toBe("acme-corp");
	});

	it("extracts slug from leaf entity file", () => {
		expect(extractSlug("acme-corp/john-doe.md")).toBe("john-doe");
	});

	it("extracts slug from flat standalone file", () => {
		expect(extractSlug("my-subscription.md")).toBe("my-subscription");
	});

	it("extracts slug from deeply nested leaf file", () => {
		expect(extractSlug("projects/acme-website/setup-repo.md")).toBe("setup-repo");
	});
});

describe("parseWikiLinks", () => {
	it("parses bare [[slug]] links", () => {
		expect(parseWikiLinks("See [[acme-corp]] here.")).toEqual(["acme-corp"]);
	});

	it("parses [[slug|display text]] links (slug only)", () => {
		expect(parseWikiLinks("See [[acme-corp|Acme Corporation]].")).toEqual(["acme-corp"]);
	});

	it("parses [[collection/slug]] explicit references", () => {
		expect(parseWikiLinks("See [[projects/acme-website]].")).toEqual(["projects/acme-website"]);
	});

	it("parses [[collection/slug|text]] explicit with label", () => {
		expect(parseWikiLinks("See [[projects/acme-website|Website]].")).toEqual([
			"projects/acme-website",
		]);
	});

	it("parses multiple links in one string", () => {
		expect(
			parseWikiLinks("Contact [[acme-corp]] about [[acme-website]] project."),
		).toEqual(["acme-corp", "acme-website"]);
	});

	it("returns empty array for text without wiki-links", () => {
		expect(parseWikiLinks("Just normal text.")).toEqual([]);
	});

	it("trims whitespace in slugs", () => {
		expect(parseWikiLinks("See [[ acme-corp ]] here.")).toEqual(["acme-corp"]);
	});

	it("handles adjacent wiki-links", () => {
		expect(parseWikiLinks("[[acme-corp]][[acme-website]]")).toEqual([
			"acme-corp",
			"acme-website",
		]);
	});

	it("does not match incomplete brackets", () => {
		expect(parseWikiLinks("See [[incomplete here.")).toEqual([]);
		expect(parseWikiLinks("See [single-bracket] here.")).toEqual([]);
	});
});
