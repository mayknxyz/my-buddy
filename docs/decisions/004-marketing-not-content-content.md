# ADR 004: `marketing/` Instead of `content/content/`

## Status

Accepted

## Context

Blog posts, social media content, and newsletters needed a parent
directory within the `content/` collection folder. The initial design
placed them at `content/content/blog/`, `content/content/social/`, and
`content/content/newsletter/`, creating a stuttering `content/content/`
path.

## Decision

Rename to `content/marketing/blog/`, `content/marketing/social/`, and
`content/marketing/newsletter/`. The collection names in Astro become
`marketing/blog`, `marketing/social`, `marketing/newsletter`.

## Alternatives Considered

- **`content/content/`** — original design. Confusing path, ambiguous
  what "content" means when the entire data layer is content
- **`content/posts/`** — too narrow, doesn't cover social or newsletter
- **Top-level `content/blog/`, `content/social/`** — loses the grouping
  that ties them together as marketing outputs

## Tradeoffs

- **Pro:** Clear, descriptive path — `marketing/blog/` tells you exactly
  what it is
- **Pro:** Groups all marketing content under one namespace
- **Pro:** No stuttering paths
- **Con:** None identified

## Consequences

The campaigns collection references marketing content via a `marketing[]`
field in frontmatter (e.g., `marketing: [blog/first-post]`). Dashboard
routes remain at `/campaigns`, not `/marketing`.
