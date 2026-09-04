# Payload Contract

## Ownership

Payload — единственный owner для:

- schema
- migrations
- Admin
- auth
- access control
- Local API
- jobs queue

## Starter runtime shape

- `/admin` обязателен
- public site pages отсутствуют
- public site data позже отдаётся только через headless DTO/API boundary
- generated Payload files редактируются только через `generate:types` и `generate:importmap`

## Admin contract

- custom admin views остаются operational и нейтральными
- branding в admin не должен ссылаться на клиента
- native Payload CRUD, locks, trash и media остаются authoritative

## Migration contract

- active source: `src/payload/migrations-v2`
- production schema change только через migrations
- legacy `src/payload/migrations` не используется как active source

## Security contract

- `overrideAccess: false` для public/user operations
- `overrideAccess: true` только в approved system/maintenance paths
- GraphQL disabled
- env и secrets валидируются server-side

## Verification

Schema/admin/runtime work требует:

- `pnpm generate:types`
- `pnpm generate:importmap`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm architecture:check`
- `pnpm security:check`
- `pnpm test`
- `pnpm build`
