# Product

## Purpose

Build the new public platform for Союз застройщиков Ростов: secondary and newbuild catalog, properties, complexes, developers, agents, content, maps, leads, SEO and a minimal operational Payload Admin. The current public UI is retained while the internal platform is rebuilt to AMS Realty Platform Core Standard 2.0.

## Users

- Anonymous visitors browsing property, complex, agent and content pages.
- Leads requesting callback, viewing, mortgage, question or sale consultation.
- Client owner, editor and viewer operating Payload Admin.
- Technical owner operating imports, integrations, fleet and releases.

## Scope

- One isolated client deployment, not multi-tenant SaaS.
- Catalog up to 50,000 active offers.
- Multiple client-specific feeds through a secure generic ingest engine.
- Payload as only CMS/backend/schema/auth platform.
- Separate worker/scheduler using Payload Jobs Queue.
- Public data only through trusted gateway and DTO contracts.
- Transactional lead outbox for MAX, email and CRM channels when configured.
- Optional Yandex Maps and Metrika modules.
- SEO, redirects, sitemap, structured data and approved SEO landings.
- Future reusable `@ams/realty-core` package with client repository isolation.

## Non-goals until approved prerequisites

- Real feed parser without an approved fixture/specification.
- Production catalog/content/media seed without data approval.
- Lead delivery without client legal consent, channels and routing decision.
- Domain/DNS/legacy Astro cutover.
- Public machine-to-machine Payload access.
- Cross-source auto-merge, second ORM, GraphQL, Redis, external broker or microservices.

## Current stage

Wave 0 is rebuilding runtime/security/schema foundations. The old production preview and legacy Astro remain untouched. V2 uses a fresh UUID managed database because the current business collections are empty.

## Acceptance before public launch

1. Access boundaries, imports, leads, privacy and migration contracts meet the Core Standard.
2. Existing UI remains visually equivalent except for required functional additions.
3. Real feeds/import reports, lead delivery, maps and SEO are accepted with client data.
4. SourceCraft release has exact commit evidence, verified backup/restore, critical E2E and performance results.
5. DNS/SSL cutover has a separate release and rollback plan.
