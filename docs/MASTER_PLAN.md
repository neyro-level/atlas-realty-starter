# Master plan

## Текущий этап — 1. Foundation

- [x] Подтверждён отдельный серверный контур SZ Rostov.
- [x] Подтверждён Doppler `szrostov-server/prd`.
- [x] Создан отдельный приватный SourceCraft-репозиторий.
- [x] Развёрнут официальный Payload blank scaffold.
- [x] Зафиксирован стек Next 16 + Payload 3 + PostgreSQL 18.
- [x] Созданы `Users`, `Media`, `Pages`, `SiteSettings`.
- [x] Подготовлен Payload Admin как рабочий кабинет.
- [x] Создан `docs/PAYLOAD_CONTRACT.md` и ADR по Payload.
- [ ] Повторно прогнать полный gate локально на чистой PostgreSQL и production smoke после финальной установки зависимостей.

## Этап 2. Инвентаризация текущего сайта

- карта URL и redirect requirements;
- страницы, каталог, статьи, медиа и SEO;
- формы, lead delivery и внешние интеграции;
- источники данных и ownership;
- production performance и аналитика, которые нужно сохранить.

Критерий этапа: утверждён migration scope и отсутствуют неизвестные критичные контуры.

## Этап 3. Реализация

- публичный shell и дизайн-система для 40 страниц;
- Payload collections и административные процессы;
- каталог и карточки объектов;
- контентные страницы и журнал;
- формы и подтверждённая доставка заявок;
- SEO/GEO и redirect layer;
- media pipeline.

Критерий этапа: функциональный scope готов в staging и покрыт risk-driven проверками.

## Этап 4. Migration rehearsal

- перенос контента и данных в тестовом контуре;
- проверка URL, metadata, structured data и redirects;
- backup/restore rehearsal;
- нагрузочный и security gate по фактическому риску;
- runbook deploy, DNS/SSL cutover и rollback.

Критерий этапа: повторяемая миграция с доказательством результата и временем отката.

## Этап 5. Production cutover

- release только из canonical SourceCraft `main` на exact SHA;
- deploy на согласованный runtime SZ Rostov;
- переключение домена по утверждённому плану;
- live smoke маршрутов, форм, assets, CMS, SEO и health/version;
- мониторинг и готовый rollback;
- синхронизация release proof в документах.

Критерий этапа: домен обслуживается новой платформой, критичные проверки зелёные, старый runtime сохранён на согласованный rollback-window.

## Текущие ограничения

- managed PostgreSQL Timeweb ещё не создавалась;
- S3-compatible object storage ещё не подключено;
- deploy runbook и DNS plan отсутствуют;
- каталог недвижимости, лиды и публичный UI ещё не реализованы;
- старый production не изменяется.
