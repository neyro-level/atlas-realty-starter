# Security

## Trust boundary

- anonymous browser не доверен
- Payload Admin работает только для authenticated users
- secrets живут только в env/secret storage
- public UI в starter отсутствует, поэтому случайная business data exposure через public pages должна быть исключена

## Обязательные инварианты

- Payload-only backend
- no Prisma / second ORM / second auth
- no client markers, secrets, server aliases или domain identity в активном коде и docs
- `overrideAccess: true` только в approved elevated paths
- raw anonymous business REST должен оставаться закрытым
- PII не попадает в logs, fixtures и diagnostics

## Starter-specific rules

- retained external server/DB contour используется только как isolated validation target
- старая client database не является starter schema source
- archive не является active source of truth и не должен участвовать в обычной навигации/export

## Remaining risk

- repo rename и isolated staging identity ещё не проведены во внешних системах
- часть legacy collections/import flows всё ещё требует wave-by-wave cleanup до полного target data model
