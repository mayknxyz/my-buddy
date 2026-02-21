/**
 * Tests for the wiki-links remark plugin.
 * Verifies slug resolution, custom display text, broken link handling,
 * and explicit collection references.
 */
import { describe, it, expect, beforeEach } from "vitest";
import type { Root, Paragraph } from "mdast";
import { remarkWikiLinks } from "./remark-plugin";

const TEST_INDEX = {
	"acme-corp": { route: "/clients/acme-corp", collection: "clients" },
	"acme-website": { route: "/projects/acme-website", collection: "projects" },
	"john-doe": { route: "/contacts/acme-corp/john-doe", collection: "contacts" },
	"clients/acme-corp": { route: "/clients/acme-corp", collection: "clients" },
	"projects/acme-website": { route: "/projects/acme-website", collection: "projects" },
	"contacts/john-doe": { route: "/contacts/acme-corp/john-doe", collection: "contacts" },
};

/** Helper to create a minimal AST with a single text node. */
function makeTree(text: string): Root {
	return {
		type: "root",
		children: [
			{
				type: "paragraph",
				children: [{ type: "text", value: text }],
			},
		],
	};
}

/** Get the children of the first paragraph in the tree. */
function getChildren(tree: Root) {
	return (tree.children[0] as Paragraph).children;
}

describe("remarkWikiLinks", () => {
	let transform: (tree: Root) => void;

	beforeEach(() => {
		transform = remarkWikiLinks({ index: TEST_INDEX });
	});

	it("resolves a bare [[slug]] to an anchor", () => {
		const tree = makeTree("See [[acme-corp]] for details.");
		transform(tree);
		const children = getChildren(tree);
		expect(children).toHaveLength(3);
		expect(children[0]).toEqual({ type: "text", value: "See " });
		expect(children[1]).toEqual({
			type: "html",
			value: '<a class="wiki-link" href="/clients/acme-corp">acme-corp</a>',
		});
		expect(children[2]).toEqual({ type: "text", value: " for details." });
	});

	it("resolves [[slug|display text]] with custom label", () => {
		const tree = makeTree("Contact [[acme-corp|Acme Corporation]] today.");
		transform(tree);
		const children = getChildren(tree);
		expect(children[1]).toEqual({
			type: "html",
			value: '<a class="wiki-link" href="/clients/acme-corp">Acme Corporation</a>',
		});
	});

	it("resolves [[collection/slug]] explicit references", () => {
		const tree = makeTree("See [[projects/acme-website]] here.");
		transform(tree);
		const children = getChildren(tree);
		expect(children[1]).toEqual({
			type: "html",
			value: '<a class="wiki-link" href="/projects/acme-website">projects/acme-website</a>',
		});
	});

	it("resolves [[collection/slug|text]] with explicit collection and custom label", () => {
		const tree = makeTree("The [[projects/acme-website|Acme Website]] project.");
		transform(tree);
		const children = getChildren(tree);
		expect(children[1]).toEqual({
			type: "html",
			value: '<a class="wiki-link" href="/projects/acme-website">Acme Website</a>',
		});
	});

	it("renders unresolved links as broken spans", () => {
		const tree = makeTree("See [[nonexistent-slug]] here.");
		transform(tree);
		const children = getChildren(tree);
		expect(children[1]).toEqual({
			type: "html",
			value: '<span class="wiki-link-broken" title="Unresolved: nonexistent-slug">nonexistent-slug</span>',
		});
	});

	it("handles multiple wiki-links in one text node", () => {
		const tree = makeTree("Contact [[acme-corp]] about [[acme-website]].");
		transform(tree);
		const children = getChildren(tree);
		expect(children).toHaveLength(5);
		expect(children[0]).toEqual({ type: "text", value: "Contact " });
		expect((children[1] as any).value).toContain('href="/clients/acme-corp"');
		expect(children[2]).toEqual({ type: "text", value: " about " });
		expect((children[3] as any).value).toContain('href="/projects/acme-website"');
		expect(children[4]).toEqual({ type: "text", value: "." });
	});

	it("leaves text without wiki-links unchanged", () => {
		const tree = makeTree("Just normal text, nothing special.");
		transform(tree);
		const children = getChildren(tree);
		expect(children).toHaveLength(1);
		expect(children[0]).toEqual({ type: "text", value: "Just normal text, nothing special." });
	});

	it("trims whitespace in slug references", () => {
		const tree = makeTree("See [[ acme-corp ]] here.");
		transform(tree);
		const children = getChildren(tree);
		expect((children[1] as any).value).toContain('href="/clients/acme-corp"');
	});

	it("trims whitespace in display text", () => {
		const tree = makeTree("See [[acme-corp| Acme Corp ]] here.");
		transform(tree);
		const children = getChildren(tree);
		expect((children[1] as any).value).toContain(">Acme Corp</a>");
	});

	it("handles wiki-link at the start of text", () => {
		const tree = makeTree("[[acme-corp]] is a client.");
		transform(tree);
		const children = getChildren(tree);
		expect(children[0]).toEqual({
			type: "html",
			value: '<a class="wiki-link" href="/clients/acme-corp">acme-corp</a>',
		});
		expect(children[1]).toEqual({ type: "text", value: " is a client." });
	});

	it("handles wiki-link at the end of text", () => {
		const tree = makeTree("See [[acme-corp]]");
		transform(tree);
		const children = getChildren(tree);
		expect(children).toHaveLength(2);
		expect(children[0]).toEqual({ type: "text", value: "See " });
		expect((children[1] as any).value).toContain('href="/clients/acme-corp"');
	});

	it("handles text that is only a wiki-link", () => {
		const tree = makeTree("[[acme-corp]]");
		transform(tree);
		const children = getChildren(tree);
		expect(children).toHaveLength(1);
		expect(children[0]).toEqual({
			type: "html",
			value: '<a class="wiki-link" href="/clients/acme-corp">acme-corp</a>',
		});
	});

	it("falls back to empty index when none provided", () => {
		const fallbackTransform = remarkWikiLinks({ index: {} });
		const tree = makeTree("See [[acme-corp]] here.");
		fallbackTransform(tree);
		const children = getChildren(tree);
		expect((children[1] as any).value).toContain("wiki-link-broken");
	});
});
