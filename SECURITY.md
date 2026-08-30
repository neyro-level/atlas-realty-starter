# Security

## Статус

Базовый security-контракт до инициализации приложения. Детали auth и Payload access control будут добавлены после утверждения стека.

## Trust boundaries

- публичный браузер не считается доверенным;
- Payload Admin доступен только аутентифицированным пользователям;
- server runtime имеет доступ к базе, хранилищу и интеграционным секретам;
- SourceCraft CI получает только минимальные credentials своего workflow;
- production secrets хранятся в Doppler, а не в Git.

## Инварианты

- секреты, PAT, ключи, пароли и database URLs не коммитятся и не выводятся в логи;
- публичные endpoints валидируют входные данные и ограничивают частоту запросов;
- access control Payload проверяется на сервере для каждой чувствительной collection/action;
- административный интерфейс не полагается только на скрытие элементов UI;
- загрузки проверяются по размеру, типу и допустимому содержимому;
- внешние URL и webhooks защищаются от SSRF, replay и подделки запроса по релевантности;
- production migrations и destructive operations требуют отдельной команды и rollback;
- PII в заявках минимизируется, доступ и retention документируются.

## Secrets

- server scope: Doppler `szrostov-server/prd`;
- project runtime scope: `TODO` — создать или зарегистрировать до первого deploy;
- локальный development scope: `TODO`;
- в репозитории допускается только `.env.example` без реальных значений.

## Роли

Предполагаются как минимум администратор и редактор, но точная RBAC-модель — `TODO`. До её утверждения нельзя считать Payload Admin production-ready.

## Перед production

- threat model публичных форм, CMS, uploads и integrations;
- проверка auth, sessions, cookies, CSRF/CORS и security headers;
- backup/restore БД и media;
- secret rotation и least privilege;
- dependency и container/runtime проверки;
- закрытый административный контур и audit evidence;
- проверенный rollback.
