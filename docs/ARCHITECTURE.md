# Architecture

## Authority

Нормативный стандарт: `docs/AMS_REALTY_PLATFORM_CORE_STANDARD_2.0.md`.

Этот документ описывает active starter shape после нейтрализации клиента.

## Runtime topology

```text
Internet
  -> Nginx
      -> Next.js runtime + Payload Admin/API
      -> dedicated workers
  -> private / managed PostgreSQL 18
```

Starter не публикует public UI. App Router остаётся только для:

- root layout
- 404 handling
- Payload Admin
- Payload/API routes
- technical metadata routes

## Source layout

```text
src/
  app/
    layout.tsx
    not-found.tsx
    robots.ts
    (payload)/
  core/
    access/
    data-access/
    observability/
    security/
  payload/
    access/
    admin/
    bootstrap/
    collections/
    globals/
    hooks/
    jobs/
    migrations-v2/
  project/
    build-env.ts
    config.ts
    env.ts
    public-env.ts
    sentry-server-env.ts
```

## Public boundary

Пока UI отсутствует, public boundary готовится как headless contract:

- serializable DTO
- future `publicGateway.*`
- thin `/api/public/v1/*` routes

Прямых imports из будущего UI в Payload config, collections или generated types быть не должно.

## Transitional notes

- `src/payload/migrations` пока остаётся как legacy evidence и не является active V2 source.
- existing business collections могут ещё содержать legacy naming drift; active migration source уже зафиксирован как V2.
- recovery code из Wave 1 переносится в starter осознанно, а не автоматически.
