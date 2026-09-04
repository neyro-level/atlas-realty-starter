# Runbook Deploy

## Current release policy

Starter production cutover не выполняется в рамках нейтрализации repository.

Допустим только isolated validation/staging release на сохранённый серверный контур.

## Target validation contour

- отдельный app directory
- отдельный service name
- отдельный internal port
- отдельные workers
- отдельная logical database и DB role
- preview access only
- `noindex`, `nofollow`, `noarchive`

## Required external steps

1. Backup existing client contour
2. Create isolated starter DB/user on retained PostgreSQL cluster
3. Create neutral staging secrets scope
4. Deploy exact merged SHA into isolated directory
5. Verify `/api/health`, admin login and workers
6. Keep old runtime and old database untouched

## Forbidden

- in-place migration of legacy client database
- overwrite of existing client service
- domain cutover
- public indexing
