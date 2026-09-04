# Worklog

## 2026-09-04 — starter neutral foundation

- Старый client canon и root-docs перенесены в `docs/archive/union-legacy-2026-09-04/`.
- Незавершённый Wave 1 сохранён recovery-коммитом и опубликован в SourceCraft как `work/recovery-wave1-access-gateways`.
- Выявлено фактическое ограничение SourceCraft: remote branch policy не принимает `codex/*`, поэтому активные рабочие ветки starter используют совместимый формат `work/**`.
- Активный репозиторий переведён в режим `AMS Realty Platform Starter`.
- Начата полная зачистка public UI и клиентских preset-слоёв при сохранении Payload Admin, API и health/runtime foundation.

## Текущее состояние

- Production cutover не выполнялся.
- Repo rename, external server alias, isolated staging DB/Doppler rename и validation release остаются отдельными внешними шагами.
- Legacy runtime evidence сохранён только в архиве и больше не является active source of truth.
