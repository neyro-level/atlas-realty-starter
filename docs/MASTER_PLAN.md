# Master plan

## Текущий этап — 0. Bootstrap

- [x] Подтверждён отдельный серверный контур SZ Rostov.
- [x] Подтверждён Doppler `szrostov-server/prd`.
- [x] Создан отдельный приватный SourceCraft-репозиторий.
- [x] Заложено документальное ядро проекта.
- [ ] Получить от владельца точную спецификацию стека.

## Этап 1. Архитектурное решение и foundation

- утвердить версии Node.js, Next.js, Payload и package manager;
- выбрать database adapter, локальную и production БД;
- выбрать media storage;
- определить структуру runtime и deploy topology;
- определить Payload collections, роли и access control;
- зарегистрировать команды dev/check/build и CI contract;
- создать `.env.example` без секретов.

Критерий этапа: локально запускается минимальное приложение и Payload Admin, архитектурные документы соответствуют runtime.

## Этап 2. Инвентаризация текущего сайта

- карта URL и redirect requirements;
- страницы, каталог, статьи, медиа и SEO;
- формы, lead delivery и внешние интеграции;
- источники данных и ownership;
- production performance и аналитика, которые нужно сохранить.

Критерий этапа: утверждён migration scope и отсутствуют неизвестные критичные контуры.

## Этап 3. Реализация

- публичный shell и дизайн-система;
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

- точный стек ещё не предоставлен;
- приложение и зависимости не созданы;
- project-specific Doppler scope для runtime не определён;
- deploy runbook и DNS plan отсутствуют;
- старый production не изменяется.
