/**
 * Canonical Yandex Metrika JavaScript goals for agency.
 * Create matching goals in Metrika UI (type: action / JavaScript event),
 * or sync via Management API with OAuth token (metrika:read / metrika:write).
 *
 * API list: GET https://api-metrika.yandex.net/management/v1/counter/{id}/goals
 * Auth: Authorization: OAuth <token>
 */
export const YANDEX_METRIKA_COUNTER_ID = "97957631";

export const YANDEX_METRIKA_INIT_OPTIONS = {
  defer: true,
  clickmap: true,
  trackLinks: true,
  accurateTrackBounce: true,
  webvisor: false,
} as const;

export const YANDEX_METRIKA_JS_GOALS = [
  { id: "lead_submit_success", role: "primary", note: "Успешная заявка — главная конверсия Директа" },
  { id: "phone_reveal", role: "primary", note: "Показать телефон — основная микроконверсия" },
  { id: "phone_click", role: "secondary", note: "Клик по раскрытому tel:" },
  { id: "lead_submit_attempt", role: "secondary", note: "Попытка отправки формы" },
  { id: "lead_submit_error", role: "secondary", note: "Ошибка отправки заявки" },
  { id: "modal_open", role: "secondary", note: "Открытие заявочной модалки" },
  { id: "chat_open", role: "secondary", note: "Открытие чата на объекте" },
  { id: "property_open", role: "secondary", note: "Переход в карточку объекта" },
  { id: "employee_profile_open", role: "secondary", note: "Профиль сотрудника" },
  { id: "employee_review_open", role: "secondary", note: "Открытие формы отзыва" },
  { id: "employee_review_submit_success", role: "secondary", note: "Успешный отзыв" },
  { id: "employee_review_submit_error", role: "secondary", note: "Ошибка отзыва" },
  { id: "favorites_interaction", role: "secondary", note: "Избранное" },
  { id: "compare_interaction", role: "secondary", note: "Сравнение" },
  { id: "share_click", role: "secondary", note: "Поделиться" },
  { id: "map_open", role: "secondary", note: "Карта" },
  { id: "scroll_depth", role: "secondary", note: "Глубина скролла 25/50/75/90" },
  { id: "catalog_interaction", role: "optional", note: "Зарезервировано; в коде почти не используется" },
] as const;

export type YandexMetrikaJsGoalId = (typeof YANDEX_METRIKA_JS_GOALS)[number]["id"];
