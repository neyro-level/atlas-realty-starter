# Data Model

## Active V2 owner

Schema owner: Payload CMS.

Active migration source: `src/payload/migrations-v2`.

## Ближайшая целевая модель

Collections:

- `users`
- `media`
- `pages`
- `posts`
- `feed-sources`
- `properties`
- `residential-complexes`
- `buildings`
- `developers`
- `agents`
- `property-price-history`
- `leads`
- `lead-deliveries`
- `phone-reveals`
- `import-runs`
- `import-issues`
- `audit-events`
- `redirects`
- `reviews`
- `offices`
- `stat-events`
- `stat-daily`
- `facet-cache`
- `seo-landings`

Globals:

- `site-settings`
- `contacts`
- `seo-defaults`
- `legal`
- `analytics-settings`
- `lead-routing-settings`
- `map-settings`

## Transitional state

- current repository всё ещё содержит legacy collection naming, включая `employees`, `import-sources`, `import-errors`, `lead-notes`, `units`
- эти names рассматриваются как migration drift и будут закрываться по волнам schema/import cleanup
- новые business identifiers должны закрепляться как UUID-only

## Rules

- secrets не хранятся в collections/globals
- public DTO не возвращают raw Payload documents
- import diagnostics и PII проходят redaction/retention
- manual/client content не должен смешиваться с import ownership
