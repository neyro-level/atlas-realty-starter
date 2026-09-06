import { normalizeAllowedLeadSourcePage } from "./source-page-policy";

const EXACT_FORM_LABELS: Record<string, string> = {
  lead: "Заявка с сайта",
  request_modal: "Общая заявка с сайта",
  lead_db_smoke: "Служебная проверка базы заявок",
  max_delivery_smoke: "Служебная проверка доставки MAX",
  home_hero: "Главная: подбор проверенного объекта",
  home_new_building_budget_selection: "Главная: подбор новостроек по бюджету",
  home_new_building_quiz: "Подбор новостроек в Краснодаре",
  corporate_novostroyki: "Новостройки Краснодара: подбор квартиры в ЖК",
  home_new_building_selection_request: "Главная: подбор новостроек",
  property_purchase_split: "Подбор недвижимости с экспертом агентства недвижимости",
  mortgage_request: "Ипотека: расчет платежа",
  mortgage_consultation: "Ипотека: бесплатная консультация",
  mortgage_calculator: "Ипотека: расчет по калькулятору",
  mortgage_catalog_request: "Каталог: помощь с ипотекой",
  catalog_buyer_service_selection: "Каталог: помощь эксперта",
  catalog_buyer_service_mortgage: "Каталог: одобрение ипотеки",
  catalog_buyer_service_legal: "Каталог: юридическое сопровождение сделки",
  property_request: "Каталог: заявка по объекту",
  property_similar_request: "Карточка объекта: подбор похожих вариантов",
  property_price_offer: "Карточка объекта: предложение своей цены",
  property_viewing_request: "Карточка объекта: запись на просмотр",
  property_chat: "Карточка объекта: спросить у продавца",
  property_expert_purchase_request: "Карточка объекта: доверить покупку эксперту",
  new_building_request: "Страница ЖК: подбор предложений",
  new_building_callback: "Каталог новостроек: консультация по ЖК",
  new_building_selection: "Журнал: подбор новостроек",
  new_building_selection_request: "Каталог: объективный подбор новостроек",
  catalog_new_building_selection_request: "Каталог: подбор новостроек",
  new_building_expert_request: "Страница ЖК: консультация эксперта",
  construction_mortgage_request: "Строительство: ипотека на строительство",
  office_appointment: "Контакты: запись в офис",
  corporate_rabota_rieltorom: "Вакансии: отклик в команду агентства недвижимости",
  corporate_prodazha_nedvizhimosti_city: "Продажа недвижимости: консультация",
  corporate_o_kompanii: "О компании: консультация по недвижимости",
  corporate_reviews: "Отзывы: консультация по недвижимости",
  legal_consultation: "Юридическая консультация",
  employee_callback: "Профиль сотрудника: обратный звонок",
  home_interest_flat_selection: "Главная: подбор квартиры",
  home_interest_country_selection: "Главная: подбор дома или участка",
  journal_request: "Журнал: консультация",
  leadgen_kvartiry_promo_request: "Подбор квартир",
  leadgen_kvartiry_promo_simple_request: "Подбор квартир",
  leadgen_kvartiry_promo_header_callback: "Подбор квартир",
  leadgen_kvartiry_promo_hero_request: "Подбор квартир",
  leadgen_kvartiry_promo_quiz: "Подбор квартир",
  leadgen_kvartiry_promo_final_quiz: "Подбор квартир",
  leadgen_kvartiry_promo_mobile_menu_quiz: "Подбор квартир",
  leadgen_kvartiry_promo_base_inline: "Подбор квартир",
  leadgen_kvartiry_promo_example_request: "Подбор квартир",
  leadgen_new_buildings_promo_quiz: "Новостройки Краснодара — квиз",
  leadgen_new_buildings_promo_final_quiz: "Новостройки Краснодара — квиз",
  leadgen_izhs_promo_header_callback: "Расчет строительства дома",
  leadgen_izhs_promo_hero_request: "Расчет строительства дома",
  leadgen_izhs_promo_quiz: "Расчет строительства дома",
  leadgen_izhs_promo_final_quiz: "Расчет строительства дома",
  leadgen_izhs_promo_mobile_menu_quiz: "Расчет строительства дома",
  leadgen_izhs_promo_base_inline: "Расчет строительства дома",
  leadgen_izhs_promo_example_request: "Расчет строительства дома",
  leadgen_izhs_promo_examples_quiz: "Расчет строительства дома",
};

const EXACT_SOURCE_LABELS: Record<string, string> = {
  "home-services:new-building-budget": "Главная: подбор новостроек по бюджету",
  "home-services:new-building-quiz": "Подбор новостроек в Краснодаре",
  "catalog:new-building-selection-card": "Каталог: подбор новостроек",
  "catalog:mortgage-help-card": "Каталог: помощь с ипотекой",
  "catalog-buyer-services:selection": "Каталог: помощь эксперта",
  "catalog-buyer-services:mortgage": "Каталог: одобрение ипотеки",
  "catalog-buyer-services:legal": "Каталог: юридическое сопровождение сделки",
  "mortgage-page-support": "Ипотека: расчет платежа",
  "employee_profile": "Профиль сотрудника: обратный звонок",
  property_card: "Карточка объекта: обращение",
  property_object_expert_sidebar: "Карточка объекта: доверить покупку эксперту",
  "property_purchase_inline_split_form": "Подбор недвижимости с экспертом агентства недвижимости",
};

const LEADGEN_PAGE_LABELS: Record<string, string> = {
  "/promo/kvartiry": "Подбор квартир",
  "/promo/novostroyki": "Новостройки Краснодара",

  "/promo/stroitelstvo-domov": "Расчет строительства дома",
};

const LEADGEN_SCENARIO_LABELS: Record<string, string> = {
  quiz: "бесплатный подбор",
  final_quiz: "финальная заявка",
  hero_request: "заявка с первого экрана",
  header_callback: "заказ звонка",
  mobile_menu_quiz: "заявка из мобильного меню",
  base_inline: "заявка из блока оффера",
  example_request: "заявка по примеру",
  examples_quiz: "заявка по примерам проектов",
};

const LEADGEN_PREFIXES = [
  { prefix: "leadgen_kvartiry_promo_", page: "/promo/kvartiry" },
  { prefix: "leadgen_new_buildings_promo_", page: "/promo/novostroyki" },
  { prefix: "leadgen_izhs_promo_", page: "/promo/stroitelstvo-domov" },
] as const;

export function getLeadFormLabel(
  formType?: string | null,
  source?: string | null,
  sourcePage?: string | null,
) {
  const normalizedFormType = normalizeLeadKey(formType);
  const normalizedSource = normalizeLeadKey(source);
  const normalizedSourcePage = normalizeLeadSourcePage(sourcePage);

  if (normalizedFormType) {
    const exact = EXACT_FORM_LABELS[normalizedFormType];
    if (exact) {
      return resolveContextualLabel(exact, normalizedFormType, normalizedSourcePage);
    }

    const leadgen = resolveLeadgenLabel(normalizedFormType, normalizedSourcePage);
    if (leadgen) return leadgen;
  }

  if (normalizedSource) {
    const exact = EXACT_SOURCE_LABELS[normalizedSource];
    if (exact) return exact;

    if (normalizedSource.startsWith("new_building:")) {
      return "Страница ЖК: подбор предложений";
    }

    if (normalizedSource.startsWith("journal:")) {
      return "Журнал: консультация";
    }

    if (normalizedSource.startsWith("leadgen_yandex_direct")) {
      return resolveLeadgenLabel(normalizedFormType ?? "", normalizedSourcePage) ?? "Заявка из рекламы";
    }
  }

  return "Заявка с сайта";
}

export function getLeadSourceSummary(input: {
  formType?: string | null;
  source?: string | null;
  sourcePage?: string | null;
}) {
  const formLabel = getLeadFormLabel(input.formType, input.source, input.sourcePage);
  const sourcePage = normalizeLeadSourcePage(input.sourcePage);
  return sourcePage ? `${formLabel} · ${sourcePage}` : formLabel;
}

export function normalizeLeadSourcePage(sourcePage?: string | null) {
  return normalizeAllowedLeadSourcePage(sourcePage);
}

function normalizeLeadKey(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function resolveContextualLabel(baseLabel: string, formType: string, sourcePage: string | null) {
  if (formType !== "property_purchase_split") return baseLabel;

  if (sourcePage === "/") return "Главная: подбор недвижимости с экспертом агентства недвижимости";
  if (sourcePage === "/nedvizhimost") return "Недвижимость в Краснодаре: подбор недвижимости с экспертом агентства недвижимости";

  return baseLabel;
}

function resolveLeadgenLabel(formType: string, sourcePage: string | null) {
  for (const candidate of LEADGEN_PREFIXES) {
    if (!formType.startsWith(candidate.prefix)) continue;

    const scenario = formType.slice(candidate.prefix.length);
    const page = sourcePage && LEADGEN_PAGE_LABELS[sourcePage] ? sourcePage : candidate.page;
    const pageLabel = LEADGEN_PAGE_LABELS[page];
    const scenarioLabel = LEADGEN_SCENARIO_LABELS[scenario];

    if (pageLabel && scenarioLabel) {
      return `${pageLabel} — ${scenarioLabel}`;
    }

    if (pageLabel) {
      return pageLabel;
    }
  }

  return null;
}
