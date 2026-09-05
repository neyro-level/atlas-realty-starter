# ADR 0001: Headless starter boundary

Status: accepted
Date: 2026-09-04

## Decision

The repository is a self-contained headless realty engine. It contains Payload Admin, APIs, jobs, migrations and operational endpoints, but no public presentation library. The root route and former client public routes return 404. Public consumers integrate through versioned DTO endpoints under /api/public/v1.

## Consequences

Payload remains the sole backend/schema/auth/Admin owner. A future UI library may be connected without changing backend trust boundaries. Client identity, domains, feeds and delivery channels are configured only in a concrete clone. Adding public UI to this starter requires a new owner decision and ADR.
