# Starter Contract

## This repository is the starter

Отдельный `@ams/realty-core`, второй repository и package extraction сейчас не создаются.

Текущий repository сам является reusable starter engine.

## Included

- Next.js runtime
- Payload Admin/CMS/auth
- PostgreSQL migrations
- property/import/lead/analytics operations
- headless frontend contracts
- deploy/testing scripts

## Excluded

- public pages
- public visual catalog
- client branding
- client content
- client domains and server aliases
- client runtime data and media

## Archive boundary

`docs/archive/union-legacy-2026-09-04/` хранит только legacy evidence.

Archive:

- не является active source of truth
- не участвует в обычном starter bootstrap
- не должен попадать в future export

## Export rule

Будущий export должен брать только active starter state без legacy archive, secrets и client evidence.
