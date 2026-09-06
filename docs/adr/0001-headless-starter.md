# ADR 0001: Headless starter boundary

Status: superseded by ADR 0002
Date: 2026-09-04
Superseded: 2026-09-06

## Decision

The repository was initially accepted as a self-contained headless realty engine with Payload Admin, APIs, jobs, migrations and operational endpoints, but no public presentation library. The root route returned 404 and public consumers integrated through `/api/public/v1`.

## Reason for supersession

SourceCraft PR `!51` integrated the reusable public realty UI and connected it to the existing Public Gateway through a `SiteEngine` boundary. The historical decision remains recorded, but its “no public UI” consequence is no longer an active invariant.

## Preserved consequences

Payload remains the sole backend/schema/auth/Admin owner. Public consumers still receive bounded DTOs rather than raw Payload documents, and `/api/public/v1` remains supported.
