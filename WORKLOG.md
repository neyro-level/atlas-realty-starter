# Worklog

## 2026-08-30 — foundation Next 16 + Payload

- Развёрнут официальный Payload blank scaffold и перенесён в репозиторий `integrator-p/soyuz-rostov-next`.
- Зафиксирован foundation-стек: Next.js `16.3.0`, React `19.2.8`, TypeScript `6.0.3`, Payload `3.88.0`, PostgreSQL `18`, Node.js `24.20.0`, pnpm `11.24.0`.
- Настроен единый runtime `Next.js + Payload` без Prisma, Better Auth и отдельного backend.
- Добавлены `Users`, `Media`, `Pages`, `SiteSettings`, централизованный access-слой и базовые hooks.
- Подготовлен branded Payload Admin с русскими подписями, группировкой сущностей и стартовым dashboard.
- Настроены локальная PostgreSQL 18 через Docker Compose, `.env.example`, type generation, import map и базовые test/check scripts.
- Создан обязательный проектный контракт `docs/PAYLOAD_CONTRACT.md` и ADR про Payload как единое ядро.
- Production, домен, managed PostgreSQL Timeweb и перенос с Astro по-прежнему не запускались.
