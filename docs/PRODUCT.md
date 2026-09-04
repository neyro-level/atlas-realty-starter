# Product

## Назначение

`AMS Realty Platform Starter` — стартовый шаблон backend/runtime-платформы для недвижимости. Это не клиентский сайт и не готовый UI-продукт, а нейтральный движок, к которому позже подключается отдельная библиотека Next.js-страниц.

## Внутри starter

- Payload Admin
- Next.js runtime
- PostgreSQL schema и migrations
- property/import/lead/analytics foundation
- jobs/workers
- API и DTO контракты для будущего UI
- deploy/testing contracts

## Вне starter

- клиентский бренд
- публичные страницы
- контент исходного клиента
- клиентские legal/SEO claims
- production identity сервера, домена и секретов

## Текущее правило UI

Пока новая UI-библиотека не подключена:

- `/` возвращает `404`
- старые public routes возвращают `404`
- `/admin` и operational routes продолжают работать

## Пользователи

- владелец платформы
- администратор/редактор контента и каталога
- оператор импорта, заявок и operational diagnostics

## Ближайшая программа

1. Нейтрализация active repository
2. Удаление public UI
3. Перенос access/gateway foundation
4. Сборка headless catalog/import/leads/contracts
5. Подготовка isolated validation release на существующем серверном контуре

