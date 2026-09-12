# ADR 0002: Full-stack starter boundary

Status: accepted
Date: 2026-09-06

## Context

The starter needs to ship a reusable public real-estate site as well as Payload Admin and the versioned public API. Directly coupling reusable UI to Payload would weaken the existing Public Gateway and make client cloning harder.

## Decision

The repository is a full-stack starter with a public Next.js App Router site. Presentation is separated through three workspace packages and one adapter boundary:

- `packages/site-contracts` owns DTOs and the `SiteEngine` interface;
- `packages/site-ui` owns reusable views and UI components and cannot import backend code;
- `packages/site-fixtures` provides deterministic preview/test data;
- `src/site-engine` chooses the Payload-backed or fixture adapter.

Payload-backed public reads continue through the Public Gateway, explicit access/select/limit rules and DTO mapping. `/api/public/v1` remains the external headless contract.

## Consequences

- `/` and approved public routes are real site pages and must be tested as such.
- Public UI integration does not authorize raw Payload REST, direct Local API calls from presentation code or a second backend.
- Atlas is the concrete Krasnodar product identity; reusable UI remains separated so the platform architecture can evolve without coupling presentation to Payload.
- A production validation from before the public UI boundary cannot be presented as exact-head live proof for the current full-stack system.
- Changes to `site-contracts`, Public Gateway wiring or backend imports in `site-ui` are architecture-sensitive and require targeted checks.
