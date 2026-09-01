# Product

## Назначение

Создать новую веб-платформу «Союза застройщиков Ростов» на Next.js + Payload CMS, которая после отдельной миграции сможет заменить действующий Astro-сайт без потери критичного контента, поискового трафика и заявок.

Продуктовая модель распространения: единая codebase-версия используется как стартовый шаблон, но каждый клиент получает отдельный server, database, storage и Payload Admin. Shared multi-tenant database не входит в scope.

## Пользователи

- покупатели недвижимости и посетители публичного сайта;
- потенциальные клиенты, отправляющие заявки;
- редакторы и администраторы контента в Payload CMS;
- владелец проекта и AI-исполнители, развивающие платформу.

Текущие роли CMS:

- `SUPER_ADMIN`
- `DIRECTOR`
- `CONTENT_MANAGER`

## Базовые продуктовые контуры

- публичные страницы и посадочные страницы;
- каталог недвижимости и карточки объектов;
- редакционный контент и медиа;
- формы заявок и рабочий mini-CRM контур;
- SEO/GEO: metadata, canonical, sitemap, robots, structured data и redirects;
- административная работа с контентом через Payload CMS;
- внутренний кабинет: `Посетители`, `Заявки`, `Объекты`, `Сотрудники`, `Отзывы`, `Офисы`, `Контакты`, `Антиспам`, `XML-импорт`.

## Критерии миграции

До переноса домена должны быть подтверждены:

1. карта существующих маршрутов, контента, форм и интеграций;
2. redirect map без необоснованных потерь URL;
3. перенос и проверка критичных SEO-данных;
4. доставка заявок end-to-end;
5. корректность контента и медиа;
6. backup, rollback и понятное окно DNS cutover;
7. live smoke после переключения.

## Текущий scope

- hardened `Next.js + Payload` foundation и production runtime;
- публичный UI реализован по verified reference UI contract без Prisma/Better Auth/backend code;
- canonical Ростов routes: Home, новостройки, квартиры, строительство, ипотека, about, reviews, contacts и careers;
- Payload collection `residential-complexes` для 30 ЖК;
- public DTO/query layer с `overrideAccess: false`;
- catalog/detail families для ЖК и самостоятельных `properties`;
- metadata, sitemap, robots, responsive states and empty states.

## Non-goals текущего этапа

- изменение действующего Astro-сайта или domain/DNS cutover;
- production seed жилых комплексов без отдельного data approval;
- выдуманные недостающие 10 ЖК, цены, отзывы или квартиры;
- реальный XML parser/adapter под неизвестную спецификацию;
- финальная CRM delivery и public lead ingestion;
- `Building -> Unit` mass catalog до полного feed;
- journal, favorites/compare и advertising leadgen migration.
