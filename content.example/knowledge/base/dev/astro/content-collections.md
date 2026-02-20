---
title: "Astro Content Collections"
category: dev
tags:
  - astro
  - content-layer
related: []
projects:
  - acme-website
last-reviewed: 2026-02-10
---

# Astro Content Collections

Reference guide for working with Astro 5's Content Layer API, used extensively in [[acme-website]] and the my-buddy system itself.

## Key Concepts

### Defining Collections

Collections are defined in `src/content.config.ts` using `defineCollection()` with a Zod schema and a loader (typically `glob`).

### Querying Data

Use `getCollection()` and `getEntry()` from `astro:content` to retrieve typed data at build time.

```typescript
import { getCollection } from "astro:content";
const allProjects = await getCollection("projects");
```

### Schema Validation

Zod schemas enforce frontmatter types at build time. Invalid content will cause build failures with clear error messages.

## Tips

- Use `z.coerce.date()` for date fields to handle YAML date strings
- Use `.default([])` for optional arrays to avoid null checks
- Use `.nullable().optional()` for truly optional fields

## Related

- [Astro Content Collections docs](https://docs.astro.build/en/guides/content-collections/)
- [[mike]] maintains the schema definitions
