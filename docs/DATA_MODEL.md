# Data model

## Foundation model

| Сущность | Назначение | Ключевые поля | Доступ |
|---|---|---|---|
| `users` | административные аккаунты Payload | `name`, `email`, `password`, `role` | полный management только `SUPER_ADMIN` |
| `media` | базовый media layer | файл, `alt`, `caption`, `isPublic`, focal point | public read только при `isPublic = true` |
| `pages` | минимальная CMS-модель страниц | `title`, `slug`, `content`, `seo`, `_status` | public read только published |
| `site-settings` | глобальные настройки проекта | `projectName`, `brandName`, `companyName`, контакты, social links, default SEO | update `DIRECTOR | SUPER_ADMIN` |

## Инварианты foundation

- `users.role` хранится в самой коллекции и сохраняется в JWT;
- первый пользователь автоматически получает `SUPER_ADMIN`;
- `pages.slug` уникален и индексируется;
- публикация `pages` отделена от наличия записи через drafts/versions Payload;
- `media` не становится публичным автоматически;
- sensitive data не попадает в публичные Payload responses;
- timestamps и audit fields задаются единообразно.

## Lifecycle и удаление

По умолчанию:

- `pages` снимаются с публикации либо удаляются только директором/суперадмином;
- `media` управляется через Payload upload lifecycle;
- `users` не удаляются и не меняют роль без суперадмина;
- `site-settings` обновляется in-place как единый global.

## Отложено

- реальные сущности каталога недвижимости;
- ownership лидов и интеграция с внешним lead-контуром;
- import IDs, redirect registry и migration tables;
- локализация публичного сайта;
- retention, backup policy и production object storage.
