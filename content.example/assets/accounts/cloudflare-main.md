---
title: "Cloudflare — Main Account"
url: "https://dash.cloudflare.com"
credentials: "1password://cloudflare-main"
owner: mike
projects:
  - acme-website
services:
  - DNS
  - Pages
  - R2
---

# Cloudflare — Main Account

Primary Cloudflare account for DNS management, static site hosting via Pages, and R2 object storage.

## Services

- **DNS** — manages all client and internal domains
- **Pages** — hosts [[acme-website]] and internal tools
- **R2** — file storage for invoices, proposals, and deliverables

## Notes

- Pro plan on primary zone
- API token scoped per-service in 1Password
