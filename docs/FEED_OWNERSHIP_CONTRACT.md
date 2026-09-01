# Feed ownership contract

## Граница текущего этапа

Конкретная XML-схема неизвестна. Parser, mapping и сетевой adapter не реализуются до получения реального feed и подтверждённой спецификации.

## Уже зафиксированный operational layer

- `import-sources` — зарегистрированный источник и признак готовности adapter;
- `import-runs` — lifecycle запуска;
- `import-errors` — ошибки отдельных records;
- `admin-activities` — завершение и значимые действия;
- статусы: `running`, `success`, `partial_success`, `failed`, `cancelled`.

## Ownership

Импортный adapter владеет только source-controlled fields:

- `origin`;
- `externalId`;
- `sourceKey`;
- `importHash`;
- `lastSeenAt`;
- source price/availability/status;
- import diagnostics.

Редактор владеет manual и presentation fields только после явного product decision. Import не должен молча перезаписывать ручные SEO-тексты, media overrides или moderation state.

## Idempotency

- уникальность определяется `source + externalId`;
- повтор одного run не создаёт новую business entity;
- unchanged record не выполняет лишний update;
- import run получает correlation ID;
- partial/failed run не запускает массовую деактивацию;
- deactivate разрешён только после успешного полного snapshot run.

## Безопасность

- URL и credentials источника живут в server config/Doppler;
- XML ограничивается по размеру и времени обработки;
- parser запрещает external entities и сетевые DTD;
- ошибки не содержат secrets и лишние PII;
- ручной запуск проверяет capability `import.run` server-side;
- history и errors append-only для пользователей.

## Требования перед adapter implementation

1. реальный XML sample;
2. owner и способ доставки;
3. frequency и размер;
4. external ID contract;
5. full snapshot или delta;
6. правила цены и availability;
7. media URLs и retention;
8. правила пропавших records;
9. expected SLA и retry policy;
10. mapping к `properties` либо будущим `residential-complexes/buildings/units`.
