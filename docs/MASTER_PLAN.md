# Master Plan

## Objective

Превратить текущий repository в нейтральный `AMS Realty Platform Starter` без клиентского UI и без клиентской идентичности, сохранив Payload Admin, API, health/runtime foundation и дальнейший путь к full Realty Platform Core 2.0.

## Stage map

- `00 neutral foundation` — active
- `01 access + gateways` — recovery saved, перенос в active stream pending
- `02 schema normalization`
- `03 ingest core`
- `04 secondary YRL`
- `05 newbuild YRL`
- `06 leads + outbox`
- `07 headless catalog + maps`
- `08 SEO + content`
- `09 analytics`
- `10 operations`
- `11 compliance + validation release`

## 00. Neutral foundation

- archive legacy client docs
- rewrite active canon
- rename package/runtime identity to starter
- remove public routes/components/assets
- keep `/admin`, API, health, workers
- add root 404 behavior
- neutralize admin branding
- update starter manifest/export baseline

## 01. Access + gateways

- перенести полезную часть recovery WIP
- закрепить `core/access/*`
- закрепить `core/data-access/{public,user,system,ingest}`
- начать поднимать security gate к Wave 1

## 02–11 summary

- schema and UUID business model
- secure ingest engine
- secondary/newbuild parsers
- leads/outbox/recovery
- headless catalog DTO/API
- SEO/headless content
- analytics without browser tracker
- workers/health/revalidation/release proof
- clone rehearsal and isolated validation release

## External follow-ups

- SourceCraft repository rename to `ams-realty-platform-starter`
- GitHub mirror rename
- neutral Doppler project/config
- isolated validation DB/user on retained managed PostgreSQL cluster
- preview/noindex validation release on retained server
