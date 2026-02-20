# ADR 003: Wiki-Links Over Explicit References

## Status

Accepted

## Context

Content authors need to cross-reference entries across collections in
Markdown body text (meeting notes referencing projects, journal entries
mentioning clients). We need a lightweight syntax that doesn't require
knowing the full path or collection name.

## Decision

Use `[[double-bracket]]` wiki-link syntax with a custom remark plugin
that resolves slugs at build time.

```markdown
Discussed [[test-project]] timeline with [[john-doe|John]].
See [[knowledge/base/dev/auth-patterns]] for reference.
```

Resolution priority when no collection prefix is given:
clients > contacts > projects > tasks > leads > opportunities >
kb > meetings > journal

## Alternatives Considered

- **Markdown links only** — `[John](/contacts/acme-corp/john-doe)`.
  Verbose, requires knowing the full path, breaks if paths change
- **Frontmatter `related` arrays** — `related: [test-project, john-doe]`.
  Structured but can't be used inline in prose
- **Obsidian-compatible wiki-links without custom resolution** — would
  require Obsidian's vault structure, not compatible with Astro routing

## Tradeoffs

- **Pro:** Lightweight — just type `[[slug]]` in any markdown body
- **Pro:** Backlinks auto-generated at build time via reverse index
- **Pro:** Broken links detected at build time (rendered as
  `<span class="wiki-link-broken">`)
- **Con:** Ambiguity when the same slug exists in multiple collections
  (mitigated by resolution priority and explicit `[[collection/slug]]`)
- **Con:** Requires a pre-build step to generate the slug index

## Consequences

The build pipeline runs `build-index.ts` before `astro build` to
generate `wiki-link-index.json` and `backlink-index.json`. Detail
pages display a "Referenced by" section using the backlink index.
