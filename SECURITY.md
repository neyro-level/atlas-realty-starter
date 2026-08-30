# Security

## Trust boundaries

- публичный браузер не считается доверенным;
- Payload Admin доступен только аутентифицированным пользователям коллекции `users`;
- server runtime имеет доступ к базе, хранилищу и интеграционным секретам;
- SourceCraft CI получает только минимальные credentials своего workflow;
- production secrets хранятся в Doppler, а не в Git.

## Инварианты

- секреты, PAT, ключи, пароли и database URLs не коммитятся и не выводятся в логи;
- публичные endpoints валидируют входные данные и ограничивают частоту запросов по мере появления таких endpoint;
- access control Payload проверяется на сервере для каждой чувствительной collection/action;
- административный интерфейс не полагается только на скрытие элементов UI;
- загрузки ограничены изображениями и server-side access;
- внешние URL и webhooks будут защищаться отдельно при появлении интеграций;
- production migrations и destructive operations требуют отдельной команды и rollback;
- PII в заявках пока вне scope foundation и будет документироваться отдельным этапом;
- Local API от имени пользователя вызывается с `overrideAccess: false`;
- первый пользователь автоматически получает `SUPER_ADMIN`, но дальнейшее управление пользователями остаётся только у суперадмина.

## Secrets

- server scope: Doppler `szrostov-server/prd`;
- project runtime scope: `TODO` — зарегистрировать до первого deploy;
- локальный development scope: `.env`, созданный из `.env.example`, без Git;
- в репозитории допускается только `.env.example` без реальных значений.

## Роли

- `SUPER_ADMIN` — полный доступ, пользователи, роли, удаление;
- `DIRECTOR` — контент, медиа, `SiteSettings`, удаление контента;
- `CONTENT_MANAGER` — создание и обновление контента без управления пользователями.

Публичный доступ:

- `Pages` — только `_status = published`;
- `Media` — только `isPublic = true`;
- `SiteSettings` — read-only публично, update только `DIRECTOR | SUPER_ADMIN`.

## Перед production

- threat model публичных форм, CMS, uploads и integrations;
- проверка auth, sessions, cookies, CSRF/CORS и security headers;
- backup/restore БД и media;
- secret rotation и least privilege;
- dependency и container/runtime проверки;
- закрытый административный контур и audit evidence;
- проверенный rollback;
- переход медиа на S3-compatible object storage;
- отдельная managed PostgreSQL Timeweb.
