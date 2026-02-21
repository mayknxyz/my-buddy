---
title: "Staging VPS"
provider: Hetzner
ip: "116.203.42.100"
specs: "CX22 — 2 vCPU, 4 GB RAM, 40 GB NVMe"
cost: 12
billing: monthly
projects:
  - acme-website
status: active
---

# Staging VPS

Hetzner Cloud CX22 instance used as a staging environment for client projects.

## Setup

- Ubuntu 22.04 LTS
- Docker + Docker Compose
- Caddy reverse proxy with auto TLS

## Access

- SSH key auth only, no password login
- Managed via Ansible playbook in ops repo
